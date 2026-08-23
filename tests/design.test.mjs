// Invariants for the brand design pipeline (brand/design/) — the wiring between the
// SVG masters (source of truth), the committed Claude Design boards/cards generated
// from them, and the surfaces that consume them:
//
//   brand/*.svg  ──build-boards.mjs──▶  brand/design/canvas/*.dc.html  (Design project boards)
//                                  └──▶  brand/design/cards/*.html      (@dsCard design-system cards)
//
// The core rule: committed outputs must embed the CURRENT masters. Editing a master
// without running `npm run design:build` fails the drift tests below. All tests are
// pure node:fs — no network.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = join(repoRoot, 'brand');
const DESIGN = join(BRAND, 'design');
const CANVAS = join(DESIGN, 'canvas');
const CARDS = join(DESIGN, 'cards');
const read = (p) => readFileSync(p, 'utf8');

const MASTERS = ['logo.svg', 'logo-dark.svg', 'icon.svg', 'mark.svg'];
const BOARDS = ['Cover.dc.html', 'Main.dc.html', 'MarkStory.dc.html', 'Foundations.dc.html', 'Applications.dc.html'];
const CANDIDATES = ['mark-A-grove.svg', 'mark-B-flight.svg', 'mark-C-canopy.svg', 'mark-D-north.svg'];
const PROJECT_ID = 'e1932f3e-7810-4729-a638-09fecad7d7ab';

const pathPayloads = (svg) => [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);

// --- structure ---------------------------------------------------------------------

test('brand/design has the expected layout', () => {
  assert.ok(existsSync(join(DESIGN, 'build-boards.mjs')), 'build-boards.mjs missing');
  assert.ok(existsSync(join(DESIGN, 'README.md')), 'design/README.md missing');
  assert.ok(existsSync(join(CANVAS, 'canvas.json')), 'canvas/canvas.json missing');
  for (const f of BOARDS) assert.ok(existsSync(join(CANVAS, f)), `canvas/${f} missing`);
  for (const f of CANDIDATES) assert.ok(existsSync(join(DESIGN, 'candidates', f)), `candidates/${f} missing`);
  assert.ok(existsSync(CARDS) && readdirSync(CARDS).some((f) => f.endsWith('.html')), 'cards/ empty');
});

test('canvas.json is valid and matches the boards on disk', () => {
  const manifest = JSON.parse(read(join(CANVAS, 'canvas.json')));
  const listed = manifest.artboards.map((a) => a.file).sort();
  const onDisk = readdirSync(CANVAS).filter((f) => f.endsWith('.dc.html')).sort();
  assert.deepEqual(listed, onDisk, 'canvas.json artboards and *.dc.html files diverge');
});

// --- drift (the core): committed outputs embed the CURRENT masters -----------------

test('boards embed the current masters (no drift)', () => {
  const boards = BOARDS.map((f) => read(join(CANVAS, f))).join('\n');
  for (const m of MASTERS) {
    for (const d of pathPayloads(read(join(BRAND, m)))) {
      assert.ok(boards.includes(d), `${m} drifted: a path payload is not embedded in the boards — run npm run design:build`);
    }
  }
});

test('MarkStory embeds the current candidate SVGs', () => {
  const story = read(join(CANVAS, 'MarkStory.dc.html'));
  for (const c of CANDIDATES) {
    if (c === 'mark-B-flight.svg') continue; // B renders via its own file elsewhere in the board set
    for (const d of pathPayloads(read(join(DESIGN, 'candidates', c)))) {
      assert.ok(story.includes(d), `candidate ${c} drifted from MarkStory — run npm run design:build`);
    }
  }
});

test('rebuild is byte-identical to the committed outputs', async () => {
  const { build } = await import(join(DESIGN, 'build-boards.mjs'));
  const tmp = mkdtempSync(join(tmpdir(), 'yp-boards-'));
  try {
    build(tmp);
    for (const f of BOARDS) {
      assert.equal(read(join(tmp, 'canvas', f)), read(join(CANVAS, f)), `${f}: committed board != fresh build — run npm run design:build and commit`);
    }
    for (const f of readdirSync(CARDS)) {
      assert.equal(read(join(tmp, 'cards', f)), read(join(CARDS, f)), `cards/${f}: committed card != fresh build`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// --- design-system cards -----------------------------------------------------------

test('the brand ships ONE mark — no small-size fork', () => {
  assert.ok(!existsSync(join(BRAND, 'favicon.svg')), 'favicon.svg exists — the small cut was consolidated into the single v2.1 mark');
  assert.ok(!existsSync(join(CARDS, 'favicon.html')), 'cards/favicon.html exists — small-cut card was retired');
  const all = [...BOARDS.map((f) => read(join(CANVAS, f))), read(join(BRAND, 'README.md'))].join('\n');
  assert.ok(!/small cut|below 48/i.test(all), 'stale small-cut / below-48px rule survives in boards or README');
});

test('every card opens with a @dsCard marker on line one', () => {
  for (const f of readdirSync(CARDS).filter((f) => f.endsWith('.html'))) {
    const firstLine = read(join(CARDS, f)).split('\n', 1)[0];
    assert.match(firstLine, /^<!-- @dsCard group="[^"]+" -->/, `cards/${f}: missing first-line @dsCard marker`);
  }
});

test('cards use the brand face for their labels', () => {
  for (const f of readdirSync(CARDS).filter((f) => f.endsWith('.html'))) {
    const card = read(join(CARDS, f));
    assert.ok(card.includes('family=Kanit'), `cards/${f}: brand materials label in Kanit`);
  }
});

// --- pointers: every surface names its relations -----------------------------------

test('brand/README names the Design project and the pipeline', () => {
  const readme = read(join(BRAND, 'README.md'));
  assert.ok(readme.includes('claude.ai/design'), 'no claude.ai/design mention');
  assert.ok(readme.includes(PROJECT_ID), 'no Design project id');
  assert.ok(readme.includes('design/'), 'no design/ pipeline reference');
});

test('boards name the source-of-truth repo path', () => {
  for (const f of ['Cover.dc.html', 'Main.dc.html']) {
    const board = read(join(CANVAS, f));
    assert.ok(board.includes('github.com/yellow-pine/.github'), `${f}: no source-of-truth pointer`);
  }
  assert.ok(read(join(CANVAS, 'canvas.json')).includes('github.com/yellow-pine/.github'), 'canvas.json: no repo pointer');
});

test('no surface claims a live Figma mirror', () => {
  const all = [...BOARDS.map((f) => read(join(CANVAS, f))), read(join(CANVAS, 'canvas.json')), read(join(BRAND, 'README.md'))].join('\n');
  assert.ok(!/Figma file are mirrors|working design library/i.test(all), 'stale Figma-mirror claim survives — Figma is deleted');
});

// --- hygiene -----------------------------------------------------------------------

test('builder reads only repo-relative paths', () => {
  const src = read(join(DESIGN, 'build-boards.mjs'));
  assert.ok(!/\/tmp\/|\/home\//.test(src), 'builder references absolute machine paths');
});

test('boards and cards are self-contained (fonts + support.js excepted)', () => {
  const files = [
    ...BOARDS.map((f) => join(CANVAS, f)),
    ...readdirSync(CARDS).map((f) => join(CARDS, f)),
  ];
  for (const p of files) {
    const html = read(p);
    for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const ref = m[1];
      const ok = ref === './support.js' || ref.startsWith('https://fonts.googleapis.com') || ref.startsWith('#');
      assert.ok(ok, `${p}: unexpected external/local reference ${ref}`);
    }
    assert.ok(!/<image[\s>]|data:image\//i.test(html), `${p}: raster embed found — vectors only`);
  }
});

test('Main board palette matches the documented palette', () => {
  const main = read(join(CANVAS, 'Main.dc.html'));
  for (const hex of ['#FFD100', '#202020', '#FCFCFC', '#3C91E6', '#333533', '#1a75c8']) {
    assert.ok(main.includes(hex), `palette hex ${hex} missing from Main board`);
  }
});

test('boards use the identified brand face and the accessible link token', () => {
  for (const f of BOARDS) {
    const board = read(join(CANVAS, f));
    assert.ok(board.includes('family=Kanit'), `${f}: boards should load Kanit — the identified wordmark face`);
    assert.ok(!/a \{ color: #3C91E6/.test(board), `${f}: links on light must use the AA token #1a75c8, not raw #3C91E6`);
  }
});
