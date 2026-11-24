# Miljöutredning – KvalitetsGruppen

Digital miljöutredning för webb och Windows, byggd på **KvalitetsGruppen App Template**.

## Starta lokalt

```bash
npm install
npm run dev            # webb (Next.js)
npm run desktop:dev    # Windows (Electron)
npm run test:core
npm run test:data
```

Bygg installerbart Windows-program:

```bash
npm run desktop:dist
```

Setup.exe skapas under `apps/desktop/release/`.

## Struktur

```text
apps/desktop/          Electron + SQLite (sql.js)
packages/core/         typer, bedömning, repository-gränssnitt
packages/data/         memory-/Supabase-adaptrar, migrationer
packages/product/      Miljöutredningens 21 avsnitt
packages/ui/           delad UI (under migrering)
supabase/migrations/   förberedda Postgres/RLS-migrationer
docs/                  inventering, arkitektur, status
```

Webbappen ligger tills vidare i repo-roten (Next.js) så att befintlig Vercel-setup fortsätter fungera.

## Dokumentation

- `docs/INVENTORY.md`
- `docs/PRODUCT_CONTENT_MAP.md`
- `docs/DUAL_PLATFORM.md`
- `docs/NEW_APP_FROM_WORD.md`
- `docs/QUALITYWORKS_PORTAL.md`
- `docs/STATUS.md`

## Viktiga regler

- Ingen merge till `main` utan godkännande
- Ingen produktionspublicering i denna etapp
- Windows fungerar offline utan Supabase
- Supabase-tester är blockerade tills testdatabas finns
