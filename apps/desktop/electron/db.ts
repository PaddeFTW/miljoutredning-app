import { app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import { createEmptySections } from "@kg/product";

const require = createRequire(import.meta.url);
const DB_FILE_NAME = "miljoutredning.sqlite";
const SCHEMA_VERSION = 1;

export type Investigation = {
  id: string;
  title: string;
  status: string;
  company: { name: string };
  sections: unknown[];
  createdAt: string;
  updatedAt: string;
};

export type CreateInvestigationInput = {
  title: string;
  company: { name: string };
};

export type UpdateInvestigationInput = {
  id: string;
  title: string;
  company: { name: string };
  status?: string;
  sections?: unknown[];
};

export type ExportPayload = {
  exportedAt: string;
  schemaVersion: number;
  investigations: Investigation[];
};

export class DesktopDatabase {
  private sql: SqlJsStatic | null = null;
  private db: Database | null = null;
  private readonly dbPath: string;

  constructor(private readonly userDataPath = app.getPath("userData")) {
    this.dbPath = path.join(this.userDataPath, DB_FILE_NAME);
  }

  get filePath(): string {
    return this.dbPath;
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.userDataPath, { recursive: true });

    this.sql = await initSqlJs({
      locateFile: () => this.resolveSqlWasmPath()
    });

    const existing = await this.readExistingDatabase();
    this.db = existing ? new this.sql.Database(existing) : new this.sql.Database();
    this.runMigrations();
    await this.persist();
  }

  listInvestigations(): Investigation[] {
    const db = this.requireDb();
    const rows = db.exec(
      "SELECT id, title, status, company_json, sections_json, created_at, updated_at FROM investigations ORDER BY updated_at DESC"
    );

    if (rows.length === 0) {
      return [];
    }

    return rows[0].values.map((row) => this.rowToInvestigation(row));
  }

  getInvestigation(id: string): Investigation | null {
    const statement = this.requireDb().prepare(
      "SELECT id, title, status, company_json, sections_json, created_at, updated_at FROM investigations WHERE id = $id"
    );

    try {
      statement.bind({ $id: id });
      if (!statement.step()) {
        return null;
      }

      return this.objectToInvestigation(statement.getAsObject());
    } finally {
      statement.free();
    }
  }

  async createInvestigation(input: CreateInvestigationInput): Promise<Investigation> {
    const now = new Date().toISOString();
    const investigation: Investigation = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      status: "utkast",
      company: { name: input.company.name.trim() },
      sections: createEmptySections(),
      createdAt: now,
      updatedAt: now
    };

    this.requireDb().run(
      `INSERT INTO investigations (id, title, status, company_json, sections_json, created_at, updated_at)
       VALUES ($id, $title, $status, $companyJson, $sectionsJson, $createdAt, $updatedAt)`,
      {
        $id: investigation.id,
        $title: investigation.title,
        $status: investigation.status,
        $companyJson: JSON.stringify(investigation.company),
        $sectionsJson: JSON.stringify(investigation.sections),
        $createdAt: investigation.createdAt,
        $updatedAt: investigation.updatedAt
      }
    );

    await this.persist();
    return investigation;
  }

  async updateInvestigation(input: UpdateInvestigationInput): Promise<Investigation> {
    const existing = this.getInvestigation(input.id);
    if (!existing) {
      throw new Error("Investigation not found.");
    }

    const updated: Investigation = {
      ...existing,
      title: input.title.trim(),
      status: input.status ?? existing.status,
      company: { name: input.company.name.trim() },
      sections: input.sections ?? existing.sections,
      updatedAt: new Date().toISOString()
    };

    this.requireDb().run(
      `UPDATE investigations
       SET title = $title,
           status = $status,
           company_json = $companyJson,
           sections_json = $sectionsJson,
           updated_at = $updatedAt
       WHERE id = $id`,
      {
        $id: updated.id,
        $title: updated.title,
        $status: updated.status,
        $companyJson: JSON.stringify(updated.company),
        $sectionsJson: JSON.stringify(updated.sections),
        $updatedAt: updated.updatedAt
      }
    );

    await this.persist();
    return updated;
  }

  async deleteInvestigation(id: string): Promise<void> {
    this.requireDb().run("DELETE FROM investigations WHERE id = $id", { $id: id });
    await this.persist();
  }

  exportJson(): ExportPayload {
    return {
      exportedAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      investigations: this.listInvestigations()
    };
  }

  async backupTo(destinationPath: string): Promise<void> {
    await this.persist();
    await fs.copyFile(this.dbPath, destinationPath);
  }

  async restoreFrom(sourcePath: string): Promise<void> {
    await fs.copyFile(sourcePath, `${this.dbPath}.restore-tmp`);
    await fs.rename(`${this.dbPath}.restore-tmp`, this.dbPath);

    if (!this.sql) {
      throw new Error("Database engine is not initialized.");
    }

    const bytes = await fs.readFile(this.dbPath);
    this.db?.close();
    this.db = new this.sql.Database(bytes);
    this.runMigrations();
    await this.persist();
  }

  private runMigrations(): void {
    const db = this.requireDb();
    db.run("BEGIN TRANSACTION");

    try {
      db.run("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
      const currentVersion = this.getSchemaVersion();

      if (currentVersion < 1) {
        db.run(`
          CREATE TABLE IF NOT EXISTS investigations (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            company_json TEXT NOT NULL,
            sections_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        `);
        db.run("CREATE INDEX IF NOT EXISTS idx_investigations_updated_at ON investigations(updated_at)");
        this.setSchemaVersion(1);
      }

      db.run("COMMIT");
    } catch (error) {
      db.run("ROLLBACK");
      throw error;
    }
  }

  private getSchemaVersion(): number {
    const result = this.requireDb().exec("SELECT value FROM meta WHERE key = 'schema_version'");
    if (result.length === 0 || result[0].values.length === 0) {
      return 0;
    }

    return Number(result[0].values[0][0]) || 0;
  }

  private setSchemaVersion(version: number): void {
    this.requireDb().run(
      "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', $version)",
      { $version: String(version) }
    );
  }

  private async persist(): Promise<void> {
    const db = this.requireDb();
    const tempPath = `${this.dbPath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tempPath, Buffer.from(db.export()));
    await fs.rename(tempPath, this.dbPath);
  }

  private async readExistingDatabase(): Promise<Uint8Array | null> {
    try {
      return await fs.readFile(this.dbPath);
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
        return null;
      }

      throw error;
    }
  }

  private resolveSqlWasmPath(): string {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, "sql-wasm.wasm");
    }

    return require.resolve("sql.js/dist/sql-wasm.wasm");
  }

  private rowToInvestigation(row: unknown[]): Investigation {
    const [id, title, status, companyJson, sectionsJson, createdAt, updatedAt] = row;
    return {
      id: String(id),
      title: String(title),
      status: String(status),
      company: this.parseCompany(String(companyJson)),
      sections: this.parseSections(String(sectionsJson)),
      createdAt: String(createdAt),
      updatedAt: String(updatedAt)
    };
  }

  private objectToInvestigation(row: Record<string, unknown>): Investigation {
    return {
      id: String(row.id),
      title: String(row.title),
      status: String(row.status),
      company: this.parseCompany(String(row.company_json)),
      sections: this.parseSections(String(row.sections_json)),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at)
    };
  }

  private parseCompany(json: string): { name: string } {
    const parsed = JSON.parse(json) as { name?: unknown };
    return { name: typeof parsed.name === "string" ? parsed.name : "" };
  }

  private parseSections(json: string): unknown[] {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  }

  private requireDb(): Database {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }

    return this.db;
  }
}
