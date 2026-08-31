from __future__ import annotations

import unittest

from neural_ia.datasets import XOR
from neural_ia.network import NeuralNetwork


class NeuralNetworkTests(unittest.TestCase):
    def test_xor_converges_deterministically(self) -> None:
        model = NeuralNetwork(hidden_size=5, seed=7)
        losses = model.fit(XOR, epochs=1_500, learning_rate=0.12)
        self.assertLess(losses[-1], 0.02)
        self.assertEqual(model.accuracy(XOR), 1.0)

    def test_seed_reproduces_initial_predictions(self) -> None:
        first = NeuralNetwork(hidden_size=4, seed=42)
        second = NeuralNetwork(hidden_size=4, seed=42)
        self.assertEqual(
            [first.predict(inputs) for inputs, _ in XOR],
            [second.predict(inputs) for inputs, _ in XOR],
        )

    def test_invalid_configuration_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            NeuralNetwork(hidden_size=1)
        with self.assertRaises(ValueError):
            NeuralNetwork().train_sample([0.0, 0.0], 2)


if __name__ == "__main__":
    unittest.main()
