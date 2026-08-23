// Re-typesets the Yellow Pine lockup masters (../logo.svg, ../logo-dark.svg) from the
// vendored brand face: Rubik 700 (fonts/rubik-700.ttf, OFL — chosen 2026-08 by a
// three-lens panel over fourteen candidate faces plus the incumbent).
//
// Run rarely — only when the face, tracking, or mark changes:
//   npm i --no-save opentype.js && node brand/design/gen-wordmark.mjs
// The mark is read from ../mark.svg (its own source of truth); vertical metrics keep the
// established system: cap 198, baseline 311, mark height 384, box height 400.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const opentype = require('opentype.js');

const DESIGN = dirname(fileURLToPath(import.meta.url));
const BRAND = join(DESIGN, '..');

const CAP = 198, BASELINE = 311, MARK_H = 384, TRACK_EM = 0.02;
const GAP_LEFT = 122, GAP_RIGHT = 146; // word→mark bearings: tighter after Yellow (mark mass leans right)
const MARGIN = 5;

const buf = readFileSync(join(DESIGN, 'fonts', 'rubik-700.ttf'));
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const capH = font.tables.os2 && font.tables.os2.sCapHeight > 0
  ? font.tables.os2.sCapHeight
  : font.charToGlyph('Y').getBoundingBox().y2;
const scale = CAP / capH;
const tracking = TRACK_EM * font.unitsPerEm * scale;

function word(text, xStart) {
  let x = xStart, d = '', prev = null;
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    if (prev) {
      const k = font.getKerningValue(prev, g);
      if (Number.isFinite(k)) x += k * scale; // some fonts (e.g. Fraunces) yield NaN kerns via opentype.js
    }
    d += g.getPath(x, BASELINE, font.unitsPerEm * scale).toPathData(1);
    x += g.advanceWidth * scale + tracking;
    prev = g;
  }
  return { d, end: x - tracking };
}

const markSvg = readFileSync(join(BRAND, 'mark.svg'), 'utf8');
const markVB = /viewBox="([\d.\- ]+)"/.exec(markSvg)[1].split(' ').map(Number);
const markPaths = [...markSvg.matchAll(/<path[^>]+>/g)].map((m) => m[0]).join('');
const markScale = MARK_H / markVB[3];
const markW = markVB[2] * markScale;

const yellow = word('Yellow', MARGIN);
const markX = yellow.end + GAP_LEFT - markVB[0] * markScale;
const markY = 200 - (markVB[1] + markVB[3] / 2) * markScale;
const pine = word('Pine', yellow.end + GAP_LEFT + markW + GAP_RIGHT);
const width = (pine.end + MARGIN).toFixed(1);

const lockup = (fill, file) => writeFileSync(join(BRAND, file),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 400" role="img" aria-label="Yellow Pine">
  <title>Yellow Pine</title>
  <g transform="translate(${markX.toFixed(1)},${markY.toFixed(1)}) scale(${markScale.toFixed(4)})">${markPaths}</g>
  <path fill="${fill}" fill-rule="nonzero" d="${yellow.d}${pine.d}"/>
</svg>
`);
lockup('#202020', 'logo.svg');
lockup('#FCFCFC', 'logo-dark.svg');

// Ink-only master: grayscale print kills the yellow (it grays to ~85% near-white),
// so a one-color lockup must exist — mark and wordmark both in ink.
writeFileSync(join(BRAND, 'logo-mono.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 400" role="img" aria-label="Yellow Pine">
  <title>Yellow Pine</title>
  <g transform="translate(${markX.toFixed(1)},${markY.toFixed(1)}) scale(${markScale.toFixed(4)})">${markPaths.replaceAll('#FFD100', '#202020')}</g>
  <path fill="#202020" fill-rule="nonzero" d="${yellow.d}${pine.d}"/>
</svg>
`);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify({ width: +width, tracking: +tracking.toFixed(1), markX: +markX.toFixed(1) }));
}
