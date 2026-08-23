# Yellow Pine Brand

The canonical public brand library — **identity v2.2** (August 2026). Clean
outlined vectors with tight viewBoxes and no metadata cruft — use them as-is.

The mark is a two-tier pine with a 4° lean: a tree that's on its way somewhere. One mark
serves every size — the v2.1 geometry (deep tier step, sturdy trunk) is tuned to stay
legible at 16 px, so there is no separate favicon variant to maintain.

## Files

| File | What it is | Use on |
|---|---|---|
| [`logo.svg`](logo.svg) | Horizontal lockup — *Yellow 🌲 Pine*, `#202020` wordmark | Light backgrounds |
| [`logo-dark.svg`](logo-dark.svg) | Same lockup, `#FCFCFC` wordmark | Dark backgrounds |
| [`icon.svg`](icon.svg) | The mark on a rounded `#202020` tile | Avatars, app icons, favicons — every size |
| [`mark.svg`](mark.svg) | The bare `#FFD100` mark on transparency | Surfaces that bring their own background |

## Palette

| Role | Name | Hex |
|---|---|---|
| Brand yellow — the mark | Cyber Yellow | `#FFD100` |
| Foreground / primary text | Eerie Black | `#202020` |
| Background / surfaces | Baby Powder | `#FCFCFC` |
| Links on dark · large text · accents | Bleu De France | `#3C91E6` |
| Link text on light (AA, derived from Bleu De France) | Link on Light | `#1a75c8` |
| Elevated dark surface | Jet | `#333533` |

Contrast contracts are computed, not eyeballed — the full matrix lives on the Foundations
board in [`design/`](design/). The palette was selected twice over seven complete candidate
systems (all validator-gated): a skills-armed panel, then a **blind** rerun with codenamed
systems and no incumbent framing — the same system won both (2/3 each). Role guardrails
from those verdicts:

- **`#FFD100` is identity only** — the mark and badges. Never a chart series (use a darker
  gold step) and never a status color; a future status-amber must step clearly away from it.
- **Blue is interactive only** — links, focus rings, info badges; never decorative or
  identity. On light backgrounds it is always the `#1a75c8` token.
- Cyber Yellow on light backgrounds is the logo only (WCAG logo exemption, 1.4:1) — never
  functional icons, text, or UI.

### Extended tokens (blind-selection verdict, all AA-verified)

| Group | Tokens |
|---|---|
| Surfaces · light | paper `#FCFCFC` · card `#FFFFFF` (hairline `#E7E7E5`) · sunken `#F4F4F2` |
| Surfaces · dark | bg `#161616` · surface `#202020` · raised `#2A2A2A` · border `#3A3A3A` |
| Text · light | `#202020` · secondary `#5A5A58` · tertiary `#6E6E6C` · disabled `#9A9A98` (non-text) |
| Text · dark | `#F2F2F0` · secondary `#B7B7B4` · tertiary `#8F8F8C` · disabled `#5E5E5C` |
| Links | light `#1a75c8` (hover `#155F9F`) · dark `#82BCF2` (hover `#9FCCF6`) · fills `#3C91E6` |
| Selection wash | `#FFF7CC` with ink text (the one sanctioned yellow tint) |
| Status (icon + label, always) | success `#1A7F4B`/`#3DBE7E` · warning `#B45309`/`#E08A2E` (orange-shifted, never brand yellow) · danger `#C7392F`/`#F2555A` |

- Focus rings are azure in both modes — never yellow (3:1 non-text gate).
- Charts: `#FFD100` is excluded from categorical slots; slot 1 is the azure family; if a
  yellow-family slot is needed, use in-band ochre `#C9930A`; validate palettes per mode
  with the dataviz validator.
- Info states default to the azure family; a product may substitute neutral where blue
  must stay exclusively interactive (Latch).

## Type

The brand face is **Rubik 700** — chosen (2026-08) by a three-lens panel over fourteen
candidate faces and the incumbent: its rounded stems and terminals share the pine's corner
language, warm enough for kishi, credible enough for Latch, and a living 300–900 variable
family for headings. The wordmark is set in Rubik 700 at +0.02em tracking (near-neutral, per the blind selection verdict) and shipped as
outlines (no font dependency); regenerate it with
[`design/gen-wordmark.mjs`](design/gen-wordmark.mjs) (vendored OFL font in
`design/fonts/`). Use Rubik for headings in brand materials; body copy stays system.
Product UIs keep their own voices (kishi and Latch run JetBrains Mono as UI identity —
deliberately divergent from the umbrella brand).

## Usage

- The lockup keeps the mark **between** the words — that placement is the signature; don't
  move it in front.
- GitHub org avatar: render `icon.svg` full-bleed (strip the tile's `rx`) at 1024 px.
- Clear space: keep space equal to the wordmark's x-height on all sides.
- Never stretch, skew, add effects, change the lean, or recolor outside these variants.
- Meet WCAG AA contrast (4.5:1): pair `logo.svg` with light and `logo-dark.svg` with dark
  backgrounds.

## Provenance

**This folder is the source of truth for the Yellow Pine identity.** Design work happens
in the **Yellow Pine Brand** project on Claude Design (claude.ai/design, org access,
project `e1932f3e-7810-4729-a638-09fecad7d7ab`) — change the identity here first, then
rebuild and refresh the mirrors. The boards, design-system cards, and the pipeline that
generates them from these masters live in [`design/`](design/) (see its README for the
refresh loop and the Figma decision).

v2 (2026-08): mark redesigned in-house — a two-tier pine synthesizing the original
Brandmark mark's rounded geometry and tilt with an unmistakable pine silhouette. v2.1
(2026-08-23): the mark retuned (deeper tier step, sturdier trunk) so one geometry serves
every size, retiring the separate small-size cut; color pass added the link-on-light
token `#1a75c8` and re-roled Jet. v2.2 (2026-08-23): wordmark re-typeset in **Rubik 700**
(panel-chosen brand face), replacing the Brandmark-era outlined lettering. The v1
Brandmark-generated identity is archived in the private `yellow-pine/brand-assets`
repository and in this repo's git history.
