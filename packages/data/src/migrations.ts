/** Versionshanterade SQL-migrationer delade mellan SQLite (desktop) och dokumentation för Postgres. */

export interface Migration {
  version: number;
  name: string;
  sqlite: string;
  postgres: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: "create_investigations",
    sqlite: `
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS investigations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        company_json TEXT NOT NULL,
        sections_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_investigations_updated_at ON investigations(updated_at);
    `,
    postgres: `
      create table if not exists investigations (
        id uuid primary key,
        organization_id uuid not null,
        title text not null,
        status text not null,
        company_json jsonb not null default '{}'::jsonb,
        sections_json jsonb not null default '[]'::jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
      create index if not exists idx_investigations_org on investigations(organization_id);
    `
  }
];

export const CURRENT_SCHEMA_VERSION = 1;
