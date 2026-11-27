import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const home = os.homedir();
const roots = [
  path.join(home, "AppData", "Roaming"),
  path.join(home, "AppData", "Local")
];

const found = [];
for (const root of roots) {
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "Programs") continue;
        stack.push(full);
      } else if (entry.name === "miljoutredning.sqlite") {
        const stat = fs.statSync(full);
        found.push({ full, size: stat.size, mtime: stat.mtime.toISOString() });
      }
    }
  }
}

console.log("DATABASES", JSON.stringify(found, null, 2));

const asarPath = path.join(
  home,
  "AppData",
  "Local",
  "Programs",
  "@kgdesktop",
  "resources",
  "app.asar"
);

try {
  const asar = require("@electron/asar");
  console.log("PACKAGE", asar.extractFile(asarPath, "package.json").toString("utf8"));
} catch (error) {
  console.log("ASAR_READ_ERROR", error.message);
  const buf = fs.readFileSync(asarPath);
  const text = buf.toString("utf8");
  const match = text.match(/"name"\s*:\s*"[^"]+"/);
  const product = text.match(/"productName"\s*:\s*"[^"]+"/);
  console.log("NAME_MATCH", match?.[0]);
  console.log("PRODUCT_MATCH", product?.[0]);
}
