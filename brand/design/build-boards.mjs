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

const HEAD = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700&display=swap">
  <style>
    body { margin: 0; font-family: "Kanit", "Trebuchet MS", system-ui, sans-serif; color: #202020; }
    a { color: #1a75c8; } a:hover { color: #155f9f; }
    h2 { font-size: 15px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; margin: 0; }
    p, li { font-weight: 500; }
  </style>
</helmet>`;
const FOOT = `</x-dc>
</body>
</html>`;

const eyebrow = (t) =>
  `<div style="font-size: 11px; font-weight: 600; letter-spacing: 0.22em; color: #6a6a68; text-transform: uppercase">${t}</div>`;

const swatch = (hex, name, role) =>
  `<div style="display: flex; flex-direction: column; gap: 8px; flex: 1 1 0">
    <div style="background: ${hex}; height: 84px; border-radius: 10px; border: 1px solid rgba(32,32,32,0.08)"></div>
    <div style="font-size: 12px; font-weight: 600">${name}</div>
    <div style="font-size: 11px; color: #6a6a68">${hex} · ${role}</div>
  </div>`;

const candCard = (svgHtml, name, score, verdict, winner) =>
  `<div style="display: flex; flex-direction: column; gap: 12px; background: #ffffff; border: 1px solid rgba(32,32,32,${winner ? '0.35' : '0.08'}); border-radius: 14px; padding: 20px">
    <div style="height: 150px; display: flex; align-items: center; justify-content: center">${svgHtml}</div>
    <div style="display: flex; align-items: baseline; gap: 8px">
      <div style="font-size: 13px; font-weight: 800">${name}</div>
      <div style="font-size: 11px; font-weight: 600; color: ${winner ? '#202020' : '#6a6a68'}; background: ${winner ? '#FFD100' : 'rgba(32,32,32,0.06)'}; border-radius: 99px; padding: 2px 8px">${score}</div>
    </div>
    <p style="font-size: 12px; line-height: 1.55; margin: 0; color: #46464a; text-wrap: pretty">${verdict}</p>
  </div>`;

const tab = (title, active) =>
  `<div style="display: flex; align-items: center; gap: 8px; background: ${active ? '#2d2d30' : 'transparent'}; border-radius: 8px 8px 0 0; padding: 8px 14px; font-size: 11.5px; color: ${active ? '#FCFCFC' : '#9a9a98'}; white-space: nowrap">${icon(16)}<span>${title}</span></div>`;

// Self-contained design-system card: first-line @dsCard marker feeds the Design System
// pane; no external references at all (system fonts only).
const dsCard = (group, title, note, stage, bg) => `<!-- @dsCard group="${group}" -->
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>body { margin: 0; font-family: system-ui, sans-serif; background: ${bg}; color: ${bg === '#202020' ? '#FCFCFC' : '#202020'}; }</style>
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
<div style="background: #FCFCFC; padding: 72px 64px; display: flex; flex-direction: column; gap: 36px; justify-content: center">
  <div style="padding: 4px 0">${logo(700)}</div>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div style="font-size: 19px; font-weight: 600; color: #202020">Thoughtful tools, built with care.</div>
    <div style="font-size: 12px; color: #6a6a68; line-height: 1.6; max-width: 70ch">Identity v2 · August 2026 · Source of truth: <strong>${SOT} → brand/</strong> — this project is the design home; the published SVG masters and these boards' sources (brand/design/) live in the repo.</div>
  </div>
</div>
${FOOT}`);

  // ------------------------------------------------------------ Main sheet
  board('Main.dc.html', `${HEAD}
<div style="background: #FCFCFC; padding: 56px; display: flex; flex-direction: column; gap: 40px">
  ${eyebrow('Yellow Pine · Identity v2 · August 2026')}
  <div style="display: flex; flex-direction: column; gap: 10px">
    <div style="font-size: 34px; font-weight: 800; line-height: 1.1; text-wrap: balance">The plane becomes a pine.</div>
    <p style="font-size: 14px; line-height: 1.55; margin: 0; max-width: 62ch; text-wrap: pretty">A two-tier pine with a 4° lean — keeping the original mark's rounded geometry, Cyber Yellow, and tilt energy, and finally making the name land on sight. Wordmark letterforms unchanged.</p>
  </div>
  <div style="padding: 8px 0">${logo(768)}</div>
  <div style="background: #202020; border-radius: 16px; padding: 40px 32px">${logoDark(704)}</div>
  <div style="display: flex; flex-direction: column; gap: 18px">
    <h2>The mark</h2>
    <div style="display: flex; gap: 28px; align-items: flex-end">
      <div style="display: flex; flex-direction: column; gap: 10px; align-items: center">${mark(120)}<div style="font-size: 11px; color: #6a6a68">mark.svg</div></div>
      <div style="display: flex; flex-direction: column; gap: 10px; align-items: center">${icon(150)}<div style="font-size: 11px; color: #6a6a68">icon.svg · the tile</div></div>
      <div style="display: flex; flex-direction: column; gap: 10px; align-items: center">
        <div style="display: flex; gap: 12px; align-items: flex-end">${icon(48)}${icon(32)}${icon(16)}</div>
        <div style="font-size: 11px; color: #6a6a68">one mark at every size · 48 / 32 / 16 true-size</div>
      </div>
    </div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 18px">
    <h2>Color</h2>
    <div style="display: flex; gap: 16px">
      ${swatch('#FFD100', 'Cyber Yellow', 'the mark')}
      ${swatch('#202020', 'Eerie Black', 'foreground')}
      ${swatch('#FCFCFC', 'Baby Powder', 'background')}
      ${swatch('#3C91E6', 'Bleu De France', 'links on dark · accents')}
      ${swatch('#1a75c8', 'Link on Light', 'link text on light · AA')}
      ${swatch('#333533', 'Jet', 'elevated dark surface')}
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
  <div style="border-top: 1px solid rgba(32,32,32,0.1); padding-top: 18px; font-size: 12px; color: #6a6a68">
    Source of truth: <strong>${SOT} → brand/</strong> · editable here in the Yellow Pine Brand project · board sources: brand/design/ in the repo.
  </div>
</div>
${FOOT}`);

  // ------------------------------------------------------------- Mark story
  board('MarkStory.dc.html', `${HEAD}
<div style="background: #FCFCFC; padding: 56px; display: flex; flex-direction: column; gap: 36px">
  ${eyebrow('Why it changed')}
  <div style="display: flex; gap: 28px; align-items: center">
    <div style="display: flex; flex-direction: column; gap: 8px; align-items: center">${oldMark(96)}<div style="font-size: 11px; color: #6a6a68">v1 — read as a play button / paper plane</div></div>
    <div style="font-size: 26px; color: #6a6a68">→</div>
    <div style="display: flex; flex-direction: column; gap: 8px; align-items: center">${mark(96)}<div style="font-size: 11px; color: #6a6a68">v2 — a pine, still on its way somewhere</div></div>
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
  <div style="background: #202020; color: #FCFCFC; border-radius: 14px; padding: 22px 26px; font-size: 13px; line-height: 1.6">
    <strong style="color: #FFD100">Synthesis.</strong> C's silhouette + B's 4° lean, retuned in v2.1 (deeper tier step, sturdier trunk from A) so one mark serves every size. Tile gestalt (rounded square, yellow on Eerie Black) unchanged for recognition continuity.
  </div>
</div>
${FOOT}`);

  // ------------------------------------------------------------ Foundations
  board('Foundations.dc.html', `${HEAD}
<div style="background: #FCFCFC; padding: 56px; display: flex; flex-direction: column; gap: 36px">
  ${eyebrow('Foundations · type & color pass · August 2026')}
  <div style="display: flex; flex-direction: column; gap: 14px">
    <h2>The face</h2>
    <p style="font-size: 13px; line-height: 1.55; margin: 0; max-width: 66ch; text-wrap: pretty">The wordmark is set in <strong>Kanit SemiBold</strong> (outlined — no font dependency), identified by metric forensics against twenty candidates: every letter gap fits Kanit&#39;s native kerning plus one constant +0.135em of tracking. Two deliberate customizations: a 22% wider, flat-apex <strong>w</strong> and a rounder i-dot. The tight &#39;Ye&#39; pair is the face&#39;s own kern — kept as a signature. Use Kanit for headings in brand materials; body copy stays system.</p>
    <div style="font-family: Kanit, sans-serif; font-weight: 600; font-size: 30px; letter-spacing: 0.135em">AaBbCcDdEe 0123456789</div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 14px">
    <h2>Color contracts</h2>
    <p style="font-size: 13px; line-height: 1.55; margin: 0; max-width: 66ch; text-wrap: pretty">Every pairing below is computed, not eyeballed. One correction shipped from the audit: link text on light uses the derived token <strong>#1a75c8</strong> (same oklch hue and chroma as Bleu De France, darkened to pass AA); #3C91E6 remains correct on dark backgrounds, for large text, and for non-text accents. Jet is an elevated dark surface, not an accent. Cyber Yellow on light is the logo only — never functional UI.</p>
    <table style="border-collapse: collapse; font-size: 12px; max-width: 640px">
      <tr style="text-align: left; color: #6a6a68"><th style="padding: 6px 14px 6px 0; font-weight: 600">Pairing</th><th style="padding: 6px 14px; font-weight: 600">Ratio</th><th style="padding: 6px 0; font-weight: 600">Verdict</th></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">#202020 text on #FCFCFC</td><td style="padding: 6px 14px; border-top: 1px solid rgba(32,32,32,0.08)">15.9</td><td style="padding: 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">AAA</td></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">#FFD100 mark on #202020 tile</td><td style="padding: 6px 14px; border-top: 1px solid rgba(32,32,32,0.08)">11.2</td><td style="padding: 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">non-text, wide margin</td></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">#1a75c8 links on #FCFCFC</td><td style="padding: 6px 14px; border-top: 1px solid rgba(32,32,32,0.08)">4.6</td><td style="padding: 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">AA — the light-background link</td></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">#3C91E6 links on #202020</td><td style="padding: 6px 14px; border-top: 1px solid rgba(32,32,32,0.08)">5.0</td><td style="padding: 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">AA — the dark-background link</td></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">#3C91E6 on light</td><td style="padding: 6px 14px; border-top: 1px solid rgba(32,32,32,0.08)">3.2</td><td style="padding: 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">large text and accents only</td></tr>
      <tr><td style="padding: 6px 14px 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">#FFD100 on light</td><td style="padding: 6px 14px; border-top: 1px solid rgba(32,32,32,0.08)">1.4</td><td style="padding: 6px 0; border-top: 1px solid rgba(32,32,32,0.08)">logo exemption only</td></tr>
    </table>
  </div>
</div>
${FOOT}`);

  // ------------------------------------------------------------ Applications
  board('Applications.dc.html', `${HEAD}
<div style="background: #FCFCFC; padding: 56px; display: flex; flex-direction: column; gap: 32px">
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
    <div style="background: #202020; border-radius: 14px; padding: 24px 26px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.9">
      <div><span style="color: #FFD100">➜</span> <span style="color: #3C91E6">~/code</span> <span style="color: #FCFCFC">gh repo view yellow-pine/.github</span></div>
      <div style="color: #9a9a98">The Yellow Pine homepage — org profile, public brand library, and org-wide config.</div>
      <div><span style="color: #FFD100">➜</span> <span style="color: #3C91E6">~/code</span> <span style="color: #FCFCFC">git push</span> <span style="color: #9a9a98"># built with 💛 by a tiny human team and a fleet of agents</span></div>
    </div>
  </div>
</div>
${FOOT}`);

  // ------------------------------------------- Design-system cards (@dsCard)
  card('logo-light.html', dsCard('Brand', 'Logo — light backgrounds', `Master: brand/logo.svg in ${SOT}`, logo(560), '#FCFCFC'));
  card('logo-dark.html', dsCard('Brand', 'Logo — dark backgrounds', `Master: brand/logo-dark.svg in ${SOT}`, logoDark(560), '#202020'));
  card('mark.html', dsCard('Brand', 'Mark', `Two-tier pine, 4° lean. Master: brand/mark.svg in ${SOT}`, mark(140), '#FCFCFC'));
  card('icon.html', dsCard('Brand', 'App tile — every size', `One mark, 16px to hero. Master: brand/icon.svg in ${SOT}`, icon(160), '#FCFCFC'));
  card('type.html', dsCard('Brand', 'Type — Kanit', `Wordmark: Kanit SemiBold, outlined, custom w + i-dot. Headings: Kanit. Body: system.`,
    `<div style="font-family: Kanit, system-ui, sans-serif; font-weight: 600; font-size: 34px; letter-spacing: 0.1em">Yellow Pine</div><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit:wght@600&display=swap">`, '#FCFCFC'));
  card('colors.html', dsCard('Brand', 'Palette', `#FFD100 Cyber Yellow · #202020 Eerie Black · #FCFCFC Baby Powder · #3C91E6 Bleu De France (dark bg / accents) · #1a75c8 Link on Light · #333533 Jet (elevated dark surface)`,
    `<div style="display: flex; gap: 10px">${['#FFD100', '#202020', '#FCFCFC', '#3C91E6', '#1a75c8', '#333533'].map((h) => `<div style="width: 64px; height: 64px; border-radius: 10px; background: ${h}; border: 1px solid rgba(128,128,128,0.35)"></div>`).join('')}</div>`, '#FCFCFC'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  build(process.argv[2] ? process.argv[2] : DESIGN);
  console.log('built canvas/ boards + cards/ from the brand masters');
}
