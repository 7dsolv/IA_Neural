---
applyTo: "web/**/*.js,web/**/*.html,web/**/*.css,tests/**/*.js"
---

- Use browser-native APIs and ES modules; do not introduce a build step without a documented architectural reason.
- Keep canvas rendering separate from model calculations.
- Every visible control needs an associated label and keyboard behavior.
- Test core behavior with `node:test`; do not make tests depend on a remote service.
- Keep the app usable when the GitHub public API or Google Fonts is unavailable.
