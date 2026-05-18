# AGENTS.md - Guide for the Portfolio Site

## Scope
This file applies to the repository root at:

```text
/Users/zhangxiyuan/VSCode/ZHANGXiyuan2004.github.io
```

The current project is a deployable static portfolio site for Shine Yuan. The live site files now sit directly in the repository root, not under `src/` or `template/`.

The older Minecraft/pixel-art portfolio files may still appear in git history or as deleted paths. Do not treat old `assets/`, `blog.html`, `publications.html`, `collaborators.html`, `CLAUDE.md`, `DEPLOY.md`, or legacy root pages as the current architecture unless the user explicitly asks to restore them.

Do not treat `.DS_Store` or `.local-server-*` files as meaningful site assets.

## Current Site Files
- `index.html`: Portfolio homepage with desk hero, profile/about copy, photography carousels, research cards, product card, blog/video cards, contact section, footer, and floating dock navigation.
- `project_neuroimaging.html`: Project detail page for unified few-shot neuroimaging segmentation.
- `project_emotion.html`: Project detail page for self-powered multimodal emotion recognition.
- `project_rsvg.html`: Project detail page for remote sensing visual grounding.
- `project_superionic.html`: Project detail page for superionic conductor screening.
- `styles.css`: Main styling for the editorial desk scene, global layout, dock, cards, reveal animation, and responsive rules.
- `custom.css`: Additional section styles, image/card overrides, contact photo scene, and small-screen patches.
- `script.js`: All runtime interaction logic. It is dependency-free and organized by guarded init functions.
- `images/`: Local image assets, including pre-rendered desk item PNGs, gallery photos, project images, product/blog thumbnails, avatar, and contact background.
- `open-local.command`: macOS one-click local HTTP preview.
- `open-local.ps1`: Windows PowerShell local HTTP preview server.
- `open-local.bat`: Windows launcher for `open-local.ps1`.

There is currently no deployed `vendor/` directory and no active external runtime dependency.

## Current Site Architecture

### Static Desk Scene
The homepage desk scene uses transparent PNG images and CSS transforms. The live page must not create runtime `<model-viewer>` instances.

| Item | Current implementation |
|------|------------------------|
| Desk mat | CSS background `images/victorian-desk.png` on `.desk-mat` |
| Pencil | `<img class="pencil-model" src="images/desk-pencil.png">` |
| Clock | `<img class="digital-clock-model" src="images/desk-clock.png">` |
| Book | `<img class="book-model" src="images/desk-book.png">` |
| MacBook | `<img class="macbook-model" src="images/desk-macbook.png">` |
| HomePods | Single merged `<img class="homepod-composite" src="images/desk-homepods.png">` |
| Mouse | `<img class="magic-mouse-model" src="images/desk-mouse.png">` |
| Hobbies stack | Emoji tool stack inside `.app-stack` |

Rules:
- Do not re-add `<model-viewer>`, GLB loading, WebGL loops, or external 3D runtimes unless the user explicitly requests interactive 3D.
- Deployed HTML must not reference `vendor/model-viewer.min.js`, `.glb` files, or `vendor/`.
- Desk hover and float animations are applied to parent containers such as `.pencil`, `.digital-clock`, `.notebook`, `.laptop`, `.homepod-set`, and `.mouse`, not directly to inner `<img>` elements.
- The entrance waterfall animation uses the `.desk-scene.animate-in` and `.desk-scene.entrance-complete` states. Preserve the existing stagger timing and visual rhythm.
- `.homepod-set` contains one composite image. Do not split it back into separate HomePod elements unless recapturing assets intentionally.

### Page Sections
The homepage is organized as:
- `#home`: Desk hero, avatar, name, and social links.
- `#about`: Editorial profile copy.
- `#gallery`: Two auto-scrolling photography carousels, one landscape and one portrait.
- `#research`: Research heading.
- `.project-grid`: Four research cards linking to project detail pages.
- `#product`: Ask Why product/open-source card.
- `#blog`: Video/tutorial cards.
- `#contact`: Scroll-linked contact photo scene and contact cards.
- `.dock`: Floating section navigation.

Project detail pages intentionally reuse shared CSS and JS but should remain lightweight:
- No `.desk-scene`, `.dock`, `.carousel-window`, or `.carousel-track`.
- One project hero image per page.
- Keep the back link to `index.html#research`.
- If adding a new project page, copy the same loading attributes and cache-busted CSS/JS links.

## Loading Strategy
The current performance strategy prioritizes scheduling and runtime efficiency without changing image compression or formats.

Homepage first screen:
- `index.html` preloads only `images/victorian-desk.png`.
- `desk-macbook.png` is the only image with `fetchpriority="high"`.
- Desk hero images and avatar include intrinsic `width`/`height` and `decoding="async"`.
- Do not assign `fetchpriority="high"` broadly. Too many high-priority images will compete with the real first-screen resources.

Below-the-fold content:
- Gallery, research card, product, blog, and project detail hero images should use:
  - `loading="lazy"`
  - `decoding="async"`
  - `fetchpriority="low"`
  - real intrinsic `width` and `height`
- Keep CSS sizing and crop behavior unchanged when adding loading attributes.
- Preserve image filename casing exactly. GitHub Pages is case-sensitive.

Cache busting:
- HTML pages currently use `?v=20260518-top-glow-clear` on `styles.css`, `custom.css`, and `script.js`.
- If CSS or JS changes after deployment, update this version string consistently across `index.html` and all `project_*.html` pages.

## Runtime JavaScript
`script.js` is a single dependency-free IIFE organized into guarded modules:
- `initGlobalPointer()`
- `initDeskScene()`
- `initReveal()`
- `initTiltCards()`
- `initFeatureCards()`
- `initToolStack()`
- `initDock()`
- `initInteractiveHover()`
- `initLocationRotation()`
- `initHashScroll()`
- `initCarousel()`

Rules:
- Keep each feature guarded by DOM existence checks. Project detail pages should not initialize desk, dock, carousel, tool stack, or other homepage-only behavior when the required DOM is absent.
- High-frequency pointer effects must use `createRafPointerEffect()` or equivalent `requestAnimationFrame` batching.
- Cache element rects during active pointer interactions where possible; avoid repeated synchronous layout reads inside raw `pointermove`.
- The carousel must remain paused when offscreen or when `document.visibilityState === "hidden"`, and resume when visible.
- The desk entrance should start after DOM ready plus desk image decode readiness, with a short timeout fallback. Do not wait for every page image.
- Keep `prefers-reduced-motion` behavior working: entrance, carousel, smooth scroll, location rotation, and contact animations should stop or degrade cleanly.

## CSS Rules
- Avoid long-lived `will-change` on static elements. Enable it only for entrance, hover, active, or scroll-linked animation states where it helps.
- `.project-visual` hover expansion is transform-based. Do not reintroduce hover transitions on `width`, `height`, `right`, or `bottom` unless a pixel regression confirms the change is safe.
- Do not add `content-visibility: auto` to the contact/view-timeline section. It can interfere with scroll-linked animation triggering.
- Contact photo merge, blur/glass, and drop-shadow visuals are intentional. Reduced-motion may use lighter opacity/transform/static behavior, but normal-motion visual storytelling should remain intact.
- For 320px and other very narrow widths, preserve the compact title and icon-only dock constraints in `custom.css`.
- Keep shared visual behavior in `styles.css` when possible; use `custom.css` for section-specific overrides, image/card adjustments, contact scene styling, and small-screen patches.

## Local Preview
Use HTTP preview instead of opening files directly:

```bash
cd /Users/zhangxiyuan/VSCode/ZHANGXiyuan2004.github.io
python3 -m http.server 8765 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:8765/index.html
```

For a one-click macOS workflow, double-click:

```text
open-local.command
```

This starts a local server from the repository root, opens the correct `http://127.0.0.1:PORT/index.html` URL, and avoids `file://` behavior. On Windows, use `open-local.bat` or run `open-local.ps1`.

## GitHub Pages Deployment
The public site should deploy these root files together in the same relative structure:

```text
index.html
styles.css
custom.css
script.js
project_neuroimaging.html
project_emotion.html
project_rsvg.html
project_superionic.html
images/...
```

The deployed page must be able to fetch:

```text
images/victorian-desk.png
images/desk-macbook.png
```

from the same base URL as `index.html`.

## Verification Checklist
After changing HTML, CSS, JS, image placement, or animation logic:

- Open over local `http://` or deployed `https://`, not `file://`.
- Check DevTools Network for `200` on `images/victorian-desk.png` and `images/desk-macbook.png`.
- Confirm Network does not request `vendor/model-viewer.min.js`, `.glb`, or `vendor/`.
- Confirm only `desk-macbook.png` has `fetchpriority="high"`.
- Confirm below-the-fold images and project detail hero images are lazy/async/low priority with intrinsic dimensions.
- Confirm homepage desk entrance, avatar, title, social links, dock, and waterfall timing still look unchanged.
- Confirm carousel pauses offscreen/background and resumes when visible.
- Confirm project detail pages do not initialize desk/dock/carousel behavior.
- Test desktop, 640px, and 320px widths after changing layout, image scale, title, dock, or contact styles.
- Test `prefers-reduced-motion: reduce`; carousel and scroll/entrance/contact animations should stop or degrade safely.

Useful local checks:

```bash
node --check script.js
rg -n "model-viewer|\\.glb|vendor/model-viewer|vendor/" index.html project_*.html styles.css custom.css script.js
rg -n "fetchpriority=\"high\"" index.html project_*.html
rg -n "\\?v=" index.html project_*.html
```

## File Size Notes
- `images/desk-macbook.png` is about 3.2 MB and is intentionally the only high-priority image.
- `images/victorian-desk.png` is about 476 KB and is preloaded by the homepage.
- `images/` is intentionally asset-heavy. Image compression, new formats, and thumbnail generation are separate tasks and should be coordinated with the user.
- Avoid replacing a working desk PNG with a much larger asset unless there is a clear visual reason and the page is re-tested.
