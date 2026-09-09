# .github — the Yellow Pine org profile

Organization-wide GitHub configuration for **Yellow Pine**. The company homepage is
[yellowpine.com](https://yellowpine.com). The org profile rendered from this repository is
what every visitor to [github.com/yellow-pine](https://github.com/yellow-pine) lands on, so
it is held to the same standard — but it is no longer the homepage itself.

## Contents

- [`profile/README.md`](profile/README.md) — the public org profile.
- [`brand/`](brand/) — the canonical public brand library: hand-cleaned SVG masters
  (logo, dark variant, tile icon, bare mark), palette, and usage rules. The full Brandmark
  export archive and raster generators live in the private `yellow-pine/brand-assets` repo.
- [`tests/`](tests/) — profile invariants, run by [CI](.github/workflows/ci.yml) on every
  push and weekly: every referenced asset exists, brand SVGs are real vectors, every
  linked repo is publicly visible **without auth** (nothing private can leak onto the
  profile), and every product link is live.

## The publish rule

A project appears on the profile only if it is a public repo, or a private repo with a
live public website. The tests enforce the mechanical half of this: they fetch every
`github.com/yellow-pine/*` link anonymously and fail on anything not public.

```sh
npm test              # run the invariants locally
SKIP_NETWORK=1 npm test   # offline: skip the link-liveness checks
```
