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
  - `fonts/VT323-Regular.ttf`: Local pixel font.

## UI/UX Features (Minecraft Theme)
1. **Theme Toggle**: Light/Dark mode with persistence.
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

### 3. CSS Specificity
- The stylesheet uses many `!important` flags in final override sections (lines 1400+). Check these first when styles won't update.
- Always place `fade-in-up` on a **parent container**, not on elements with hover effects (avoids transition conflicts).

## Development Guidelines
- **Responsive**: Test breakpoints at 640px and 320px. 
- **Dark Mode**: Always verify parity for every new UI element.
- **Pixel Art**: Use `image-rendering: pixelated` for game assets. Ensure square edges (no `border-radius`).
- **Dependencies**: Do not add external CDNs/libraries without express permission.

## Maintenance Milestone (Feb 14, 2026)
- Fully implemented Minecraft UI system (Hotbar, Tooltips, Advancements).
- Added Private Guestbook with Book & Quill interface.
- Optimized mobile header to include the Board icon.
- Restored "Herobrine Removed" splash to Home page only.
