# Yellow Pine Brand

The canonical public brand library — **identity v2** (August 2026 modernization). Clean
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
board in [`design/`](design/). Cyber Yellow on light backgrounds is the logo only (WCAG
logo exemption, 1.4:1) — never functional icons, text, or UI.

## Type

The wordmark is set in **Kanit SemiBold** (outlined — no font dependency), with two
deliberate customizations: a wider flat-apex `w` and a rounder i-dot, under +0.135em
tracking; the tight `Ye` pair is Kanit's own kern, kept as a signature. Use Kanit for
headings in brand materials; body copy stays system.

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
Brandmark mark's rounded geometry and tilt with an unmistakable pine silhouette; wordmark
letterforms unchanged (outlined, no font dependency). v2.1 (2026-08-23): the mark retuned
(deeper tier step, sturdier trunk) so one geometry serves every size, retiring the
separate small-size cut; typography and color passes completed — face identified as
customized Kanit SemiBold, link-on-light token `#1a75c8` added, Jet re-roled. The v1
Brandmark-generated identity is archived in the private `yellow-pine/brand-assets`
repository and in this repo's git history.
