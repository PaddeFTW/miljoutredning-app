import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const asar = require("@electron/asar");
const asarPath = path.join(
  os.homedir(),
  "AppData",
  "Local",
  "Programs",
  "@kgdesktop",
  "resources",
  "app.asar"
);

const files = asar.listPackage(asarPath);
const interesting = files.filter(
  (file) =>
    file.includes("preload") ||
    file.includes("zod") ||
    file.includes("sql.js") ||
    file.endsWith("package.json") ||
    file.includes("out/main") ||
    file.includes("out/renderer")
);

console.log(JSON.stringify({ total: files.length, interesting }, null, 2));
