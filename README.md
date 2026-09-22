# The Reserve Protocol: Clinic App

Companion web app for The Reserve Protocol, a proposed measurement specification for functional reserve (capacity minus demand). It runs the Tier One clinic card, the Tier Two loaded protocol and the Tier Three determinant panel on this device. Not validated. Not a guideline. Preprint: [The Reserve Protocol: A Measurement Specification for Functional Reserve](https://doi.org/10.20944/preprints202609.1685.v1). Framework paper: [The Preservation of Functional Reserve](https://doi.org/10.3390/life16091457) (*Life* 2026;16(9):1457). Code is MIT (LICENSE); text and clinical content are CC BY 4.0 (LICENSE-CONTENT). Code generated with Grok Build (xAI) from the author's specification. The specification and all clinical content are the author's.

Live: [https://protocol.theaskingpress.com](https://protocol.theaskingpress.com)

## Cloudflare Pages

| | |
|---|---|
| **Build command** | `npm run build` |
| **Output folder** | `dist` |

Node 22. The production build is a static site: HTML, CSS, JS and assets. Cloudflare Pages should serve existing files first and fall back to `index.html` (see `public/_redirects`).
