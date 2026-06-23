import { readFile } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "sw.js",
  "manifest.webmanifest",
  "assets/icon.svg",
  "assets/icon-180.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
];

for (const file of requiredFiles) {
  await readFile(new URL(`../${file}`, import.meta.url));
}

JSON.parse(await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"));
console.log("Static PWA files validated.");
