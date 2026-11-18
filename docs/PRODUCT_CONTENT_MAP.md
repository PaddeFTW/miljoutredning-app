# Produktinnehållskarta – Miljöutredning

Koppling mellan originaldokument och appfunktioner.  
Källa: `Miljöutredning.docx`, `Vägledning för miljöutredning.docx`.

## Bedömningsmodell (originalkrav)

| Fält | Skala | Betydelse |
|------|-------|-----------|
| Mängd | 1–3 | Liten / Måttlig / Stor omfattning |
| Miljöpåverkan | 1–6 | 1–2 liten, 3–4 måttlig, 5–6 stor |
| Resultat | mängd × miljöpåverkan | Beräknas |
| Klassning | 1–6 Mindre · 7–12 Måttlig · 13–18 Betydande | Originalkrav |

## Avsnittskartläggning

| Nr | Originalavsnitt | Appfunktion | Datatyp | Originalkrav / digital förbättring |
|----|-----------------|-------------|---------|-------------------------------------|
| 1 | Allmän information | Formulär | Företag, period, omfattning, signaturer | Original |
| 2 | Verksamhetsbeskrivning | Formulär | Adress, kontakt, läge, anställda, omsättning | Original |
| 3 | Lagar och bindande krav | Register | Krav, beskrivning, avvikelse, uppföljning | Original |
| 4 | Miljöolyckor och risker | Register | Händelser 5 år, risker, skadegrad | Original |
| 5 | Förbrukningsmaterial | Register + bedömning | Poster med mängd/påverkan/resultat | Original |
| 6 | Råvaror och komponenter | Register + bedömning | Poster med mängd/påverkan/resultat | Original |
| 7 | Kemikalier och kemiska produkter | Register + bedömning | Produkt, SDB, mängd, påverkan, ansvarig | Original |
| 8 | Avfall, farligt avfall, återvinning | Register + bedömning | Fraktioner, mängder, hantering | Original |
| 9 | Vatten och avlopp | Formulär/register | Förbrukning, utsläpp, reningsverk | Original |
| 10 | Buller | Formulär | Källor, nivåer, åtgärder | Original |
| 11 | Energianvändning | Register + bedömning | El, värme, energislag, årsmängd | Original |
| 12 | Transport | Register + bedömning | Fordon, bränsle, mil, CO₂ | Original |
| 13 | Tjänsteresor | Register + bedömning | Fordon/färdmedel, mil, bedömning | Original |
| 14 | Resor till/från jobbet | Register (frivilligt) | Färdsätt, mil | Original (frivilligt) |
| 15 | Nödlägesberedskap | Formulär/checklista | Rutiner, ansvar, övning | Original |
| 16 | Leverantörsbedömning | Register | Leverantör, miljökrav, status | Original |
| 17 | Miljöpolicy | Textfält | Policytext / hänvisning | Original |
| 18 | Miljömål | Register | Mål, nyckeltal, ansvar, deadline | Original |
| 19 | Bedömning av miljöaspekter | Sammanställning | Alla bedömda rader | Original |
| 20 | Betydande miljöaspekt | Filter/vy | Resultat 13–18 (+ motivering) | Original |
| 21 | Positiva iakttagelser | Text/lista | Frivilliga positiva fynd | Original |

## Skillnad mot tidigare UI-lista

Den tidigare listan i `components/miljo/app-shell.tsx` (t.ex. “Utsläpp till luft”, “Mark och föroreningar”, “Ledningens genomgång”) **matchar inte** originalets 21 blanketter och ska ersättas av tabellen ovan.

## Föreslagna digitala förbättringar (inte originalkrav)

- Autosparning och återupptag av arbete  
- Quiz/vägledning per avsnitt (finns delvis)  
- PDF/JSON-export  
- Offline Windows-app med lokal databas  
- Sök/filter i register  
- Gemensam kundportal senare via qualityworks.se (endast dokumenterad)  
