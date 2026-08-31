import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("the public page exposes the main interactive controls", async () => {
  const html = await readFile(path.join(root, "web", "index.html"), "utf8");
  for (const id of [
    "laboratorio",
    "dataset",
    "start-training",
    "decision-canvas",
    "network-canvas",
    "loss-canvas",
    "export-model",
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /name="description"/);
  assert.match(html, /rel="canonical"/);
});

test("all app shell files referenced by the service worker exist", async () => {
  const serviceWorker = await readFile(path.join(root, "web", "sw.js"), "utf8");
  const paths = [...serviceWorker.matchAll(/"\.\/(.*?)"/g)].map((match) => match[1]);
  assert.ok(paths.length >= 8);
  await Promise.all(
    paths
      .filter(Boolean)
      .map((entry) => readFile(path.join(root, "web", entry))),
  );
});
