# AstroPilot – Regeln für Coding-Agenten

## Ziel und aktueller Entwicklungsstand

AstroPilot ist ein schlankes, dateibasiertes Content-Framework auf Astro. Entwickler stellen Layout und geprüfte Bausteine bereit; Autoren und Agenten pflegen Inhalte in Markdown und YAML. Ausgabe sind statische Websites und Landingpages ohne CMS-Backend.

Langfristiges Ziel: Installation als npm-Package `astropilot` mit nutzbarem Basislayout. Ein Projektgenerator und optionale Extensions können später folgen. Der Paketname ist ein Arbeitsname; Verfügbarkeit ist nicht geprüft. In dieser ersten Phase wird direkt in diesem Repository entwickelt. Installiere NICHT ein möglicherweise fremdes `astropilot`-Package aus der Registry.

Das Repository muss nach Installation seiner Entwicklungsabhängigkeiten unmittelbar mit `npm run dev` als Beispielwebsite laufen. Das ist ein funktionsfähiger Entwicklungsstand, noch kein fertiges veröffentlichtes npm-Produkt.

## Architekturprinzipien

- Verwende Astro-Standards, stabile öffentliche APIs, Astro-Komponenten, Content Collections mit Schemas und die native Markdown-Verarbeitung.
- Erweitere nur, wo die vereinbarte Inhaltsstruktur zusätzliche Logik erfordert. Kein eigener Markdown-Parser, Router, Build-Runner oder allgemeines Template-System.
- Nutze ein normales Astro-Projekt mit TypeScript und npm. Beginne ohne Monorepo, Plugin-Registry, Dependency-Injection-Container oder eigene CLI.
- Halte Funktionen und Module verständlich. Keine Abstraktionen für hypothetische Anwendungsfälle, keine unnötigen Wrapper oder Abhängigkeiten.
- Begründe Abweichungen von Astro-Konventionen kurz in der Dokumentation. Wartbarkeit zählt mehr als eine minimale Zeilenzahl.
- Trenne Inhaltsmodell und Seitenzusammenstellung von Darstellung. Der Kern darf keine DaisyUI-Klassen kennen und keine konkreten Demo-Seiten voraussetzen.
- Lade Markdown über Astro. Verwende für YAML vorhandene Loader bzw. einen kleinen etablierten YAML-Parser, wenn die Singleton-Konfiguration das erfordert. Parse YAML nicht selbst.
- Halte wiederverwendbare Logik in `src/lib/astropilot/` und das Standard-Theme in `src/themes/default/`. Kleine Standarddateien verbinden diese mit Astro. Das sind interne Grenzen, noch keine eigene Theme-Plattform.
- Der einzige Style-Einstieg des Standard-Themes ist `src/themes/default/styles/theme.css`. Seine dokumentierte Importreihenfolge ist Teil der Cascade und wird nur mit anschließender Prüfung geändert.
- Gliedere Theme-Styles nachvollziehbar: `styles/foundation/` enthält ausschließlich globale Grundlagen ohne konkrete Astro-Komponente (Tokens, Basis, Fokus, Layout-Hilfen und Prosa); `styles/themes/` enthält ausschließlich semantische Zuordnungen wie Inhalts-Tones.
- Theme-Komponenten folgen Atomic Design: `components/atoms/` für kleine UI-Bausteine, `components/molecules/` für zusammengesetzte UI-Bausteine, `components/organisms/` für größere Website-Bereiche und `components/layout/` für technische Layout-Primitives. Lege keine leeren Kategorien an; bei neuen Komponenten wähle die kleinste fachlich passende Kategorie.
- Jede Standard-Theme-Komponente liegt innerhalb ihrer Kategorie in einem eigenen PascalCase-Ordner mit der gleichnamigen `.astro`- und `.css`-Datei, etwa `components/organisms/Header/Header.astro` und `components/organisms/Header/Header.css`. Die CSS-Datei enthält ausschließlich die Darstellung dieses Bausteins; leere oder fachfremde CSS-Dateien sind nicht zulässig.
- Theme-eigene CSS-Klassen erhalten den Präfix `ap-` und folgen innerhalb eines Bausteins einer klaren Block-Element-Benennung, etwa `ap-header` und `ap-header__inner`. DaisyUI-Klassen bleiben für ihre echten UI-Bausteine erlaubt.
- Verwende für Header, Footer, Hero, Section und die H1-Fallback-Ansicht dieselbe äußere Inhaltskante über `site-shell`. Begrenze die Lesebreite bei Bedarf innerhalb dieses Containers; unterschiedliche äußere Einrückungen für diese Standardbereiche sind nicht zulässig.
- Demo-Inhalte bleiben in `src/content/`; sie gehören später nicht fest in den Framework-Kern.
- Prüfe zu Beginn kompatible stabile Versionen in der offiziellen Dokumentation. Verwende eine unterstützte Node-LTS-Version, dokumentiere sie und lege eine Lockdatei an. Keine geratenen Versionsnummern.

## Verbindliche Sprache: ausschließlich TypeScript

- Sämtliche eigene Programmlogik wird in TypeScript geschrieben: Core, Hilfsfunktionen, Browser-Code, Tests, Prüfskripte und programmatische Werkzeugkonfigurationen.
- Keine eigenen `.js`, `.mjs` oder `.cjs`-Quelldateien. Verwende `.ts`; keine zusätzliche Programmiersprache für Projekt-Hilfsskripte einführen.
- Verwende `astro.config.ts`. Auch Test- und andere Werkzeugkonfigurationen werden in TypeScript angelegt, sofern sie programmatische Konfiguration benötigen. Wähle Werkzeuge mit TypeScript-Unterstützung; melde echte Einschränkungen statt still JavaScript anzulegen.
- Formatiere formatierbare Projektquellen mit `npm run format`; verwende vier Leerzeichen statt Tabs. Prüfe den unveränderten Stil mit `npm run format:check`. Lockdateien und generierte Dateien werden nicht formatiert.
- Nutze `astro/tsconfigs/strict` als TypeScript-Basis. Verwende präzise Typen und Typinferenz; kein pauschales `any`, `@ts-ignore` oder Abschalten der Typprüfung, um Fehler zu umgehen.
- Astro-Komponenten bleiben `.astro`-Dateien; ihre Programmlogik wird in TypeScript geschrieben. Verwende typisierte Component-Props.
- Browser-Scripts werden durch Astro verarbeitet: TypeScript in verarbeiteten `<script>`-Blöcken oder eingebundenen `.ts`-Modulen. Kein `is:inline`, keine HTML-Eventhandler und kein unverarbeiteter JavaScript-Programmcode in HTML-Strings.
- Generiertes JavaScript in Build-Ausgaben und JavaScript in Abhängigkeiten sind erlaubt. TypeScript wird für die Ausführung zu JavaScript verarbeitet; das Quellcode-Verbot gilt nicht für diesen notwendigen Output.
- Markdown, YAML, CSS, JSON und HTML-Templates innerhalb von `.astro` bleiben für Inhalte, Styles, Daten und Markup erlaubt. npm-Scripts dürfen vorhandene CLI-Werkzeuge aufrufen; eigene Prüfprogrammlogik gehört in TypeScript-Dateien.
- Prüfe bei der Abnahme, dass keine eigenen JavaScript-Quelldateien vorhanden sind. Generierte Verzeichnisse und Abhängigkeiten dabei ausschließen.

## Verbindlicher Inhaltsvertrag

```text
src/content/
├── site.yaml
└── pages/
    ├── page.yaml
    ├── hero.md
    ├── 01-einleitung.mdx # MDX-Layout-Section
    ├── 02-vorteile.md
    ├── 03-weiterlesen.md
    ├── faq/
    │   ├── page.yaml
    │   ├── hero.md
    │   ├── 01-allgemeine-fragen.md
    │   └── 02-inhalte-pflegen.md
    ├── info/
    │   ├── page.yaml
    │   ├── hero.md
    │   ├── 01-ueber-astropilot.md
    │   └── 02-arbeitsweise.md
    ├── showcase/
    │   ├── page.yaml
    │   ├── hero.md
    │   ├── 01-foundations.md
    │   ├── 02-layout.mdx
    │   ├── 03-typografie.md
    │   ├── 04-navigation.md
    │   └── 05-sections.md
    └── kontakt/
        ├── page.yaml
        └── 01-kontakt.md
```

### Globale Konfiguration: `site.yaml`

Mindestens:

```yaml
name: AstroPilot
url: https://example.com
base: /
language: de
header:
    links:
        - label: Startseite
          href: /
        - label: FAQ
          href: /faq/
        - label: Info
          href: /info/
        - label: Showcase
          href: /showcase/
        - label: Kontakt
          href: /kontakt/
footer:
    text: Eine Beispielwebsite mit AstroPilot.
    links:
        - label: Kontakt
          href: /kontakt/
```

Website-Name, Sprache, Produktions-URL, Basispfad, Navigation und Footer werden hier gepflegt. Verwende dieselben validierten Werte für Astro-Konfiguration, Links, Canonicals und Sitemap; keine doppelte Konfiguration. Astro-Konfiguration darf keine nur innerhalb der Astro-Laufzeit verfügbaren Content-APIs importieren. Verwende für die gemeinsam benötigte Singleton-Konfiguration eine kleine Node-kompatible Ladefunktion.

`example.com` ist ein dokumentierter Platzhalter. Dokumentiere dessen Austausch vor einer echten Veröffentlichung. Externe Schriftarten, Tracking oder Dienste sind für die Demo nicht nötig.

### Seite: `page.yaml`

```yaml
title: Energie verstehen und gezielt optimieren
description: Eine aussagekräftige Beschreibung dieser Beispielseite.
```

- `title` und `description` sind nicht leere Pflichtfelder und werden für HTML-Metadaten verwendet: `title` für den `<title>`-Tag, `description` für die Meta-Description.
- Jeder Ordner mit `page.yaml` definiert eine Seite; Ordner ohne diese Datei dürfen als reine Gruppierung für tiefere Seiten dienen.
- Der relative Ordnerpfad bestimmt die URL: Wurzel → `/`, `faq/` → `/faq/`, `leistungen/monitoring/` → `/leistungen/monitoring/`.
- Keine zusätzlichen Slug-Overrides oder Übersetzungssysteme in dieser Phase.
- Bei Seiten ohne Hero ist `title` zugleich die sichtbare Hauptüberschrift.

### Optionaler Hero: `hero.md`

```md
---
title: Energie verstehen und gezielt optimieren
eyebrow: Willkommen bei AstroPilot
tone: brand
---

Eine kurze Einführung in die Inhalte dieser Seite.

[Mehr erfahren](/info/)
```

- Die Existenz der Datei aktiviert den Hero. Keine weitere Aktivierungsoption in `page.yaml`.
- `title` ist ein nicht leerer Pflichtwert und wird als sichtbare `h1` gerendert; `eyebrow` ist optional; `tone` hat einen dokumentierten Standard.
- Die gemeinsame Hero-Komponente rendert Titel und Markdown-Inhalt vollständig aus `hero.md`.
- Ohne Hero rendert das Layout `page.yaml.title` als schlichte sichtbare `h1` vor den Sections. Dies ist der einzige vorgesehene sichtbare Fallback für Seiten ohne Hero.
- Hauptseite, FAQ und Info nutzen dieselbe Hero-Komponente mit jeweils eigenen Inhalten. Keine drei kopierten Implementierungen.

### Sections: `NN-name.md` und `NN-name.mdx`

```md
---
tone: muted
---

## Ein eigener Inhaltsbereich

Hier steht normaler Markdown-Inhalt.

[Antworten auf häufige Fragen](/faq/)
```

- Nur direkt im Seitenordner liegende Dateien gehören zur jeweiligen Seite; keine Vermischung mit Unterseiten.
- Numerische Präfixe mit mindestens zwei Ziffern und einem sprechenden, kleingeschriebenen Namen mit Bindestrichen; numerisch sortieren. Doppelte Nummern sind Fehler. Lücken sind erlaubt. Normale Sections verwenden `.md`; eine `.mdx`-Datei ist ausschließlich für dokumentierte MDX-Layout-Komponenten zulässig.
- `tone`: ausschließlich `default`, `muted`, `brand`; fehlender Wert bedeutet `default`.
- Eine Datei wird als ein semantischer Inhaltsabschnitt dargestellt. Sie beginnt inhaltlich mit einer sinnvollen `h2`; weitere Ebenen müssen logisch folgen. Keine `h1` im Hero- oder Section-Markdown.
- Keine eigene Section-Direktive, keine Steuerkommentare, keine CSS-Klassen oder Inline-Styles in Content-Dateien. MDX ist nur in `.mdx`-Sections erlaubt und darf ausschließlich dokumentierte AstroPilot-Komponenten importieren; keine Browser-Skripte oder beliebige JSX-Elemente.
- Für das MVP unterstützt der Content-Vertrag normales Markdown ohne rohes HTML oder ausführbaren Code. Unzulässige Konstrukte über den vorhandenen Markdown-AST prüfen, nicht per Regex-Parser nachbauen. Fenced Code-Blöcke bleiben normale Inhalte.
- IDs für Überschriften müssen innerhalb der zusammengesetzten Seite eindeutig sein, auch bei gleichen Überschriften in verschiedenen Dateien. Nutze eine kleine deterministische Strategie und dokumentiere Sprunglinks.

### MDX-Layout-Komponenten

- Installiere bei MDX-Nutzung im Verbraucherprojekt `@astrojs/mdx` als direkte Abhängigkeit. Die AstroPilot-Konfiguration bindet die offizielle MDX-Integration ein.
- Der erste Standardbaustein ist ein 12-Spalten-Layout: `Columns` enthält genau die gewünschten `Column span={8}`- und `Column span={4}`-Bereiche. Es rendert mobil untereinander und ab Desktop nebeneinander.
- Neue Komponenten sind Entwicklerarbeit: Sie benötigen eine geprüfte Astro-Komponente, einen dokumentierten Export und eine klare MDX-Nutzung. Entwickle keine unbeschränkte Layoutsprache.

## Validierung, Routing und Entwicklung

- Verwende passende Content Collections und Astro-Schemas. Ordnerbeziehungen und numerische Sortierung ergänzt eine kleine gemeinsame Funktion.
- Erzeuge Seiten über eine gemeinsame statische Astro-Route mit `getStaticPaths()`, einschließlich der Startseite. Keine handgeschriebenen Routen je Beispielseite.
- Validiere YAML-Felder und Frontmatter strikt. Fehler nennen Datei, Feld bzw. Ursache und erwartete Werte. Keine stillen Fallbacks für ungültige Konfiguration.
- Hero-/Section-Dateien ohne direkt zugehörige `page.yaml` sind Fehler. Falsch benannte Inhaltsdateien nicht still ignorieren; klar melden. README-Dateien gehören außerhalb des Inhaltsverzeichnisses.
- Interne Content-Links sind website-root-relative, z. B. `/faq/`, ohne Deployment-Unterpfad. Wende `base` einmalig auf solche Links und lokale öffentliche Asset-URLs an.
- Externe URLs, `mailto:`, `tel:`, Querystrings und Fragmentziele korrekt behandeln. Keine unzulässigen URL-Protokolle wie `javascript:` oder Protokoll-relative URLs im Content-Vertrag.
- Prüfe interne Seitenziele und Fragmente gegen die fertige Ausgabe; gewöhnliche statische Dateien wie Bilder dürfen nicht als Seiten interpretiert werden.
- Sichere Pfadnormalisierung: keine Pfad-Traversierung und keine stillen URL-Kollisionen.
- Änderungen, Hinzufügen und Entfernen von Inhaltsdateien sollen im Dev-Server berücksichtigt werden. Prüfe auch YAML-Änderungen. Falls globale Build-Konfiguration einen Neustart erfordert, dokumentiere dies ehrlich; kein aufwendiges eigenes Watch-System.

## Austauschbare Darstellung mit DaisyUI

- Integriere Tailwind CSS und DaisyUI nach deren aktueller offizieller Astro-Anleitung.
- Nutze DaisyUI tatsächlich in Navigation, Links/Buttons, Hero oder anderen passenden Theme-Elementen.
- DaisyUI-/Tailwind-spezifische Klassen und Styles bleiben im Standard-Theme und dessen technischer Einbindung. Keine solchen Details in Inhaltsschemas oder Core-Modulen.
- Ordne semantische `tone`-Werte statischen, geprüften Farbvarianten zu. Kein dynamisches Zusammensetzen von Tailwind-Klassennamen, das die CSS-Erkennung unterläuft.
- Stelle lesbare Markdown-Typografie einschließlich Listen, Links, Tabellen und Code sicher.
- Ein späterer Austausch des Themes darf keine Content-Migration verlangen. Er darf Änderungen an Komponenten und CSS-/Build-Einbindung erfordern. Keine falsche Zusage, jede UI-Bibliothek ließe sich bereits per Konfigurationsschalter tauschen.
- Baue jetzt nur ein Theme. Dokumentiere kurz dessen spätere Ersetzung. Kein generischer Theme-Loader erforderlich.
- Gemeinsamer Header und Footer auf allen Seiten. Navigation mit aktivem Seitenzustand. Für fünf Links genügt eine responsive umbrochene Navigation ohne JavaScript-Menü.
- Konfigurierbar sind vereinbarte Inhalte, Navigation, Footer, Site-Metadaten und Farbvarianten. Beliebige Layout-Strukturen bleiben Entwickleraufgabe; kein visueller Baukasten.

## Barrierefreiheit und SEO

Diese Anforderungen gelten für Implementierungs- und Content-Aufgaben, nicht erst am Projektende.

- Ziel: WCAG 2.2 AA. Keine vollständige Konformität allein aufgrund automatisierter Tests behaupten.
- Semantisches HTML, korrektes `lang`, Skip-Link, genau ein `main`, eine sichtbare `h1` als Projektkonvention, logische Überschriftenstruktur.
- Tastaturbedienbarkeit, sichtbare und nicht verdeckte Fokusmarkierungen, sinnvolle Lesereihenfolge, ausreichend große Interaktionsziele und responsive Darstellung ohne vermeidbaren horizontalen Seiten-Overflow.
- Kontraste für jede unterstützte Farbvariante prüfen; Links im Fließtext erkennbar machen. Information nicht nur über Farbe vermitteln.
- Aussagekräftige Linktexte; Link für Navigation, Button für Aktionen. Aktive Navigation mit `aria-current="page"`.
- Bilder brauchen sinnvolle Alternativtexte oder bewusst leere Alternativtexte bei Dekoration. Falls Bilder eingesetzt werden: Maße, responsive Auslieferung und passendes Ladeverhalten berücksichtigen. Keine Bilder nur zum Erfüllen einer Checkliste ergänzen.
- Keine unnötigen Animationen; wenn verwendet, `prefers-reduced-motion` beachten. Native HTML-Semantik statt unnötigem ARIA.
- Individueller HTML-Titel und Meta-Description aus validierten Daten; absolute Canonical-URL aus derselben Produktions-URL, Base und Route. Keine doppelten Base-Präfixe.
- Offizielle Astro-Sitemap-Integration bevorzugen. Statische, crawlbare Links und saubere Status-/404-Behandlung; kein Catch-all, der unbekannte URLs als Startseite ausgibt.
- Keine Meta-Keywords, kein fingiertes JSON-LD, keine Ranking-Versprechen. FAQ kann zunächst normaler Markdown-Text sein; kein Accordion oder FAQ-Schema erforderlich.
- Dokumentiere vor Veröffentlichung zu prüfende Produktions-URL, Indexierbarkeit und gegebenenfalls Schutz einer Staging-Umgebung. `robots.txt` ist kein Zugriffsschutz.

## Agenten-Arbeitsmodi

Bei Framework-Entwicklung dürfen Core, Theme und Astro-Konfiguration im vereinbarten Umfang geändert werden.
Bei reinen Inhaltsaufträgen bearbeite nur Inhalte, freigegebene Website-Einstellungen und Assets. Erweitere nicht ungefragt das Inhaltsmodell oder Styles, um einen Inhalt passend zu machen.
Diese Regeln sind Verhaltensanweisungen, keine technische Sandbox. Behaupte nicht, ein Agent mit vollständigem Dateizugriff könne das Layout unmöglich verändern.

## Repository-lokale Codex-Skills und Versionen

- Die projektbezogenen Workflows liegen unter `.codex/skills/`. Nutze sie, wenn der Nutzer sie ausdrücklich mit ihrem Namen oder Kürzel aufruft.
- Release-Workflows bereiten einen Release vor; `npm publish`, einen GitHub-Release, Tags oder einen Push nur auf ausdrücklichen Auftrag ausführen.
- Die veröffentlichbare Version muss in `package.json`, `VERSION` und `CHANGELOG.md` übereinstimmen. Der Changelog folgt Keep a Changelog und SemVer.

## Prüfungen und Dokumentation

Stelle mindestens diese Befehle bereit:

- `npm run dev`: lokale Astro-Vorschau aus diesem Repository.
- `npm run build`: validierte statische Ausgabe nach `dist/`.
- `npm run preview`: Vorschau des Builds.
- `npm run check`: Astro-/TypeScript-Prüfung plus erforderliche Inhaltsvalidierung.
- `npm test`: wenige aussagekräftige Tests der eigenen Konventionen.
- `npm run test:a11y`: reproduzierbare Browserprüfung der fünf Beispielseiten, etwa mit Playwright und axe-core.

Nutze vorhandene Werkzeuge; keine eigene Testplattform. Prüfe vor allem Sortierung und doppelte Nummern, tiefe Ordnerzuordnung, fehlende Seitenmetadaten, ungültige Tones, Hero-Präsenz, H1-Fallback, eindeutige IDs und Base-URL-Verhalten. Temporäre Test-Fixtures für tiefere Seiten sind ausreichend; die sichtbare Demo umfasst fünf Seiten.

Prüfe die gebaute Ausgabe auf interne Links und Metadaten. Einmal mit `/`, einmal mit einem Unterpfad wie `/demo/` testen. Kontrolliere Desktop und Mobile sowie Tastaturbedienung. Automatisierte Prüfungen ersetzen keine inhaltliche Bewertung von Überschriften oder Alternativtexten.

README auf Deutsch: Setup, Node-Version, Befehle, Projektstruktur, Seite/Section hinzufügen, Hero entfernen, Navigation/Footer ändern, Farbvarianten, Links/Base, Theme ersetzen und geplante npm-Auslagerung. Code-Identifier auf Englisch. Dokumentiere tatsächlich ausgeführte Prüfungen und offene Grenzen; niemals nicht ausgeführte Tests als bestanden melden.

## Spätere npm-Verteilung und bewusst ausgeschlossener Umfang

Halte Core und Basislayout so getrennt, dass sie später in ein npm-Package ausgelagert werden können. Keine absoluten Entwicklerpfade oder Core-Importe aus Demo-Inhalten. Dokumentiere die geplante öffentliche Oberfläche knapp, ohne jetzt ungenutzte APIs zu implementieren.

Noch nicht Teil dieses Meilensteins: npm-Veröffentlichung, Installationstest eines fertigen AstroPilot-Packages, Projektgenerator, eigener MCP-Server, Extensions/Marktplatz, Multisite, Mehrsprachigkeit, CMS, Authentifizierung, Form-Backend, Deployment und komplexe Layoutsprache.

Veröffentliche oder deploye nichts ohne entsprechenden Auftrag. Eine frei erfundene Lizenz oder Paketnamensverfügbarkeit darf nicht als geklärt gelten.
