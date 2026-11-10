# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1] - 2026-11-10

### Added

- Added the reference-based Sproutsite sprout-and-layers identity: standalone light, dark, monochrome, and icon SVGs, locally outlined Nunito lettering, and separate brand color tokens.
- Added a reproducible TypeScript asset generator, SVG/ICO/PNG favicons, Apple and web app icons, a static base-aware manifest, and a product Open Graph card.

### Changed

- Integrated the shared logo in the responsive header and footer, with white and navy wordmark states, while retaining the existing page design and consumer site names.

## [0.4.0] - 2026-11-10

### Changed

- Established Sproutsite — The Agent-Ready Static CMS as the product identity across the website, package, documentation, examples, tests, and Storybook.
- Renamed package imports and public helpers to Sproutsite, moved the core to `src/lib/sproutsite/`, and aligned theme classes (`ss-`) and the base-path environment variable (`SPROUTSITE_BASE`). Consumer imports and custom theme overrides must be updated together.
- Set the canonical product URL to `https://sproutsite.dev` and repository links to `sproutsite/sproutsite`; added consistent Open Graph and summary-card metadata.
- Replaced the previous product icon with a typographic wordmark and removed the favicon pending a new visual identity. Existing page URLs, component behavior, and visual theme remain intact.

### Fixed

- Applied the configured deployment base to Button navigation links, as uncovered by the full internal-link check under `/demo/`.

## [0.3.0] - 2026-11-01

### Added

- Added validated MDX layout components for columns, alerts, cards, images, and contextual eyebrows.
- Added a self-documenting website with a component showcase, documentation pages, optimized local images, and reusable hero theme classes.
- Added responsive transparent and glass header states, a compact fallback page title, and a sticky footer layout.

### Changed

- Reorganized default-theme components by Atomic Design and consolidated their nested CSS structure.
- Refined semantic typography, spacing, prose handling, navigation states, cards, and section layout options.
- Simplified section filenames, reserved underscored support directories, and improved heading anchors and content validation.

## [0.2.3] - 2026-10-30

### Added

- Added a dedicated light Sproutsite DaisyUI theme with semantic colors, typography, spacing, radius, and elevation tokens.

### Changed

- Applied the new design tokens to the shared page layout, navigation, hero, sections, footer, and fallback heading.

## [0.2.2] - 2026-10-30

### Added

- Added a dynamic GitHub release badge to the README.

## [0.2.1] - 2026-10-30

### Changed

- Reorganized the default-theme styles into documented foundation, component, and theme modules behind a single stylesheet entry point.

## [0.2.0] - 2026-10-30

### Changed

- Made `NN-section.name.md` the required naming convention for content sections.
- Updated the content validator, section sorting, documentation, and all bundled example content for the new convention.

## [0.1.1] - 2026-10-27

### Fixed

- Included the installed default theme's Astro components and layouts in Tailwind's source scan so packaged websites receive all required utility classes.

## [0.1.0] - 2026-10-27

### Added

- Introduced the initial Sproutsite file-based content framework, default DaisyUI theme, validated content contract, static routing, SEO metadata, sitemap, tests, and accessibility checks.
- Added the installable package surface for content collections, Astro configuration, and the shared page route, together with local tarball verification.
