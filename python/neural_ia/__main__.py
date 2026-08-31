"""Run a reproducible XOR experiment from the command line."""

from __future__ import annotations

import argparse
import json

from .datasets import XOR
from .network import NeuralNetwork


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the Neural IA reference engine")
    parser.add_argument("--epochs", type=int, default=1_500)
    parser.add_argument("--hidden", type=int, default=5)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--learning-rate", type=float, default=0.12)
    parser.add_argument("--json", action="store_true", help="print the model snapshot")
    args = parser.parse_args()

    model = NeuralNetwork(hidden_size=args.hidden, seed=args.seed)
    losses = model.fit(XOR, epochs=args.epochs, learning_rate=args.learning_rate)
    predictions = [round(model.predict(inputs), 6) for inputs, _ in XOR]
    result = {
        "epochs": model.epochs,
        "loss": round(losses[-1], 8),
        "accuracy": model.accuracy(XOR),
        "predictions": predictions,
    }

    print(json.dumps(model.to_dict() if args.json else result, indent=2))


if __name__ == "__main__":
    main()
