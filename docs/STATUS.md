# Statusrapport – dual-platform

Gren: `feature/dual-platform-app-template`  
Uppdaterad under pågående arbete.

| Leverans | Status | Kommentar |
|----------|--------|-----------|
| Inventering | KLAR | `docs/INVENTORY.md` |
| Originalets 21 avsnitt kartlagda | KLAR | `docs/PRODUCT_CONTENT_MAP.md`, `@kg/product` |
| Bedömningsmodell 1–3 × 1–6 | KLAR | `@kg/core` + wizard |
| Monorepo workspaces | DELVIS KLAR | packages + apps/desktop; webb fortfarande i root |
| Windows Electron + SQLite | DELVIS KLAR | Kod klar; Setup.exe EJ TESTAD förrän `npm run desktop:dist` körts |
| Permanent lokal lagring | DELVIS KLAR | sql.js + AppData + atomic write |
| Backup/restore/JSON-export | DELVIS KLAR | IPC implementerad; EJ TESTAD i installerad miljö |
| PDF-export | EJ KLAR | Placeholder i webb |
| Alla 21 avsnittsformulär ifyllbara | DELVIS KLAR | Avsnittsplatser skapas; fulla formulär per avsnitt återstår |
| Webb Supabase-adapter | BLOCKERAD | Stub + migrationer; kräver testdatabas |
| Org-säkerhetsfix | DELVIS KLAR | Auto-join borttagen; RLS-migrationer förberedda |
| KvalitetsGruppen App Template | DELVIS KLAR | Paketstruktur + docs; eget GitHub-repo EJ skapat |
| Setup.exe på ren Windows | EJ TESTAD | – |
| Merge till main | EJ KLAR | Kräver godkännande |
