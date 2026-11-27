# Statusrapport – dual-platform

Gren: `feature/dual-platform-app-template`  
Uppdaterad: 2026-11-18

## Leveransstatus

| Leverans | Status | Kommentar |
|----------|--------|-----------|
| Inventering | KLAR | `docs/INVENTORY.md` |
| Originalets 21 avsnitt kartlagda | KLAR | `docs/PRODUCT_CONTENT_MAP.md`, `@kg/product` |
| Bedömningsmodell 1–3 × 1–6 | KLAR | `@kg/core` + wizard; enhetstest godkänt |
| Monorepo workspaces | DELVIS KLAR | `packages/*` + `apps/desktop`; webb kvar i root |
| Windows Electron + SQLite | DELVIS KLAR | Bygg OK; app startar; skapa/spara via UI EJ TESTAD automatiskt |
| Permanent lokal lagring | DELVIS KLAR | sql.js + AppData + atomic write implementerat |
| Backup/restore/JSON-export | DELVIS KLAR | IPC + UI finns; EJ TESTAD end-to-end |
| PDF-export | EJ KLAR | Webb-placeholder |
| Alla 21 avsnittsformulär ifyllbara | DELVIS KLAR | Avsnittsplatser skapas i desktop; fulla blankettformulär återstår |
| Webb utan hårdkodad demodata | DELVIS KLAR | Dashboard/utredning rensade från “Nordkust” |
| Org-säkerhetsfix | DELVIS KLAR | Auto-join till KvalitetsGruppen borttagen |
| Supabase-adapter + RLS-migrationer | BLOCKERAD | Stub + SQL förberedda; kräver testdatabas |
| Setup.exe byggd | KLAR | `apps/desktop/release/Miljöutredning – KvalitetsGruppen Setup 0.1.0.exe` |
| Setup.exe installerad lokalt | KLAR | Silent install till `%LOCALAPPDATA%\Programs\miljoutredning-desktop\` |
| Installerad app startar | KLAR | Process + fönster verifierat |
| SQLite-lista efter omstart | KLAR | smoke-test.log: `list ok count=2` |
| UI skapa-knapp end-to-end | EJ TESTAD | Databas/API fungerar; manuell UI-klick kvar |
| KvalitetsGruppen App Template | DELVIS KLAR | Paket + docs; GitHub-template-repo EJ skapat |
| Merge till main | EJ KLAR | Kräver godkännande |

## Faktiskt testat

| Test | Resultat |
|------|----------|
| `npm run test:core` | Godkänd |
| `npm run test:data` | Godkänd |
| `npx tsc --noEmit` | Godkänd |
| `npm run desktop:build` | Godkänd |
| Electron-fönster startar | Godkänd (visuellt verifierat) |
| Skapa/spara/återöppna i Electron | EJ TESTAD |
| Setup.exe på ren Windows | EJ TESTAD |
| Supabase RLS | BLOCKERAD |

## Blockeringar

1. Aktiv Supabase-testdatabas saknas.  
2. Diskutrymme på C: har varit kritiskt (ca 0–1,4 GB ledigt under arbetet).  
3. Fullständiga 21 blankettformulär med permanent lagring per fält är inte färdiga.
