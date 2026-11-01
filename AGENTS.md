# AstroPilot – Rules for Coding Agents

## Goal and Current Development Status

AstroPilot is a lean, file-based content framework built on Astro. Developers provide layouts and tested building blocks; authors and agents maintain content in Markdown and YAML. Its output consists of static websites and landing pages without a CMS backend.

The long-term goal is installation as an npm package named `astropilot` with a usable base layout. A project generator and optional extensions may follow later. The package name is a working name; availability has not been verified. During this initial phase, development happens directly in this repository. Do NOT install a potentially unrelated `astropilot` package from the registry.

After installing its development dependencies, this repository must run immediately as a demo website with `npm run dev`. This is a functional development state, not a finished published npm product.

## Architecture Principles

- Use Astro standards, stable public APIs, Astro components, Content Collections with schemas, and native Markdown processing.
- Extend only where the agreed content structure requires additional logic. Do not implement a custom Markdown parser, router, build runner, or general template system.
- Use a standard Astro project with TypeScript and npm. Start without a monorepo, plugin registry, dependency-injection container, or custom CLI.
- Keep functions and modules understandable. Do not create abstractions for hypothetical use cases, unnecessary wrappers, or dependencies.
- Briefly document deviations from Astro conventions. Maintainability matters more than a minimal line count.
- Separate the content model and page assembly from presentation. The core must not know DaisyUI classes or assume concrete demo pages.
- Load Markdown through Astro. For YAML, use existing loaders or a small established YAML parser where singleton configuration requires it. Do not parse YAML yourself.
- Keep reusable logic in `src/lib/astropilot/` and the default theme in `src/themes/default/`. Small standard files connect them to Astro. These are internal boundaries, not a theme platform yet.
- The only style entry point for the default theme is `src/themes/default/styles/theme.css`. Its documented import order is part of the cascade and may only change after subsequent verification.
- Structure theme styles clearly: `styles/foundation/` contains only global foundations without concrete Astro components (tokens, base styles, focus, layout helpers, and prose); `styles/themes/` contains only semantic mappings such as content tones.
- Theme components follow Atomic Design: use `components/atoms/` for small UI building blocks, `components/molecules/` for composed UI building blocks, `components/organisms/` for larger website areas, and `components/layout/` for technical layout primitives. Do not create empty categories; choose the smallest suitable category for each new component.
- Each default-theme component lives in its category within its own PascalCase directory, containing an `.astro` and `.css` file with the same name, for example `components/organisms/Header/Header.astro` and `components/organisms/Header/Header.css`. The CSS file contains only the presentation of that building block; empty or unrelated CSS files are not allowed.
- Theme-owned CSS classes use the `ap-` prefix and clear block-element naming within a building block, for example `ap-header` and `ap-header__inner`. DaisyUI classes remain allowed for their actual UI components.
- Use native CSS nesting consistently for theme components: a block encapsulates its elements, for example `.ap-hero { .ap-hero__inner { .ap-hero__title { … } } }`; a modifier encapsulates its pseudo-elements and differing elements, for example `.ap-hero--theme-1 { &::before { … } .ap-hero__inner { … } }`. Do not split related selectors into separate blocks. This project uses CSS with Tailwind, not SCSS.
- Use the same outer content edge via `site-shell` for the header, footer, hero, sections, and H1 fallback view. Constrain reading width inside this container where needed; differing outer indents for these standard areas are not allowed.
- Demo content remains in `src/content/`; it must not become a fixed part of the framework core later.
- At the beginning, verify compatible stable versions in the official documentation. Use a supported Node LTS version, document it, and commit a lockfile. Do not guess version numbers.

## Mandatory Language: TypeScript Only

- Write all project-owned program logic in TypeScript: core code, helpers, browser code, tests, validation scripts, and programmatic tool configuration.
- Do not create `.js`, `.mjs`, or `.cjs` source files. Use `.ts`; do not introduce another programming language for project helper scripts.
- Use `astro.config.ts`. Test and other tool configurations must also be TypeScript where they require programmatic configuration. Choose tools that support TypeScript; report genuine limitations instead of silently adding JavaScript.
- Format formatable project sources with `npm run format`; use four spaces rather than tabs. Check unchanged formatting with `npm run format:check`. Do not format lockfiles or generated files.
- Use `astro/tsconfigs/strict` as the TypeScript base. Use precise types and inference; do not use blanket `any`, `@ts-ignore`, or disabled type checking to avoid errors.
- Astro components remain `.astro` files; write their program logic in TypeScript. Use typed component props.
- Browser scripts are processed by Astro: use TypeScript in processed `<script>` blocks or imported `.ts` modules. Do not use `is:inline`, HTML event handlers, or unprocessed JavaScript code in HTML strings.
- Generated JavaScript in build output and JavaScript in dependencies are allowed. TypeScript is transformed to JavaScript for execution; the source-code restriction does not apply to this required output.
- Markdown, YAML, CSS, JSON, and HTML templates inside `.astro` remain allowed for content, styles, data, and markup. npm scripts may invoke existing CLI tools; project-owned validation logic belongs in TypeScript files.
- During acceptance, check that no project-owned JavaScript source files exist. Exclude generated directories and dependencies from this check.

## Binding Content Contract

```text
src/content/
├── site.yaml
└── pages/
    ├── page.yaml
    ├── hero.md
    ├── 01-introduction.mdx # MDX layout section
    ├── 02-benefits.md
    ├── 03-further-reading.md
    ├── faq/
    │   ├── page.yaml
    │   ├── hero.md
    │   ├── 01-general-questions.md
    │   └── 02-content-management.md
    ├── info/
    │   ├── page.yaml
    │   ├── hero.md
    │   ├── 01-about-astropilot.md
    │   └── 02-workflow.md
    ├── showcase/
    │   ├── page.yaml
    │   ├── hero.md
    │   ├── 01-areas.mdx
    │   ├── _assets/
    │   │   ├── layout-landscape.png
    │   │   └── layout-portrait.png
    │   ├── foundations/
    │   │   ├── page.yaml
    │   │   └── 01-foundations.md
    │   ├── layout/
    │   │   ├── page.yaml
    │   │   └── 01-layout.mdx
    │   ├── typography/
    │   ├── navigation/
    │   ├── sections/
    │   ├── alerts/
    │   ├── images/
    │   └── cards/
    ├── documentation/
    │   ├── page.yaml
    │   ├── hero.md
    │   ├── 01-overview.mdx
    │   ├── getting-started/
    │   ├── content/
    │   ├── layout/
    │   ├── theme/
    │   ├── checks/
    │   └── package/
    └── contact/
        ├── page.yaml
        └── 01-contact.md
```

### Global Configuration: `site.yaml`

At a minimum:

```yaml
name: AstroPilot
url: https://example.com
base: /
language: de
hero-classes:
    - ap-hero--theme-1
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
        - label: Dokumentation
          href: /dokumentation/
        - label: Kontakt
          href: /kontakt/
footer:
    text: Eine Beispielwebsite mit AstroPilot.
    links:
        - label: Kontakt
          href: /kontakt/
```

Website name, language, production URL, base path, global `hero-classes`, navigation, and footer are maintained here. `hero-classes` is optional, contains at most eight theme classes with the `ap-` prefix, and applies to every hero and H1 fallback view without `hero.md`; `classes` in an individual `hero.md` overrides this value completely. Use the same validated values for Astro configuration, links, canonicals, and the sitemap; do not duplicate configuration. Astro configuration must not import Content APIs that are only available within the Astro runtime. Use a small Node-compatible loader for singleton configuration needed in more than one place.

`example.com` is a documented placeholder. Document its replacement before a real release. The demo does not require external fonts, tracking, or services.

### Page: `page.yaml`

```yaml
title: Energie verstehen und gezielt optimieren
description: Eine aussagekräftige Beschreibung dieser Beispielseite.
url: energie
```

- `title` and `description` are non-empty required fields used for HTML metadata: `title` for the `<title>` tag and `description` for the meta description. `url` is optional and contains exactly one URL segment using lowercase letters, digits, and hyphens.
- Every directory containing `page.yaml` defines a page; directories without this file may serve purely as grouping for deeper pages. Directories whose name begins with `_` are reserved support directories (such as `_assets/`), must not contain `page.yaml`, and never produce a page.
- Without `url`, the relative directory path determines the URL: root → `/`, `faq/` → `/faq/`, `services/monitoring/` → `/services/monitoring/`. A `url` value replaces only the segment of its own directory; for child pages, the `url` values of existing parent pages are also used. Therefore, `documentation/page.yaml` with `url: dokumentation` and `documentation/getting-started/page.yaml` with `url: einstieg` continue to produce `/dokumentation/einstieg/`.
- Do not implement additional slug overrides or translation systems beyond this single explicit URL-segment value during this phase.
- For pages without a hero, `title` is also the visible main heading.

### Optional Hero: `hero.md`

```md
---
title: Energie verstehen und gezielt optimieren
eyebrow: Willkommen bei AstroPilot
tone: brand
classes:
    - ap-hero--visual
---

Eine kurze Einführung in die Inhalte dieser Seite.

[Mehr erfahren](/info/)
```

- The presence of the file activates the hero. Do not add another activation option to `page.yaml`.
- `title` is a non-empty required field rendered as the visible `h1`; `eyebrow` is optional; `tone` has a documented default.
- `classes` is optional and contains at most eight additional theme classes for the outer hero `section` element. Each class starts with `ap-` and may only contain lowercase letters, digits, `_`, and `-`, for example `ap-hero--visual`. When `classes` is supplied as a list, it completely overrides global `hero-classes` from `site.yaml`. `classes: null` deliberately removes global classes; when the field is absent, global classes apply. This lets theme developers add backgrounds, images, or textures without copying the hero. These classes are only intended for `hero.md`, not for sections.
- The shared hero component renders the title and Markdown content entirely from `hero.md`.
- Without a hero, the layout renders `page.yaml.title` as a compact visible H1 fallback before the sections. It receives global `hero-classes` from `site.yaml`; without `hero.md`, there is no local override. This is the only intended visible fallback for pages without a hero.
- The homepage, FAQ, and Info use the same hero component with their own content. Do not create three copied implementations.

### Sections: `NN-name.md` and `NN-name.mdx`

```md
---
tone: muted
fullWidth: true
---

## Ein eigener Inhaltsbereich

Hier steht normaler Markdown-Inhalt.

[Antworten auf häufige Fragen](/faq/)
```

- Only files directly in a page directory belong to that page; do not mix them with child pages.
- Use numeric prefixes of at least two digits and a descriptive lowercase hyphenated name; sort numerically. Duplicate numbers are errors. Gaps are allowed. Standard sections use `.md`; an `.mdx` file is allowed only for documented MDX layout components.
- `tone`: only `default`, `muted`, or `brand`; an omitted value means `default`.
- `fullWidth`: an optional Boolean for sections; an omitted value means `false` and constrains content to the reading column. With `true`, only `ap-section__content` is omitted; `content-prose` and the outer `site-shell` remain active. The area therefore uses the full content width but not the browser edge.
- One file renders one semantic content section. It starts with a meaningful `h2`; further levels must follow logically. Do not use `h1` in hero or section Markdown.
- Do not use custom section directives, control comments, CSS classes, or inline styles in content files. MDX is allowed only in `.mdx` sections and may import only documented AstroPilot components and relative local images; do not use browser scripts or arbitrary JSX elements.
- For the MVP, the content contract supports normal Markdown without raw HTML or executable code. Check disallowed constructs using the existing Markdown AST; do not recreate a regex parser. Fenced code blocks remain normal content.
- Heading IDs must be unique within the assembled page, including equal headings in different files. Use a small deterministic strategy and document anchor links.

### MDX Layout Components

- When using MDX in a consumer project, install `@astrojs/mdx` as a direct dependency. AstroPilot configuration includes the official MDX integration.
- The first standard building block is a 12-column layout: `Columns` contains exactly the requested `Column span={8}` and `Column span={4}` areas. It renders stacked on mobile and side by side from desktop widths upward.
- New components are developer work: they require a tested Astro component, a documented export, and clear MDX usage. Do not develop an unrestricted layout language.

## Validation, Routing, and Development

- Use suitable Content Collections and Astro schemas. A small shared function supplements directory relationships and numeric sorting.
- Generate pages through one shared static Astro route with `getStaticPaths()`, including the homepage. Do not hand-write routes for individual demo pages.
- Validate YAML fields and frontmatter strictly. Errors name the file, field or cause, and expected values. Do not silently fall back for invalid configuration.
- Hero or section files without directly associated `page.yaml` are errors. Do not silently ignore incorrectly named content files; report them clearly. README files belong outside the content directory.
- Internal content links are website-root-relative, for example `/faq/`, without the deployment subpath. Apply `base` exactly once to such links and local public asset URLs.
- Handle external URLs, `mailto:`, `tel:`, query strings, and fragment targets correctly. Do not allow invalid URL protocols such as `javascript:` or protocol-relative URLs in the content contract.
- Check internal page targets and fragments against the finished output; ordinary static files such as images must not be interpreted as pages.
- Ensure safe path normalization: no path traversal and no silent URL collisions.
- Changes, additions, and removals of content files must be reflected by the dev server. Check YAML changes too. If global build configuration requires a restart, document this honestly; do not build a complex custom watch system.

## Replaceable Presentation with DaisyUI

- Integrate Tailwind CSS and DaisyUI according to their current official Astro instructions.
- Actually use DaisyUI in navigation, links/buttons, the hero, or other suitable theme elements.
- Keep DaisyUI- and Tailwind-specific classes and styles in the default theme and its technical integration. Do not put such details into content schemas or core modules.
- Map semantic `tone` values to static, tested color variants. Do not dynamically compose Tailwind class names in a way that bypasses CSS detection.
- Ensure readable Markdown typography including lists, links, tables, and code.
- A later theme replacement must not require content migration. It may require changes to components and CSS/build integration. Do not falsely promise that every UI library is already interchangeable through a configuration switch.
- Build only one theme now. Briefly document how it can later be replaced. No generic theme loader is required.
- Use a shared header and footer on all pages. Navigation has an active page state. For six links, a responsive wrapping navigation without a JavaScript menu is sufficient.
- The agreed content, navigation, footer, site metadata, and color variants are configurable. Arbitrary layout structures remain developer work; do not build a visual page builder.

## Accessibility and SEO

These requirements apply to implementation and content tasks, not only at the end of the project.

- Target WCAG 2.2 AA. Do not claim full conformance based on automated tests alone.
- Use semantic HTML, correct `lang`, a skip link, exactly one `main`, one visible `h1` as a project convention, and a logical heading structure.
- Provide keyboard operation, visible and unobscured focus indicators, meaningful reading order, sufficiently large interactive targets, and responsive presentation without avoidable horizontal page overflow.
- Check contrast for every supported color variant; make links in running text recognizable. Do not convey information through color alone.
- Use meaningful link text; use links for navigation and buttons for actions. Mark active navigation with `aria-current="page"`.
- Images need meaningful alternative text or deliberately empty alternative text when decorative. If images are used, consider dimensions, responsive delivery, and suitable loading behavior. Do not add images merely to satisfy a checklist.
- Do not use unnecessary animation; if used, respect `prefers-reduced-motion`. Prefer native HTML semantics over unnecessary ARIA.
- Use individual HTML titles and meta descriptions from validated data; derive absolute canonical URLs from the same production URL, base, and route. Do not create duplicate base prefixes.
- Prefer the official Astro sitemap integration. Use static crawlable links and correct status/404 handling; do not use a catch-all that renders unknown URLs as the homepage.
- Do not add meta keywords, fabricated JSON-LD, or ranking promises. The FAQ may initially remain regular Markdown text; no accordion or FAQ schema is required.
- Before publishing, document the production URL, indexability, and any staging protection that must be checked. `robots.txt` is not access control.

## Agent Work Modes

During framework development, core, theme, and Astro configuration may be changed within the agreed scope.
For content-only tasks, edit only content, approved website settings, and assets. Do not expand the content model or styles without being asked in order to force content to fit.
These rules are behavior instructions, not a technical sandbox. Do not claim that an agent with full file access cannot change the layout.

## Repository-Local Codex Skills and Versions

- Repository-specific workflows are located in `.codex/skills/`. Use them when the user explicitly invokes their name or shortcut.
- Release workflows prepare a release; run `npm publish`, create a GitHub release, tag, or push only with an explicit request.
- The publishable version must match in `package.json`, `VERSION`, and `CHANGELOG.md`. The changelog follows Keep a Changelog and SemVer.

## Verification and Documentation

Provide at least these commands:

- `npm run dev`: local Astro preview from this repository.
- `npm run build`: validated static output to `dist/`.
- `npm run preview`: preview the build.
- `npm run check`: Astro/TypeScript checking plus required content validation.
- `npm test`: a few meaningful tests of project-owned conventions.
- `npm run test:a11y`: reproducible browser verification of all generated demo, showcase, and documentation pages, for example with Playwright and axe-core.

Use existing tools; do not build a custom test platform. Check especially sorting and duplicate numbers, deep directory association, missing page metadata, invalid tones, hero presence, H1 fallback, unique IDs, and base URL behavior. Temporary fixtures for deeper pages are sufficient; the visible demo includes the homepage, content pages, showcase, and documentation.

Check built output for internal links and metadata. Test once with `/` and once with a subpath such as `/demo/`. Check desktop and mobile presentation as well as keyboard operation. Automated checks do not replace editorial judgment of headings or alternative text.

README in English: setup, Node version, commands, project structure, adding pages/sections, removing the hero, changing navigation/footer, color variants, links/base, replacing the theme, and planned npm extraction. Keep code identifiers in English. Document checks that were actually run and open limitations; never report unrun tests as passed.

## Future npm Distribution and Deliberately Excluded Scope

Keep core and base layout separated so they can later be extracted into an npm package. Do not use absolute developer paths or core imports from demo content. Briefly document the planned public surface without implementing unused APIs now.

This milestone does not yet include: npm publishing, installation testing of a finished AstroPilot package, a project generator, a custom MCP server, extensions/marketplace, multisite, multilingual support, CMS, authentication, form backend, deployment, or a complex layout language.

Do not publish or deploy anything without the corresponding request. Do not treat an invented license or package-name availability as resolved.
