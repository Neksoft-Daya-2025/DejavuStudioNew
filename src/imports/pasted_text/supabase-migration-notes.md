We zijn nu voorbij de Supabase-migratie/auth-fase. De nieuwe Supabase-database is de enige source of truth.

BELANGRIJK: ga nu niet opnieuw de login-, auth- of RLS-migratie proberen op te lossen. Die fase is afgerond.

BEWEZEN WERKEND — NIET AANPASSEN

De volgende onderdelen werken correct en mogen niet worden gewijzigd tenzij uit de diagnose blijkt dat een wijziging absoluut noodzakelijk is:

- Supabase authentication/login
- auth.users
- profiles.auth_user_id
- algemene profile loading
- data loading
- RLS
- role-based access
- admin versus medewerker autorisatie
- de bestaande koppeling met het nieuwe Supabase-project

De huidige situatie is positief:
- gebruikers kunnen inloggen;
- data wordt vanuit het nieuwe Supabase-project geladen;
- RLS werkt;
- admin ziet andere gegevens dan medewerkers.

We gaan nu de resterende functionele problemen structureel oplossen.

==================================================
HOOFDDOEL
==================================================

Maak de applicatie functioneel consistent voor zowel bestaande als toekomstige gebruikers.

Gebruik uitsluitend de daadwerkelijke structuur van het NIEUWE Supabase-project.

Gebruik geen aannames uit het oude Supabase-project.

Gebruik geen oude tabellen, kolommen, relaties, routes of API-contracten alleen omdat die in de oude applicatie bestonden.

Maak geen handmatige uitzonderingen voor K9, Sario, Yarri, Exclusive of andere individuele gebruikers.

Een nieuwe gebruiker moet automatisch volgens dezelfde generieke logica functioneren als bestaande gebruikers.

==================================================
WERKWIJZE — ZEER BELANGRIJK
==================================================

Werk in twee fases.

FASE 1 — VOLLEDIGE DIAGNOSE

Voordat je code wijzigt:

1. Controleer het daadwerkelijke nieuwe database-schema.
2. Controleer relevante tabellen.
3. Controleer kolommen.
4. Controleer foreign keys/relaties.
5. Controleer RLS policies.
6. Controleer bestaande data.
7. Controleer de relevante frontend queries.
8. Controleer de relevante Edge Functions/API-routes.
9. Controleer welke data daadwerkelijk van database naar frontend gaat.
10. Zoek actief naar oude database-aannames/references in de relevante booking-, availability-, wallet-, program- en staff-code.

Maak eerst één overzicht:

| Probleem | Exacte oorzaak | Tabel/kolom/query/route | Frontend/backend/database/RLS/data | Structurele oplossing |
|---|---|---|---|---|

Geef eerst de diagnose.

Maak daarna pas de noodzakelijke codewijzigingen.

BELANGRIJK:
- Voeg geen nieuwe database-entiteiten toe om een oude query werkend te krijgen.
- Voeg geen kolommen toe alleen omdat een oude query die verwacht.
- Verwijder geen bestaande data.
- Wijzig geen auth_user_id.
- Migreer de database niet opnieuw.
- Gebruik geen hardcoded gebruikers.
- Gebruik geen tijdelijke frontend-state als source of truth wanneer data persistent hoort te zijn.

==================================================
PROBLEEM 1 — WALLET / UURBUDGET
==================================================

De pagina "Studiotijd" toont:

"Geen walletdata gevonden. Wallets worden per profiel geladen."

Onderzoek:

- welke query walletdata ophaalt;
- welke tabel wordt gebruikt;
- welke kolommen worden gebruikt;
- welke relatie tussen profiles en wallets wordt verwacht;
- of deze relatie daadwerkelijk bestaat in het nieuwe Supabase-project;
- of de wallet van de huidige gebruiker daadwerkelijk bestaat;
- of RLS de query blokkeert;
- of de frontend een verkeerde relatie/query gebruikt;
- of oude databasevelden worden gebruikt.

Bepaal exact waarom walletdata niet wordt weergegeven.

Gebruik de bestaande database als source of truth.

De oplossing moet automatisch werken voor toekomstige gebruikers volgens de bestaande wallet/profile-structuur.

==================================================
PROBLEEM 2 — BOOKING OPSLAAN
==================================================

Bij het bevestigen van een booking verschijnt momenteel:

"Could not find the 'booking_type_id' column of 'bookings' in the schema cache"

Onderzoek de volledige booking-flow.

Controleer:

- daadwerkelijke structuur van bookings;
- daadwerkelijke kolommen;
- foreign keys;
- booking type-structuur;
- eventuele services/service-types;
- INSERT-query;
- UPDATE-query;
- gebruikte Edge Function/API-route;
- welke payload vanuit de frontend wordt verstuurd;
- welke velden de backend verwacht;
- waarom booking_type_id momenteel wordt gebruikt;
- of booking_type_id überhaupt onderdeel is van het nieuwe schema.

Gebruik NIET automatisch een nieuwe kolom booking_type_id om de oude query te laten werken.

De applicatie moet aansluiten op het bestaande nieuwe schema.

Controleer daarna ook:

- wordt de booking daadwerkelijk opgeslagen?
- komt deze terug bij "Mijn sessies"?
- komt deze terug in Agenda?
- kan admin deze zien?
- respecteert dit RLS?

==================================================
PROBLEEM 3 — BESCHIKBAARHEID OPSLAAN
==================================================

De availability-interface werkt visueel, maar de geselecteerde dagen/tijden blijven niet betrouwbaar staan.

Onderzoek de volledige flow:

frontend
→ API/Edge Function
→ database
→ RLS
→ database
→ read query
→ frontend

Controleer:

- welke tabel availability gebruikt;
- welke kolommen bestaan;
- hoe availability aan profiles wordt gekoppeld;
- welke INSERT/UPDATE-query wordt gebruikt;
- of de save-query daadwerkelijk succesvol is;
- of RLS de save blokkeert;
- welke read-query daarna wordt uitgevoerd;
- waarom de geselecteerde dagen verdwijnen;
- waarom availability niet in de tabel wordt weergegeven;
- of admin dezelfde problemen heeft.

Test specifiek:

availability instellen
→ opslaan
→ pagina vernieuwen
→ availability opnieuw laden

De gegevens moeten blijven bestaan.

Availability mag niet uitsluitend frontend-state zijn.

==================================================
PROBLEEM 4 — AVAILABILITY MOET DE BOOKINGFLOW AANSTUREN
==================================================

Beschikbaarheid is geen losstaande profielinformatie.

Beschikbaarheid moet daadwerkelijk worden gebruikt door de booking-engine.

Wanneer een gebruiker een studio, engineer of beatmaker wil boeken, moet de applicatie controleren:

1. Is de studio beschikbaar?
2. Is de engineer beschikbaar indien geselecteerd?
3. Is de beatmaker beschikbaar indien geselecteerd?
4. Is er al een conflicterende booking?
5. Mag de betreffende gebruiker volgens de bestaande rollen/services überhaupt worden geboekt?

De frontend mag alleen beschikbare personen tonen wanneer datum en tijd bekend zijn.

Bij het definitief bevestigen van een booking moet de server/backend opnieuw controleren of de geselecteerde studio en personen beschikbaar zijn.

Dit is noodzakelijk om dubbele boekingen te voorkomen.

Availability moet dus daadwerkelijk onderdeel worden van de bookinglogica.

==================================================
PROBLEEM 5 — BOOKINGFLOW: BEAT SESSION
==================================================

De huidige Beat Session-flow verplicht de gebruiker om resources te kiezen, terwijl dat niet altijd logisch is.

Een Beat Session moet twee duidelijke mogelijkheden ondersteunen.

OPTION A — SOLO BEAT SESSION

De gebruiker wil de studio gebruiken om zelfstandig een beat te maken.

Daarvoor:

- geen engineer;
- geen beatmaker;
- geen resource-selectie;
- alleen studio + datum + tijd + overige benodigde bookinginformatie.

De studio moet dus gewoon geboekt kunnen worden zonder medewerker.

OPTION B — BEAT SESSION MET BEATMAKER

De gebruiker wil samen met een beatmaker werken.

Daarvoor:

- toon duidelijk dat de personen BEATMAKERS zijn;
- toon alleen beatmakers die beschikbaar zijn op het gekozen tijdstip;
- laat de gebruiker een beatmaker kiezen;
- maak duidelijk wat de rol van deze persoon is.

Gebruik geen onduidelijke generieke resource-lijst.

Bijvoorbeeld:

"Solo"
Zelfstandig gebruik van de studio

"Met Beatmaker"
Werk samen met een beatmaker

Daarna:

"Beschikbare beatmakers"

Sario
Yarri
K9

Alleen daadwerkelijk beschikbare personen tonen.

==================================================
PROBLEEM 6 — BOOKINGFLOW: STUDIO SESSION
==================================================

Een Studio Session mag geen engineer of beatmaker verplicht stellen.

Ondersteun:

1. Solo studio
2. Studio + engineer
3. Studio + beatmaker
4. Studio + engineer + beatmaker

De gebruiker moet expliciet kunnen kiezen welke begeleiding gewenst is.

Bijvoorbeeld:

"Begeleiding"

○ Geen
○ Engineer
○ Beatmaker
○ Engineer + Beatmaker

Daarna worden alleen de relevante beschikbare personen weergegeven.

==================================================
PROBLEEM 7 — ENGINEER EN BEATMAKER ZIJN APARTE ROLLEN
==================================================

De huidige UI heeft een probleem waarbij een persoon die als engineer wordt geselecteerd ook visueel als beatmaker geselecteerd kan worden.

Dit moet structureel worden opgelost.

Engineer-selectie en beatmaker-selectie moeten volledig onafhankelijk zijn.

Als de database dit ondersteunt met afzonderlijke relaties/velden, gebruik die bestaande structuur.

Conceptueel moet dit gedrag mogelijk zijn:

engineer = Yarri
beatmaker = null

of:

engineer = null
beatmaker = Yarri

of:

engineer = Yarri
beatmaker = Sario

of:

engineer = null
beatmaker = null

Gebruik uitsluitend veldnamen die daadwerkelijk bestaan in het nieuwe schema.

Controleer ook hoe profielen aan rollen/services gekoppeld zijn.

Maak geen aparte uitzonderingen voor personen met meerdere rollen.

==================================================
PROBLEEM 8 — RESOURCES MOETEN DUIDELIJK ZIJN
==================================================

Het huidige woord "Resources" is te onduidelijk voor gebruikers.

Maak onderscheid tussen:

ENGINEER

en

BEATMAKER

Toon bij voorkeur beschikbaarheidsinformatie wanneer datum en tijd bekend zijn.

Bijvoorbeeld:

Sario
Engineer
Beschikbaar

Yarri
Beatmaker
Beschikbaar

K9
Beatmaker
Niet beschikbaar

Of toon alleen daadwerkelijk beschikbare personen als dat UX-technisch beter is.

De gebruiker moet altijd begrijpen:

- wie deze persoon is;
- welke rol deze persoon heeft;
- waarom hij/zij hier staat;
- of deze persoon beschikbaar is.

==================================================
PROBLEEM 9 — K9 / MEDEWERKERS / BEATMAKER
==================================================

K9 bestaat als profiel en verschijnt wel in het Team-overzicht van het admin-dashboard.

Maar:

- K9 verschijnt niet in het medewerkersoverzicht;
- K9 kan niet als Beatmaker worden geselecteerd bij een booking.

Onderzoek waarom deze onderdelen verschillende resultaten geven.

Vergelijk:

- gebruikte queries;
- profielstatus;
- rollen;
- services;
- staff/member filters;
- actieve/inactieve status;
- organization_id;
- eventuele andere filters.

Gebruik één consistente profiel-/rolstructuur.

Als K9 volgens de daadwerkelijke database een Beatmaker-rol heeft, moet hij automatisch als Beatmaker beschikbaar kunnen worden wanneer hij beschikbaar is.

Geen hardcoded K9-fix.

==================================================
PROBLEEM 10 — STUDIO BOEKBAARHEID
==================================================

Studio's worden momenteel als "niet boekbaar" weergegeven.

Controleer:

- of dit hardcoded is;
- welke tabel/configuratie studio's gebruikt;
- welke kolommen de boekbaarheid bepalen;
- of de frontend de juiste bron gebruikt;
- of een status/filter verkeerd wordt geïnterpreteerd.

De daadwerkelijke database/configuratie is leidend.

Studio availability moet uiteindelijk ook onderdeel zijn van de booking-engine.

Een studio die boekbaar is volgens de database moet boekbaar worden weergegeven.

==================================================
PROBLEEM 11 — GOLDLECTIVE
==================================================

Het Goldlective-programma wordt weergegeven maar is niet actief.

Onderzoek:

- daadwerkelijke program-data;
- active/status-velden;
- organisatie;
- query;
- frontend-filters;
- RLS;
- eventuele oude statuswaarden.

Bepaal exact waarom het programma als niet actief wordt beschouwd.

Pas daarna de noodzakelijke code aan.

Geen nieuwe program-data aanmaken als de bestaande data correct blijkt te zijn.

==================================================
PROBLEEM 12 — AGENDA
==================================================

De agenda werkt momenteel alleen als eenvoudige weekweergave.

Verbeter deze functioneel.

Minimaal:

- Weekweergave
- Maandweergave
- Vorige week
- Volgende week
- Vorige maand
- Volgende maand
- Vandaag

De agenda moet dezelfde bookingdata gebruiken als de bookingflow.

Een booking die succesvol wordt opgeslagen moet automatisch zichtbaar worden in de agenda.

Geen aparte hardcoded agenda-data.

==================================================
PROBLEEM 13 — MIX & MASTER
==================================================

Mix & Master werkt momenteel goed.

Niet onnodig wijzigen.

Controleer na de andere wijzigingen alleen of Mix & Master nog steeds correct werkt.

==================================================
BOOKING ARCHITECTUUR
==================================================

De uiteindelijke bookingflow moet conceptueel werken als:

SERVICE
↓
STUDIO
↓
DATUM
↓
TIJD
↓
BESCHIKBAARHEID CONTROLEREN
↓
BEGELEIDING KIEZEN
├── Solo
├── Engineer
├── Beatmaker
└── Engineer + Beatmaker
↓
ALLEEN BESCHIKBARE PERSONEN TONEN
↓
BOOKING BEVESTIGEN
↓
SERVER-SIDE BESCHIKBAARHEID OPNIEUW CONTROLEREN
↓
BOOKING OPSLAAN
↓
MIJN SESSIES
↓
AGENDA
↓
ADMIN

De exacte implementatie moet aansluiten op het bestaande database-schema.

==================================================
BOOKING VALIDATION
==================================================

Bij het definitief opslaan van een booking moet minimaal worden gecontroleerd:

- juiste gebruiker;
- juiste organization_id;
- juiste service;
- juiste studio;
- juiste datum;
- juiste starttijd;
- juiste eindtijd;
- studio beschikbaar;
- engineer beschikbaar indien geselecteerd;
- beatmaker beschikbaar indien geselecteerd;
- geen conflicterende booking;
- geselecteerde personen hebben de juiste rol/service;
- RLS/authorization is correct.

Als een conflict ontstaat:

- booking niet opslaan;
- duidelijke foutmelding tonen;
- gebruiker moet een andere tijd/resource kunnen kiezen.

==================================================
OUDE DATABASE-REFERENCES
==================================================

Omdat de database eerder is gemigreerd, zoek actief naar oude aannames in de relevante code.

Controleer onder andere:

- oude tabelnamen;
- oude kolomnamen;
- oude foreign keys;
- oude booking-types;
- oude resource-relaties;
- oude availability-relaties;
- oude program-statussen;
- oude wallet-relaties;
- oude Edge Function routes;
- oude Supabase project references.

Maar:

VERWIJDER NIET BLIND ALLE OUDE CODE.

Bepaal per reference eerst of deze daadwerkelijk nog relevant is voor de nieuwe database.

Het doel is dat de applicatie volledig aansluit op het nieuwe schema, niet dat er willekeurig code wordt verwijderd.

==================================================
GEEN HARDCODED OPLOSSINGEN
==================================================

Gebruik absoluut geen oplossingen zoals:

if email === "..."
if user.id === "..."
if profile.id === "..."

of specifieke uitzonderingen voor:

K9
Sario
Yarri
Exclusive
Clyde
etc.

De applicatie moet gebaseerd zijn op:

profiles
roles
services
availability
studios
bookings
organization
RLS

en de daadwerkelijke relaties die in de nieuwe database bestaan.

==================================================
EINDTEST
==================================================

Voer na de fixes een volledige functionele test uit.

Test minimaal:

1. Login
2. Profile loading
3. RLS medewerker
4. RLS admin
5. Wallet/uurbudget
6. Solo Beat Session
7. Beat Session + Beatmaker
8. Solo Studio Session
9. Studio + Engineer
10. Studio + Beatmaker
11. Studio + Engineer + Beatmaker
12. Mix & Master
13. Beschikbare medewerker selecteren
14. Niet-beschikbare medewerker niet selecteerbaar
15. Beschikbaarheid opslaan
16. Availability na refresh terugladen
17. Availability zichtbaar bij medewerker
18. Availability zichtbaar bij admin
19. Availability wordt gebruikt door bookingflow
20. Booking zonder resource
21. Booking met engineer
22. Booking met beatmaker
23. Booking met beide
24. Dubbele/conflicterende booking blokkeren
25. Booking daadwerkelijk opslaan
26. Booking zichtbaar in Mijn sessies
27. Booking zichtbaar in Agenda
28. Agenda weekweergave
29. Agenda maandweergave
30. Vorige/volgende week
31. Vorige/volgende maand
32. K9 zichtbaar als medewerker indien zijn database-rol dit toestaat
33. K9 beschikbaar als Beatmaker indien zijn database-rol dit toestaat
34. Studio boekbaarheid
35. Goldlective status
36. Mix & Master regressietest

==================================================
EINDRAPPORT
==================================================

Geef na afloop een compact overzicht:

| Onderdeel | Status | Oorzaak | Oplossing |
|---|---|---|---|

Gebruik:

✅ Werkt
⚠️ Gedeeltelijk
❌ Werkt niet

Geef daarnaast aan:

1. Welke oude database-aannames zijn gevonden.
2. Welke daarvan daadwerkelijk problemen veroorzaakten.
3. Welke code is aangepast.
4. Welke database-entiteiten NIET zijn gewijzigd.
5. Of alle oplossingen generiek zijn voor toekomstige gebruikers.
6. Welke problemen eventueel nog overblijven.

BELANGRIJKSTE REGEL:

We zijn nu NIET meer bezig met losse foutmeldingen.

Los de onderliggende architectuur op zodat:

profiel
→ rol
→ beschikbaarheid
→ service
→ studio
→ booking
→ agenda

één consistente flow vormt.

Een nieuwe gebruiker, nieuwe engineer, nieuwe beatmaker, nieuwe studio of nieuwe booking moet automatisch volgens dezelfde logica functioneren.

Geen handmatige koppelingen per gebruiker.
Geen oude database-aannames.
Geen hardcoded availability.
Geen hardcoded resources.
Geen frontend-only opslag van belangrijke gegevens.
Geen nieuwe databasekolommen om oude queries te repareren.

Eerst diagnose, daarna structurele fixes, daarna volledige test.