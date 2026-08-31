import assert from "node:assert/strict";
import test from "node:test";

import { createDataset } from "../web/core/datasets.js";
import { evaluate } from "../web/core/metrics.js";
import { NeuralNetwork } from "../web/core/network.js";

test("XOR converges with the documented defaults", () => {
  const dataset = createDataset("xor", 7);
  const network = new NeuralNetwork({ hiddenSize: 5, seed: 7 });
  let loss = Number.POSITIVE_INFINITY;
  for (let epoch = 0; epoch < 1_500; epoch += 1) {
    loss = network.trainEpoch(dataset, 0.12);
  }
  const metrics = evaluate(network, dataset);
  assert.equal(metrics.accuracy, 1);
  assert.ok(loss < 0.02, `expected loss below 0.02, received ${loss}`);
});

test("the same seed reproduces the same initial model", () => {
  const first = new NeuralNetwork({ hiddenSize: 4, seed: 42 });
  const second = new NeuralNetwork({ hiddenSize: 4, seed: 42 });
  assert.deepEqual(first.snapshot(), second.snapshot());
});

test("all datasets produce finite probabilities", () => {
  for (const name of ["xor", "and", "or", "rings", "diagonal"]) {
    const dataset = createDataset(name, 9);
    const network = new NeuralNetwork({ hiddenSize: 6, seed: 9 });
    for (let epoch = 0; epoch < 30; epoch += 1) {
      network.trainEpoch(dataset, 0.08);
    }
    for (const sample of dataset) {
      const probability = network.predict(sample.input);
      assert.ok(Number.isFinite(probability));
      assert.ok(probability >= 0 && probability <= 1);
    }
  }
});

test("invalid inputs are rejected", () => {
  const network = new NeuralNetwork();
  assert.throws(() => network.predict([1]), /two finite numbers/);
  assert.throws(() => network.trainSample([0, 1], 3), /target/);
});
