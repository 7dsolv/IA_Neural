"""A dependency-free multilayer perceptron for educational experiments."""

from __future__ import annotations

from dataclasses import dataclass
from math import exp, log, sqrt, tanh
from random import Random
from typing import Iterable, Sequence

Sample = tuple[Sequence[float], int]


def _sigmoid(value: float) -> float:
    if value >= 0:
        factor = exp(-value)
        return 1.0 / (1.0 + factor)
    factor = exp(value)
    return factor / (1.0 + factor)


def _activate(name: str, value: float) -> float:
    if name == "tanh":
        return tanh(value)
    if name == "relu":
        return max(0.0, value)
    if name == "sigmoid":
        return _sigmoid(value)
    raise ValueError(f"unsupported activation: {name}")


def _derivative(name: str, output: float) -> float:
    if name == "tanh":
        return 1.0 - output * output
    if name == "relu":
        return 1.0 if output > 0 else 0.0
    if name == "sigmoid":
        return output * (1.0 - output)
    raise ValueError(f"unsupported activation: {name}")


@dataclass
class DenseLayer:
    """A fully connected layer with an element-wise activation."""

    input_size: int
    output_size: int
    activation: str
    weights: list[list[float]]
    biases: list[float]

    @classmethod
    def create(
        cls,
        input_size: int,
        output_size: int,
        activation: str,
        random: Random,
    ) -> "DenseLayer":
        limit = sqrt(6.0 / (input_size + output_size))
        weights = [
            [random.uniform(-limit, limit) for _ in range(input_size)]
            for _ in range(output_size)
        ]
        return cls(input_size, output_size, activation, weights, [0.0] * output_size)

    def forward(self, inputs: Sequence[float]) -> list[float]:
        return [
            _activate(
                self.activation,
                sum(weight * value for weight, value in zip(row, inputs, strict=True))
                + self.biases[index],
            )
            for index, row in enumerate(self.weights)
        ]

    def backward(
        self,
        inputs: Sequence[float],
        outputs: Sequence[float],
        output_gradient: Sequence[float],
        learning_rate: float,
    ) -> list[float]:
        local_gradient = [
            gradient * _derivative(self.activation, output)
            for output, gradient in zip(outputs, output_gradient, strict=True)
        ]
        input_gradient = [0.0] * self.input_size

        for output_index in range(self.output_size):
            for input_index in range(self.input_size):
                input_gradient[input_index] += (
                    local_gradient[output_index] * self.weights[output_index][input_index]
                )

        for output_index in range(self.output_size):
            for input_index in range(self.input_size):
                self.weights[output_index][input_index] -= (
                    learning_rate * local_gradient[output_index] * inputs[input_index]
                )
            self.biases[output_index] -= learning_rate * local_gradient[output_index]

        return input_gradient


class NeuralNetwork:
    """Two-layer MLP for binary classification.

    The implementation intentionally favors readability and deterministic tests
    over tensor-level performance. It mirrors the browser engine used by the
    interactive demo.
    """

    def __init__(self, hidden_size: int = 5, seed: int = 7) -> None:
        if not 2 <= hidden_size <= 16:
            raise ValueError("hidden_size must be between 2 and 16")
        self.hidden_size = hidden_size
        self.seed = seed
        self.epochs = 0
        self._random = Random(seed)
        self.hidden_layer = DenseLayer.create(2, hidden_size, "tanh", self._random)
        self.output_layer = DenseLayer.create(hidden_size, 1, "sigmoid", self._random)

    @staticmethod
    def _validate_input(inputs: Sequence[float]) -> None:
        if len(inputs) != 2:
            raise ValueError("inputs must contain exactly two values")

    def predict(self, inputs: Sequence[float]) -> float:
        self._validate_input(inputs)
        hidden = self.hidden_layer.forward(inputs)
        return self.output_layer.forward(hidden)[0]

    def train_sample(
        self,
        inputs: Sequence[float],
        target: int,
        learning_rate: float = 0.12,
    ) -> float:
        self._validate_input(inputs)
        if target not in (0, 1):
            raise ValueError("target must be 0 or 1")
        if not 0 < learning_rate <= 2:
            raise ValueError("learning_rate must be greater than 0 and at most 2")

        hidden = self.hidden_layer.forward(inputs)
        output = self.output_layer.forward(hidden)
        probability = min(1.0 - 1e-9, max(1e-9, output[0]))
        loss = -(target * log(probability) + (1 - target) * log(1 - probability))
        output_gradient = [
            (probability - target) / (probability * (1.0 - probability))
        ]
        hidden_gradient = self.output_layer.backward(
            hidden, output, output_gradient, learning_rate
        )
        self.hidden_layer.backward(inputs, hidden, hidden_gradient, learning_rate)
        return loss

    def train_epoch(
        self, dataset: Sequence[Sample], learning_rate: float = 0.12
    ) -> float:
        if not dataset:
            raise ValueError("dataset must not be empty")
        order = list(range(len(dataset)))
        self._random.shuffle(order)
        total_loss = 0.0
        for index in order:
            inputs, target = dataset[index]
            total_loss += self.train_sample(inputs, target, learning_rate)
        self.epochs += 1
        return total_loss / len(dataset)

    def fit(
        self,
        dataset: Sequence[Sample],
        epochs: int = 1_500,
        learning_rate: float = 0.12,
    ) -> list[float]:
        if epochs < 1:
            raise ValueError("epochs must be positive")
        return [self.train_epoch(dataset, learning_rate) for _ in range(epochs)]

    def accuracy(self, dataset: Iterable[Sample]) -> float:
        samples = list(dataset)
        if not samples:
            raise ValueError("dataset must not be empty")
        correct = sum(
            (self.predict(inputs) >= 0.5) == bool(target)
            for inputs, target in samples
        )
        return correct / len(samples)

    def to_dict(self) -> dict[str, object]:
        return {
            "format": "neural-ia-python/v1",
            "seed": self.seed,
            "hidden_size": self.hidden_size,
            "epochs": self.epochs,
            "hidden": {
                "weights": self.hidden_layer.weights,
                "biases": self.hidden_layer.biases,
            },
            "output": {
                "weights": self.output_layer.weights,
                "biases": self.output_layer.biases,
            },
        }
