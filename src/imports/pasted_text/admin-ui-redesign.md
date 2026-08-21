DÉJÀ VU OS, ADMIN UI REDESIGN

Gebruik de bestaande Déjà Vu OS interface en behoud de huidige visuele stijl: donker, premium, minimalistisch, zwart met subtiele gouden accenten, dunne borders, veel whitespace en de bestaande sidebar.

BELANGRIJK: BACKEND FIRST.

De bestaande Supabase/PostgreSQL backend is de source of truth. Pas de database, tabellen, relaties, RLS of bestaande RPC-logica niet aan om de UI werkend te krijgen.

Gebruik uitsluitend echte backenddata. Geen mockdata, hardcoded gebruikers, rollen, studio's, programma's, bookings of beschikbaarheid.

Gebruik UUID's en relaties intern. Namen zijn uitsluitend displaydata.

Het doel is eerst één complete ADMIN/TOTAALWEERGAVE te bouwen. Daarna wordt op basis van permissions bepaald welke onderdelen een artiest ziet. Bouw dus geen tweede los systeem voor artiesten.

============================================================
1. ADMIN DASHBOARD
============================================================

Het Admin Dashboard moet een echt totaaloverzicht van Déjà Vu OS worden.

Toon dynamische KPI's uit Supabase:

- Actieve gebruikers
- Bookings
- Actieve studio's
- Boekbare studio's
- Actieve programma's

Daaronder:

RECENTE BOOKINGS

Toon echte bookings met:

- datum
- tijd
- artiest
- studio
- service
- duur
- status

Daarnaast:

VANDAAG

Toon de huidige en komende sessies:

- tijd
- artiest
- studio
- service
- deelnemers

TEAM

Toon echte profiles en hun gekoppelde roles.

Een gebruiker kan meerdere rollen hebben. Toon alle relevante rollen.

Gebruik nooit hardcoded namen.

============================================================
2. PERMISSIONS
============================================================

Gebruik de bestaande permission structuur.

Belangrijke permissions:

dashboard.view
dashboard.admin
booking.create
booking.view_own
booking.view_internal
booking.manage
availability.view_internal
availability.manage_own
studio_hours.view_own
studio_hours.manage
studios.view
studios.manage
users.manage
roles.manage
programs.manage
services.manage
settings.manage
audit.view

Gebruik NOOIT checks op namen zoals Clyde of K9.

Gebruik profile UUID's, role UUID's en permissions.

Frontend permissions bepalen wat zichtbaar is, maar de backend/RLS/RPC's blijven de daadwerkelijke security boundary.

============================================================
3. BOOKINGEN, VOLLEDIG HERONTWERPEN
============================================================

De huidige bookingpagina is te veel een formulier.

VERWIJDER HET FORMULIERCONCEPT.

Een booking moet voelen als een studio planning interface:

SERVICE → ARTIEST → STUDIO → DATUM → BESCHIKBARE SLOTS → RESOURCES → CONFIRM

Gebruik kaarten, kalender, slots en duidelijke progressie.

Geen grote pagina met alleen dropdowns voor artist, studio, type, datum, tijd en duur.

------------------------------------------------------------
STAP 1, SERVICE
------------------------------------------------------------

Toon services als kaarten.

Gebruik echte data uit:

services
service_durations
service_options

Bijvoorbeeld:

Studio Session
Beat Session
Mix & Master

Maar hardcode deze namen niet.

Toon per service relevante informatie zoals beschikbare duur.

------------------------------------------------------------
STAP 2, ARTIEST
------------------------------------------------------------

Toon artiesten als cards.

Gebruik profiles met de artist role.

Toon:

- avatar/initialen
- display name
- volledige naam indien relevant
- rollen
- programma

Gebruik UUID's intern.

------------------------------------------------------------
STAP 3, STUDIO
------------------------------------------------------------

Toon alleen studio's die daadwerkelijk beschikbaar zijn voor booking.

Gebruik:

studios.is_active
studios.is_bookable

Maak duidelijk onderscheid tussen:

ACTIEF
BOEKBAAR

Een studio die actief is maar niet boekbaar is, mag niet als beschikbare booking-optie worden aangeboden.

De frontend mag studio's niet zelf als beschikbaar beschouwen.

------------------------------------------------------------
STAP 4, DATUM
------------------------------------------------------------

Gebruik een kalendercomponent.

Na het kiezen van een datum wordt de beschikbaarheid dynamisch opgehaald.

Geen handmatige tijdvelden als primaire bookingmethode.

------------------------------------------------------------
STAP 5, TIJDSLOTS
------------------------------------------------------------

Dit is één van de belangrijkste onderdelen.

Gebruik:

get_available_slots()

Toon beschikbare tijden als visuele slot cards/buttons:

16:00
16:30
17:00
17:30
18:00

Alleen werkelijk beschikbare slots tonen.

De frontend bepaalt zelf nooit of iets beschikbaar is.

De uiteindelijke controle blijft bij de backend via:

validate_booking()
create_booking()

------------------------------------------------------------
STAP 6, RESOURCES
------------------------------------------------------------

Voor services met resources:

- Engineer
- Beat Maker

Gebruik:

get_available_people()

Toon beschikbare medewerkers als cards.

Controleer:

- role
- beschikbaarheid
- bestaande bookings
- gekozen datum
- gekozen tijd

Voor Beat Session is een Beat Maker verplicht.

============================================================
4. BOOKING PROGRESS
============================================================

Maak de booking flow visueel met een duidelijke progress indicator.

Bijvoorbeeld:

01 Service
02 Artiest
03 Studio
04 Datum
05 Tijd
06 Resources
07 Bevestigen

De gebruiker moet altijd kunnen zien waar hij zich bevindt.

Gebruik geen klassieke lange formulierpagina.

============================================================
5. STUDIO HOURS
============================================================

Studio-uren moeten visueel worden weergegeven met progress bars.

Gebruik de bestaande backendlogica:

get_monthly_allocation()
get_additional_hours()
get_used_studio_hours()
get_remaining_studio_hours()

Toon bijvoorbeeld:

STUDIO HOURS

7.5 / 12 uur gebruikt

[ progress bar ]

4.5 uur resterend

Indien relevant:

Basisallocatie
Extra uren
Gebruikte uren
Resterende uren

Geen vaste cijfers in de frontend.

Alles moet uit de backend komen.

============================================================
6. BOOKING CONFIRMATION
============================================================

Voordat een booking wordt aangemaakt, toon een duidelijke summary card.

Bijvoorbeeld:

Studio Session

K9
Gold Studio
Dinsdag 18 augustus
18:00 → 20:00
2 uur

Engineer: Yarri

Daaronder:

4 uur beschikbaar
2 uur na deze booking

Primaire actie:

SESSIE BEVESTIGEN

Gebruik hiervoor uitsluitend:

create_booking()

Doe geen directe insert vanuit de frontend.

Na succesvolle booking:

- booking opnieuw ophalen
- resterende uren opnieuw ophalen
- agenda vernieuwen
- dashboard vernieuwen
- confirmation tonen

Bij fouten toon een begrijpelijke melding.

Ondersteun backend reasons zoals:

BOOKING_CONFLICT
INSUFFICIENT_STUDIO_HOURS
STUDIO_NOT_AVAILABLE
RESOURCE_NOT_AVAILABLE
TWO_HOUR_SPLIT_LIMIT_REACHED
INVALID_DURATION

Toon nooit alleen een technische database error.

============================================================
7. AGENDA
============================================================

De Agenda moet een echte studio planning worden.

Gebruik:

get_agenda_bookings()

Maak minimaal een weekweergave met 7 dagen.

Toon bookings als visuele tijdblokken.

Per booking:

- tijd
- artiest
- studio
- service
- deelnemers

Gebruik filters:

- Alle artiesten
- Studio
- eventueel service

Klikken op een booking opent details.

De agenda moet duidelijk visueel laten zien hoe de studio's gedurende de week gevuld zijn.

Geen lege tabelweergave als primaire interface.

============================================================
8. ARTIESTEN
============================================================

Toon echte profiles met de artist role.

Per artiest:

- avatar/initialen
- display name
- volledige naam
- rollen
- programma
- studio hours progress
- komende booking indien beschikbaar

Gebruik geen hardcoded artiesten.

============================================================
9. MEDEWERKERS
============================================================

Toon echte profiles met relevante staff roles:

- Engineer
- Beat Maker
- Film Creator

Een medewerker kan meerdere rollen hebben.

Gebruik user_roles.

Geen hardcoded gebruikers.

============================================================
10. STUDIO'S
============================================================

De huidige Studio pagina moet dynamisch worden.

Gebruik:

name
description
is_active
is_bookable

Toon bijvoorbeeld visueel:

Gold Studio
ACTIEF
BOEKBAAR

Diamond Studio
ACTIEF
NIET BOEKBAAR

White Room
ACTIEF
NIET BOEKBAAR

De admin moet, wanneer hij de juiste permission heeft, studio's kunnen beheren.

Wanneer is_bookable verandert, moet de booking interface automatisch veranderen.

Geen frontend hardcoding.

============================================================
11. PROGRAMMA'S
============================================================

Gebruik echte data uit:

programs
program_members

Toon:

- programmanaam
- description
- maandelijkse studio-uren
- aantal actieve leden
- actieve status

Gebruik geen hardcoded aantallen.

============================================================
12. PROFIEL
============================================================

Gebruik profiles voor applicatiegegevens.

Toon:

- display name
- full name
- email
- telefoon indien aanwezig
- bio
- avatar
- rollen
- programma's

Wachtwoorden mogen nooit vanuit profiles worden gelezen of opgeslagen.

Authenticatie en wachtwoorden blijven volledig bij Supabase Auth.

============================================================
13. AUTH EN NIEUWE GEBRUIKERS
============================================================

Nieuwe Auth users moeten automatisch aan een profile gekoppeld worden via de bestaande backend trigger.

De UI moet niet afhankelijk zijn van vaste gebruikersnamen.

Nieuwe gebruikers moeten automatisch in de bestaande structuur terechtkomen en daarna via roles/permissions beheerd kunnen worden.

============================================================
14. GEEN MOCKDATA
============================================================

Verwijder alle tijdelijke frontenddata.

Geen hardcoded:

Clyde
K9
Yarri
LV
Gold Studio
Diamond Studio
White Room
Goldlective
12 uur
aantallen gebruikers
bookings
beschikbaarheid

Alles moet dynamisch uit Supabase komen.

============================================================
15. BESTAANDE BACKEND RPC'S
============================================================

Sluit de UI aan op de bestaande functies:

my_profile_id()
my_organization_id()
has_role()
has_permission()

get_monthly_allocation()
get_additional_hours()
get_used_studio_hours()
get_remaining_studio_hours()

is_studio_open()
is_user_available()

get_available_slots()
get_available_people()

get_agenda_bookings()

create_booking()
cancel_booking()

admin_adjust_studio_hours()

Gebruik de bestaande backendlogica.

Bouw geen alternatieve frontend-logica die dezelfde business rules opnieuw probeert te implementeren.

============================================================
16. BACKEND FIRST REGEL
============================================================

De backend is leidend.

Pas de database niet aan om een UI-probleem op te lossen.

Als een gewenste UI-feature niet ondersteund wordt door de bestaande backend:

1. verzin geen workaround
2. maak geen mockdata
3. verander geen bestaande business rules
4. laat duidelijk zien welke backenddata of RPC ontbreekt

De huidige backendlogica moet intact blijven.

============================================================
17. ADMIN EERST
============================================================

Bouw eerst de volledige Administrator experience.

De Admin moet uiteindelijk het volledige systeem kunnen beheren:

Dashboard
Bookings
Agenda
Artiesten
Medewerkers
Studio's
Programma's
Profielen
Permissions/rollen waar toegestaan
Studio hours
Beschikbaarheid
Booking management

Daarna wordt de Artist experience afgebakend op basis van permissions.

De Artist UI is dus geen apart systeem.

Het is dezelfde Déjà Vu OS backend met een andere toegangslaag en vereenvoudigde interface.

============================================================
18. VISUELE RICHTING
============================================================

Behoud de huidige Déjà Vu OS branding.

Donker
Premium
Minimalistisch
Zwart
Subtiel goud
Dunne borders
Veel whitespace
Sterke typografie
Rustige animaties
Geen standaard SaaS uitstraling

Maar de functionaliteit moet voelen als een professioneel studio operating system.

Vooral bookings moeten voelen als:

KALENDER → BESCHIKBAARHEID → SLOTS → RESOURCES → BEVESTIGING

Niet:

FORMULIER → OPSLAAN

============================================================
19. IMPLEMENTATIEVOLGORDE
============================================================

Werk in deze volgorde:

1. Backend/data wiring
2. Permission-based navigation
3. Admin Dashboard
4. Booking flow met cards, progress en beschikbare slots
5. Agenda
6. Studio management
7. Programma's
8. Artiesten
9. Medewerkers
10. Profiel
11. Daarna pas de aparte Artist UI

Gebruik de bestaande backend als source of truth en zorg dat iedere UI-component daadwerkelijk gekoppeld is aan de bestaande Supabase data en RPC-logica.