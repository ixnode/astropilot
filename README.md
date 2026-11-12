# Sproutsite

[![GitHub Release](https://img.shields.io/github/v/release/sproutsite/sproutsite?display_name=tag&sort=semver)](https://github.com/sproutsite/sproutsite/releases)

**Sproutsite — The Agent-Ready Static CMS**

Agent-ready, Markdown-first Static CMS powered by Astro and TypeScript.

Sproutsite is an npm-based developer tool for file-based content, page structures, and reusable components. External coding agents such as Codex or Claude Code can edit the repository; **Sproutsite itself contains no AI agent**. There is no traditional CMS administration backend. Astro generates a static website that needs no CMS server runtime, while Git keeps content changes reviewable.

_Plant an idea. Grow your website._

This repository is a working demo and local package development state. The package remains private and has not been published; registry availability is not implied. Official website: [sproutsite.dev](https://sproutsite.dev). Repository: [sproutsite/sproutsite](https://github.com/sproutsite/sproutsite).

## Preparing Local Package Use

Sproutsite provides a small public package surface:

- `sproutsite/content` with `createSproutsiteCollections()`
- `sproutsite/config` with `createSproutsiteConfig()`
- `sproutsite/page` with the shared route and `getSproutsiteStaticPaths()`
- `sproutsite/components` with documented MDX layout components

The demo itself already uses these imports. A future local consumer uses a tarball created with `npm pack` and installs it there. The package remains `private` and is not published to the npm registry until an explicit publishing request is made.

A consumer project needs its own content plus these three small integrations:

```ts
// src/content.config.ts
import { createSproutsiteCollections } from 'sproutsite/content';

export const collections = createSproutsiteCollections();
```

```ts
// astro.config.ts
import { defineConfig } from 'astro/config';
import { createSproutsiteConfig } from 'sproutsite/config';

export default defineConfig(createSproutsiteConfig());
```

```astro
---
// src/pages/[...slug].astro
import SproutsitePage, { getSproutsiteStaticPaths } from 'sproutsite/page';

export const getStaticPaths = getSproutsiteStaticPaths;
---

<SproutsitePage {...Astro.props} />
```

Content files belong exclusively to the consumer project. Test the installable state without publishing to a registry:

```sh
# in the Sproutsite repository
npm pack

# in the separate Astro consumer project
npm install /absolute/path/to/sproutsite-0.4.0.tgz
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
The [blog](/blog/) is a small, file-based project journal. Each article lives in a `YYYY-MM-DD.article-slug/` directory in `src/content/blog/` and uses the same `page.yaml`, `hero.md`, and numbered sections as a normal page. `page.yaml` validates the title, description, date, local card image, and alternative text; the date prefix orders source directories while the URL only uses `article-slug`. Astro generates the overview and article routes from the collection, and every section supports the usual tones and documented MDX components.

Additional commands:

The optional `blog` setting in `site.yaml` accepts `title`, `eyebrow`, `description`, and `heading` (all non-empty strings) to customize the blog overview for a consumer website. Without this setting the demo's existing overview text applies.

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

Storybook is a local developer tool and not part of the published website. It renders the existing `.astro` components with the default Sproutsite theme. Stories live in `stories/`, use TypeScript, and directly import their corresponding component. The initial set covers `Button`, `Badge`, `Alert`, `Card`, and `ContentImage`; add a story whenever a reusable component or meaningful variant is introduced. The running demo documents the workflow at `/dokumentation/storybook/`.

`npm run build:demo` sets `SPROUTSITE_BASE=/demo/` only for that command; `src/content/site.yaml` remains unchanged. The product website uses `https://sproutsite.dev`; consumer projects must configure their own production URL. Before deployment, check indexability and any staging protection. `robots.txt` is not access control.

The product identity is consistently Sproutsite: package imports use `sproutsite/*`, public helpers use `createSproutsiteCollections()`, `createSproutsiteConfig()` and `getSproutsiteStaticPaths()`, and theme classes use the `ss-` prefix. Update local consumers' dependency, imports, environment variables and custom theme overrides together.

### Logo and icons

The reference-based sprout and three-layer symbol lives in `src/themes/default/assets/branding/`. `logo.svg` (navy wordmark), `logo-dark.svg` (white wordmark), `logo-monochrome.svg`, `icon.svg`, and `icon-monochrome.svg` are standalone vector assets with transparent backgrounds and outlined Nunito lettering. They need no external font. The shared `BrandLogo` atom uses the existing locally hosted Nunito font, inherits the light/dark text color, and is used in the header and footer. Consumer sites with a different `site.name` retain their own text wordmark.

`favicon.svg` uses flat colors for small displays. The ICO contains native 16, 32, and 48 pixel frames; separate PNGs provide those sizes too. The Apple touch icon is 180 pixels; web app icons are 192 and 512 pixels, with navy backgrounds and safe internal padding. `PageLayout` links the icons and the static `/site.webmanifest` endpoint registered by `createSproutsiteConfig()` through Astro's standard `injectRoute()` API. Imported asset URLs and the configured base are respected; no CMS runtime or service worker is added. These are the default theme's icons; a differently branded consumer should replace them when replacing the theme. The Sproutsite social card is emitted only for the product site (`site.name: Sproutsite`).

Brand colors are separate `--color-brand-*` tokens in `styles/foundation/tokens.css`; the existing semantic UI palette is unchanged. Run `npm run branding:generate` after changing the vector geometry or brand tokens, then `npm run format`. The TypeScript generator uses `fontkit` and `sharp` only during development. Its local source font is `scripts/assets/nunito-variable.ttf` from the [official Nunito distribution](https://github.com/google/fonts/tree/main/ofl/nunito), covered by the adjacent SIL Open Font License. Generated assets are committed and ordinary builds do not regenerate or download them.

## Maintaining Content

For a compact QR or advertising entry page, set `layout: landing` in `page.yaml`, omit `hero.md`, and supply exactly one visible H1 in the section content. The content can start with an image. This layout omits the header and automatic title area; the normal footer and shared components remain available. All other pages use `layout: default` automatically.

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

A `hero.md` activates the shared hero and requires a frontmatter `title`, rendered as the visible `h1`. `titleHighlight` may select one text fragment from that title for the theme highlight. `hero-classes` in `site.yaml` may optionally set up to eight theme classes for each hero and for the H1 fallback view without `hero.md`. A `classes` list in an individual `hero.md` completely overrides that global list; `classes: null` removes global classes for that hero. Classes must begin with `ss-`, for example `ss-hero--visual`, so a theme can add gradients, overlays, or textures. `background-image` optionally references a local image relative to `hero.md`; Astro validates it and emits an optimized decorative hero image. `claim` adds a prominent line below the title. `actions` optionally defines one or two Button-based calls to action with `label`, `href`, and `variant: primary|secondary`; `tagline` adds a short line below them. If these settings are omitted, the hero receives no additional image or actions. Delete the file to render `page.yaml.title` as a compact visible H1 fallback above the sections; it still receives global `hero-classes`. Sections must be named `NN-name.md`, begin with an `h2`, and may set `tone: default`, `muted`, or `brand` in frontmatter. By default, `ss-section__content` constrains content to a readable width. `fullWidth: true` in section frontmatter removes this inner constraint; the shared outer `site-shell` and Markdown typography remain active. Internal links always stay website-root-relative, for example `/faq/`; Sproutsite applies `base` exactly once. Heading IDs are derived from file names and headings, for example `01-introduction-inhalte-direkt-im-projekt-pflegen`, so anchor links remain unique across assembled Markdown files.

```md
---
title: Beispiel-Hero
titleHighlight: Hero
tone: brand
classes:
    - ss-hero--visual
background-image: ./_assets/hero-visual.png
claim: A memorable message.
actions:
    - label: Get started
      href: /dokumentation/einstieg/
      variant: primary
tagline: A short supporting claim.
---
```

Localization is not implemented in this milestone. Keep UI and explanatory copy in one language; established English brand claims can remain on a German page. A future localization layer should own translations and language selection rather than mixing languages in shared components.

To deliberately remove global hero classes, use:

```md
---
title: Hero ohne globale Theme-Klassen
classes: null
---
```

For tested layout building blocks, Sproutsite also supports MDX sections with the `.mdx` extension. Install this direct peer dependency in the consumer project:

```bash
npm install @astrojs/mdx
```

The first standard building block is a responsive 12-column layout:

```mdx
import { Column, Columns } from 'sproutsite/components';

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
import { Alert } from 'sproutsite/components';

<Alert variant="success" style="soft">
    **Gespeichert:** Die Änderungen wurden übernommen.
</Alert>
```

Local content images belong beside their page or in a shared local `_assets/` directory, for example `src/content/pages/showcase/_assets/`. The `_` prefix marks a support-only directory: it must not contain `page.yaml` and therefore cannot generate a page. `ContentImage` imports these PNG, JPEG, WebP, or AVIF files relatively from MDX and sends them through Astro’s asset pipeline as WebP at quality 80. The component accepts `width`, `height`, `fullWidth`, `shape="rounded|square"`, and `border="default|none"`; when width and height are specified, it uses `object-fit: cover`.

```mdx
import layoutImage from '../_assets/layout.png';
import { ContentImage } from 'sproutsite/components';

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

`Card` combines an optional local image, Markdown content, and actions. Its first direct `###` heading receives the DaisyUI card-title style. `CardActions` is optional; all Markdown links inside it render as consistent primary buttons. Use `shadow="none|sm|md|lg|xl"` to configure elevation; `sm` is the default.

```mdx
import cardImage from './images/card.png';
import { Card, CardActions } from 'sproutsite/components';

<Card image={cardImage} imageAlt="Description of the image content" shadow="md">
    ### Card title

    Multiple Markdown paragraphs are supported.

    <CardActions>
        [Learn more](/info/)
    </CardActions>

</Card>
```

`Button` renders a semantic link when `href` is provided and a real button otherwise. It accepts `variant="primary|secondary|accent|neutral|info|success|warning|error"`, `style="solid|outline|soft|ghost|link"`, `size="xs|sm|md|lg|xl"`, `type="button|submit|reset"`, and the Boolean `disabled` for button actions. Links deliberately cannot be disabled.

```mdx
import { Button } from 'sproutsite/components';

<Button href="/contact/">Contact</Button>
<Button variant="secondary" style="outline">
    Save draft
</Button>
```

`Badge` labels compact status values or categories. It accepts `variant="default|primary|secondary|accent|neutral|info|success|warning|error"`, `style="solid|outline|soft|dash"`, and `size="xs|sm|md|lg|xl"`.

```mdx
import { Badge } from 'sproutsite/components';

Build status: <Badge variant="success" style="soft">ready</Badge>
```

`Tabs` and `Tab` display Markdown panels with DaisyUI styling. `Tabs` requires a non-empty accessible `label` and one or more direct `Tab` children, each with a non-empty `title`. Optional `variant` supports `border` (default), `box`, and `lift`; `initial` is a one-based index (default `1`) and must refer to an existing panel.

```mdx
import { Tabs, Tab } from 'sproutsite/components';

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
import { ContentTable } from 'sproutsite/components';

<ContentTable caption="Example projects" variant="striped">

    | Project | Status | Pages |
    | :--- | :---: | ---: |
    | North | Draft | 12 |
    | South | Reviewed | 8 |

</ContentTable>
```

This MDX component requires the Sproutsite configuration: a small rehype transform adds the caption, column-header scopes, and optional row marker to Astro's existing table AST. Validation uses `remark-gfm` to inspect the same Markdown table structure. No custom table parser or browser JavaScript is needed. Plain Markdown tables remain supported; `/showcase/tabellen/` demonstrates the enhanced component.

`FoundationSample` is a fixed visual theme specimen exported from `sproutsite/components`. Its required `kind` prop accepts `colors`, `type`, `spacing`, `radius`, `shadow`, or `focus`; it accepts no other props or children. For example, `<FoundationSample kind="colors" />` displays labeled swatches using the actual theme variables. It illustrates the theme rather than providing a general layout language. `/showcase/foundations/` contains live specimens and usage/CSS examples; the detailed token reference lives on `/dokumentation/theme/`.

The small reusable content and URL logic lives in `src/lib/sproutsite/`. It knows neither demo text nor Tailwind or DaisyUI classes. The default theme lives in `src/themes/default/` and includes the layout, header, hero, sections, and footer. DaisyUI is actively used there for navigation and theme elements.

The entry point for the default theme is `src/themes/default/styles/theme.css`. It documents the import order and remains the only central import. Global foundations live in `styles/foundation/`, semantic content variants in `styles/themes/`. Components follow Atomic Design: `atoms/`, `molecules/`, `organisms/`, and `layout/` for technical layout primitives. Every visible building block is organized locally as a pair, for example `components/organisms/Header/Header.astro` and `components/organisms/Header/Header.css`; `layouts/PageLayout/` follows the same pattern. Theme-owned classes begin with `ss-`, for example `ss-header` and `ss-header__inner`. The default theme is named `sproutsite`, intentionally light, and centrally defines semantic DaisyUI tokens, font sizes, spacing, radii, and shadows in its theme and foundation files.

Another theme can replace these components and the technical CSS integration without migrating Markdown or YAML. This is not yet a configurable theme loader and deliberately does not claim every UI library can be switched through a setting.

## Validation and Limitations

The validator checks directory association, YAML fields, file names, tones, duplicate section numbers, Markdown hierarchy, raw HTML, disallowed link protocols, internal link targets, and generated heading IDs. The build checks all generated pages, metadata, canonicals, the sitemap, and base prefixes. Project-owned program logic is TypeScript only; `npm run test:source` checks this too.

Accessibility testing automates axe, visible keyboard focus, and mobile overflow checks. It does not replace a complete WCAG 2.2 AA conformance assessment or editorial review of headings and link text.

Future npm extraction still needs a defined public package surface, an installation test in a consumer project, package metadata/publishing, a project generator, and optional extensions. These capabilities are explicitly outside the scope of this milestone.
