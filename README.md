# .github — the Yellow Pine homepage

Organization-wide GitHub configuration for **Yellow Pine**. Because yellowpine.com
redirects to [github.com/yellow-pine](https://github.com/yellow-pine), the org profile
rendered from this repository **is** the company homepage.

## Contents

- [`profile/README.md`](profile/README.md) — the public org profile / homepage.
- [`brand/`](brand/) — the canonical public brand library: hand-cleaned SVG masters
  (logo, dark variant, tile icon, bare mark), palette, and usage rules. The full Brandmark
  export archive and raster generators live in the private `yellow-pine/brand-assets` repo.
- [`tests/`](tests/) — homepage invariants, run by [CI](.github/workflows/ci.yml) on every
  push and weekly: every referenced asset exists, brand SVGs are real vectors, every
  linked repo is publicly visible **without auth** (nothing private can leak onto the
  homepage), and every product link is live.

## The publish rule

A project appears on the homepage only if it is a public repo, or a private repo with a
live public website. The tests enforce the mechanical half of this: they fetch every
`github.com/yellow-pine/*` link anonymously and fail on anything not public.

```sh
npm test              # run the invariants locally
SKIP_NETWORK=1 npm test   # offline: skip the link-liveness checks
```
