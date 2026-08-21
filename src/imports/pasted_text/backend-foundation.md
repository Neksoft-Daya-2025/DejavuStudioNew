Master Prompt – Backend Fase 1 | Fundament Déjà Vu OS
De publieke website is gereed en goedgekeurd. De volgende stap is het opzetten van de volledige backendarchitectuur waarop het interne platform gebouwd gaat worden.
Het doel van deze iteratie is niet om direct het complete boekingssysteem af te ronden, maar om een schaalbare, veilige en toekomstbestendige fundering neer te zetten.
Gebruik Supabase als centrale backend voor:
	●	Database
	●	Authentication
	●	Row Level Security (RLS)
	●	API
	●	Storage (voor toekomstige uitbreidingen)
De architectuur moet modulair zijn en eenvoudig uitbreidbaar blijven.
⸻
Algemene uitgangspunten
Bouw geen oplossing specifiek voor Goldlective.
Bouw een generiek intern platform dat in de toekomst eenvoudig uitgebreid kan worden met:
	●	nieuwe studio’s;
	●	nieuwe projecten;
	●	nieuwe programma’s;
	●	nieuwe diensten;
	●	nieuwe medewerkers;
	●	nieuwe rollen;
	●	nieuwe organisaties.
De database moet leidend zijn.
⸻
Login
Voeg naast “Laten we kennismaken” een tweede knop toe:
Login
Voor deze eerste iteratie hoeft authenticatie nog niet volledig geïmplementeerd te worden.
De login mag voorlopig direct toegang geven tot de interne omgeving zodat tijdens de ontwikkeling eenvoudig tussen de publieke website en het interne platform geschakeld kan worden.
Supabase Auth wordt later volledig ingericht.
⸻
Eén intern platform
Maak géén aparte dashboards voor artiesten, engineers of beheerders.
Ontwikkel één intern platform.
Alle gebruikers openen dezelfde applicatie.
Welke onderdelen zichtbaar zijn wordt later volledig bepaald door de database.
⸻
Database First
Gebruik een Database First architectuur.
De frontend bepaalt nooit welke rechten een gebruiker heeft.
De frontend vraagt uitsluitend gegevens op.
De database bepaalt:
	●	welke gegevens zichtbaar zijn;
	●	welke gegevens gewijzigd mogen worden;
	●	welke pagina’s toegankelijk zijn;
	●	welke acties uitgevoerd mogen worden.
Gebruik hiervoor:
	●	Roles
	●	Permissions
	●	User Roles
	●	Row Level Security
Frontendbeveiliging is uitsluitend bedoeld voor de gebruikerservaring.
De daadwerkelijke beveiliging gebeurt volledig vanuit Supabase.
⸻
Database-architectuur
Ontwerp direct een professionele relationele databasestructuur.
Denk minimaal aan tabellen zoals:
	●	organizations
	●	users
	●	profiles
	●	roles
	●	permissions
	●	role_permissions
	●	user_roles
	●	programs
	●	user_programs
	●	studios
	●	staff
	●	booking_types
	●	booking_statuses
	●	bookings
	●	availability
	●	studio_hour_wallet
	●	notifications
	●	settings
	●	audit_logs
Gebruik waar mogelijk foreign keys en normalisatie.
Voorkom hardcoded waarden.
⸻
Organisatie
Introduceer direct een organisatie.
Voor nu:
Déjà Vu Studio
Alle gebruikers, studio’s, projecten, programma’s en boekingen worden gekoppeld aan een organisatie.
Hierdoor kan de software later eenvoudig meerdere organisaties ondersteunen.
⸻
Rollen
Maak de volgende rollen aan.
	●	Administrator
	●	Artist
	●	Engineer
	●	Beat Maker
Een gebruiker mag meerdere rollen tegelijk hebben.
Gebruik daarom een many-to-many relatie via:
user_roles
⸻
Programma’s
Programma’s zijn géén rollen.
Maak hiervoor een aparte structuur.
Voor nu:
	●	Goldlective
	●	Huisartiest Déjà Vu Studio
Een gebruiker kan lid zijn van meerdere programma’s.
Gebruik hiervoor:
programs
user_programs
⸻
Permissions
Maak rechten volledig configureerbaar vanuit de database.
Bijvoorbeeld:
	●	bookings.create
	●	bookings.edit
	●	bookings.delete
	●	bookings.view_all
	●	dashboard.admin
	●	dashboard.artist
	●	studio.manage
	●	users.manage
	●	settings.manage
Koppel permissions aan rollen.
Nieuwe rechten moeten later zonder code toegevoegd kunnen worden.
⸻
Studios
Voorzie ondersteuning voor meerdere studio’s.
Voor nu:
Gold Studio
Voorbereiden op:
	●	Diamond Studio
	●	White Room
⸻
Boekingstypen
Maak direct ondersteuning voor meerdere boekingstypen.
Voor nu:
	●	Studio Session
	●	Beat Session
Later moeten eenvoudig nieuwe typen toegevoegd kunnen worden.
⸻
Studio-uren
Iedere artiest beschikt over een urenwallet.
Voor Goldlective:
12 uur per maand.
De architectuur moet afwijkende aantallen uren ondersteunen.
⸻
Beschikbaarheid
Maak aparte beschikbaarheidstabellen voor:
	●	Studio’s
	●	Engineers
	●	Beat Makers
Voorkom dubbele boekingen.
⸻
Boekingen
Iedere boeking bevat minimaal:
	●	artiest
	●	programma
	●	studio
	●	boekingstype
	●	engineer
	●	datum
	●	starttijd
	●	eindtijd
	●	duur
	●	status
⸻
Statussen
Maak een aparte tabel voor boekingsstatussen.
Bijvoorbeeld:
	●	Pending
	●	Confirmed
	●	Cancelled
	●	Completed
	●	No Show
⸻
Row Level Security
Gebruik Row Level Security op alle gevoelige tabellen.
Een artiest mag uitsluitend:
	●	eigen profiel zien;
	●	eigen boekingen zien;
	●	eigen studio-uren zien.
Engineers mogen uitsluitend hun eigen agenda zien.
Administrators mogen alles beheren.
Alle beveiliging moet vanuit de database worden afgedwongen.
Niet vanuit frontendlogica.
⸻
Seed Data
Vul de database direct met een eerste dataset zodat het systeem direct getest kan worden.
Organisatie
Déjà Vu Studio
⸻
Gebruikers
Clyde
Displaynaam:
Clyde
Rollen:
	●	Administrator
Programma’s:
geen
⸻
Keenan Maartens
Displaynaam:
K9
Rollen:
	●	Administrator
	●	Artist
	●	Beat Maker
Programma’s:
	●	Goldlective
⸻
Jarnelle
Displaynaam:
Yarri
Rollen:
	●	Artist
	●	Engineer
Programma’s:
	●	Goldlective
⸻
Myron
Displaynaam:
LV
Rollen:
	●	Artist
	●	Engineer
Programma’s:
	●	Goldlective
⸻
Studio
Gold Studio
Status:
Actief
⸻
Dashboard MVP
Maak alvast één intern dashboard.
Voor nu mogen alle onderdelen zichtbaar zijn zodat de volledige applicatie ontwikkeld kan worden.
Denk aan modules zoals:
	●	Dashboard
	●	Boekingen
	●	Agenda
	●	Artiesten
	●	Medewerkers
	●	Studio’s
	●	Programma’s
	●	Instellingen
De uiteindelijke toegangsrechten worden later automatisch bepaald via rollen, permissions en Row Level Security.
⸻
E-mailarchitectuur
Bereid de backend alvast voor op transactionele e-mails.
Gebruik hiervoor later Resend.
De daadwerkelijke implementatie hoeft nu nog niet plaats te vinden.
Voorzie de architectuur alvast voor:
	●	boekingsbevestiging artiest;
	●	kopie naar Déjà Vu Studio;
	●	herinneringen;
	●	annuleringen;
	●	wijzigingen.
⸻
Logging
Leg belangrijke acties vast.
Bijvoorbeeld:
	●	gebruiker aangemaakt;
	●	boeking aangemaakt;
	●	boeking gewijzigd;
	●	studio-uren aangepast;
	●	rechten gewijzigd.
⸻
Doel van deze iteratie
Na deze fase moet de volledige technische fundering staan. Er is één intern platform, verbonden met Supabase, met een professionele databasestructuur, seed data, rollen, programma’s, rechten en Row Level Security. De backend is vanaf dit punt schaalbaar en voorbereid op de volgende fase: het daadwerkelijk bouwen van de complete boekingsflow, notificaties en Resend-integratie. Dit voorkomt dat de database later opnieuw ontworpen hoeft te worden.