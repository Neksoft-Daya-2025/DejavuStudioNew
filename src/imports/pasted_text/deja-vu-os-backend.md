MASTER PROMPT, DÉJÀ VU OS, BACKEND FIRST
De publieke frontend van Déjà Vu OS staat al grotendeels klaar. De volgende stap is om de Supabase backend als bron van waarheid op te zetten en daarna de bestaande frontend hierop aan te sluiten.
Werk in fases. Voer eerst de database, seed data, business rules, permissions en RLS uit. Pas daarna de frontend aansluiten en alle mock data vervangen door live data uit Supabase.
Gebruik Supabase PostgreSQL als backend. Gebruik geen hardcoded business rules in de frontend. De database bepaalt wat mogelijk is. De frontend toont alleen wat de database toestaat.
Stop na elke fase kort om te verifiëren dat de structuur klopt voordat je verdergaat.
 
FASE 0, SUPABASE AUTHENTICATION
The existing Login button is currently only a frontend placeholder and does not yet require authentication.
Replace this with a real Supabase Authentication flow.
Authentication requirements
Use Supabase Auth as the only authentication system.
Do not create a custom password system and do not store passwords in the application database.
Create or connect the following test accounts through Supabase Auth:
* Sario, Sariov2@hotmail.com
* Yarri, Jarnelleramdin@gmail.com
* LV Exclusive, Myroncampbell2506@gmail.com
* JSR, jerramaatsen@gmail.com
* K9, Prodby.kn9ne@gmail.com
* Deja vu studio: dejavustudio036@gmail.com
Use the current shared temporary test password:
GoldlectiveDejavu26
Clyde should also have an administrator account.
The Supabase Auth user ID must be linked to the corresponding profiles record.
After successful login:
1. Create/restore the authenticated Supabase session.
2. Retrieve the user’s profile.
3. Retrieve their roles.
4. Retrieve their programs.
5. Retrieve their permissions.
6. Load the appropriate dashboard/navigation based on those database permissions.
Do not determine authorization purely through frontend code.
Login behaviour
The existing Login button should open a proper login screen containing:
* E-mail
* Password
* Login button
Handle:
* incorrect credentials;
* missing credentials;
* loading state;
* successful authentication;
* logout;
* expired session.
After successful login, the user should remain authenticated when navigating through the application.
The application must never display authenticated internal content to an unauthenticated user.
Important
Do not store the password in profiles, users or any custom database table.
Supabase Auth is responsible for password storage, hashing and authentication.
The custom profiles table should only contain application-specific user information and reference the Supabase Auth user through the Auth user ID.

 
FASE 1, DATABASE ANALYSE EN STRUCTUUR
Inspecteer eerst de bestaande Supabase-structuur.
* Controleer welke tabellen al bestaan.
* Hergebruik bestaande tabellen waar mogelijk.
* Maak geen dubbele tabellen als dezelfde functie al bestaat.
* Voeg alleen toe wat nog ontbreekt.
* Houd de database generiek en uitbreidbaar.
 
⸻
 
BASISARCHITECTUUR
Bouw een modulair platform, niet een eenmalige oplossing.
Gebruik minimaal de volgende entiteiten:
* organizations
* profiles
* roles
* permissions
* role_permissions
* user_roles
* programs
* user_programs
* studios
* services
* service_options
* availability
* availability_exceptions
* bookings
* booking_resources
* studio_wallets
* wallet_transactions
* audit_logs
* settings
Gebruik duidelijke relaties en foreign keys.
 
⸻
 
ORGANIZATION
Maak één organisatie aan:
Déjà Vu Studio
Koppel alle gebruikers, programma’s, studio’s, boekingen en regels hieraan.
De database moet later eenvoudig meerdere organisaties kunnen ondersteunen, maar voor nu draait alles binnen Déjà Vu Studio.
 
⸻
 
ROLLEN
Maak de volgende rollen aan:
* Administrator
* Artist
* Engineer
* Beat Creator
* Film Director / Cameraman
Een gebruiker mag meerdere rollen tegelijk hebben.
Gebruik daarom een many-to-many structuur via user_roles.
 
⸻
 
PROGRAMMA’S
Programma’s zijn geen rollen.
Maak een aparte structuur voor programma’s.
Voor nu:
* Goldlective
Iedereen van de huidige testgebruikers is onderdeel van Goldlective.
Gebruik hiervoor programs en user_programs.
 
⸻
 
GEBRUIKERS / SEED DATA
Voeg de volgende testgebruikers toe.
Jessario
* Displaynaam: Sario
* E-mail: Sariov2@hotmail.com
* Rollen: Artist, Engineer, Beat Creator
* Programma: Goldlective
Jarnelle Ramdin
* Displaynaam: Yarri
* E-mail: Jarnelleramdin@gmail.com
* Rollen: Artist, Engineer, Beat Creator, Film Director / Cameraman
* Programma: Goldlective
Myron Campbell
* Displaynaam: LV Exclusive
* E-mail: Myroncampbell2506@gmail.com
* Rollen: Artist, Engineer
* Programma: Goldlective
Jermexinio Maatsen
* Displaynaam: JSR
* E-mail: jerramaatsen@gmail.com
* Rollen: Artist
* Programma: Goldlective
Keenan Maartens
* Displaynaam: K9
* E-mail: Prodby.kn9ne@gmail.com
* Rollen: Beat Creator
* Programma: Goldlective

Déjà Vu Studios / Clyde
* E-mail: dejavustudio036@gmail.com
* Rol: Administrator
* Programma: geen specifiek programma nodig, hij beheert de organisatie
* Tijdelijk wachtwoord: GoldlectiveDejavu26
Gebruik deze seed data direct, zodat het systeem vanaf het begin getest kan worden met echte accounts.
 
⸻
 
STUDIO’S
Voor fase 1 is uitsluitend deze studio boekbaar:
* Gold Studio
Instellingen:
* Openingstijd: 16:00
* Sluitingstijd: 02:00
De volgende studio’s bestaan al conceptueel, maar zijn in fase 1 nog niet boekbaar:
* Diamond Studio
* White Room
Maak de structuur alvast klaar voor uitbreiding.
 
⸻
 
DIENSTEN
Maak de volgende diensten aan als basis:
* Studio Session
* Beat Session
* Mix & Master
Gebruik de database als bron van waarheid voor de regels per dienst.
Studio Session
* Gold Studio verplicht
* Beat Creator optioneel
* Engineer optioneel
* De gebruiker kan kiezen:
    * Geen begeleiding
    * Beat Creator
    * Engineer
    * Beat Creator + Engineer
Beat Session
* Gold Studio verplicht
* Beat Creator verplicht
* Engineer niet nodig
Mix & Master
* Losse dienst
* Geen studio nodig in de booking flow
* Engineer vereist
Gebruik een services tabel en een service_options of vergelijkbare structuur zodat deze logica later eenvoudig uit te breiden is.
 
⸻
 
STUDIO-UREN EN PROGRAMMAREGELS
Voor Goldlective gelden de volgende regels:
* Iedere artiest heeft standaard 12 studio-uren per maand
* Een standaard Studio Session duurt 4 uur
* Eén 4-uurs sessie per maand mag worden opgesplitst in twee sessies van 2 uur
* Het systeem moet automatisch controleren:
    * of de artiest nog uren over heeft
    * of de gekozen sessieduur toegestaan is
    * of de 2-uurs splitsing al is gebruikt
    * of de boeking binnen de maandlimiet past
Deze regels moeten in de database of backendlogica staan, niet hardcoded in de frontend.
Gebruik hiervoor bij voorkeur:
* studio_wallets
* wallet_transactions
Zodat je altijd kunt zien:
* hoeveel iemand heeft
* wat gebruikt is
* wat toegevoegd is
* waarom iets is afgeschreven
 
⸻
 
BESCHIKBAARHEID
Beschikbaarheid moet volledig database-gedreven zijn.
Iedere medewerker kan via zijn eigen omgeving beschikbaarheid invullen.
Gebruik minimaal:
* availability
* availability_exceptions
De beschikbaarheid moet werken met:
* standaard terugkerende beschikbaarheid
* uitzonderingen
* niet beschikbaar
* tijdelijk vrij
De frontend mag nooit een medewerker als beschikbaar tonen als er geen availability in de database staat.
Bij ontbrekende beschikbaarheid moet zichtbaar zijn:
Beschikbaarheid nog niet opgegeven
 
⸻
 
BOEKINGEN
Ontwerp de bookinglogica als een service-first flow.
De gebruiker kiest eerst:
1. Welke dienst
2. Welke optionele begeleiding
3. Daarna pas datum en tijd
Het systeem controleert daarna automatisch:
* of de studio open is
* of de gekozen dienst geldig is
* of de benodigde medewerkers beschikbaar zijn
* of de gebruiker voldoende studio-uren heeft
* of er geen dubbele boeking bestaat
* of de gekozen sessieduur toegestaan is
De backend moet de boeking pas opslaan als alle controles slagen.
Gebruik minimaal:
* bookings
* booking_resources
* booking_statuses
Een booking kan meerdere resources bevatten, bijvoorbeeld:
* Studio
* Engineer
* Beat Creator
Maak de structuur dus niet te smal. Een sessie moet meerdere gekoppelde resources kunnen hebben.
 
⸻
 
AGENDA
Maak één centrale agenda die gevoed wordt door bookings en availability.
Iedere interne boeking moet zichtbaar zijn in de agenda zodat de community kan zien wie wanneer in de studio aanwezig is.
Toon alleen:
* displaynaam
* type sessie
* studio
* tijd
Toon geen gevoelige interne data zoals:
* studio-uren van anderen
* e-mailadressen
* interne notities
 
⸻
 
TEAMBEHEER
Clyde moet in het beheerpaneel kunnen zien:
* alle gebruikers
* alle rollen
* alle programma’s
* wie beschikbaarheid heeft ingevuld
* wie nog niets heeft ingevuld
* resterende studio-uren per gebruiker
* komende sessies
* boekingen
* studio-status
Zet dit op in een beheeromgeving binnen hetzelfde platform.
Geen aparte dashboards per rol, maar één platform met rolgebaseerde zichtbaarheid.
 
⸻
 
RLS EN AUTORISATIE
Gebruik Row Level Security als echte beveiligingslaag.
De frontend mag nooit bepalen of iets echt toegankelijk is.
De database beslist.
Uitgangspunten:
Artist
* ziet alleen eigen profiel
* ziet alleen eigen boekingen
* ziet alleen eigen wallet
* ziet alleen relevante gedeelde agenda-informatie
Engineer
* ziet alleen eigen agenda en beschikbaarheid
* ziet eigen sessies
Beat Creator
* ziet alleen eigen agenda en beschikbaarheid
* ziet eigen sessies
Administrator
* ziet alles
Gebruik een database-first autorisatiemodel met:
* roles
* permissions
* user_roles
* role_permissions
* RLS policies
 
⸻
 
AUDIT LOGS
Leg belangrijke acties vast in audit_logs, zoals:
* gebruiker aangemaakt
* rol toegevoegd
* beschikbaarheid gewijzigd
* boeking aangemaakt
* boeking geannuleerd
* studio-uren aangepast
 
⸻
 
TOEKOMSTBESTENDIGHEID
Maak alles generiek en uitbreidbaar.
De volgende onderdelen moeten later eenvoudig kunnen worden toegevoegd zonder herbouw:
* nieuwe studio’s
* nieuwe programma’s
* nieuwe diensten
* nieuwe rollen
* nieuwe booking types
* nieuwe medewerkers
* nieuwe organisaties
 
⸻
 
FASE 2, RESEND EN EXTERNE KOPPELINGEN
Nog niet nu bouwen, maar wel alvast architectonisch voorbereiden.
Voorzie de backend en frontend later van ondersteuning voor:
* Resend voor automatische bevestigingsmails
* Google Calendar synchronisatie
* Outlook Calendar synchronisatie
* Apple Calendar ondersteuning
De bron van waarheid blijft altijd Supabase.
Externe calendar-syncs zijn alleen kopieën van de boekingen, nooit de primaire logica.
 
⸻
 
FASE 3, FRONTEND AANSLUITEN
Pas nadat de database, rollen, regels, seed data, RLS en functies werken, koppel je de bestaande frontend hierop aan.
Vervang alle mock data door live data uit Supabase.
Zorg dat de frontend de database respecteert en niet zelf business logic verzint.
Belangrijk:
* geen nepdata
* geen hardcoded beschikbaarheid
* geen hardcoded uren
* geen hardcoded boekingsrechten
* geen dubbele dashboards
* geen losse testlogica in de UI
De frontend toont alleen wat de database teruggeeft.
 
⸻
 
EINDDOEL
Na deze iteratie staat Déjà Vu OS als een werkend, schaalbaar intern platform met:
* echte database-structuur
* echte gebruikers
* echte rollen
* echte programma’s
* echte beschikbaarheid
* echte boekingslogica
* echte agenda-data
* echte rechten
* echte beheermogelijkheden
De frontend sluit hier daarna volledig op aan.

Do not merely describe the database changes. Actually implement them in the connected Supabase project. Use migrations or SQL through the connected Supabase tooling where required, and verify that the changes were successfully applied before proceeding to the frontend.

Keep development status, implementation notes, setup instructions, limitations and remaining tasks out of the application UI. Report them directly in the chat after implementation instead. 