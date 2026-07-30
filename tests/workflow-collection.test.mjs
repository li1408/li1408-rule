import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");
const homepage = await readFile(path.join(distRoot, "index.html"), "utf8");
const blogIndex = await readFile(path.join(distRoot, "blog", "index.html"), "utf8");

const workflowSlugs = [
  "math-modeling-workflow-build-log",
  "math-modeling-workflow",
  "math-modeling-workflow-reproducibility-retrospective",
  "cumcm2025-c-workflow-record",
];

function countMatches(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

test("homepage does not render the workflow collection", () => {
  assert.equal(countMatches(homepage, /data-workflow-collection/g), 0);
  assert.equal(countMatches(homepage, /data-workflow-series-entry/g), 0);
});

test("blog index replaces four standalone workflow cards with one expandable collection", () => {
  assert.equal(countMatches(blogIndex, /data-workflow-collection/g), 1);
  assert.equal(countMatches(blogIndex, /data-workflow-series-entry/g), 4);

  for (const slug of workflowSlugs) {
    assert.equal(countMatches(blogIndex, new RegExp(`href="/blog/${slug}"`, "g")), 1);
  }
});

test("workflow timeline keeps the four stages in chronological order", () => {
  const positions = workflowSlugs.map((slug) => blogIndex.indexOf(`href="/blog/${slug}"`));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test("original workflow article pages remain available", async () => {
  for (const slug of workflowSlugs) {
    const article = await readFile(path.join(distRoot, "blog", slug, "index.html"), "utf8");
    assert.match(article, /<article/);
  }
});
