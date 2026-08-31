---
applyTo: "python/**/*.py,python_tests/**/*.py"
---

- Support Python 3.10 or newer and prefer the standard library.
- Add type hints to public functions and keep deterministic seeds in tests.
- Use `unittest` so a fresh clone can validate without installing packages.
- Serialization must use explicit JSON-compatible structures; do not use pickle for untrusted data.
