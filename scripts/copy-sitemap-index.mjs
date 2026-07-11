import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const sitemapIndex = join(distDir, "sitemap-index.xml");
const sitemapCompat = join(distDir, "sitemap.xml");

if (!existsSync(sitemapIndex)) {
  throw new Error("Expected dist/sitemap-index.xml to exist after astro build.");
}

copyFileSync(sitemapIndex, sitemapCompat);
console.log("Created dist/sitemap.xml from sitemap-index.xml");
