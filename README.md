# AstroPilot

AstroPilot ist derzeit ein lokal entwickeltes, dateibasiertes Content-Framework auf Astro. Dieses Repository ist eine lauffähige Beispielwebsite, **kein veröffentlichtes npm-Paket** und keine Aussage über die Verfügbarkeit des Paketnamens.

## Lokale Paketnutzung vorbereiten

AstroPilot stellt eine kleine öffentliche Paketoberfläche bereit:

- `astropilot/content` mit `createAstroPilotCollections()`
- `astropilot/config` mit `createAstroPilotConfig()`
- `astropilot/page` mit der gemeinsamen Route und `getAstroPilotStaticPaths()`

Die eigene Demo verwendet diese Imports bereits selbst. Für einen späteren lokalen Verbraucher wird ein Tarball mit `npm pack` erzeugt und dort installiert. Das Paket bleibt bis zu einem bewussten Veröffentlichungsauftrag `private` und wird nicht in die npm-Registry veröffentlicht.

Ein Verbraucherprojekt benötigt dann eigene Inhalte sowie diese drei kleinen Einbindungen:

```ts
// src/content.config.ts
import { createAstroPilotCollections } from 'astropilot/content';

export const collections = createAstroPilotCollections();
```

```ts
// astro.config.ts
import { defineConfig } from 'astro/config';
import { createAstroPilotConfig } from 'astropilot/config';

export default defineConfig(createAstroPilotConfig());
```

```astro
---
// src/pages/[...slug].astro
import AstroPilotPage, { getAstroPilotStaticPaths } from 'astropilot/page';

export const getStaticPaths = getAstroPilotStaticPaths;
const { page } = Astro.props;
---

<AstroPilotPage page={page} />
```

Die Content-Dateien gehören dabei ausschließlich dem Verbraucherprojekt. Den installierbaren Stand prüfst du ohne Registry-Veröffentlichung so:

```sh
# im AstroPilot-Repository
npm pack

# im separaten Astro-Verbraucherprojekt
npm install /absoluter/pfad/zu/astropilot-0.1.0.tgz
npm run check
npm run build
```

Die resultierende `.tgz` ist in diesem Repository ignoriert. Ein frisches temporäres Verbraucherprojekt mit eigener `site.yaml` und Markdown-Section wurde auf diese Weise erfolgreich geprüft.

## Starten

Voraussetzung ist Node.js 24 LTS oder neuer (getestet mit 24.20.0).

```sh
npm install
npm run dev
```

Weitere Befehle:

```sh
npm run check       # Inhaltsvertrag sowie Astro- und TypeScript-Prüfung
npm test            # kleine Unit-Tests der URL-Konventionen
npm run build       # validierter statischer Build nach dist/
npm run preview     # Vorschau des Builds
npm run test:a11y   # Playwright, axe, Tastaturfokus und mobile Breite
npm run build:demo  # prüft den Build einmalig mit Base /demo/
```

`npm run build:demo` setzt nur für diesen Befehl die Umgebungsvariable `ASTROPILOT_BASE=/demo/`; `src/content/site.yaml` bleibt unverändert. Vor einer echten Veröffentlichung muss der Platzhalter `https://example.com` durch die Produktions-URL ersetzt und Indexierbarkeit sowie ein eventueller Staging-Schutz geprüft werden. `robots.txt` wäre kein Zugriffsschutz.

## Inhalte pflegen

`src/content/site.yaml` enthält Name, Produktions-URL, Basispfad, Sprache, Navigation und Footer. Jede Seite ist ein Ordner unter `src/content/pages/`:

```text
pages/
├── page.yaml            # Startseite
├── hero.md              # optional
├── 01-einleitung.md     # Abschnitte, numerisch sortiert
└── faq/
    ├── page.yaml
    └── 01-fragen.md
```

`page.yaml` benötigt einen nicht leeren `title` und eine `description`. Sein Ordner wird direkt zur URL: `faq/page.yaml` wird `/faq/`; eine tiefere `leistungen/monitoring/page.yaml` wird `/leistungen/monitoring/`.

Ein `hero.md` aktiviert den gemeinsamen Hero. Löschen Sie die Datei, um stattdessen die schlichte sichtbare `h1` oberhalb der Sections zu verwenden. Sections heißen `NN-name.md`, beginnen mit einer `h2` und können `tone: default`, `muted` oder `brand` im Frontmatter setzen. Interne Links bleiben immer website-root-relativ, etwa `/faq/`; AstroPilot wendet `base` einmalig an. Überschrift-IDs werden aus Dateiname und Überschrift gebildet, etwa `01-einleitung-inhalte-die-im-projekt-bleiben`, damit Sprunglinks über zusammengesetzte Markdown-Dateien eindeutig sind.

## Struktur und Theme

Die kleine, wiederverwendbare Inhalts- und URL-Logik liegt in `src/lib/astropilot/`. Sie kennt weder Demo-Texte noch Tailwind- oder DaisyUI-Klassen. Das Standard-Theme liegt in `src/themes/default/` und umfasst Layout, Header, Hero, Sections, Footer und dessen Styles. DaisyUI wird dort tatsächlich für Navigation und Theme-Elemente genutzt.

Ein anderes Theme kann diese Komponenten und die technische CSS-Einbindung ersetzen, ohne Markdown oder YAML zu migrieren. Das ist noch kein konfigurierbarer Theme-Loader und bewusst keine Aussage, dass jede UI-Bibliothek per Schalter austauschbar wäre.

## Validierung und Grenzen

Der Validator prüft die Ordnerzuordnung, YAML-Felder, Dateinamen, Tones, doppelte Abschnittsnummern, Markdown-Hierarchie, rohes HTML, unzulässige Link-Protokolle, interne Linkziele und generierte Überschrift-IDs. Der Build prüft vier erzeugte Seiten, Metadaten, Canonicals, Sitemap und Base-Präfixe. Eigene Programmlogik liegt ausschließlich in TypeScript; `npm run test:source` prüft das zusätzlich.

Die Barrierefreiheitsprüfung automatisiert axe, sichtbaren Tastaturfokus und mobile Overflow-Prüfungen. Sie ersetzt keine vollständige WCAG-2.2-AA-Konformitätsbewertung oder redaktionelle Bewertung von Überschriften und Linktexten.

Für die spätere npm-Auslagerung fehlen weiterhin eine definierte öffentliche Paketoberfläche, ein Installationstest in einem Verbraucherprojekt, Paketmetadaten/Publikation, Projektgenerator und optionale Extensions. Diese Funktionen sind ausdrücklich nicht Teil dieses Meilensteins.
