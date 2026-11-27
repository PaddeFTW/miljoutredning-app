import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";

const require = createRequire(import.meta.url);
const initSqlJs = require("sql.js");

const dbPath = path.join(
  os.homedir(),
  "AppData",
  "Roaming",
  "Miljöutredning – KvalitetsGruppen",
  "miljoutredning.sqlite"
);

const sections = Array.from({ length: 21 }, (_, index) => ({
  sectionId: index + 1,
  completed: false,
  fields: {},
  rows: []
}));

const SQL = await initSqlJs({
  locateFile: () => require.resolve("sql.js/dist/sql-wasm.wasm")
});

const bytes = fs.readFileSync(dbPath);
const db = new SQL.Database(bytes);
const now = new Date().toISOString();
const id = randomUUID();
const title = "Installationsstest 2026";
const company = { name: "Testbolaget Install AB" };

db.run(
  `INSERT INTO investigations (id, title, status, company_json, sections_json, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [id, title, "utkast", JSON.stringify(company), JSON.stringify(sections), now, now]
);

const temp = `${dbPath}.seed-tmp`;
fs.writeFileSync(temp, Buffer.from(db.export()));
fs.renameSync(temp, dbPath);

const count = db.exec("SELECT COUNT(*) FROM investigations")[0].values[0][0];
console.log(JSON.stringify({ dbPath, id, title, count: Number(count), sections: sections.length }, null, 2));
