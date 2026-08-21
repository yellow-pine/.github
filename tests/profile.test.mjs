// Invariants for the Yellow Pine org homepage (profile/README.md) and the brand library.
//
// yellowpine.com redirects to github.com/yellow-pine, so profile/README.md IS the company
// homepage — these tests are the gate that keeps it publishable:
//
//   1. Every relative asset a README references must exist in the repo.
//   2. Every github.com/yellow-pine/* link must be reachable WITHOUT auth — the publish
//      rule expressed without naming any repo: a link to a private repo 404s for the
//      anonymous public and fails here.
//   3. Every external product link must be live (a dead product link on the homepage is
//      worse than no link).
//   4. brand/ must hold real vector SVGs (light + dark logo, icon) — no raster embeds.
//
// Zero dependencies: node:test + global fetch (Node >= 20). Network checks honor
// SKIP_NETWORK=1 for offline runs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(repoRoot, p), 'utf8');

const PROFILE = 'profile/README.md';
const BRAND_DIR = 'brand';
const REQUIRED_BRAND_FILES = ['logo.svg', 'logo-dark.svg', 'icon.svg', 'README.md'];

// --- helpers -----------------------------------------------------------------------

// Pull every referenced path/URL out of a markdown file: markdown links/images plus
// raw HTML src/href/srcset (the profile uses <picture> for dark-mode logos).
function referencesIn(mdPath) {
  const text = read(mdPath);
  const refs = new Set();
  for (const m of text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) refs.add(m[1]);
  for (const m of text.matchAll(/<(https?:\/\/[^>\s]+)>/g)) refs.add(m[1]);
  for (const m of text.matchAll(/(?:src|href)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of text.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(',')) refs.add(part.trim().split(/\s+/)[0]);
  }
  return [...refs].filter((r) => r && !r.startsWith('#') && !r.startsWith('mailto:'));
}

const isExternal = (ref) => /^[a-z][a-z0-9+.-]*:/i.test(ref);

function assertLocalRefsExist(mdPath) {
  const base = dirname(mdPath);
  for (const ref of referencesIn(mdPath)) {
    if (isExternal(ref)) continue;
    const target = join(repoRoot, base, ref.split('#')[0].split('?')[0]);
    assert.ok(existsSync(target), `${mdPath} references missing file: ${ref}`);
  }
}

async function fetchStatus(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    // GET, not HEAD: several hosts (github.com included) mis-handle HEAD.
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'yellow-pine-profile-tests' },
    });
    return res.status;
  } finally {
    clearTimeout(timer);
  }
}

// Every README in this public repo is public-facing — scan them all.
const PUBLIC_MDS = ['README.md', PROFILE, join(BRAND_DIR, 'README.md')];
const externalLinks = () =>
  [...new Set(
    PUBLIC_MDS.filter((md) => existsSync(join(repoRoot, md)))
      .flatMap((md) => referencesIn(md))
      .filter((r) => /^https?:\/\//.test(r)),
  )];
const skipNetwork = process.env.SKIP_NETWORK === '1';

// --- structure ---------------------------------------------------------------------

test('profile/README.md exists and is substantial', () => {
  assert.ok(existsSync(join(repoRoot, PROFILE)), 'profile/README.md missing');
  assert.ok(read(PROFILE).length > 500, 'profile/README.md is too thin to be the homepage');
});

test('every local asset referenced by a README exists', () => {
  for (const md of ['README.md', PROFILE, join(BRAND_DIR, 'README.md')]) {
    if (existsSync(join(repoRoot, md))) assertLocalRefsExist(md);
  }
});

test('profile README supports dark mode via <picture>', () => {
  const text = read(PROFILE);
  assert.match(text, /prefers-color-scheme:\s*dark/, 'no dark-mode logo variant');
});

// --- brand library -----------------------------------------------------------------

test('brand/ holds the required curated files', () => {
  for (const f of REQUIRED_BRAND_FILES) {
    assert.ok(existsSync(join(repoRoot, BRAND_DIR, f)), `brand/${f} missing`);
  }
});

test('brand SVGs are real vectors', () => {
  const svgs = existsSync(join(repoRoot, BRAND_DIR))
    ? readdirSync(join(repoRoot, BRAND_DIR)).filter((f) => f.endsWith('.svg'))
    : [];
  assert.ok(svgs.length >= 3, 'expected at least logo.svg, logo-dark.svg, icon.svg');
  for (const f of svgs) {
    const svg = read(join(BRAND_DIR, f));
    assert.match(svg, /<svg[^>]*viewBox="/, `brand/${f}: missing viewBox`);
    assert.ok(!/<image[\s>]/i.test(svg), `brand/${f}: embeds a raster <image> — not a real vector`);
    assert.ok(!/data:image\//i.test(svg), `brand/${f}: embeds a data-URI raster`);
  }
});

// --- the homepage's links must hold up for the anonymous public --------------------

test('every yellow-pine GitHub link is publicly reachable without auth', { skip: skipNetwork }, async () => {
  const orgLinks = externalLinks().filter((u) => u.startsWith('https://github.com/yellow-pine'));
  assert.ok(orgLinks.length >= 1, 'homepage should link at least one yellow-pine repo');
  for (const url of orgLinks) {
    const status = await fetchStatus(url);
    assert.equal(status, 200, `${url} is not publicly visible without auth (HTTP ${status})`);
  }
});

test('every external product link is live', { skip: skipNetwork }, async () => {
  const others = externalLinks().filter((u) => !u.startsWith('https://github.com/yellow-pine'));
  for (const url of others) {
    const status = await fetchStatus(url);
    assert.ok(status < 400, `${url} looks dead (HTTP ${status})`);
  }
});
