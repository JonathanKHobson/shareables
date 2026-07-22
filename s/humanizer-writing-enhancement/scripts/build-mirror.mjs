#!/usr/bin/env node

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const mirrorRoot = resolve(here, "..");
const args = new Map();

for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const htmlPath = args.get("--html");
const cssPath = args.get("--css");
const assetsPath = args.get("--assets");

if (!htmlPath || !cssPath || !assetsPath) {
  throw new Error(
    "Usage: build-mirror.mjs --html <rendered-html> --css <compiled-css> --assets <public-assets-dir>",
  );
}

const rendered = await readFile(htmlPath, "utf8");
const start = rendered.indexOf("<main>");
const end = rendered.indexOf("</main>", start);

if (start === -1 || end === -1) {
  throw new Error("The rendered Site response did not include a complete <main> element.");
}

const main = rendered
  .slice(start, end + "</main>".length)
  .replaceAll('src="/humanizer-markup.png"', 'src="assets/humanizer-markup.png"')
  .replaceAll(
    'src="/humanizer-revision-card.png"',
    'src="assets/humanizer-revision-card.png"',
  );

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Humanizer: Writing tools that keep your voice</title>
    <meta name="description" content="Download Humanizer and complementary writing, UX, design, grant, and TTRPG skill packs for Claude and Codex." />
    <meta property="og:title" content="Humanizer: Writing tools that keep your voice" />
    <meta property="og:description" content="A practical writing-enhancement toolkit for specificity, source integrity, voice, and reader trust." />
    <meta property="og:image" content="https://jonathankhobson.github.io/shareables/s/humanizer-writing-enhancement/assets/og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="assets/favicon.svg" />
    <link rel="stylesheet" href="assets/humanizer.css" />
  </head>
  <body>
${main}
    <script src="assets/mirror.js" defer></script>
  </body>
</html>
`;

const mirrorAssets = resolve(mirrorRoot, "assets");
await mkdir(mirrorAssets, { recursive: true });
await writeFile(resolve(mirrorRoot, "index.html"), page, "utf8");
await copyFile(cssPath, resolve(mirrorAssets, "humanizer.css"));

for (const asset of [
  "humanizer-markup.png",
  "humanizer-revision-card.png",
  "og.png",
  "favicon.svg",
]) {
  await copyFile(resolve(assetsPath, asset), resolve(mirrorAssets, asset));
}
