export function evaluate(network, dataset) {
  if (!network || !Array.isArray(dataset) || dataset.length === 0) {
    throw new TypeError("network and a non-empty dataset are required");
  }

  let correct = 0;
  let loss = 0;
  const predictions = dataset.map((sample) => {
    const probability = network.predict(sample.input);
    const clipped = Math.min(1 - 1e-9, Math.max(1e-9, probability));
    loss += -(
      sample.target * Math.log(clipped) +
      (1 - sample.target) * Math.log(1 - clipped)
    );
    if ((probability >= 0.5 ? 1 : 0) === sample.target) correct += 1;
    return probability;
  });

  return {
    accuracy: correct / dataset.length,
    loss: loss / dataset.length,
    predictions,
  };
}

export function formatPercent(value) {
  return `${(value * 100).toFixed(value >= 0.995 ? 0 : 1)}%`;
}

export function formatLoss(value) {
  if (!Number.isFinite(value)) return "—";
  if (value < 0.001) return value.toExponential(2);
  return value.toFixed(4);
}
