import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const initSqlJs = require("sql.js");

const dbPath = path.join(
  os.homedir(),
  "AppData",
  "Roaming",
  "Miljöutredning – KvalitetsGruppen",
  "miljoutredning.sqlite"
);

const SQL = await initSqlJs({
  locateFile: () => require.resolve("sql.js/dist/sql-wasm.wasm")
});

const bytes = fs.readFileSync(dbPath);
const db = new SQL.Database(bytes);
const meta = db.exec("SELECT key, value FROM meta");
const rows = db.exec(
  "SELECT id, title, status, company_json, created_at, updated_at FROM investigations ORDER BY updated_at DESC"
);

console.log(
  JSON.stringify(
    {
      dbPath,
      size: bytes.length,
      meta: meta[0]?.values ?? [],
      investigations: (rows[0]?.values ?? []).map((row) => ({
        id: row[0],
        title: row[1],
        status: row[2],
        company: row[3],
        createdAt: row[4],
        updatedAt: row[5]
      }))
    },
    null,
    2
  )
);
