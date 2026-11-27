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
  "miljoutredning-desktop",
  "resources",
  "app.asar"
);

const files = asar.listPackage(asarPath);
const needle = ["zod", "out/main", "out\\main", "preload", "sql.js", "renderer", "package.json"];
for (const n of needle) {
  const hits = files.filter((f) => f.toLowerCase().includes(n.toLowerCase())).slice(0, 8);
  console.log(n, hits.length, hits);
}
