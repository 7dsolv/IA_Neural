const EPSILON = 1e-9;

export function createRandom(seed = 7) {
  let state = Number(seed) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function sigmoid(value) {
  if (value >= 0) {
    const exp = Math.exp(-value);
    return 1 / (1 + exp);
  }

  const exp = Math.exp(value);
  return exp / (1 + exp);
}

function activate(name, value) {
  if (name === "tanh") return Math.tanh(value);
  if (name === "relu") return Math.max(0, value);
  if (name === "sigmoid") return sigmoid(value);
  throw new Error(`Unsupported activation: ${name}`);
}

function derivative(name, output) {
  if (name === "tanh") return 1 - output * output;
  if (name === "relu") return output > 0 ? 1 : 0;
  if (name === "sigmoid") return output * (1 - output);
  throw new Error(`Unsupported activation: ${name}`);
}

class DenseLayer {
  constructor(inputSize, outputSize, activationName, random) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.activationName = activationName;
    const limit = Math.sqrt(6 / (inputSize + outputSize));
    this.weights = Array.from({ length: outputSize }, () =>
      Array.from({ length: inputSize }, () => (random() * 2 - 1) * limit),
    );
    this.biases = Array(outputSize).fill(0);
  }

  forward(input) {
    return this.weights.map((row, outputIndex) => {
      const weighted = row.reduce(
        (sum, weight, inputIndex) => sum + weight * input[inputIndex],
        this.biases[outputIndex],
      );
      return activate(this.activationName, weighted);
    });
  }

  backward(input, output, outputGradient, learningRate) {
    const localGradient = output.map(
      (value, index) => outputGradient[index] * derivative(this.activationName, value),
    );
    const inputGradient = Array(this.inputSize).fill(0);

    for (let outputIndex = 0; outputIndex < this.outputSize; outputIndex += 1) {
      for (let inputIndex = 0; inputIndex < this.inputSize; inputIndex += 1) {
        inputGradient[inputIndex] +=
          localGradient[outputIndex] * this.weights[outputIndex][inputIndex];
      }
    }

    for (let outputIndex = 0; outputIndex < this.outputSize; outputIndex += 1) {
      for (let inputIndex = 0; inputIndex < this.inputSize; inputIndex += 1) {
        this.weights[outputIndex][inputIndex] -=
          learningRate * localGradient[outputIndex] * input[inputIndex];
      }
      this.biases[outputIndex] -= learningRate * localGradient[outputIndex];
    }

    return inputGradient;
  }
}

export class NeuralNetwork {
  constructor({ hiddenSize = 5, seed = 7, activation = "tanh" } = {}) {
    if (!Number.isInteger(hiddenSize) || hiddenSize < 2 || hiddenSize > 16) {
      throw new RangeError("hiddenSize must be an integer between 2 and 16");
    }

    this.seed = Number(seed) || 7;
    this.hiddenSize = hiddenSize;
    this.activation = activation;
    this.random = createRandom(this.seed);
    this.hiddenLayer = new DenseLayer(2, hiddenSize, activation, this.random);
    this.outputLayer = new DenseLayer(hiddenSize, 1, "sigmoid", this.random);
    this.epochs = 0;
  }

  predict(input) {
    this.#assertInput(input);
    const hidden = this.hiddenLayer.forward(input);
    return this.outputLayer.forward(hidden)[0];
  }

  trainSample(input, target, learningRate = 0.12) {
    this.#assertInput(input);
    if (target !== 0 && target !== 1) {
      throw new RangeError("target must be 0 or 1");
    }
    if (!(learningRate > 0 && learningRate <= 2)) {
      throw new RangeError("learningRate must be greater than 0 and at most 2");
    }

    const hidden = this.hiddenLayer.forward(input);
    const output = this.outputLayer.forward(hidden);
    const probability = Math.min(1 - EPSILON, Math.max(EPSILON, output[0]));
    const loss = -(
      target * Math.log(probability) +
      (1 - target) * Math.log(1 - probability)
    );

    // BCE derivative with respect to sigmoid output. The sigmoid derivative
    // inside DenseLayer reduces this pair to (probability - target).
    const outputGradient = [
      (probability - target) / (probability * (1 - probability)),
    ];
    const hiddenGradient = this.outputLayer.backward(
      hidden,
      output,
      outputGradient,
      learningRate,
    );
    this.hiddenLayer.backward(input, hidden, hiddenGradient, learningRate);
    return loss;
  }

  trainEpoch(dataset, learningRate = 0.12) {
    if (!Array.isArray(dataset) || dataset.length === 0) {
      throw new TypeError("dataset must contain at least one sample");
    }

    const order = Array.from({ length: dataset.length }, (_, index) => index);
    for (let index = order.length - 1; index > 0; index -= 1) {
      const selected = Math.floor(this.random() * (index + 1));
      [order[index], order[selected]] = [order[selected], order[index]];
    }

    let totalLoss = 0;
    for (const index of order) {
      const sample = dataset[index];
      totalLoss += this.trainSample(sample.input, sample.target, learningRate);
    }
    this.epochs += 1;
    return totalLoss / dataset.length;
  }

  snapshot() {
    return {
      seed: this.seed,
      hiddenSize: this.hiddenSize,
      activation: this.activation,
      epochs: this.epochs,
      hiddenWeights: this.hiddenLayer.weights.map((row) => [...row]),
      hiddenBiases: [...this.hiddenLayer.biases],
      outputWeights: this.outputLayer.weights.map((row) => [...row]),
      outputBiases: [...this.outputLayer.biases],
    };
  }

  #assertInput(input) {
    if (
      !Array.isArray(input) ||
      input.length !== 2 ||
      input.some((value) => !Number.isFinite(value))
    ) {
      throw new TypeError("input must be an array with two finite numbers");
    }
  }
}
