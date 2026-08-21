# Yellow Pine Brand

The canonical public brand library — **identity v2** (August 2026 modernization). Clean
outlined vectors with tight viewBoxes and no metadata cruft — use them as-is.

The mark is a two-tier pine with a 4° lean: a tree that's on its way somewhere. At small
sizes it simplifies to a single tier with a sturdier trunk (`favicon.svg`) so it never
muddies into a triangle.

## Files

| File | What it is | Use on |
|---|---|---|
| [`logo.svg`](logo.svg) | Horizontal lockup — *Yellow 🌲 Pine*, `#202020` wordmark | Light backgrounds |
| [`logo-dark.svg`](logo-dark.svg) | Same lockup, `#FCFCFC` wordmark | Dark backgrounds |
| [`icon.svg`](icon.svg) | The mark on a rounded `#202020` tile | Avatars, app icons ≥ 48 px |
| [`favicon.svg`](favicon.svg) | Small-size cut (single tier, sturdy trunk) on the same tile | Favicons, anything < 48 px |
| [`mark.svg`](mark.svg) | The bare `#FFD100` mark on transparency | Surfaces that bring their own background |

## Palette

| Role | Name | Hex |
|---|---|---|
| Brand yellow — the mark | Cyber Yellow | `#FFD100` |
| Foreground / primary text | Eerie Black | `#202020` |
| Background / surfaces | Baby Powder | `#FCFCFC` |
| Highlights, links | Bleu De France | `#3C91E6` |
| Muted dark accent | Jet | `#333533` |

## Usage

- Below 48 px, always use `favicon.svg`'s single-tier cut — the tier notches of the full
  mark are what muddies first.
- The lockup keeps the mark **between** the words — that placement is the signature; don't
  move it in front.
- Clear space: keep space equal to the wordmark's x-height on all sides.
- Never stretch, skew, add effects, change the lean, or recolor outside these variants.
- Meet WCAG AA contrast (4.5:1): pair `logo.svg` with light and `logo-dark.svg` with dark
  backgrounds.

## Provenance

v2 (2026-08): mark redesigned in-house — a two-tier pine synthesizing the original
Brandmark mark's rounded geometry and tilt with an unmistakable pine silhouette; wordmark
letterforms unchanged (outlined, no font dependency). The v1 Brandmark-generated identity
is archived in the private `yellow-pine/brand-assets` repository and in this repo's git
history. Working design library: the **Yellow Pine Brand** Figma file (key
`hbz4zqAZwSskQiFn5PPxFE`, org access).
