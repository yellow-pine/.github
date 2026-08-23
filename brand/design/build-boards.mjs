// Brand design pipeline: generates the Claude Design artboards (canvas/*.dc.html) and
// the design-system cards (cards/*.html) from the SVG masters in ../ (the source of
// truth) and the candidate vectors in candidates/.
//
// Deterministic on purpose — no dates, randomness, or environment reads — so
// tests/design.test.mjs can prove the committed outputs match a fresh build.
// Refresh loop: edit ../\*.svg → `npm run design:build` → commit (tests gate) → a
// Claude session pushes canvas/ + cards/ to the Design project and artifact.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DESIGN = dirname(fileURLToPath(import.meta.url));
const BRAND = join(DESIGN, '..');
const CANDIDATES = join(DESIGN, 'candidates');

const strip = (svg, w) =>
  svg.replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>|<title>[^<]*<\/title>/g, '')
    .replace(/\s(role|aria-label)="[^"]*"/g, '')
    .replace('<svg ', `<svg width="${w}" style="display:block;height:auto" `)
    .replace(/\n/g, ' ');

const master = (name) => readFileSync(join(BRAND, `${name}.svg`), 'utf8');
const candidate = (name) => readFileSync(join(CANDIDATES, name), 'utf8');

const logo = (w) => strip(master('logo'), w);
const logoDark = (w) => strip(master('logo-dark'), w);
const mark = (w) => strip(master('mark'), w);
const icon = (w) => strip(master('icon'), w);
const cand = (f, w) => strip(candidate(f), w);
const oldMark = (w) => strip(candidate('mark-B-flight.svg'), w);

const SOT = 'github.com/yellow-pine/.github';
const VERSION = 'Identity v3 · August 2026';

const HEAD = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,600&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400&display=swap">
  <style>
    body { margin: 0; font-family: "Source Sans 3", system-ui, sans-serif; color: #121E17; }
    a { color: #1C533D; } a:hover { color: #143D2D; }
    h2 { font-family: "JetBrains Mono", monospace; font-size: 13px; font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase; margin: 0; color: #5A675F; }
    p, li { font-weight: 500; }
  </style>
</helmet>`;
const FOOT = `</x-dc>
</body>
</html>`;

const eyebrow = (t) =>
  `<div style="font-size: 11px; font-weight: 600; letter-spacing: 0.22em; color: #5A675F; text-transform: uppercase">${t}</div>`;

const swatch = (hex, name, role) =>
  `<div style="display: flex; flex-direction: column; gap: 8px; flex: 1 1 0">
    <div style="background: ${hex}; height: 84px; border-radius: 10px; border: 1px solid rgba(18,30,23,0.08)"></div>
    <div style="font-size: 12px; font-weight: 600">${name}</div>
    <div style="font-size: 11px; color: #5A675F">${hex} · ${role}</div>
  </div>`;

const candCard = (svgHtml, name, score, verdict, winner) =>
  `<div style="display: flex; flex-direction: column; gap: 12px; background: #ffffff; border: 1px solid rgba(18,30,23,${winner ? '0.35' : '0.08'}); border-radius: 14px; padding: 20px">
    <div style="height: 150px; display: flex; align-items: center; justify-content: center">${svgHtml}</div>
    <div style="display: flex; align-items: baseline; gap: 8px">
      <div style="font-size: 13px; font-weight: 800">${name}</div>
      <div style="font-size: 11px; font-weight: 600; color: ${winner ? '#121E17' : '#5A675F'}; background: ${winner ? '#F2CE59' : 'rgba(18,30,23,0.06)'}; border-radius: 99px; padding: 2px 8px">${score}</div>
    </div>
    <p style="font-size: 12px; line-height: 1.55; margin: 0; color: #3F4A44; text-wrap: pretty">${verdict}</p>
  </div>`;

const tab = (title, active) =>
  `<div style="display: flex; align-items: center; gap: 8px; background: ${active ? '#2d2d30' : 'transparent'}; border-radius: 8px 8px 0 0; padding: 8px 14px; font-size: 11.5px; color: ${active ? '#F8F7F2' : '#9a9a98'}; white-space: nowrap">${icon(16)}<span>${title}</span></div>`;

// Self-contained design-system card: first-line @dsCard marker feeds the Design System
// pane; only external reference is Google Fonts (Literata — the brand face).
const dsCard = (group, title, note, stage, bg) => `<!-- @dsCard group="${group}" -->
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,600&display=swap">
  <style>body { margin: 0; font-family: "Literata", Georgia, serif; background: ${bg}; color: ${bg === '#121E17' ? '#F8F7F2' : '#121E17'}; }</style>
</head>
<body>
<div style="display: flex; flex-direction: column; gap: 14px; align-items: center; justify-content: center; padding: 32px; min-height: 200px">
  ${stage}
  <div style="font-size: 12px; font-weight: 600">${title}</div>
  <div style="font-size: 11px; opacity: 0.65; text-align: center">${note}</div>
</div>
</body>
</html>
`;

export function build(outDir = DESIGN) {
  const canvasDir = join(outDir, 'canvas');
  const cardsDir = join(outDir, 'cards');
  mkdirSync(canvasDir, { recursive: true });
  mkdirSync(cardsDir, { recursive: true });
  const board = (name, html) => writeFileSync(join(canvasDir, name), html);
  const card = (name, html) => writeFileSync(join(cardsDir, name), html);

  // ------------------------------------------------------------------- Cover
  board('Cover.dc.html', `${HEAD}
<div style="background: #F8F7F2; padding: 72px 64px; display: flex; flex-direction: column; gap: 36px; justify-content: center">
  <div style="padding: 4px 0">${logo(700)}</div>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div style="font-size: 19px; font-weight: 600; color: #121E17">Thoughtful tools, built with care.</div>
    <div style="font-size: 12px; color: #5A675F; line-height: 1.6; max-width: 70ch">${VERSION} · Source of truth: <strong>${SOT} → brand/</strong> — this project is the design home; the published SVG masters and these boards' sources (brand/design/) live in the repo.</div>
  </div>
</div>
${FOOT}`);

  // ------------------------------------------------------------ Main sheet
  board('Main.dc.html', `${HEAD}
<div style="background: #F8F7F2; padding: 56px; display: flex; flex-direction: column; gap: 40px">
  ${eyebrow('Yellow Pine · ' + VERSION)}
  <div style="display: flex; flex-direction: column; gap: 10px">
    <div style="font-family: Literata, Georgia, serif; font-size: 34px; font-weight: 600; line-height: 1.15; text-wrap: balance">The name becomes the palette.</div>
    <p style="font-size: 14px; line-height: 1.55; margin: 0; max-width: 62ch; text-wrap: pretty">Identity v3, adopted while the company is preproduction: the greenfield system the design skills derive from the premise alone. \u201cYellow\u201d is the wood-gold tree; \u201cPine\u201d is the forest green it grows in. Wordmark set in Literata 600; the mark keeps its v2.1 geometry, recolored.</p>
  </div>
  <div style="padding: 8px 0">${logo(768)}</div>
  <div style="background: #121E17; border-radius: 16px; padding: 40px 32px">${logoDark(704)}</div>
  <div style="display: flex; flex-direction: column; gap: 18px">
    <h2>The mark</h2>
    <div style="display: flex; gap: 28px; align-items: flex-end">
      <div style="display: flex; flex-direction: column; gap: 10px; align-items: center">${mark(120)}<div style="font-size: 11px; color: #5A675F">mark.svg</div></div>
      <div style="display: flex; flex-direction: column; gap: 10px; align-items: center">${icon(150)}<div style="font-size: 11px; color: #5A675F">icon.svg · the tile</div></div>
      <div style="display: flex; flex-direction: column; gap: 10px; align-items: center">
        <div style="display: flex; gap: 12px; align-items: flex-end">${icon(48)}${icon(32)}${icon(16)}</div>
        <div style="font-size: 11px; color: #5A675F">one mark at every size · 48 / 32 / 16 true-size</div>
      </div>
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 18px">
    <h2>Color</h2>
    <p style="font-size: 12px; color: #5A675F; margin: 0; max-width: 66ch">Two brand hues plus the reserved status pair. Every other value — dark-theme steps (pine-300 #99D3B9, gold-300 #F2CE59), muted text, print stock — is a derived token, not a color (see Foundations). Derived twice independently from the premise; near-identical results.</p>
    <div style="display: flex; gap: 16px">
      ${swatch('#F8F7F2', 'Paper', 'surface · print stock')}
      ${swatch('#121E17', 'Forest Ink', 'text on light · the dark surface')}
      ${swatch('#1C533D', 'Pine', 'brand primary · links · wordmark')}
      ${swatch('#AC8717', 'Wood Gold', 'brand accent · the mark on light')}
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 14px">
    <h2>Rules</h2>
    <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.7; max-width: 66ch">
      <li>One mark at every size — the v2.1 geometry (deep tier step, sturdy trunk) is tuned to survive 16px.</li>
      <li>The mark sits <strong>between</strong> the words. That placement is the signature.</li>
      <li>Clear space: the wordmark's x-height on all sides.</li>
      <li>Never stretch, skew, add effects, change the lean, or recolor outside the variants.</li>
      <li>WCAG AA: light lockup on light, dark lockup on dark.</li>
    </ul>
  </div>
  <div style="border-top: 1px solid rgba(18,30,23,0.1); padding-top: 18px; font-size: 12px; color: #5A675F">
    Source of truth: <strong>${SOT} → brand/</strong> · editable here in the Yellow Pine Brand project · board sources: brand/design/ in the repo.
  </div>
</div>
${FOOT}`);

  // ------------------------------------------------------------- Mark story
  board('MarkStory.dc.html', `${HEAD}
<div style="background: #F8F7F2; padding: 56px; display: flex; flex-direction: column; gap: 36px">
  ${eyebrow('Why it changed')}
  <div style="display: flex; gap: 28px; align-items: center">
    <div style="display: flex; flex-direction: column; gap: 8px; align-items: center">${oldMark(96)}<div style="font-size: 11px; color: #5A675F">v1 (Brandmark era) — read as a play button / paper plane</div></div>
    <div style="font-size: 26px; color: #5A675F">→</div>
    <div style="display: flex; flex-direction: column; gap: 8px; align-items: center">${mark(96)}<div style="font-size: 11px; color: #5A675F">v2.1 (today) — a pine, still on its way somewhere</div></div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <h2>Four directions, three critics</h2>
    <p style="font-size: 13px; line-height: 1.55; margin: 0; max-width: 64ch; text-wrap: pretty">Each candidate was rendered and judged through three independent lenses — brand strategy, production (true-16px favicon tests), and semantics — before anything shipped.</p>
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px">
      ${candCard(cand('mark-A-grove.svg', 96), 'A · Grove', '20.5', 'Production winner — indestructible at 16px. Tradeoff: trunk vanishes small, drifting toward a generic triangle. Its sturdy trunk and simplicity informed the v2.1 tuning.')}
      ${candCard(oldMark(80), 'B · Flight', '17', 'Strategy winner — the ownable pine-cursor duality. Tradeoff: reads play-button at small sizes; the exact problem being fixed.')}
      ${candCard(cand('mark-C-canopy.svg', 96), 'C · Canopy', '22 · shipped', 'Semantics winner — pine undeniable, and the truest heir of v1’s rounded, notched construction. Shipped with B’s lean added.', true)}
      ${candCard(cand('mark-D-north.svg', 96), 'D · North', '14.5', 'Sleek, but reads as every map app’s heading arrow, and its thin tips starve beside the heavy rounded wordmark.')}
    </div>
  </div>
  <div style="background: #121E17; color: #F8F7F2; border-radius: 14px; padding: 22px 26px; font-size: 13px; line-height: 1.6">
    <strong style="color: #F2CE59">Synthesis.</strong> C's silhouette + B's 4° lean, retuned in v2.1 (deeper tier step, sturdier trunk from A) so one mark serves every size. In v3 the geometry is unchanged and only recolored: wood gold on light, gold-300 on the forest dark. The full v3 story lives on the <strong>Foundations</strong> board.
  </div>
</div>
${FOOT}`);

  // ------------------------------------------------------------ Foundations
  board('Foundations.dc.html', `${HEAD}
<div style="background: #F8F7F2; padding: 56px; display: flex; flex-direction: column; gap: 36px">
  ${eyebrow('Foundations · type & color pass · August 2026')}
  <div style="display: flex; flex-direction: column; gap: 14px">
    <h2>The face</h2>
    <p style="font-size: 13px; line-height: 1.55; margin: 0; max-width: 66ch; text-wrap: pretty">Identity v3 type system, derived premise-only: <strong>three families, no more</strong> (the better-typography cap, with JetBrains Mono counted as the products&#39; own face). <strong>Literata 600</strong> is the brand face — lockup and display (a warm literary serif pairs by maximal contrast with the products&#39; rigid mono; three independent derivations all chose this category); <strong>Source Sans 3</strong> carries body and UI (400/600/700 + real italic); <strong>JetBrains Mono</strong> keeps code, data, and eyebrow labels. The wordmark is Literata 600 at −0.01em, shipped as outlines via brand/design/gen-wordmark.mjs (vendored OFL font). Fraunces won the display slot on paper but failed the outline-pipeline production gate; Literata was the replicate&#39;s own equal-standing pick.</p>
    <div style="font-family: Literata, Georgia, serif; font-weight: 600; font-size: 30px; letter-spacing: -0.01em">AaBbCcDdEe 0123456789</div>
    <div style="display: flex; flex-direction: column; gap: 10px; background: #ffffff; border: 1px solid rgba(18,30,23,0.08); border-radius: 14px; padding: 22px">
      <div style="font-size: 11px; color: #5A675F; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600">Proof — outlines vs the live face</div>
      ${logo(560)}
      <div style="font-family: Literata, Georgia, serif; font-weight: 600; font-size: 47px; letter-spacing: -0.01em; line-height: 1; color: #1C533D">Yellow&#8195;Pine</div>
      <div style="font-size: 11px; color: #5A675F">Top: the outlined lockup masters. Bottom: live Literata 600 from Google Fonts at the same tracking — same face, byte-reproducible via brand/design/gen-wordmark.mjs.</div>
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 14px">
    <h2>Color contracts</h2>
    <p style="font-size: 13px; line-height: 1.55; margin: 0; max-width: 66ch; text-wrap: pretty">Every pairing below is computed, not eyeballed — the whole v3 system was derived twice independently from the premise and every value re-verified before shipping. Pine-700 is the interactive and brand-text color on light; gold is graphic-only on light (3.1:1 non-text) and text-capable on the forest dark. Status pass/fail are reserved, always icon + label, and hold ΔE ≥ 15 from brand pine in both themes.</p>
    <table style="border-collapse: collapse; font-size: 12px; max-width: 640px">
      <tr style="text-align: left; color: #5A675F"><th style="padding: 6px 14px 6px 0; font-weight: 600">Pairing</th><th style="padding: 6px 14px; font-weight: 600">Ratio</th><th style="padding: 6px 0; font-weight: 600">Verdict</th></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">#121E17 ink on #F8F7F2 paper</td><td style="padding: 6px 14px; border-top: 1px solid rgba(18,30,23,0.08)">16.0</td><td style="padding: 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">AAA</td></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">#1C533D pine links on paper</td><td style="padding: 6px 14px; border-top: 1px solid rgba(18,30,23,0.08)">8.3</td><td style="padding: 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">AA+ — brand text and links</td></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">#99D3B9 pine links on forest</td><td style="padding: 6px 14px; border-top: 1px solid rgba(18,30,23,0.08)">10.1</td><td style="padding: 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">AA+ — dark-theme links</td></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">#AC8717 gold mark on paper</td><td style="padding: 6px 14px; border-top: 1px solid rgba(18,30,23,0.08)">3.1</td><td style="padding: 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">non-text only on light</td></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">#F2CE59 gold on forest</td><td style="padding: 6px 14px; border-top: 1px solid rgba(18,30,23,0.08)">11.2</td><td style="padding: 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">text-capable — gold leads on dark</td></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">#1F812D / #AC2724 status on paper</td><td style="padding: 6px 14px; border-top: 1px solid rgba(18,30,23,0.08)">4.6 / 6.4</td><td style="padding: 6px 0; border-top: 1px solid rgba(18,30,23,0.08)">AA — pass / fail, icon + label always</td></tr>
    </table>
  </div>
  <div style="display: flex; flex-direction: column; gap: 14px">
    <h2>Derived, not picked</h2>
    <p style="font-size: 13px; line-height: 1.55; margin: 0; max-width: 66ch; text-wrap: pretty">Identity v3 IS the derivation: with the company in preproduction, the greenfield system the skills build from the premise alone was adopted outright (quality over continuity). Two independent premise-only replicates produced near-identical palettes — pine primary, wood-gold accent, forest ink doubling as the dark surface, warm paper stock — and three independent runs chose a warm literary serif for the face. The name becomes the palette: gold is &#8220;Yellow&#8221;, green is &#8220;Pine&#8221;. The v2 system (Cyber Yellow + neutral ink + azure + Rubik) was the skills&#39; answer anchored on the inherited Brandmark mark equity; it remains archived in git history.</p>
  </div>
  <div style="display: flex; flex-direction: column; gap: 14px">
    <h2>Selection history (v2 era)</h2>
    <p style="font-size: 13px; line-height: 1.55; margin: 0; max-width: 66ch; text-wrap: pretty">Seven complete systems competed (validator-gated: WCAG + colorblind separation), judged twice through three lenses — once openly, once <strong>blind</strong> — during the v2 era, when the system was anchored on the inherited Cyber Yellow mark. The incumbent won both anchored rounds; the premise-only derivations later showed what the skills build without the anchor, and with the company in preproduction that greenfield system was adopted as v3. This section is the selection history; the live guardrails are: <strong>gold is graphic-only on light, text-capable on dark</strong>; <strong>pine is the interactive and brand-text hue</strong>; <strong>status pass/fail are reserved</strong> (icon + label, ΔE ≥ 15 from brand pine).</p>
    ${[
      ['A · Cyber (v2 winner)', ['#FFD100', '#202020', '#FCFCFC', '#3C91E6', '#1a75c8'], 'won both anchored rounds; superseded by the premise-only v3 adoption', true],
      ['B · Amber &amp; Forest', ['#ffc336', '#242018', '#fcfaf4', '#2f8856', '#278250'], 'warm and handsome; drifts template-cream, surrenders the ownable yellow'],
      ['C · Evergreen Night', ['#FFD100', '#152c22', '#FCFCFC', '#1b8d5a', '#0a8553'], 'personality winner — but green accent collides with pass/fail semantics in a dev tool'],
      ['D · Honey &amp; Ink', ['#ecbe2a', '#1D1D1F', '#fcfbf8', '#3C91E6', '#1a75c8'], 'premium but dims the one distinctive asset'],
      ['E · Citrus &amp; Slate', ['#f5da3a', '#1e242f', '#fafcfe', '#3e89d7', '#2a76c3'], 'swims into the navy dev-tool sea'],
      ['F · Duotone', ['#FFD100', '#1C1C1C', '#FCFCFC', '#3a3a3a', '#3a3a3a'], 'strongest restraint and CVD margins; starves real UI of an accent'],
      ['G · Golden Hour', ['#ffcb38', '#26201c', '#fdfaf6', '#ce604a', '#bd513b'], 'the flagged cream+terracotta default; coral links read as errors'],
    ].map(([name, chips, note, win]) => `<div style="display: flex; align-items: center; gap: 14px${win ? '; background: #ffffff; border: 1px solid rgba(18,30,23,0.35); border-radius: 10px; padding: 8px 12px' : '; padding: 8px 12px'}">
      <div style="display: flex; gap: 4px">${chips.map((h) => `<div style="width: 26px; height: 26px; border-radius: 6px; background: ${h}; border: 1px solid rgba(18,30,23,0.12)"></div>`).join('')}</div>
      <div style="font-size: 12px; font-weight: 700; white-space: nowrap">${name}</div>
      <div style="font-size: 11.5px; color: #5A675F; text-wrap: pretty">${note}</div>
    </div>`).join('\n    ')}
  </div>
</div>
${FOOT}`);

  // ------------------------------------------------------------ Applications
  board('Applications.dc.html', `${HEAD}
<div style="background: #F8F7F2; padding: 56px; display: flex; flex-direction: column; gap: 32px">
  ${eyebrow('In situ')}
  <div style="display: flex; flex-direction: column; gap: 14px">
    <h2>Org profile</h2>
    <div style="background: #0d1117; border-radius: 14px; padding: 28px; display: flex; align-items: center; gap: 20px">
      ${icon(72)}
      <div style="display: flex; flex-direction: column; gap: 6px">
        <div style="color: #f0f6fc; font-size: 20px; font-weight: 800">Yellow Pine</div>
        <div style="color: #9198a1; font-size: 13px">Thoughtful tools, built with care.</div>
      </div>
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 14px">
    <h2>Browser tabs</h2>
    <div style="background: #202124; border-radius: 14px 14px 0 0; padding: 10px 12px 0; display: flex; gap: 4px">
      ${tab('kishi — show up as the most you', true)}
      ${tab('Latch — grip-test your repo')}
      ${tab('Bly — your career agent')}
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 14px">
    <h2>Terminal</h2>
    <div style="background: #121E17; border-radius: 14px; padding: 24px 26px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.9">
      <div><span style="color: #F2CE59">➜</span> <span style="color: #99D3B9">~/code</span> <span style="color: #F8F7F2">gh repo view yellow-pine/.github</span></div>
      <div style="color: #9a9a98">The Yellow Pine homepage — org profile, public brand library, and org-wide config.</div>
      <div><span style="color: #F2CE59">➜</span> <span style="color: #99D3B9">~/code</span> <span style="color: #F8F7F2">git push</span> <span style="color: #9a9a98"># built with 💛 by a tiny human team and a fleet of agents</span></div>
    </div>
  </div>
</div>
${FOOT}`);

  // ------------------------------------------- Design-system cards (@dsCard)
  card('logo-light.html', dsCard('Brand', 'Logo — light backgrounds', `Master: brand/logo.svg in ${SOT}`, logo(560), '#F8F7F2'));
  card('logo-dark.html', dsCard('Brand', 'Logo — dark backgrounds', `Master: brand/logo-dark.svg in ${SOT}`, logoDark(560), '#121E17'));
  card('mark.html', dsCard('Brand', 'Mark', `Two-tier pine, 4° lean. Master: brand/mark.svg in ${SOT}`, mark(140), '#F8F7F2'));
  card('icon.html', dsCard('Brand', 'App tile — every size', `One mark, 16px to hero. Master: brand/icon.svg in ${SOT}`, icon(160), '#F8F7F2'));
  card('type.html', dsCard('Brand', 'Type — Literata', `Wordmark + display: Literata 600, −0.01em, outlined. Body/UI: Source Sans 3 400/600/700. Code/data/eyebrows: JetBrains Mono. Three families, no more.`,
    `<div style="font-family: Literata, Georgia, serif; font-weight: 600; font-size: 34px; letter-spacing: -0.01em; color: #1C533D">Yellow Pine</div>`, '#F8F7F2'));
  card('colors.html', dsCard('Brand', 'Palette — pine and gold', `Brand: #1C533D Pine (primary, links) + #AC8717 Wood Gold (accent; #F2CE59 leads on dark). Ground: #F8F7F2 Paper + #121E17 Forest Ink (text on light, the dark surface). Status: #1F812D pass / #AC2724 fail, reserved.`,
    `<div style="display: flex; gap: 10px">${['#1C533D', '#AC8717', '#F8F7F2', '#121E17'].map((h) => `<div style="width: 64px; height: 64px; border-radius: 10px; background: ${h}; border: 1px solid rgba(128,128,128,0.35)"></div>`).join('')}</div>`, '#F8F7F2'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  build(process.argv[2] ? process.argv[2] : DESIGN);
  console.log('built canvas/ boards + cards/ from the brand masters');
}
