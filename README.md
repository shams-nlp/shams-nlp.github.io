# shams-nlp.github.io

Project page for SHAMS, an audio-grounded pronunciation benchmark for Levantine Arabic. One static page (`index.html` with inline CSS, `fonts.css`, `assets/`, `fonts/`); it makes no external requests at runtime.
Design follows Ben's SHAMS poster draft; the frame in `assets/frame.svg` and the tier figure in `assets/tiers.svg` are shared with the poster. All text and numbers come from the camera-ready paper.
Fonts (self-hosted @fontsource subsets, SIL OFL 1.1, licenses in `fonts/`): Inter Tight (headings, for the poster's Aktiv Grotesk), Source Sans 3 (body and phonemes), Tinos (author block, for the poster's Adobe Arabic Latin), IBM Plex Sans Arabic (Arabic).
The Paper, Code and Data buttons sit in the `.links` list in the header and in the footer, in that order. Paper points to arXiv 2610.01427.
GitHub Pages serves the repository root on the `main` branch.

## Versions

- `main` is the published site. GitHub Pages serves it.
- Each change is made on a `feature/<name>` branch from `main`. It merges into `main` after Ben approves it.
- `project-page` holds the full draft (tag `draft-2026-10-04`). It is never merged. A section from it comes back on its own `feature/<name>` branch.
- Each release gets a tag: `v1.0`, `v1.1`, and so on.

