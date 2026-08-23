# Yellow Pine Brand

The canonical brand guideline — **identity v3** (August 2026). Adopted while the company
is preproduction: the system the design skills derive from the brand premise alone,
verified computationally at every value. The name is the palette: **gold is "Yellow",
forest green is "Pine."**

The mark is a rounded two-tier pine with a 4° lean (geometry unchanged from v2.1 — one
mark at every size, tuned to stay legible at 16 px). In v3 it is recolored: wood gold on
light surfaces, gold-300 on the forest dark.

## Files

| File | What it is | Use on |
|---|---|---|
| [`logo.svg`](logo.svg) | Lockup — pine-green Literata wordmark, gold tree between the words | Light / paper surfaces |
| [`logo-dark.svg`](logo-dark.svg) | Lockup all in gold-300 — gold leads on dark | The forest dark surface |
| [`logo-mono.svg`](logo-mono.svg) | Ink-only lockup (one color) | Grayscale, single-ink print |
| [`icon.svg`](icon.svg) | Gold-300 mark on a forest `#121E17` tile | Avatars, app icons, favicons — every size |
| [`mark.svg`](mark.svg) | The bare wood-gold mark on transparency | Surfaces that bring their own background |

## Color

Two brand hues, one ground pair, one reserved status pair. Derived twice independently
from the premise (near-identical results); every pairing below is computed, not eyeballed.

| Group | Token | Hex | Contract |
|---|---|---|---|
| Brand | pine-700 — primary: links, brand text, wordmark on light | `#1C533D` | 8.3:1 on paper |
| Brand | pine-300 — links/brand text on the forest dark | `#99D3B9` | 10.1:1 on forest |
| Brand | gold-600 — the mark and graphic accents on light | `#AC8717` | 3.1:1 non-text only |
| Brand | gold-300 — gold leads on dark: mark, CTAs, highlights | `#F2CE59` | 11.2:1 on forest |
| Ground | paper — light surface and print stock | `#F8F7F2` | ink on it: 16:1 |
| Ground | forest ink — text on light AND the dark surface | `#121E17` | one computable anchor |
| Text | muted on paper / on forest | `#5A675F` / `#9AA9A0` | 5.5:1 / 7.0:1 |
| Status | pass / fail on paper | `#1F812D` / `#AC2724` | 4.6:1 / 6.4:1 |
| Status | pass / fail on forest | `#5AB757` / `#F47B74` | 6.8:1 / 6.5:1 |

Guardrails:

- **Gold is graphic-only on light** (3.1:1 — marks, rules, highlights, never text) and
  text-capable on the forest dark. Ink-on-gold-300 (11.2:1) is the CTA pairing.
- **Pine is the interactive and brand-text hue.** Status greens are deliberately separated
  from brand pine (ΔE ≥ 15.5 in both themes) and status is always icon + label — a link
  never impersonates "pass."
- **Forest ink does double duty** — primary text on light and the entire dark surface —
  so light and dark themes are one computable system, not two palettes.

## Type

**Three families, no more** (JetBrains Mono counted — it is the products' own interior
face and keeps that role):

| Family | Roles | Loaded weights |
|---|---|---|
| **Literata** (brand face) | Lockup, display, headings | 600 (opsz auto) |
| **Source Sans 3** | Body, UI labels, captions, subheads | 400, 400 italic, 600, 700 |
| **JetBrains Mono** | Code, tabular data/scores, eyebrow labels | 400, 700 |

Web scale: display 55/44/35 (Literata 600, lh 1.05–1.1, −0.015em) · title 28 (the site
header) · heading 22 (Literata) · subheading 18 (SS3 600) · body 16 (SS3 400, lh 1.55,
max-width 65ch) · ui 14 · caption 13 · overline 12 (JBM 400, uppercase, +0.08em — the
system floor). Paper scale: headline 29pt / subhead 19pt (Literata 600) · body 12pt floor
(SS3 400) · caption 9.5pt minimum for legal lines only.

Lockup: Literata 600 at −0.01em, shipped as outlines — regenerate with
[`design/gen-wordmark.mjs`](design/gen-wordmark.mjs) (vendored OFL fonts in
`design/fonts/`). Headings run −0.01em to 0; never below weight 400 at text sizes.
(Fraunces won the display slot on paper but fails the outline pipeline's production gate;
Literata is the derivation's equal-standing pick.)

## Usage

- The mark sits **between** the words — the gold tree literally is the "Yellow" of the
  name. Don't move it in front.
- GitHub org avatar: render `icon.svg` full-bleed (strip the tile's `rx`) at 1024 px.
- Clear space: the wordmark's x-height on all sides.
- Never stretch, skew, add effects, change the lean, or recolor outside these variants.

## Print

- Paper `#F8F7F2` is the stock; print runs two inks — forest ink plus a gold spot matched
  to the `#AC8717` family; **no full-dark flood pieces** — the forest surface is
  screen-only.
- Grayscale: gold grays to a mid tone and pine to near-ink — `logo-mono.svg` is the
  one-color master; the mark never relies on color alone.
- Status hues collapse in grayscale — the icon + label rule is the print mitigation.

## Provenance

**This folder is the source of truth.** Design work happens in the **Yellow Pine Brand**
project on Claude Design (claude.ai/design, org access, project
`e1932f3e-7810-4729-a638-09fecad7d7ab`); the pipeline generating its boards and
design-system cards lives in [`design/`](design/).

- v1 (Brandmark, archived in `yellow-pine/brand-assets`): generated identity — Cyber
  Yellow mark, outlined lettering.
- v2 (2026-08-21/23): mark redesigned as the two-tier pine (panel over four candidates,
  retuned v2.1 to one mark at every size); wordmark re-typeset in Rubik 700; palette kept
  and guardrailed through open and blind selections — the skills' answer *anchored on*
  the inherited yellow equity. Archived in this repo's git history.
- **v3 (2026-08-23, current):** with the company preproduction, the anchor was dropped
  and the premise-only greenfield system adopted outright — pine + gold + forest +
  Literata — derived twice independently with near-identical results, every token
  AA-verified.
