# AstroPilot

[![GitHub Release](https://img.shields.io/github/v/release/ixnode/astropilot?display_name=tag&sort=semver)](https://github.com/ixnode/astropilot/releases)

AstroPilot is currently a locally developed, file-based content framework built on Astro. This repository is a working demo website, **not a published npm package** and not a statement about package-name availability.

## Preparing Local Package Use

AstroPilot provides a small public package surface:

- `astropilot/content` with `createAstroPilotCollections()`
- `astropilot/config` with `createAstroPilotConfig()`
- `astropilot/page` with the shared route and `getAstroPilotStaticPaths()`
- `astropilot/components` with documented MDX layout components

The demo itself already uses these imports. A future local consumer uses a tarball created with `npm pack` and installs it there. The package remains `private` and is not published to the npm registry until an explicit publishing request is made.

A consumer project needs its own content plus these three small integrations:

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

Content files belong exclusively to the consumer project. Test the installable state without publishing to a registry:

```sh
# in the AstroPilot repository
npm pack

# in the separate Astro consumer project
npm install /absolute/path/to/astropilot-0.1.0.tgz
npm run check
npm run build
```

The resulting `.tgz` is ignored by this repository. A fresh temporary consumer project with its own `site.yaml` and Markdown section has been tested successfully this way.

## Getting Started

Node.js 24 LTS or later is required. `.nvmrc` pins Node.js 24.22.2 for local development.

```sh
npm install
npm run dev
```

The dev server deliberately starts with `--force`, so changes to Content Collections, MDX components, and local package files are checked without an outdated Astro content cache.

The running demo documents itself at `/dokumentation/`: it contains setup, the content contract, layout components, theme, checks, and local package use. The visible [showcase](/showcase/) instead collects component examples.

Additional commands:

```sh
npm run check       # content contract plus Astro and TypeScript checks
npm test            # small unit tests for URL conventions
npm run build       # validated static build to dist/
npm run preview     # preview the build
npm run test:a11y   # Playwright, axe, keyboard focus, and mobile width
npm run build:demo  # builds once with base /demo/
npm run storybook   # isolated Astro component workshop on port 6006
npm run build:storybook # static Storybook output to storybook-static/
```

Storybook is a local developer tool and not part of the published website. It renders the existing `.astro` components with the default AstroPilot theme. Stories live in `stories/`, use TypeScript, and directly import their corresponding component. The initial set covers `Button`, `Badge`, `Alert`, `Card`, and `ContentImage`; add a story whenever a reusable component or meaningful variant is introduced. The running demo documents the workflow at `/dokumentation/storybook/`.

`npm run build:demo` sets `ASTROPILOT_BASE=/demo/` only for that command; `src/content/site.yaml` remains unchanged. Before a real release, replace the `https://example.com` placeholder with the production URL and check indexability as well as any staging protection. `robots.txt` is not access control.

## Maintaining Content

`src/content/site.yaml` contains the name, production URL, base path, language, navigation, and footer. Every page is a directory under `src/content/pages/`:

```text
pages/
├── page.yaml            # homepage
├── hero.md              # optional
├── 01-introduction.md   # regular Markdown sections, sorted numerically
└── faq/
    ├── page.yaml
    └── 01-questions.md
```

`page.yaml` requires a non-empty `title` and `description`. Both values are used for HTML metadata: `title` becomes the `<title>` tag and `description` becomes the meta description. Without `url`, its directory becomes the URL directly: `faq/page.yaml` becomes `/faq/`; a deeper `services/monitoring/page.yaml` becomes `/services/monitoring/`. The optional single URL segment `url` lets an English source path retain a localized public URL: `documentation/page.yaml` with `url: dokumentation` produces `/dokumentation/`. URL segments of parent pages are also considered for child pages.

A `hero.md` activates the shared hero and requires a frontmatter `title`, rendered as the visible `h1`. `hero-classes` in `site.yaml` may optionally set up to eight theme classes for each hero and for the H1 fallback view without `hero.md`. A `classes` list in an individual `hero.md` completely overrides that global list; `classes: null` removes global classes for that hero. Classes must begin with `ap-`, for example `ap-hero--visual`, so a theme can add hero backgrounds, images, or textures. If both settings are omitted, the hero receives no additional theme class. Delete the file to render `page.yaml.title` as a compact visible H1 fallback above the sections; it still receives global `hero-classes`. Sections must be named `NN-name.md`, begin with an `h2`, and may set `tone: default`, `muted`, or `brand` in frontmatter. By default, `ap-section__content` constrains content to a readable width. `fullWidth: true` in section frontmatter removes this inner constraint; the shared outer `site-shell` and Markdown typography remain active. Internal links always stay website-root-relative, for example `/faq/`; AstroPilot applies `base` exactly once. Heading IDs are derived from file names and headings, for example `01-introduction-inhalte-direkt-im-projekt-pflegen`, so anchor links remain unique across assembled Markdown files.

```md
---
title: Beispiel-Hero
tone: brand
classes:
    - ap-hero--visual
---
```

To deliberately remove global hero classes, use:

```md
---
title: Hero ohne globale Theme-Klassen
classes: null
---
```

For tested layout building blocks, AstroPilot also supports MDX sections with the `.mdx` extension. Install this direct peer dependency in the consumer project:

```bash
npm install @astrojs/mdx
```

The first standard building block is a responsive 12-column layout:

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

The file would be named `01-introduction.mdx`. Areas stack on mobile; from desktop widths onward, a 12-column grid applies. A `Columns` block contains one or more direct `Column` elements. `Column` accepts `span={1}` through `span={12}`; without a value, a column occupies the full width (`12`). Columns automatically continue on the next row when the next span no longer fits in the twelve available grid tracks. Eight columns with `span={4}`, for example, form rows of three, three, and two elements. Smaller totals intentionally leave empty space. The grid gap controls both horizontal and vertical spacing.

Common balanced distributions are `12` (one column), `6 + 6` (two columns), `4 + 4 + 4` (three columns), and `3 + 3 + 3 + 3` (four columns). Asymmetric distributions such as `8 + 4` or `7 + 5` are equally valid. New layout components always require an Astro component, a documented export, and documented usage.

The first DaisyUI component is `Alert`. Import it in an MDX section; it accepts optional `variant="info|success|warning|error"` and `style="normal|soft|outline|dash"` props:

```mdx
import { Alert } from 'astropilot/components';

<Alert variant="success" style="soft">
    **Gespeichert:** Die Änderungen wurden übernommen.
</Alert>
```

Local content images belong beside their page or in a shared local `_assets/` directory, for example `src/content/pages/showcase/_assets/`. The `_` prefix marks a support-only directory: it must not contain `page.yaml` and therefore cannot generate a page. `ContentImage` imports these PNG, JPEG, WebP, or AVIF files relatively from MDX and sends them through Astro’s asset pipeline as WebP at quality 80. The component accepts `width`, `height`, `fullWidth`, `shape="rounded|square"`, and `border="default|none"`; when width and height are specified, it uses `object-fit: cover`.

```mdx
import layoutImage from '../_assets/layout.png';
import { ContentImage } from 'astropilot/components';

<ContentImage
    src={layoutImage}
    alt="Description of the image content"
    width={720}
    height={260}
    fullWidth
    shape="rounded"
    border="default"
/>
```

`Card` combines an optional local image, Markdown content, and actions. Its first direct `###` heading receives the DaisyUI card-title style. `CardActions` is optional; all Markdown links inside it render as consistent primary buttons.

```mdx
import cardImage from './images/card.png';
import { Card, CardActions } from 'astropilot/components';

<Card image={cardImage} imageAlt="Description of the image content">
    ### Card title

    Multiple Markdown paragraphs are supported.

    <CardActions>
        [Learn more](/info/)
    </CardActions>

</Card>
```

`Button` renders a semantic link when `href` is provided and a real button otherwise. It accepts `variant="primary|secondary|accent|neutral|info|success|warning|error"`, `style="solid|outline|soft|ghost|link"`, `size="xs|sm|md|lg|xl"`, `type="button|submit|reset"`, and the Boolean `disabled` for button actions. Links deliberately cannot be disabled.

```mdx
import { Button } from 'astropilot/components';

<Button href="/contact/">Contact</Button>
<Button variant="secondary" style="outline">
    Save draft
</Button>
```

`Badge` labels compact status values or categories. It accepts `variant="default|primary|secondary|accent|neutral|info|success|warning|error"`, `style="solid|outline|soft|dash"`, and `size="xs|sm|md|lg|xl"`.

```mdx
import { Badge } from 'astropilot/components';

Build status: <Badge variant="success" style="soft">ready</Badge>
```

`Tabs` and `Tab` display Markdown panels with DaisyUI styling. `Tabs` requires a non-empty accessible `label` and one or more direct `Tab` children, each with a non-empty `title`. Optional `variant` supports `border` (default), `box`, and `lift`; `initial` is a one-based index (default `1`) and must refer to an existing panel.

```mdx
import { Tabs, Tab } from 'astropilot/components';

<Tabs label="Product information" variant="border" initial={1}>
    <Tab title="Overview">

        An overview with **Markdown**.

    </Tab>
    <Tab title="Details">

        Additional information.

    </Tab>

</Tabs>
```

Tabs progressively enhance static panels: all content remains readable without JavaScript. With JavaScript, each group has its own selection and linked tab/panel semantics. Arrow keys wrap between tabs, Home/End select the first/last tab, and Tab moves into the active panel. Long tab lists scroll horizontally. See `/showcase/tabs/` for examples. The implementation uses [DaisyUI tabs](https://daisyui.com/components/tab/) and the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

Fenced code blocks use Astro's built-in Shiki highlighter. Specify the language after the opening fence, for example `mdx`, `typescript`, `yaml`, or `css`. The configuration preloads MDX and its embedded TSX grammar so imports, components, attributes, and Markdown receive their respective syntax colors. Highlighting runs at build time and needs no browser library. Restart the development server after changing the shared Astro configuration.

## Structure and Theme

External HTTP(S) links automatically receive `target="_blank"` and `rel="noopener noreferrer"`, including Markdown reference/autolinks and header/footer links. External means a different origin from the validated production URL in `site.yaml`, so preview builds use the same classification. Internal/same-origin links, fragments, `mailto:`, and `tel:` retain their normal behavior. Authors do not add link attributes in content.

`ContentTable` wraps exactly one Markdown table in an MDX section. Its required `caption` becomes a native table caption. Optional props are `variant="plain|striped"`, `density="comfortable|compact"`, a boolean `wide` flag, and a one-based `highlight={2}` body-row index. Keep blank lines between the component tags and Markdown table. Column alignment uses standard Markdown colons. `wide` preserves a minimum table width of 60rem inside a keyboard-focusable horizontal scroll region.

```mdx
import { ContentTable } from 'astropilot/components';

<ContentTable caption="Example projects" variant="striped">

    | Project | Status | Pages |
    | :--- | :---: | ---: |
    | North | Draft | 12 |
    | South | Reviewed | 8 |

</ContentTable>
```

This MDX component requires the AstroPilot configuration: a small rehype transform adds the caption, column-header scopes, and optional row marker to Astro's existing table AST. Validation uses `remark-gfm` to inspect the same Markdown table structure. No custom table parser or browser JavaScript is needed. Plain Markdown tables remain supported; `/showcase/tabellen/` demonstrates the enhanced component.

`FoundationSample` is a fixed visual theme specimen exported from `astropilot/components`. Its required `kind` prop accepts `colors`, `type`, `spacing`, `radius`, `shadow`, or `focus`; it accepts no other props or children. For example, `<FoundationSample kind="colors" />` displays labeled swatches using the actual theme variables. It illustrates the theme rather than providing a general layout language. `/showcase/foundations/` contains live specimens and usage/CSS examples; the detailed token reference lives on `/dokumentation/theme/`.

The small reusable content and URL logic lives in `src/lib/astropilot/`. It knows neither demo text nor Tailwind or DaisyUI classes. The default theme lives in `src/themes/default/` and includes the layout, header, hero, sections, and footer. DaisyUI is actively used there for navigation and theme elements.

The entry point for the default theme is `src/themes/default/styles/theme.css`. It documents the import order and remains the only central import. Global foundations live in `styles/foundation/`, semantic content variants in `styles/themes/`. Components follow Atomic Design: `atoms/`, `molecules/`, `organisms/`, and `layout/` for technical layout primitives. Every visible building block is organized locally as a pair, for example `components/organisms/Header/Header.astro` and `components/organisms/Header/Header.css`; `layouts/PageLayout/` follows the same pattern. Theme-owned classes begin with `ap-`, for example `ap-header` and `ap-header__inner`. The default theme is named `astropilot`, intentionally light, and centrally defines semantic DaisyUI tokens, font sizes, spacing, radii, and shadows in its theme and foundation files.

Another theme can replace these components and the technical CSS integration without migrating Markdown or YAML. This is not yet a configurable theme loader and deliberately does not claim every UI library can be switched through a setting.

## Validation and Limitations

The validator checks directory association, YAML fields, file names, tones, duplicate section numbers, Markdown hierarchy, raw HTML, disallowed link protocols, internal link targets, and generated heading IDs. The build checks all generated pages, metadata, canonicals, the sitemap, and base prefixes. Project-owned program logic is TypeScript only; `npm run test:source` checks this too.

Accessibility testing automates axe, visible keyboard focus, and mobile overflow checks. It does not replace a complete WCAG 2.2 AA conformance assessment or editorial review of headings and link text.

Future npm extraction still needs a defined public package surface, an installation test in a consumer project, package metadata/publishing, a project generator, and optional extensions. These capabilities are explicitly outside the scope of this milestone.
