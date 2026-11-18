# Framtida inloggning via qualityworks.se

Detta är **endast dokumentation**. Bygg inte kundportalen och ändra inte qualityworks.se i denna etapp.

## Kundresa (målbild)

```text
qualityworks.se → Mina appar → Logga in → Kundportal
  ├── Miljöutredning (webb / Windows-nedladdning)
  ├── Skyddsrond
  ├── Riskbedömning
  └── Introduktion
```

## Arkitekturprinciper

1. Separera **identitet**, **företagsmedlemskap** och **produkttillgång**.
2. Behörighet kontrolleras serverside (RLS / API), aldrig bara i klienten.
3. Använd etablerad auth (t.ex. OAuth/OIDC via Supabase eller annan IdP).
4. Gemensamt konto betyder inte automatiskt gemensam inloggningssession i alla appar.
5. Windows-appen ska fortsätta fungera offline utan portalen.

## Integration senare

- Portal listar appar kunden har rätt till.
- Webbappar federerar inloggning mot samma IdP.
- Windows-distribution kan länkas från portalen men kräver ingen online-auth för lokal användning.
