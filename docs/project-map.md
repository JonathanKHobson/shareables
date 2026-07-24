---
project: public-shareables
type: project-map
status: active
---

# Project Map

- `index.html`, `shareables.json`, and `sitemap.xml` provide the public collection index.
- `s/` contains listed public shareables; `u/` contains unlisted public-by-link shareables.
- `assets/` contains companion assets used by published pages.
- `tools/inject-cloudflare-analytics.mjs` adds the privacy-first analytics beacon only to the generated deployment artifact.
- `.github/workflows/pages.yml` builds and deploys GitHub Pages from `main`; it requires the repository variable `CLOUDFLARE_WEB_ANALYTICS_TOKEN`.

The deployment intentionally includes analytics on both `s/` and `u/`. Source HTML remains unchanged, and the workflow must fail when the analytics token is missing or invalid.
