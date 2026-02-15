# AGENTS.md — Project Guide for AI Coding Agents

## Project Overview
A **static personal portfolio website** for Shine Yuan (张晰元), hosted on GitHub Pages.
- **URL**: `https://ZHANGXiyuan2004.github.io`
- **Theme**: Minecraft-inspired pixel art + Glassmorphism.
- **Tech**: Vanilla HTML/CSS/JS (Zero external runtime dependencies).

## Project Structure
- `index.html`: Home, education, leadership.
- `publications.html`: Filterable research projects.
- `blog.html`: Blog posts and Bilibili videos.
- `collaborators.html`: Partner profiles with GitHub links.
- `assets/`: 
  - `style.css`: All styling (Minecraft UI system).
  - `script.js`: All logic (Theme, Typewriter, Modals).
  - `board.png`: Guestbook trigger character.
  - `clock_light.png`: Minecraft clock for light mode toggle.
  - `clock_dark.png`: Minecraft clock for dark mode toggle.
  - `fonts/VT323-Regular.ttf`: Local pixel font.

## UI/UX Features (Minecraft Theme)
1. **Theme Toggle**: Light/Dark mode with persistence. Uses Minecraft clock images (`clock_light.png` / `clock_dark.png`) instead of emoji icons. Hover shows golden glow; tooltip shows target mode.
2. **Hotbar Navigation**: Nav links styled as Minecraft inventory slots.
3. **Private Guestbook**: Triggered by clicking the **Board** character. Opens a "Book & Quill" modal that uses `mailto:` for private submissions.
4. **Custom Tooltips**: Pixel-art style tooltips with category-specific colors (Aqua for links, Yellow for Board, etc.). Disabled on mobile.
5. **Advancements**: Minecraft-style toast notifications for achievements (e.g., scroll to bottom).
6. **Animations**: 3D card tilt, scroll-fade (fade-in-up), and typewriter effect.
7. **Splash Text**: Bouncing yellow text ("Herobrine Removed!") next to title on `index.html` only.

## Technical Architecture

### 1. Board Character (Dual-Location)
- **Desktop**: Fixed in bottom-left (`position: fixed`).
- **Mobile (<640px)**: Integrated into the header with CSS `order` for specific sequence: `[Title] ... [Board] [Menu] [Theme]`.
- **Logic**: Managed via media queries in CSS; multiple instances in HTML; JS handles all clicks via `querySelectorAll('.mc-char')`.

### 2. Guestbook Modal
- **Layout**: Two-page book (Left: Info, Right: Input).
- **Theming**: Parchment background (`#fbf0d9`) in light mode; Dark leather background (`#2c1e14`) in dark mode.
- **Submit**: Opens default mail client.

### 3. Theme Toggle (Clock Image)
- **HTML**: `<button id="theme-toggle"><img src="assets/clock_light.png" class="theme-icon"></button>` — must be identical across **all 4 HTML pages** (`index`, `publications`, `blog`, `collaborators`).
- **CSS**: Button has `background: transparent; border: none;` — no box-shadow. Hover uses `filter: drop-shadow()` glow. Active uses `filter: brightness(0.9)` — **not** `box-shadow` (transparent PNG causes square shadow artifacts).
- **JS (`updateThemeIcon`)**: Switches `img.src` between `clock_light.png` / `clock_dark.png`. Sets `title` for tooltip (shows target mode: "Dark Mode" in light, "Light Mode" in dark). **Must also update `data-original-title`** to sync with the Minecraft tooltip cache.

### 4. CSS Specificity
- The stylesheet uses many `!important` flags in final override sections (lines 1400+). Check these first when styles won't update.
- Always place `fade-in-up` on a **parent container**, not on elements with hover effects (avoids transition conflicts).

## Development Guidelines
- **Responsive**: Test breakpoints at 640px and 320px. 
- **Dark Mode**: Always verify parity for every new UI element.
- **Pixel Art**: Use `image-rendering: pixelated` for game assets. Ensure square edges (no `border-radius`).
- **Dependencies**: Do not add external CDNs/libraries without express permission.

### Lessons Learned (Common Pitfalls)
1. **Tooltip Cache (`data-original-title`)**: The Minecraft tooltip system (`initMinecraftTooltips`) caches `title` into `data-original-title` on hover and removes it. If you dynamically update `title` via JS, you **must also update `data-original-title`**, otherwise the tooltip will show stale text until the next page load.
2. **CSS Block Boundaries**: When replacing CSS rules using tools, always verify that the **closing brace `}`** of adjacent blocks is preserved. A common mistake is accidentally merging two rule blocks (e.g., `#menu-toggle` losing its `}` and `image-rendering: pixelated` line, causing `#theme-toggle:hover` to nest inside it). Always check surrounding context after edits.
3. **Transparent PNG + `box-shadow`**: Never use `box-shadow` (including `var(--neu-shadow-pressed)`) on buttons containing transparent PNG images. The shadow renders on the element's box, not the image contour, creating an ugly square outline. Use `filter: drop-shadow()` for glow effects and `filter: brightness()` for press feedback instead.
4. **Multi-Page Consistency**: This project has **4 HTML files** sharing the same header. Any header element change (e.g., swapping `<span class="icon">` to `<img class="theme-icon">`) must be applied to **all pages**, not just `index.html`.

## Maintenance Milestones

### Feb 14, 2026
- Fully implemented Minecraft UI system (Hotbar, Tooltips, Advancements).
- Added Private Guestbook with Book & Quill interface.
- Optimized mobile header to include the Board icon.
- Restored "Herobrine Removed" splash to Home page only.

### Feb 15, 2026
- Replaced theme toggle button with Minecraft clock images (`clock_light.png` / `clock_dark.png`).
- Added dynamic tooltip ("Light Mode" / "Dark Mode") showing the target mode after switch.
- Added golden glow hover effect via `filter: drop-shadow()`.
- Removed `box-shadow` artifacts on transparent image press.
- Cleaned up leftover `font-size` in mobile `#theme-toggle` CSS.
- Updated `AGENTS.md` with architecture docs and lessons learned.
