import { NeuralNetwork } from "./core/network.js";
import { createDataset, DATASET_META } from "./core/datasets.js";
import { evaluate, formatLoss, formatPercent } from "./core/metrics.js";

const $ = (selector) => document.querySelector(selector);

const elements = {
  dataset: $("#dataset"),
  hiddenNodes: $("#hidden-nodes"),
  hiddenValue: $("#hidden-value"),
  learningRate: $("#learning-rate"),
  learningValue: $("#learning-value"),
  epochTarget: $("#epoch-target"),
  seed: $("#seed"),
  start: $("#start-training"),
  step: $("#step-training"),
  reset: $("#reset-training"),
  export: $("#export-model"),
  status: $("#lab-status"),
  statusDot: $("#status-dot"),
  datasetDescription: $("#dataset-description"),
  metricLoss: $("#metric-loss"),
  metricAccuracy: $("#metric-accuracy"),
  metricEpochs: $("#metric-epochs"),
  metricTime: $("#metric-time"),
  decisionCanvas: $("#decision-canvas"),
  networkCanvas: $("#network-canvas"),
  lossCanvas: $("#loss-canvas"),
  inputX: $("#input-x"),
  inputY: $("#input-y"),
  inputXValue: $("#input-x-value"),
  inputYValue: $("#input-y-value"),
  inferenceProbability: $("#inference-probability"),
  inferenceClass: $("#inference-class"),
  inferenceBar: $("#inference-bar"),
  githubStars: $("#github-stars"),
  githubForks: $("#github-forks"),
  toast: $("#toast"),
};

const state = {
  network: null,
  dataset: [],
  datasetName: "xor",
  losses: [],
  running: false,
  startedAt: 0,
  elapsed: 0,
  frame: 0,
  animation: null,
};

function readConfiguration() {
  return {
    hiddenSize: Number(elements.hiddenNodes.value),
    seed: Number(elements.seed.value) || 7,
    learningRate: Number(elements.learningRate.value),
    targetEpochs: Number(elements.epochTarget.value),
  };
}

function resetLab({ keepStatus = false } = {}) {
  stopTraining();
  const config = readConfiguration();
  state.datasetName = elements.dataset.value;
  state.dataset = createDataset(state.datasetName, config.seed);
  state.network = new NeuralNetwork({
    hiddenSize: config.hiddenSize,
    seed: config.seed,
  });
  state.losses = [];
  state.elapsed = 0;
  state.frame = 0;
  elements.datasetDescription.textContent = DATASET_META[state.datasetName].description;
  if (!keepStatus) setStatus("Pronto para treinar", "ready");
  renderAll();
}

function setStatus(message, mode = "ready") {
  elements.status.textContent = message;
  elements.statusDot.dataset.mode = mode;
}

function startTraining() {
  if (state.running) {
    stopTraining();
    setStatus("Treinamento pausado", "paused");
    return;
  }

  const targetEpochs = readConfiguration().targetEpochs;
  if (state.network.epochs >= targetEpochs) {
    elements.epochTarget.value = String(targetEpochs + 1000);
  }
  state.running = true;
  state.startedAt = performance.now() - state.elapsed;
  elements.start.innerHTML = '<span class="button-icon">Ⅱ</span> Pausar';
  setStatus("Treinando no seu navegador", "running");
  state.animation = requestAnimationFrame(trainingFrame);
}

function stopTraining() {
  state.running = false;
  if (state.animation) cancelAnimationFrame(state.animation);
  state.animation = null;
  elements.start.innerHTML = '<span class="button-icon">▶</span> Treinar rede';
}

function trainEpochs(count) {
  const { learningRate } = readConfiguration();
  for (let index = 0; index < count; index += 1) {
    const loss = state.network.trainEpoch(state.dataset, learningRate);
    if (state.network.epochs === 1 || state.network.epochs % 5 === 0) {
      state.losses.push({ epoch: state.network.epochs, loss });
      if (state.losses.length > 360) state.losses.shift();
    }
  }
}

function trainingFrame(timestamp) {
  if (!state.running) return;
  const config = readConfiguration();
  const datasetFactor = state.dataset.length > 20 ? 2 : 12;
  trainEpochs(datasetFactor);
  state.elapsed = timestamp - state.startedAt;
  state.frame += 1;

  if (state.frame % 2 === 0) renderAll();

  const metrics = evaluate(state.network, state.dataset);
  const converged =
    metrics.accuracy === 1 && metrics.loss < 0.018 && state.network.epochs >= 80;
  if (state.network.epochs >= config.targetEpochs || converged) {
    stopTraining();
    setStatus(converged ? "Rede convergiu" : "Meta de épocas concluída", "success");
    renderAll();
    showToast(converged ? "Convergência detectada." : "Treinamento concluído.");
    return;
  }

  state.animation = requestAnimationFrame(trainingFrame);
}

function trainStep() {
  stopTraining();
  const amount = state.dataset.length > 20 ? 20 : 100;
  const start = performance.now();
  trainEpochs(amount);
  state.elapsed += performance.now() - start;
  setStatus(`Avanço manual: +${amount} épocas`, "ready");
  renderAll();
}

function renderAll() {
  const metrics = evaluate(state.network, state.dataset);
  elements.metricLoss.textContent = formatLoss(metrics.loss);
  elements.metricAccuracy.textContent = formatPercent(metrics.accuracy);
  elements.metricEpochs.textContent = state.network.epochs.toLocaleString("pt-BR");
  elements.metricTime.textContent = `${(state.elapsed / 1000).toFixed(2)}s`;
  elements.hiddenValue.textContent = elements.hiddenNodes.value;
  elements.learningValue.textContent = Number(elements.learningRate.value).toFixed(2);
  renderInference();
  drawDecisionSurface(metrics.predictions);
  drawNetwork();
  drawLossChart();
}

function resizeCanvas(canvas) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(canvas.clientWidth));
  const height = Math.max(1, Math.floor(canvas.clientHeight));
  if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
  }
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { context, width, height };
}

function drawDecisionSurface() {
  const { context, width, height } = resizeCanvas(elements.decisionCanvas);
  const range = DATASET_META[state.datasetName].range;
  const resolution = width < 480 ? 34 : 52;
  const cellWidth = width / resolution;
  const cellHeight = height / resolution;
  context.clearRect(0, 0, width, height);

  for (let row = 0; row < resolution; row += 1) {
    for (let column = 0; column < resolution; column += 1) {
      const x = (column / (resolution - 1)) * range * 2 - range;
      const y = range - (row / (resolution - 1)) * range * 2;
      const probability = state.network.predict([x, y]);
      const red = Math.round(18 + probability * 96);
      const green = Math.round(54 + probability * 68);
      const blue = Math.round(105 + probability * 96);
      context.fillStyle = `rgb(${red} ${green} ${blue} / 0.88)`;
      context.fillRect(
        column * cellWidth,
        row * cellHeight,
        Math.ceil(cellWidth + 0.5),
        Math.ceil(cellHeight + 0.5),
      );
    }
  }

  context.strokeStyle = "rgb(255 255 255 / 0.08)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(width / 2, 0);
  context.lineTo(width / 2, height);
  context.moveTo(0, height / 2);
  context.lineTo(width, height / 2);
  context.stroke();

  for (const sample of state.dataset) {
    const px = ((sample.input[0] + range) / (range * 2)) * width;
    const py = ((range - sample.input[1]) / (range * 2)) * height;
    context.beginPath();
    context.arc(px, py, state.dataset.length > 20 ? 3.2 : 7, 0, Math.PI * 2);
    context.fillStyle = sample.target === 1 ? "#c6a6ff" : "#48efff";
    context.fill();
    context.strokeStyle = "#07111d";
    context.lineWidth = 2;
    context.stroke();
  }
}

function drawNetwork() {
  const { context, width, height } = resizeCanvas(elements.networkCanvas);
  context.clearRect(0, 0, width, height);
  const snapshot = state.network.snapshot();
  const columns = [
    { x: width * 0.12, count: 2, label: "entrada" },
    { x: width * 0.5, count: snapshot.hiddenSize, label: "oculta" },
    { x: width * 0.88, count: 1, label: "saída" },
  ];
  const point = (column, index) => ({
    x: column.x,
    y: ((index + 1) / (column.count + 1)) * (height - 50) + 22,
  });

  function drawConnections(from, to, weights) {
    for (let outputIndex = 0; outputIndex < to.count; outputIndex += 1) {
      for (let inputIndex = 0; inputIndex < from.count; inputIndex += 1) {
        const start = point(from, inputIndex);
        const end = point(to, outputIndex);
        const weight = weights[outputIndex][inputIndex];
        const intensity = Math.min(0.82, Math.abs(weight) / 3 + 0.12);
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle =
          weight >= 0
            ? `rgb(72 239 255 / ${intensity})`
            : `rgb(175 112 255 / ${intensity})`;
        context.lineWidth = Math.min(3, Math.max(0.7, Math.abs(weight) * 0.8));
        context.stroke();
      }
    }
  }

  drawConnections(columns[0], columns[1], snapshot.hiddenWeights);
  drawConnections(columns[1], columns[2], snapshot.outputWeights);

  for (const [columnIndex, column] of columns.entries()) {
    for (let index = 0; index < column.count; index += 1) {
      const node = point(column, index);
      const pulse = 0.5 + Math.sin(state.network.epochs / 12 + index) * 0.5;
      context.beginPath();
      context.arc(node.x, node.y, columnIndex === 1 ? 7 + pulse : 9, 0, Math.PI * 2);
      context.fillStyle = columnIndex === 1 ? "#a97bff" : "#40e9fa";
      context.shadowBlur = state.running ? 12 + pulse * 8 : 8;
      context.shadowColor = context.fillStyle;
      context.fill();
      context.shadowBlur = 0;
      context.strokeStyle = "#dffcff";
      context.lineWidth = 1;
      context.stroke();
    }
    context.fillStyle = "#7f91a8";
    context.font = "600 10px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.textAlign = "center";
    context.fillText(column.label.toUpperCase(), column.x, height - 8);
  }
}

function drawLossChart() {
  const { context, width, height } = resizeCanvas(elements.lossCanvas);
  context.clearRect(0, 0, width, height);
  const padding = { top: 16, right: 12, bottom: 22, left: 42 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  context.strokeStyle = "rgb(143 167 194 / 0.16)";
  context.lineWidth = 1;
  context.fillStyle = "#71839a";
  context.font = "10px ui-monospace, SFMono-Regular, Consolas, monospace";

  for (let line = 0; line <= 3; line += 1) {
    const y = padding.top + (chartHeight / 3) * line;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.textAlign = "right";
    context.fillText((1 - line / 3).toFixed(1), padding.left - 8, y + 3);
  }

  if (state.losses.length < 2) {
    context.fillStyle = "#7f91a8";
    context.textAlign = "center";
    context.fillText("O HISTÓRICO SURGE DURANTE O TREINO", width / 2, height / 2);
    return;
  }

  const maxLoss = Math.max(0.7, ...state.losses.map((entry) => entry.loss));
  const minEpoch = state.losses[0].epoch;
  const maxEpoch = state.losses.at(-1).epoch;
  context.beginPath();
  state.losses.forEach((entry, index) => {
    const progress =
      maxEpoch === minEpoch ? 0 : (entry.epoch - minEpoch) / (maxEpoch - minEpoch);
    const x = padding.left + progress * chartWidth;
    const y = padding.top + (1 - Math.min(1, entry.loss / maxLoss)) * chartHeight;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  const gradient = context.createLinearGradient(padding.left, 0, width, 0);
  gradient.addColorStop(0, "#42edff");
  gradient.addColorStop(1, "#b779ff");
  context.strokeStyle = gradient;
  context.lineWidth = 2.5;
  context.shadowBlur = 8;
  context.shadowColor = "#42edff";
  context.stroke();
  context.shadowBlur = 0;
}

function renderInference() {
  const x = Number(elements.inputX.value);
  const y = Number(elements.inputY.value);
  const probability = state.network.predict([x, y]);
  elements.inputXValue.textContent = x.toFixed(2);
  elements.inputYValue.textContent = y.toFixed(2);
  elements.inferenceProbability.textContent = formatPercent(probability);
  elements.inferenceClass.textContent = probability >= 0.5 ? "Classe 1" : "Classe 0";
  elements.inferenceClass.dataset.class = probability >= 0.5 ? "one" : "zero";
  elements.inferenceBar.style.setProperty("--probability", `${probability * 100}%`);
}

function exportModel() {
  const payload = {
    format: "neural-ia-snapshot/v1",
    createdAt: new Date().toISOString(),
    dataset: state.datasetName,
    metrics: evaluate(state.network, state.dataset),
    model: state.network.snapshot(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `neural-ia-${state.datasetName}-${state.network.epochs}ep.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Snapshot do modelo exportado.");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(
    () => elements.toast.classList.remove("is-visible"),
    2400,
  );
}

async function loadGitHubSignals() {
  try {
    const response = await fetch("https://api.github.com/repos/7dsolv/IA_Neural", {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return;
    const repository = await response.json();
    elements.githubStars.textContent = repository.stargazers_count.toLocaleString("pt-BR");
    elements.githubForks.textContent = repository.forks_count.toLocaleString("pt-BR");
  } catch {
    // The lab remains fully functional if the public GitHub API is unavailable.
  }
}

elements.start.addEventListener("click", startTraining);
elements.step.addEventListener("click", trainStep);
elements.reset.addEventListener("click", () => resetLab());
elements.export.addEventListener("click", exportModel);
elements.dataset.addEventListener("change", () => resetLab());
elements.seed.addEventListener("change", () => resetLab());
elements.hiddenNodes.addEventListener("input", () => {
  elements.hiddenValue.textContent = elements.hiddenNodes.value;
});
elements.hiddenNodes.addEventListener("change", () => resetLab());
elements.learningRate.addEventListener("input", () => {
  elements.learningValue.textContent = Number(elements.learningRate.value).toFixed(2);
});
elements.inputX.addEventListener("input", renderInference);
elements.inputY.addEventListener("input", renderInference);
window.addEventListener("resize", renderAll);
document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.running) {
    stopTraining();
    setStatus("Pausado em segundo plano", "paused");
  }
});

if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}

resetLab();
loadGitHubSignals();

// Deliver an immediately interesting first view without locking the interface.
window.setTimeout(() => {
  if (state.network.epochs === 0 && !state.running) {
    trainEpochs(120);
    setStatus("Demo inicial pronta", "success");
    renderAll();
  }
}, 350);
