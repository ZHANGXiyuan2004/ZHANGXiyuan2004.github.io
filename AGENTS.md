# Portfolio development guide

## Active site (2026-10 redesign)

User explicitly requested a new Animate UI / React stack. The old static-desk architecture has been replaced for the active homepage. Legacy pages and runtimes have been removed; Git history retains them.

- Next.js 16 App Router, static export (`out/`), React 19, TypeScript, Tailwind CSS 4, Motion.
- `app/page.tsx` → `components/portfolio.tsx` is the active homepage.
- Actual Animate UI source lives in `components/animate-ui/`. Keep attribution/license and use these components for animation instead of recreating them.
- Page content: `lib/content.ts`. Do not restore the removed partner list or count. Community has only homepage/join links.
- Layout/theme: `app/globals.css`.
- Chinese default plus English toggle; translate UI and descriptive content while preserving names, paper titles and links. Remember language choice without server dependencies.
- Section order: about, research, community, making, beyond, contact.
- User preferences: factual copy only, no slogans or visible provenance/metric disclaimers; black/white UI with COLOR photographs.
- MICCAI 2026 is published (user confirmed); other new papers are under submission. PDF named TOIS actually says IEEE TKDE. See `docs/CONTENT_SOURCES.md`.
- Do not publish local PDF manuscripts or private submission identifiers.

## Assets and compatibility

Current photo originals stay in `images/`. `scripts/prepare-assets.mjs` recreates ignored `public/` with only the current logo and responsive avatar/gallery assets. Legacy HTML/CSS/JS, GSAP/Three.js and unused imagery have been removed. Do not restore them or add research figures/product posters.

## Build and verification

- `npm ci`, `npm run dev` (localhost:3000).
- `npm run typecheck`, `npm run build`, `npm run preview` (localhost:8765, serves out/).
- Never preview the new site by serving the repository root.
- Check Chinese/English at desktop, 640px and 320px, navigation, tabs (pointer + keyboard), copy feedback, color photos, reduced motion, no-JS fallback, console/network errors.
- Deploy `out/` with the provided GitHub Pages Actions workflow, not the legacy root HTML.
- Keep `HOMEPAGE_EDIT.md` aligned with major content changes. It is a human-editable brief, not a parser-driven runtime file.
