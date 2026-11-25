# Dual platform – webb och Windows

## Princip

En kodbas, två körningar, två databasadaptrar.

```text
Produkt-UI + @kg/product + @kg/core
              |
        InvestigationRepository
         /                \
   SQLite (desktop)    Supabase (web)
```

## Mappar

| Sökväg | Roll |
|--------|------|
| `apps/desktop` | Electron + Vite + sql.js |
| `packages/core` | Typer, bedömning, repository-gränssnitt |
| `packages/data` | Memory-, Supabase-stub, migrationer |
| `packages/product` | Miljöutredningens 21 avsnitt |
| `packages/ui` | Delad UI (under migrering) |
| Root Next.js | Befintlig webbapp (flytt till `apps/web` planeras) |

## Kommandon

```bash
npm install
npm run dev              # webb
npm run desktop:dev      # Windows Electron
npm run test:data        # minnesrepository-tester
npm run build -w @kg/desktop
npm run dist -w @kg/desktop   # Setup.exe
```

## Windows-lagring

- Databasfil i `app.getPath('userData')`
- Atomisk skrivning: temp-fil → rename
- Backup/restore via IPC-dialoger
- Ingen Supabase-inloggning krävs

## Webb-lagring

- Supabase Auth + PostgreSQL + RLS
- Migrationer under `supabase/migrations/`
- Adapter `createSupabaseRepository` är förberedd men **BLOCKERAD** utan aktiv testdatabas
