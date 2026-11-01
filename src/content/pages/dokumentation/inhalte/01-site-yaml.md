---
tone: default
---

## Globale Website-Einstellungen

`src/content/site.yaml` enthält Name, Produktions-URL, Base-Pfad, Sprache, Navigation und Footer. Diese Werte werden für Layout, Links, Canonicals und Sitemap wiederverwendet.

```yaml
name: AstroPilot
url: https://example.com
base: /
language: de
```

### Globale Hero-Klassen

Mit `hero-classes` können Theme-Klassen für alle Heroes gesetzt werden. Die Klassen beginnen mit `ap-` und bleiben damit Theme-Details statt Inhaltslayout.

```yaml
hero-classes:
    - ap-hero--theme-1
```
