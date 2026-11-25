# Ny app från Word-dokument

Standardprocess för framtida KvalitetsGruppen-produkter.

1. **Välj produkt** – t.ex. `Riskbedömning.docx`
2. **Analysera** – syfte, målgrupp, formulär, register, beräkningar, export
3. **Skapa specifikationen**
   - `PRODUCT_REQUIREMENTS.md`
   - `PRODUCT_CONTENT_MAP.md`
   - `PRODUCT_CONFIG.ts` (motsvarar `packages/product`)
4. **Bygg från mallen** – GitHub-template `kvalitetsgruppen-app-template` (skapas efter godkännande)
5. **Testa lokalt** – formulär, spara, återuppta, beräkningar, export, Setup.exe
6. **Leverera** – Setup.exe, webb, instruktion, versionshistorik, testprotokoll

Produktspecifikt innehåll ska ligga i `packages/product` (eller motsvarande).  
Delad teknik: UI, dataadapters, Electron, export, auth-mönster.
