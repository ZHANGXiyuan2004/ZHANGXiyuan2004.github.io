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
- `index.html`: Portfolio homepage with desk hero, profile/about copy, photography carousels, research cards, product card, GSAP-enhanced blog/video slideshow with static fallback cards, pinned WebGL contact ring section with borderless contact signals, footer, and floating dock navigation.
- `project_neuroimaging.html`: Project detail page for unified few-shot neuroimaging segmentation.
- `project_emotion.html`: Project detail page for self-powered multimodal emotion recognition.
- `project_rsvg.html`: Project detail page for remote sensing visual grounding.
- `project_superionic.html`: Project detail page for superionic conductor screening.
- `styles.css`: Main styling for the editorial desk scene, global layout, dock, cards, reveal animation, and responsive rules.
- `custom.css`: Additional section styles, image/card overrides, blog sequence styles, contact WebGL ring styles, and small-screen patches.
- `script.js`: Runtime interaction logic organized by guarded init functions. Most features are dependency-free; the homepage blog sequence and contact ring progressively enhance with local GSAP/ScrollTrigger when available.
- `images/`: Local image assets, including pre-rendered desk item PNGs, original gallery photos, original project images, product/blog thumbnails, avatar source images, and photography textures.
- `images/optimized/`: Generated derivative assets used by the live pages. Contains responsive avatar JPG/WebP variants, Blog WebP thumbnails, gallery WebP display assets, and project card/hero WebP assets. Do not overwrite originals when adding derivatives.
- `images/contact-ring/`: Compressed local photography copies used only by the homepage WebGL contact ring.
- `libs/gsap/`: Local GSAP 3.13.0 runtime files used only by the homepage blog scroll sequence and contact ring:
  - `gsap.min.js`
  - `ScrollTrigger.min.js`
- `libs/three/`: Local Three.js runtime used only by the homepage contact WebGL ring:
  - `three.min.js`
  - `LICENSE.txt`
- `open-local.command`: macOS one-click local HTTP preview.
- `open-local.ps1`: Windows PowerShell local HTTP preview server.
- `open-local.bat`: Windows launcher for `open-local.ps1`.

There is currently no deployed `vendor/` directory. Do not add `vendor/`, CodePen helper scripts, CDN GSAP/Three links, `esm.sh`, `picsum.photos`, `ScrollSmoother`, or other external runtimes unless the user explicitly asks for them. The active homepage runtime dependencies are local GSAP/ScrollTrigger under `libs/gsap/` and local Three.js under `libs/three/`, loaded only by `index.html`.

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
- Do not re-add `<model-viewer>`, GLB loading, WebGL loops, or external 3D runtimes to the desk scene unless the user explicitly requests interactive 3D.
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
- `#blog`: Desktop/tablet scroll-synced video/tutorial slideshow with keyhole reveal, cue text, progress markers, and static fallback cards for mobile, reduced motion, no-JS, or GSAP failure.
- `#contact`: Pinned WebGL square-photo ring using local photography textures, a landing-eased entrance, and six sequential borderless contact signals.
- `.dock`: Floating section navigation.

Project detail pages intentionally reuse shared CSS and JS but should remain lightweight:
- No `.desk-scene`, `.dock`, `.carousel-window`, `.carousel-track`, or `.blog-sequence`.
- Do not load `libs/gsap/gsap.min.js`, `libs/gsap/ScrollTrigger.min.js`, or `libs/three/three.min.js` on project detail pages.
- One project hero image per page.
- Keep the back link to `index.html#research`.
- If adding a new project page, copy the same loading attributes and cache-busted CSS/JS links.

## Loading Strategy
The current performance strategy prioritizes scheduling, responsive derivative assets, and runtime efficiency without changing the desk animation, Blog ScrollTrigger contract, or Contact ring animation.

Homepage first screen:
- `index.html` preloads only `images/victorian-desk.png`.
- `desk-macbook.png` is the only image with `fetchpriority="high"`.
- Desk hero images and avatar include intrinsic `width`/`height` and `decoding="async"`.
- The avatar uses a `<picture>` with responsive local derivatives from `images/optimized/avatar/`; keep the existing avatar crop and CSS behavior.
- Do not assign `fetchpriority="high"` broadly. Too many high-priority images will compete with the real first-screen resources.

Below-the-fold content:
- Gallery, research card, product, blog, and project detail hero images should use:
  - `loading="lazy"`
  - `decoding="async"`
  - `fetchpriority="low"`
  - real intrinsic `width` and `height`
- Keep CSS sizing and crop behavior unchanged when adding loading attributes.
- Preserve image filename casing exactly. GitHub Pages is case-sensitive.
- Gallery images use `images/optimized/gallery/*` WebP derivatives with `srcset/sizes`; the original root JPG files remain available but should not be used directly by live gallery markup.
- Research card images and project detail hero images use `images/optimized/projects/*` WebP derivatives with `srcset/sizes`; the original root project PNG files are retained.
- Blog sequence images use lightweight placeholder `src` values plus `data-src` for the optimized `images/optimized/blog/blogpost*-1200.webp` files. `initBlogSequence()` swaps in `data-src` only for the desktop/no-reduced-motion enhanced sequence; the fallback cards use the same optimized Blog images with normal lazy image loading.
- Contact ring textures are declared on `#contact [data-contact-ring][data-images]` and loaded lazily by `initContactRing()`. Use compressed local files under `images/contact-ring/`, excluding project images, desk assets, blog thumbnails, logo, avatar, `me.jpeg`, and root original photo files.
- Contact ring photos are center-cover cropped as square textures in WebGL. Do not generate separate square image files unless the user explicitly asks for asset processing.
- Keep the current Blog and Contact image compression chain: do not revert Blog to root PNG thumbnails and do not revert Contact ring to root original photos.

Cache busting:
- HTML pages currently use `?v=20260520-load-cleanup` on `styles.css`, `custom.css`, and `script.js`.
- `index.html` also uses the same cache token on `libs/gsap/gsap.min.js`, `libs/gsap/ScrollTrigger.min.js`, and `libs/three/three.min.js`.
- If CSS, JS, or local runtime loading paths change after deployment, update this version string consistently across `index.html` and all `project_*.html` pages. Project detail pages should still only reference shared CSS and `script.js`, not GSAP or Three.js.

## Runtime JavaScript
`script.js` is a single IIFE organized into guarded modules:
- `initGlobalPointer()`
- `initDeskScene()`
- `initReveal()`
- `initTiltCards()`
- `initFeatureCards()`
- `initToolStack()`
- `initDock()`
- `initInteractiveHover()`
- `initLocationRotation()`
- `initBlogSequence()`
- `initContactRing()`
- `initHashScroll()`
- `initCarousel()`

Rules:
- Keep each feature guarded by DOM existence checks. Project detail pages should not initialize desk, dock, carousel, tool stack, or other homepage-only behavior when the required DOM is absent.
- `initBlogSequence()` must remain guarded by `#blog [data-blog-sequence]`, `window.gsap`, `window.ScrollTrigger`, and `gsap.matchMedia`.
- Blog sequence enhancement is desktop/tablet only: `(min-width: 721px) and (prefers-reduced-motion: no-preference)`. At `max-width: 720px`, reduced motion, no JS, or GSAP-load failure, `.blog-fallback-grid` must remain the visible experience.
- The blog sequence uses local GSAP core plus `ScrollTrigger` only. Do not add `ScrollSmoother`, CodePen `utils-v3`, `normalizeScroll`, or global smooth-scroll wrappers; those can conflict with the current hash scrolling, dock, and page layout.
- The sequence cue contract is data-attribute based:
  - `.blog-sequence[data-duration]`
  - `.blog-sequence-slide[data-start][data-end][data-src]`
  - `.blog-sequence-cue[data-start][data-end]`
- `initContactRing()` must remain guarded by `#contact [data-contact-ring]`, `window.gsap`, `window.ScrollTrigger`, `window.THREE`, and `gsap.matchMedia`.
- The contact ring uses local Three.js from `libs/three/three.min.js`. Do not import from a CDN, `esm.sh`, CodePen, `picsum.photos`, or remote image sources.
- The contact ring has two coordinated ScrollTriggers: one continuous ring-progress trigger that starts before pinning, and one pinned contact-card timeline. Keep ring rotation continuous across the pre-pin and pinned phases to avoid a visible pause.
- The contact entrance landing feel is controlled with `--contact-landing-y` on `#contact`. It should ease to `0px` by the time the pin starts, and reduced-motion/static states must reset it to `0px`.
- Contact card sequencing is data-attribute based via `[data-contact-step]`. Keep the six cards in order: Email, GitHub, Bilibili, Xiaohongshu, Douyin, QQ.
- `initInteractiveHover()` is intentionally scoped to `.product-btn`. Homepage contact entries must not receive magnetic hover transforms, ripple/press effects, hover shadows, hover filters, hover background fills, or `.is-hovered` behavior from the global hover helper.
- Blog image prewarming should stay intersection-based with an `onEnter` fallback. Do not reintroduce early page-load timers or immediate idle prewarming that fetches Blog images right after the first screen loads.
- High-frequency pointer effects must use `createRafPointerEffect()` or equivalent `requestAnimationFrame` batching.
- Cache element rects during active pointer interactions where possible; avoid repeated synchronous layout reads inside raw `pointermove`.
- The carousel must remain paused when offscreen or when `document.visibilityState === "hidden"`, and resume when visible.
- The desk entrance should start after DOM ready plus desk image decode readiness, with a short timeout fallback. Do not wait for every page image.
- Keep `prefers-reduced-motion` behavior working: entrance, carousel, smooth scroll, location rotation, contact animations, and blog sequence should stop or degrade cleanly.

## CSS Rules
- Avoid long-lived `will-change` on static elements. Enable it only for entrance, hover, active, or scroll-linked animation states where it helps.
- `.project-visual` hover expansion is transform-based. Do not reintroduce hover transitions on `width`, `height`, `right`, or `bottom` unless a pixel regression confirms the change is safe.
- Do not add `content-visibility: auto` to the contact section. It can interfere with ScrollTrigger pinning and the WebGL ring trigger.
- The contact section is now a pinned WebGL image ring. Do not re-enable the old contact photo-slice/view-timeline animation in the same section.
- Keep `--contact-landing-y` applied to `.contact-ring-stage`, `.contact-ring-vignette`, and `.contact-ring-content` so the pre-pin landing curve moves the whole scene together. Reduced motion must force it back to `0px`/no transform.
- Contact entries should stay readable over the ring as centered, borderless signal-line typography. The active entry uses platform accent color for the label, and pointer hover/focus may change the label/value text color only; do not add hover movement, glow, glass cards, background fills, filters, shadows, or ripple effects to these entries. Reduced-motion may use a static ring/background and all contacts visible, but normal-motion visual storytelling should remain intact.
- Contact entry text is intentionally larger in the pinned ring state and uses a compact centered `fit-content` layout so platform labels and handles stay close without being cramped. Preserve link hrefs and keyboard focusability.
- For 320px and other very narrow widths, preserve the compact title and icon-only dock constraints in `custom.css`.
- Keep shared visual behavior in `styles.css` when possible; use `custom.css` for section-specific overrides, image/card adjustments, contact scene styling, and small-screen patches.
- Blog slideshow card width should align with the current `.section-panel` content width and the `#product .product-card` visual width.
- Blog slideshow images should use `object-fit: contain` and avoid cropping important image content. Accept dark letterboxing rather than cutting off the top-left of thumbnails.
- Blog slideshow title lines intentionally break after the em dash (`—<br />`) for all four videos. Keep the desktop slideshow titles and static fallback card titles in sync.
- The blog section heading reuses `.about-stat-number` for `1.12M+` and `4K+` so its stat emphasis matches the About section.

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
libs/gsap/gsap.min.js
libs/gsap/ScrollTrigger.min.js
libs/three/three.min.js
libs/three/LICENSE.txt
project_neuroimaging.html
project_emotion.html
project_rsvg.html
project_superionic.html
images/...
images/contact-ring/...
images/optimized/...
```

The deployed page must be able to fetch:

```text
images/victorian-desk.png
images/desk-macbook.png
libs/gsap/gsap.min.js
libs/gsap/ScrollTrigger.min.js
libs/three/three.min.js
images/optimized/blog/blogpost1-1200.webp
images/contact-ring/DSC_2365.jpg
```

from the same base URL as `index.html`.

## Verification Checklist
After changing HTML, CSS, JS, image placement, or animation logic:

- Open over local `http://` or deployed `https://`, not `file://`.
- Check DevTools Network for `200` on `images/victorian-desk.png` and `images/desk-macbook.png`.
- Check DevTools Network for `200` on `libs/gsap/gsap.min.js`, `libs/gsap/ScrollTrigger.min.js`, and `libs/three/three.min.js` on the homepage only.
- Check DevTools Network for `200` on optimized Blog/gallery/project assets under `images/optimized/`.
- Check DevTools Network for `200` on local contact ring texture requests under `images/contact-ring/` and confirm no remote image URLs are requested.
- Confirm first-screen load does not request `images/optimized/blog/*` or `images/contact-ring/*`; those should load only when approaching Blog/Contact.
- Confirm Network does not request `vendor/model-viewer.min.js`, `.glb`, or `vendor/`.
- Confirm Network does not request CodePen helpers, CDN GSAP/Three URLs, `esm.sh`, `picsum.photos`, `utils-v3`, or `ScrollSmoother`.
- Confirm only `desk-macbook.png` has `fetchpriority="high"`.
- Confirm below-the-fold images and project detail hero images are lazy/async/low priority with intrinsic dimensions and use optimized derivatives where applicable.
- Confirm homepage desk entrance, avatar, title, social links, dock, and waterfall timing still look unchanged.
- Confirm carousel pauses offscreen/background and resumes when visible.
- Confirm desktop blog sequence pins, opens the keyhole, advances all four cues, uses full-width product-card alignment, does not crop images, fades in/out, and exits cleanly into contact.
- Confirm blog fallback cards remain visible at 640px, 320px, reduced motion, no-JS, or GSAP failure.
- Confirm desktop/tablet contact ring fades in, expands from a smaller ring to the full ring, keeps rotating continuously through the pre-pin and pinned phases, and lands smoothly before pinning.
- Confirm the six contact entries appear one by one, stay centered, borderless, clickable, and keyboard-focusable when active, and keep the existing labels/hrefs.
- Confirm contact hover/focus only changes text color to the platform accent and does not add transform, filter, box-shadow, background fill, ripple, or `.is-hovered` behavior.
- Confirm project detail pages do not load GSAP/Three or initialize desk/dock/carousel/blog-sequence/contact-ring behavior.
- Test desktop, 640px, and 320px widths after changing layout, image scale, title, dock, or contact styles.
- Test `prefers-reduced-motion: reduce`; carousel and scroll/entrance/contact/blog animations should stop or degrade safely.

Useful local checks:

```bash
node --check script.js
rg -n "esm.sh|picsum|model-viewer|\\.glb|vendor/model-viewer|vendor/" index.html project_*.html styles.css custom.css script.js
rg -n "ScrollSmoother|utils-v3|cdn.jsdelivr|codepen" index.html project_*.html styles.css custom.css script.js
rg -n "fetchpriority=\"high\"" index.html project_*.html
rg -n "libs/gsap|libs/three" project_*.html
rg -n "images/(me\\.jpeg|blogpost[1-4]\\.png|DSC_2365\\.jpg|DSC_2671\\.jpg|DSC_2683\\.jpg|DSC_2788\\.jpg|DSC_2470\\.jpg|photo2\\.jpg|photo3\\.jpg|photo5\\.jpg|DSC_2695\\.jpg|IMG_4453\\.jpg|DSC_2187\\.jpg|neuroimaging\\.png|emotion\\.png|rsvg\\.png|superionic\\.png)" index.html project_*.html
rg -n "\\?v=" index.html project_*.html
```

## File Size Notes
- `images/desk-macbook.png` is about 3.2 MB and is intentionally the only high-priority image.
- `images/victorian-desk.png` is about 476 KB and is preloaded by the homepage.
- `libs/gsap/gsap.min.js` is about 71 KB and `libs/gsap/ScrollTrigger.min.js` is about 43 KB. Keep them local and homepage-only unless the site architecture changes.
- `libs/three/three.min.js` is about 594 KB. Keep it local and homepage-only for the contact ring unless the site architecture changes.
- `images/` is intentionally asset-heavy. Image compression, new formats, and thumbnail generation are separate tasks and should be coordinated with the user.
- `images/optimized/` contains generated derivatives for live responsive loading. Regenerate these assets instead of hand-editing them, and keep original source images in place.
- `images/contact-ring/` contains compressed contact ring texture copies. Keep this directory local and deployed; do not point the ring back at root original photo assets.
- Avoid replacing a working desk PNG with a much larger asset unless there is a clear visual reason and the page is re-tested.
