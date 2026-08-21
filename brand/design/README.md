# Brand design pipeline

Everything here is generated from the SVG masters in [`../`](../) — the source of truth —
by [`build-boards.mjs`](build-boards.mjs). Two output sets:

- [`canvas/`](canvas/) — the Claude Design artboards (`*.dc.html` + hand-authored
  `canvas.json`) for the **Yellow Pine Brand** project on claude.ai/design
  (project `e1932f3e-7810-4729-a638-09fecad7d7ab`, org-scoped — a design-system project).
- [`cards/`](cards/) — self-contained `@dsCard` preview cards that feed the Claude Design
  **Design System pane**, so new Design projects in the org inherit the Yellow Pine brand.
- [`candidates/`](candidates/) — the four mark candidates from the 2026-08 modernization
  (A Grove · B Flight, the v1 mark · C Canopy, shipped · D North), embedded in the
  MarkStory board as the design record.

## Refresh loop

1. Edit the masters in `../` (never edit `canvas/*.dc.html` or `cards/*` by hand).
2. `npm run design:build` — deterministic; regenerates boards + cards.
3. Commit. `npm test` gates drift: committed outputs must byte-match a fresh build and
   embed the current masters.
4. Ask a Claude session to refresh the mirrors — it pushes `canvas/` + `cards/` to the
   Design project (DesignSync needs an interactive claude.ai login, so this is never CI)
   and republishes the shareable artifact from `canvas/`.

## The three surfaces (one source, no drift)

| Surface | Audience | Role |
|---|---|---|
| This repo (`brand/`) | Automation, the public | Source of truth — masters + tests |
| Claude Design project | The org, in claude.ai/design | Editable boards + org design system |
| [The artifact](https://claude.ai/code/artifact/5640ba83-1a0d-497d-ab95-a72752f57b7e) | Anyone with the link | Shareable presentation (Design projects have no public links) |

## Figma

Deliberately absent. The old "Yellow Pine Brand" Figma file was deleted (2026-08): on the
Starter plan its components could not be published as a library or instanced anywhere,
Code Connect is Organization/Enterprise-only, and no product design happens in Figma.
Recreate it from the masters (minutes, via `createNodeFromSvg`) only when **both** hold: a
human designer joins or product design moves to Figma, **and** the org upgrades to a paid
Figma plan — then build it as a properly published library, not a mirror.
