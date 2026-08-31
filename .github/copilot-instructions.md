# Neural IA repository instructions

- This repository is an inspectable neural-network laboratory, not an AGI or consciousness claim.
- Keep the public site static, dependency-free, and deployable from `web/` on GitHub Pages.
- The browser engine is in `web/core/`; keep it free of DOM and network access.
- The Python engine in `python/neural_ia/` mirrors the browser algorithm and uses only the standard library.
- Preserve deterministic behavior: all randomized datasets and model initialization must accept a seed.
- Do not change a loss function, activation derivative, update order, or initialization formula without numerical tests and documentation.
- Never add model weights, virtual environments, downloaded datasets, credentials, personal data, or vendored repositories.
- Never place an API token in browser code. Pages cannot keep secrets.
- Use accessible HTML, keyboard-operable controls, sufficient contrast, and reduced-motion support.
- Avoid `innerHTML` for user-controlled values.
- Run `npm run check` and `npm test` after JavaScript or site changes.
- Run `PYTHONPATH=python python -m unittest discover -s python_tests -v` after Python changes.
- Update `documentation/MATH.md` when mathematical behavior changes.
- Update `documentation/ARCHITECTURE.md` when component boundaries change.
- Prefer focused commits and include a regression test for bug fixes.
