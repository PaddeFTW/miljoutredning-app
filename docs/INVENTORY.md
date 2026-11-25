# Inventering – Miljöutredning (Etapp 1)

Datum: 2026-11-17  
Gren: `feature/dual-platform-app-template`  
Repository: `PaddeFTW/miljoutredning-app`

## Sammanfattning

Projektet är en blandning av **Quality WorX-appmall** (plattform) och **delvis byggd Miljöutredning-UI**. Webbversionen startar lokalt. Permanent lagring, export, Electron/Windows och korrekt 21-avsnittsmodell enligt originaldokumentet saknas eller är ofullständiga.

## Vad som redan fungerar

| Område | Status | Kommentar |
|--------|--------|-----------|
| Next.js + TypeScript + Tailwind | KLAR | Next 16, React 19 |
| Modern Minimal Design System | KLAR | Tokens, layouts, UI-primitiver |
| Auth-UI (login, register, reset) | DELVIS KLAR | Kod finns; kräver aktiv Supabase |
| Supabase-klienter | DELVIS KLAR | client/server/proxy; typer endast `user_profiles` |
| Wizard (5 steg) | DELVIS KLAR | Grunduppgifter, aspekter, register, lagkrav, sammanställning |
| Register (kemikalier, resor, övrigt) | DELVIS KLAR | Session-only, sparas inte permanent |
| Quiz/vägledning (MU-källor) | DELVIS KLAR | MU-05/07/08/11/13/19/20/21 |
| Dashboard / overview-sidor | DELVIS KLAR | Visar hårdkodad demodata |
| Vercel-konfiguration | DELVIS KLAR | `vercel.json` finns |

## Vad som saknas eller är fel

| Område | Status | Kommentar |
|--------|--------|-----------|
| Originalets 21 avsnitt | EJ KLAR | `app-shell.tsx` har annan lista (ISO-lik) än Word-originalet |
| Bedömningsmodell 1–3 × 1–6 | DELVIS KLAR | Multiplikation finns; skalor/klassning ej tydligt låsta |
| Permanent sparning (webb) | EJ KLAR | Endast steg 0 försöker spara; register uttryckligen session-only |
| Organisation/RLS | BLOCKERAD | Wizard auto-kopplar till org `"KvalitetsGruppen"` – säkerhetsrisk |
| Databasmodell för utredningar | EJ KLAR | Kod refererar `organizations`, `investigations`, `investigation_company` men saknas i typer/migrationer |
| PDF-export | EJ KLAR | UI-placeholder |
| JSON-export | EJ KLAR | UI-placeholder |
| Electron / Windows / SQLite | EJ KLAR | Finns inte |
| Monorepo (apps/packages) | EJ KLAR | Platt Next-app i root |
| Backup/restore | EJ KLAR | Finns inte |
| Setup.exe | EJ KLAR | Finns inte |
| Originaldokument i repo | EJ KLAR | Låg i knowledge-base; extrakt under `docs/source/` |

## Originaldokument (styrande källa)

Hämtade från KvalitetsGruppens katalog:

- `Miljöutredning.docx`
- `Vägledning för miljöutredning.docx`
- `miljöutredning -Blanketter.docx`

### Originalets 21 avsnitt

1. Allmän information  
2. Verksamhetsbeskrivning  
3. Lagar och andra bindande krav  
4. Miljöolyckor och miljöolycksrisker  
5. Förbrukningsmaterial  
6. Råvaror och komponenter  
7. Kemikalier och kemiska produkter  
8. Avfall, farligt avfall och återvinning  
9. Vatten och avlopp  
10. Buller  
11. Energianvändning  
12. Transport  
13. Tjänsteresor  
14. Resor till och från jobbet (frivilligt)  
15. Nödlägesberedskap  
16. Leverantörsbedömning ur miljösynpunkt  
17. Miljöpolicy  
18. Miljömål  
19. Bedömning av miljöaspekter  
20. Betydande miljöaspekt  
21. Positiva iakttagelser  

### Bedömningsmodell (original)

- Mängd: 1–3  
- Miljöpåverkan: 1–6  
- Resultat = mängd × miljöpåverkan  
- 1–6 Mindre · 7–12 Måttlig · 13–18 Betydande  

## Plattformsberoenden

- **Webb:** Next.js App Router, Supabase Auth, Vercel  
- **Produkt-UI:** React-komponenter under `components/miljo/` (kan delas)  
- **Design:** `components/ui`, `components/layout`, `lib/design-tokens.ts` (kan delas)  
- **Data idag:** lokal React-state + ofullständig Supabase-skrivning  

## Säkerhetsfynd (webb)

1. Wizard försöker join:a användare till organisation med namnet `KvalitetsGruppen`.  
2. Tabeller för utredningar saknas i checked-in migrationer/typer.  
3. Supabase inaktiv → databasberoende flöden blockerade tills testmiljö finns.

## Namngivning (beslut enligt uppdrag)

- Produkt: **Miljöutredning – KvalitetsGruppen**  
- Teknisk mall: **KvalitetsGruppen App Template**  
- Använd inte Quality WorX / Quality Works som produktnamn för dessa appar  
- GitHub-mall `kvalitetsgruppen-app-template` skapas först efter godkänd arkitektur  

## Nästa steg (Etapp 2+)

1. Monorepo: `apps/web`, `apps/desktop`, `packages/{ui,core,data,product}`  
2. Gemensamt repository-gränssnitt + SQLite/Supabase-adaptrar  
3. Windows Electron + permanent lagring + Setup.exe  
4. Justera produkt till originalets 21 avsnitt  
5. Förbered webbadapter (test DB senare)  
6. Extrahera produktneutral mall  
