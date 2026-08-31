import { createRandom } from "./network.js";

const LOGIC_DATASETS = {
  xor: [0, 1, 1, 0],
  and: [0, 0, 0, 1],
  or: [0, 1, 1, 1],
};

function logicDataset(name) {
  const inputs = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  return inputs.map((input, index) => ({
    input,
    target: LOGIC_DATASETS[name][index],
  }));
}

function ringsDataset(seed) {
  const random = createRandom(seed + 101);
  const samples = [];
  for (let classIndex = 0; classIndex < 2; classIndex += 1) {
    const baseRadius = classIndex === 0 ? 0.42 : 0.95;
    for (let index = 0; index < 56; index += 1) {
      const angle = (index / 56) * Math.PI * 2 + (random() - 0.5) * 0.08;
      const radius = baseRadius + (random() - 0.5) * 0.17;
      samples.push({
        input: [Math.cos(angle) * radius, Math.sin(angle) * radius],
        target: classIndex,
      });
    }
  }
  return samples;
}

function diagonalDataset(seed) {
  const random = createRandom(seed + 211);
  return Array.from({ length: 96 }, () => {
    const x = random() * 2.4 - 1.2;
    const y = random() * 2.4 - 1.2;
    return {
      input: [x, y],
      target: x + y + (random() - 0.5) * 0.25 > 0 ? 1 : 0,
    };
  });
}

export const DATASET_META = {
  xor: { label: "XOR", description: "Separação não linear clássica", range: 1.3 },
  and: { label: "AND", description: "Porta lógica conjuntiva", range: 1.3 },
  or: { label: "OR", description: "Porta lógica disjuntiva", range: 1.3 },
  rings: { label: "Anéis", description: "Classes concêntricas", range: 1.35 },
  diagonal: { label: "Diagonal", description: "Fronteira linear com ruído", range: 1.3 },
};

export function createDataset(name = "xor", seed = 7) {
  if (Object.hasOwn(LOGIC_DATASETS, name)) return logicDataset(name);
  if (name === "rings") return ringsDataset(Number(seed) || 7);
  if (name === "diagonal") return diagonalDataset(Number(seed) || 7);
  throw new Error(`Unknown dataset: ${name}`);
}
