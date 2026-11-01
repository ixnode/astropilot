# AstroPilot

[![GitHub Release](https://img.shields.io/github/v/release/ixnode/astropilot?display_name=tag&sort=semver)](https://github.com/ixnode/astropilot/releases)

AstroPilot ist derzeit ein lokal entwickeltes, dateibasiertes Content-Framework auf Astro. Dieses Repository ist eine lauffähige Beispielwebsite, **kein veröffentlichtes npm-Paket** und keine Aussage über die Verfügbarkeit des Paketnamens.

## Lokale Paketnutzung vorbereiten

AstroPilot stellt eine kleine öffentliche Paketoberfläche bereit:

- `astropilot/content` mit `createAstroPilotCollections()`
- `astropilot/config` mit `createAstroPilotConfig()`
- `astropilot/page` mit der gemeinsamen Route und `getAstroPilotStaticPaths()`
- `astropilot/components` mit den dokumentierten MDX-Layout-Komponenten

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

Voraussetzung ist Node.js 24 LTS oder neuer. Die `.nvmrc` legt für die lokale Entwicklung Node.js 24.22.2 fest.

```sh
npm install
npm run dev
```

Der Dev-Server startet bewusst mit `--force`, damit Änderungen an Content Collections, MDX-Komponenten und lokalen Package-Dateien ohne einen alten Astro-Content-Cache geprüft werden.

Die laufende Demo dokumentiert sich zusätzlich selbst unter `/dokumentation/`: Dort stehen Setup, Inhaltsvertrag, Layout-Komponenten, Theme, Prüfungen und lokale Paketnutzung. Der sichtbare [Showcase](/showcase/) sammelt dagegen die Komponentenbeispiele.

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
├── 01-introduction.md  # Normale Markdown-Abschnitte, numerisch sortiert
└── faq/
    ├── page.yaml
    └── 01-questions.md
```

`page.yaml` benötigt einen nicht leeren `title` und eine `description`. Beide Werte gehören zu den HTML-Metadaten: `title` wird im `<title>`-Tag, `description` als Meta-Description verwendet. Ohne `url` wird sein Ordner direkt zur URL: `faq/page.yaml` wird `/faq/`; eine tiefere `services/monitoring/page.yaml` wird `/services/monitoring/`. Mit dem optionalen einzelnen URL-Segment `url` kann ein englischer Quellpfad eine lokalisierte öffentliche URL behalten: `documentation/page.yaml` mit `url: dokumentation` erzeugt `/dokumentation/`. Für Unterseiten werden URL-Segmente ihrer Elternseiten ebenfalls berücksichtigt.

Ein `hero.md` aktiviert den gemeinsamen Hero und benötigt einen `title` im Frontmatter; dieser wird als sichtbare `h1` verwendet. `hero-classes` in `site.yaml` kann optional höchstens acht Theme-Klassen für jeden Hero und die H1-Fallback-Ansicht ohne `hero.md` setzen. Mit `classes` als Liste in einer einzelnen `hero.md` wird diese globale Liste vollständig überschrieben; `classes: null` entfernt globale Klassen für genau diesen Hero. Die Klassen müssen mit `ap-` beginnen, zum Beispiel `ap-hero--visual`; damit kann ein Theme Hero-Hintergründe, Bilder oder Strukturen ergänzen. Fehlen beide Angaben, erhält der Hero keine zusätzliche Theme-Klasse. Löschen Sie die Datei, um stattdessen `page.yaml.title` als kompakte sichtbare H1-Fallback-Ansicht oberhalb der Sections zu verwenden; sie übernimmt weiterhin globale `hero-classes`. Sections heißen verbindlich `NN-name.md`, beginnen mit einer `h2` und können `tone: default`, `muted` oder `brand` im Frontmatter setzen. Standardmäßig begrenzt `ap-section__content` den Inhalt auf eine gut lesbare Breite. Mit `fullWidth: true` im Section-Frontmatter entfällt diese innere Begrenzung; die gemeinsame äußere `site-shell` und die Markdown-Typografie bleiben aktiv. Interne Links bleiben immer website-root-relativ, etwa `/faq/`; AstroPilot wendet `base` einmalig an. Überschrift-IDs werden aus Dateiname und Überschrift gebildet, etwa `01-introduction-inhalte-direkt-im-projekt-pflegen`, damit Sprunglinks über zusammengesetzte Markdown-Dateien eindeutig sind.

```md
---
title: Beispiel-Hero
tone: brand
classes:
    - ap-hero--visual
---
```

Zum bewussten Entfernen der globalen Hero-Klassen genügt:

```md
---
title: Hero ohne globale Theme-Klassen
classes: null
---
```

Für geprüfte Layout-Bausteine unterstützt AstroPilot zusätzlich MDX-Sections mit der Endung `.mdx`. Installieren Sie dafür im Verbraucherprojekt die direkte Peer-Abhängigkeit:

```bash
npm install @astrojs/mdx
```

Der erste Standardbaustein ist ein responsives 12-Spalten-Layout:

```mdx
import { Column, Columns } from 'astropilot/components';

<Columns>
    <Column span={8}>

        ## Hauptinhalt

        Dieser Bereich nimmt acht von zwölf Spalten ein.

    </Column>

    <Column span={4}>

        Dieser Bereich ergänzt den Hauptinhalt auf vier Spalten.

    </Column>

</Columns>
```

Die Datei heißt dann beispielsweise `01-introduction.mdx`. Mobil stehen die Bereiche untereinander; ab Desktop liegt ein 12-Spalten-Raster zugrunde. Ein `Columns`-Block enthält ein bis vier direkte `Column`-Elemente. `Column` akzeptiert `span={1}` bis `span={12}`; ohne Angabe belegt eine Spalte die volle Breite (`12`). Die Werte einer gemeinsamen Zeile dürfen zusammen höchstens `12` ergeben. Kleinere Summen lassen bewusst leeren Raum.

Übliche gleichmäßige Aufteilungen sind `12` (eine Spalte), `6 + 6` (zwei Spalten), `4 + 4 + 4` (drei Spalten) und `3 + 3 + 3 + 3` (vier Spalten). Asymmetrische Aufteilungen wie `8 + 4` oder `7 + 5` sind ebenso möglich. Neue Layout-Komponenten erfordern immer eine Astro-Komponente, einen dokumentierten Export und eine dokumentierte Verwendung.

Die erste DaisyUI-Komponente ist `Alert`. Sie wird in einer MDX-Section importiert und akzeptiert optional `variant="info|success|warning|error"` sowie `style="normal|soft|outline|dash"`:

```mdx
import { Alert } from 'astropilot/components';

<Alert variant="success" style="soft">
    **Gespeichert:** Die Änderungen wurden übernommen.
</Alert>
```

Lokale Inhaltsbilder liegen bei der zugehörigen Seite oder in einem gemeinsamen lokalen `_assets/`-Ordner, beispielsweise unter `src/content/pages/showcase/_assets/`. Der `_`-Präfix markiert einen reinen Unterstützungsordner: Er darf kein `page.yaml` enthalten und kann deshalb keine Seite erzeugen. `ContentImage` importiert diese PNG-, JPEG-, WebP- oder AVIF-Dateien relativ aus MDX und gibt sie über Astros Asset-Pipeline als WebP mit Qualität 80 aus. Die Komponente akzeptiert `width`, `height`, `fullWidth`, `shape="rounded|square"` und `border="default|none"`; bei gesetzter Breite und Höhe verwendet sie `object-fit: cover`.

```mdx
import layoutImage from '../_assets/layout.png';
import { ContentImage } from 'astropilot/components';

<ContentImage
    src={layoutImage}
    alt="Beschreibung des Bildinhalts"
    width={720}
    height={260}
    fullWidth
    shape="rounded"
    border="default"
/>
```

`Card` bündelt optional ein lokales Bild, Markdown-Inhalt und Actions. Die erste direkte `###`-Überschrift erhält den DaisyUI-Card-Titel-Stil. `CardActions` ist optional; alle darin enthaltenen Markdown-Links werden als einheitliche primäre Buttons dargestellt.

```mdx
import cardImage from './images/card.png';
import { Card, CardActions } from 'astropilot/components';

<Card image={cardImage} imageAlt="Beschreibung des Bildinhalts">
    ### Card-Titel

    Mehrere Markdown-Absätze sind möglich.

    <CardActions>
        [Mehr erfahren](/info/)
    </CardActions>

</Card>
```

## Struktur und Theme

Die kleine, wiederverwendbare Inhalts- und URL-Logik liegt in `src/lib/astropilot/`. Sie kennt weder Demo-Texte noch Tailwind- oder DaisyUI-Klassen. Das Standard-Theme liegt in `src/themes/default/` und umfasst Layout, Header, Hero, Sections und Footer. DaisyUI wird dort tatsächlich für Navigation und Theme-Elemente genutzt.

Der Einstieg für das Default-Theme ist `src/themes/default/styles/theme.css`. Er dokumentiert die Importreihenfolge und bleibt der einzige zentrale Import. Globale Grundlagen liegen in `styles/foundation/`, semantische Inhaltsvarianten in `styles/themes/`. Komponenten folgen Atomic Design: `atoms/`, `molecules/`, `organisms/` und `layout/` für technische Layout-Primitives. Jeder sichtbare Baustein ist als Paar lokal organisiert, beispielsweise `components/organisms/Header/Header.astro` und `components/organisms/Header/Header.css`; das Layout folgt mit `layouts/PageLayout/` demselben Muster. Theme-eigene Klassen beginnen mit `ap-`, etwa `ap-header` und `ap-header__inner`. Das Standard-Theme heißt `astropilot`, ist bewusst hell und definiert seine semantischen DaisyUI-Tokens, Schriftgrößen, Abstände, Radien und Schatten zentral in den Theme- und Foundation-Dateien.

Ein anderes Theme kann diese Komponenten und die technische CSS-Einbindung ersetzen, ohne Markdown oder YAML zu migrieren. Das ist noch kein konfigurierbarer Theme-Loader und bewusst keine Aussage, dass jede UI-Bibliothek per Schalter austauschbar wäre.

## Validierung und Grenzen

Der Validator prüft die Ordnerzuordnung, YAML-Felder, Dateinamen, Tones, doppelte Abschnittsnummern, Markdown-Hierarchie, rohes HTML, unzulässige Link-Protokolle, interne Linkziele und generierte Überschrift-IDs. Der Build prüft alle erzeugten Seiten, Metadaten, Canonicals, Sitemap und Base-Präfixe. Eigene Programmlogik liegt ausschließlich in TypeScript; `npm run test:source` prüft das zusätzlich.

Die Barrierefreiheitsprüfung automatisiert axe, sichtbaren Tastaturfokus und mobile Overflow-Prüfungen. Sie ersetzt keine vollständige WCAG-2.2-AA-Konformitätsbewertung oder redaktionelle Bewertung von Überschriften und Linktexten.

Für die spätere npm-Auslagerung fehlen weiterhin eine definierte öffentliche Paketoberfläche, ein Installationstest in einem Verbraucherprojekt, Paketmetadaten/Publikation, Projektgenerator und optionale Extensions. Diese Funktionen sind ausdrücklich nicht Teil dieses Meilensteins.
