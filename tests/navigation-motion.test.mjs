import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");

async function readBuiltAssets(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      contents.push(...(await readBuiltAssets(entryPath)));
    } else if (/\.(?:css|html|js)$/.test(entry.name)) {
      contents.push(await readFile(entryPath, "utf8"));
    }
  }

  return contents;
}

const homepage = await readFile(path.join(distRoot, "index.html"), "utf8");
const builtOutput = (await readBuiltAssets(distRoot)).join("\n");

test("navigation starts visible feedback before the next page is prepared", () => {
  assert.match(builtOutput, /data-navigation-pending/);
  assert.match(builtOutput, /#nprogress/);
  assert.match(builtOutput, /astro:before-preparation/);
  assert.match(builtOutput, /astro:page-load/);
});

test("forward and back navigation use distinct motion", () => {
  assert.match(builtOutput, /li1408PageForwardIn/);
  assert.match(builtOutput, /li1408PageBackIn/);
  assert.match(builtOutput, /data-astro-transition=.?back/);
});

test("visible homepage article cards prefetch their documents", () => {
  const articleLinks = homepage.match(
    /<a(?=[^>]*href="\/blog\/(?!tag\/)[^"]+")(?=[^>]*target="_self")[^>]*>/g,
  );

  assert.ok(articleLinks?.length, "expected at least one homepage article link");
  for (const articleLink of articleLinks) {
    assert.match(articleLink, /data-astro-prefetch="viewport"/);
  }
});
