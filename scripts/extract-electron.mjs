import extract from "extract-zip";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const electronDir = path.dirname(require.resolve("electron/package.json"));
const cacheRoot = path.join(os.homedir(), "AppData", "Local", "electron", "Cache");
const zipName = "electron-v39.8.10-win32-x64.zip";

function findZip(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = findZip(full);
      if (nested) return nested;
    } else if (entry.name === zipName) {
      return full;
    }
  }
  return null;
}

const zip = findZip(cacheRoot);
if (!zip) {
  console.error("Zip not found in cache");
  process.exit(1);
}

const dist = path.join(electronDir, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

console.log("Extracting", zip, "->", dist);
await extract(zip, { dir: dist });
fs.writeFileSync(path.join(electronDir, "path.txt"), "electron.exe");
fs.writeFileSync(path.join(dist, "version"), "39.8.10");
console.log("electron.exe exists:", fs.existsSync(path.join(dist, "electron.exe")));
console.log("files:", fs.readdirSync(dist).slice(0, 15));
