---
tone: default
---

## Framework lokal testen

Für die Entwicklung kann ein anderes Astro-Projekt die lokale Arbeitskopie direkt installieren.

```sh
cd /pfad/zum/verbraucherprojekt
npm install ../astropilot
```

Nach Änderungen an AstroPilot genügt normalerweise ein Neustart des Verbraucher-Dev-Servers. Bei einer bewussten Paketprüfung erstellt `npm pack` einen Tarball, der sich anschließend im Verbraucherprojekt installieren lässt.

### Noch kein Registry-Release

AstroPilot ist aktuell ein lokales, privates Paket. Ein npm-Publish, ein GitHub-Release oder ein Tag erfolgen nur als bewusster separater Schritt.
