                              ┌─────────────────────────────────────────────────────────┐
                              │            ARCHITETTURA DATI UK VEHICLE & MOT           │
                              └─────────────────────────────────────────────────────────┘
                                                           │
          ┌────────────────────────────────────────────────┼────────────────────────────────────────────┐
          ▼                                                ▼                                            ▼
┌───────────────────────────────────┐    ┌───────────────────────────────────┐    ┌───────────────────────────────────────────┐
│     1. LIVE LOOKUP DA TARGA       │    │      2. DVLA VES API (TAX)        │    │        3. BULK OPEN DATA (SEO)            │
│       (DVSA MOT History API)      │    │    (Vehicle Enquiry Service)      │    │       (data.gov.uk Anonymised)            │
├───────────────────────────────────┤    ├───────────────────────────────────┤    ├───────────────────────────────────────────┤
│ • Scadenza esatta MOT             │    │ • Scadenza Road Tax (Bollo UK)    │    │ • Oltre 40 Milioni di test storici        │
│ • Storico di OGNI test (Pass/Fail)│    │ • Stato SORN (veicolo radiato)    │    │ • Pass Rate % per marca e modello         │
│ • Chilometraggio reale anno x anno│    │ • Emissioni CO2 (g/km)            │    │ • Top 5 difetti per ogni modello auto     │
│ • Note & Difetti del meccanico    │    │ • Cilindrata e tipo carburante    │    │ • Migliaia di pagine programmatiche SEO   │
│ • Safety Recalls ufficiali        │    │ • Data prima immatricolazione     │    │   /mot-pass-rates/ford/fiesta/            │
└───────────────────────────────────┘    └───────────────────────────────────┘    └───────────────────────────────────────────┘
