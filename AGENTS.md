# AGENTS.md — Project Guide for AI Coding Agents

## Project Overview

This is a **static personal portfolio website** for Shine Yuan (Xiyuan Zhang, 张晰元), hosted on **GitHub Pages** at `https://ZHANGXiyuan2004.github.io`. The website showcases the owner's academic background, research projects, publications, blog posts, and collaborators.

### Technology Stack

- **Type**: Static HTML/CSS/JavaScript website (no build process required)
- **Hosting**: GitHub Pages (automatic deployment from `main` branch)
- **Language**: English (with some Chinese content in blog/collaborators sections)
- **Theme**: Minecraft-inspired pixel art design with glassmorphism effects

## Project Structure

```
ZHANGXiyuan2004.github.io/
├── index.html              # Home page - About me, education, leadership, hobbies
├── publications.html       # Research projects and publications
├── blog.html              # Blog posts and content creation
├── collaborators.html     # Collaborator profiles with GitHub links
├── README.md              # Human-readable project description
├── DEPLOY.md              # Deployment instructions (in Chinese)
├── AGENTS.md              # This file
├── status.txt             # Simple status file (content: "Hello")
├── assets/
│   ├── style.css          # Main stylesheet (~1570 lines)
│   ├── script.js          # Main JavaScript (~236 lines)
│   ├── background.png     # Minecraft-style background image
│   ├── me.jpg             # Profile photo
│   ├── xuzhang.jpg        # Collaborator photo (local)
│   ├── bp1.png            # Blog/podcast preview image
│   ├── ls1.jpg ~ ls4.jpg  # Leadership section images
│   └── fonts/
│       └── VT323-Regular.ttf  # Pixel font (local, no Google Fonts dependency)
└── .git/                  # Git repository
```

## Page Structure

### 1. index.html (Home)
- Hero section with profile photo and typewriter effect
- About Me section (education, GPA, current position, honors)
- Research Interests
- Leadership & Service (4 cards with images)
- Interests & Hobbies

### 2. publications.html
- Research interests overview
- Filterable research projects (All/Research/Project filters)
- Three main projects:
  - Mini-Onevision: Lightweight Multimodal Agent Framework
  - Self-Powered Multimodal Emotion Recognition System
  - Superionic Conductor Materials Screening

### 3. blog.html
- Blog grid with podcast card
- Bilibili video embed links
- Podcast metadata display

### 4. collaborators.html
- Grid of collaborator cards
- Each card: avatar, name (Chinese name in parentheses), research area, GitHub link (if available)

## Key Features

### UI/UX Features
1. **Theme Toggle**: Light/Dark mode with persistent preference (stored in `localStorage`)
2. **Mobile Menu**: Hamburger menu for responsive navigation
3. **Typewriter Effect**: Animated text cycling through roles ("AI Researcher", "Game Streamer", etc.)
4. **Parallax Scrolling**: Hero elements move at different speeds on scroll
5. **3D Tilt Effect**: Cards tilt on mouse hover
6. **Scroll Animations**: Fade-in-up animations for content sections
7. **Back to Top Button**: Appears after scrolling 300px
8. **Filter System**: Publications page has category filters (All/Research/Project)

### Design System
- **Primary Font**: System sans-serif stack
- **Accent Font**: VT323 (pixel/monospace font, loaded locally)
- **Color Scheme**:
  - Light mode: Warm cream background (`#fdfbf7`), dark text (`#1d1d1f`)
  - Dark mode: Deep teal gradient, yellow accents (`#ffff55`)
- **Minecraft Theme**: 
  - Stone-textured buttons (gray with pixel patterns)
  - 3D beveled borders (top/left lighter, bottom/right darker)
  - No border-radius (square edges)
  - Drop shadows with offset

## CSS Architecture

The stylesheet (`assets/style.css`) is organized into sections:

1. **Core Variables & Reset** (Lines 1-43): CSS custom properties for theming
2. **Minecraft Background & Overlay** (Lines 46-66): Fixed background setup
3. **Dark Theme Overrides** (Lines 69-100): Dark mode variable definitions
4. **Header & Navigation** (Lines 177-471): Sticky header with glassmorphism
5. **Hero & Content** (Lines 473-608): Main content styling
6. **Animations & Interactions** (Lines 736-788): Keyframes and transitions
7. **Components** (Lines 791-1100): Cards, badges, buttons
8. **Minecraft Global Overrides** (Lines 1274-1316): Force square borders
9. **Typography Overrides** (Lines 1329-1559): Final text styling
10. **Local Font Loading** (Lines 1561-1573): @font-face declaration

## JavaScript Architecture

The script (`assets/script.js`) uses vanilla JS with modular initialization:

```javascript
// Configuration object
const config = {
    typewriterText: ["a Boundary-breaking Innovator", "an AI Researcher", ...],
    typewriterSpeed: 100,
    typewriterDelay: 2000
};

// Initialization functions
initTheme()           // Dark mode toggle with localStorage
initMobileMenu()      // Hamburger menu for mobile
initScrollAnimations() // IntersectionObserver for fade-in
initBackToTop()       // Scroll-to-top button
initTypewriter()      // Typing animation
initFilters()         // Publication category filtering
initParallax()        // Scroll-based parallax
initTiltEffect()      // 3D card tilt on hover
```

## Deployment Process

### GitHub Pages Deployment
1. Push changes to `main` branch:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
2. GitHub Pages automatically deploys (takes 30s-2min to propagate)
3. Site available at: `https://ZHANGXiyuan2004.github.io`

### Asset Management
- Profile photo: Place as `assets/me.jpg` (or .png/.svg)
- Background: `assets/background.png` (Minecraft-style)
- Images should be optimized for web (compress before committing)
- Local font file must remain in `assets/fonts/` for VT323 to work

## Development Guidelines

### Code Style
- **HTML**: Semantic tags, proper indentation (2 spaces), accessibility attributes (`aria-label`)
- **CSS**: 
  - Use CSS variables for theming (`var(--variable-name)`)
  - Minecraft button pattern: Use the established stone texture styles
  - Maintain dark mode parity: Always test both themes
- **JavaScript**: 
  - Use `const` and `let` (no `var`)
  - Event listeners with proper cleanup considerations
  - Feature detection before DOM manipulation

### Adding New Pages
1. Create new `.html` file in root
2. Copy header/nav structure from existing page
3. Include `assets/style.css` and `assets/script.js`
4. Add navigation link to all pages (update `nav` element)
5. Mark active page with `class="active"` on corresponding nav link

### Adding Content
- **Publications**: Add `.entry` div with `data-category` attribute inside `.pub-section`
- **Collaborators**: Add `.collab-card` div inside `.collab-grid`
- **Blog Posts**: Add `.blog-card` div inside `.blog-grid`
- **Leadership Cards**: Add `.lead-card` with image inside `.leadership-grid`

### Image Guidelines
- Profile: `assets/me.jpg` (420px width, 4:3 aspect ratio recommended)
- Leadership: `assets/ls{n}.jpg` (3:2 aspect ratio)
- Blog: Store in `assets/` with descriptive names
- Collaborator avatars: Can use GitHub avatar URLs or local files

## Testing Checklist

Before committing changes:
- [ ] Test both Light and Dark modes
- [ ] Test mobile responsiveness (resize to <640px)
- [ ] Verify all navigation links work
- [ ] Check typewriter effect on home page
- [ ] Test filter buttons on publications page
- [ ] Verify back-to-top button functionality
- [ ] Confirm images load correctly
- [ ] Check external links (GitHub, Bilibili, etc.)

## External Dependencies

The site intentionally has **zero external runtime dependencies**:
- No CDN scripts
- No external CSS frameworks
- Fonts loaded locally (`assets/fonts/VT323-Regular.ttf`)
- Badge images use shields.io (external but reliable)

## Security Considerations

- No user input handling (static site)
- External links use `target="_blank"` with `rel="noopener"`
- No sensitive data in repository
- HTTPS enforced by GitHub Pages

## Maintenance Notes

- **Annual Update**: Update copyright year in footer (currently "© 2024")
- **Academic Info**: Update education timeline as needed (currently shows 2022-2026 UESTC, 2026+ PhD)
- **GPA/Honors**: Update if new achievements
- **Profile Photo**: Replace `assets/me.jpg` when needed

## Common Tasks

### Update Typewriter Text
Edit `config.typewriterText` array in `assets/script.js`:
```javascript
const config = {
    typewriterText: ["New Role 1", "New Role 2", ...],
    // ...
};
```

### Change Theme Colors
Modify CSS variables in `:root` (light) and `body.dark-mode` (dark) sections of `style.css`.

### Add New Filter Category
1. Add button in HTML: `<button class="filter-btn" data-filter="newcategory">New</button>`
2. Add `data-category="newcategory"` to relevant entries
3. CSS for active state is automatic

### Update Footer Copyright
Edit in all HTML files:
```html
<span class="footer-copyright">© 2024 Shine Yuan —</span>
```

## Lessons Learned & Best Practices

### 1. Animation Transition Conflicts

**Problem**: When an element has both `fade-in-up` (scroll animation) and hover animations, if `fade-in-up` is placed directly on the element, it overrides the hover transition.

**Solution**: Always place `fade-in-up` class on a **parent container**, not on the element with hover effects.

```html
<!-- ❌ Wrong: fade-in-up on h3 overrides hover animation -->
<h3 class="fade-in-up">Title</h3>

<!-- ✅ Correct: fade-in-up on parent container -->
<div class="fade-in-up">
  <h3>Title</h3>  <!-- Hover animation works normally -->
</div>
```

**Affected Elements**:
- `.hero h2` - needed to merge `transform` (parallax) with `letter-spacing` and `color` (hover) transitions
- All section headings (h3) should have `fade-in-up` on their parent `<section>` or `<div>` wrapper

### 2. Button Style Consistency

**Pattern**: All Minecraft-style buttons should use consistent styling:
- `padding: 8px 18px`
- `font-size: 20px` (desktop), `16px` (mobile)
- Same background texture, border, and shadow patterns
- `.filter-btn` and `.hobby-item` should share identical base styles

### 3. Mobile Navigation Styling

**Key Decisions**:
- Remove background color entirely (`background: transparent`) for cleaner look
- Keep only the button styling
- Ensure `padding` remains constant during `:hover`, `:active`, and `.active` states to prevent layout shifts
- Add explicit `padding` declarations in mobile media query to override desktop styles

### 4. Responsive Text Alignment

**Pattern**: Use mobile-specific media queries for text alignment changes:
```css
/* Desktop: left-aligned (default) */
.element { text-align: left; }

/* Mobile: centered */
@media (max-width: 640px) {
  .element { text-align: center; }
}
```

### 5. CSS Specificity Order Matters

The CSS file has multiple sections that override earlier styles:
1. Base styles (lines 1-700)
2. Component styles (lines 700-1200)
3. Responsive adjustments (lines 1200+)
4. Final overrides with `!important` (lines 1400+)

**Rule**: When debugging style issues, check if later sections (especially Typography Overrides) are overriding your changes with `!important`.

### 6. Testing Checklist for Responsive Changes

When modifying styles that affect both desktop and mobile:
- [ ] Verify desktop appearance unchanged
- [ ] Test at exactly 640px breakpoint
- [ ] Test at 320px (smallest mobile)
- [ ] Test both Light and Dark modes
- [ ] Check hover/active/focus states on interactive elements
- [ ] Verify animations still work (fade-in-up, typewriter, etc.)

## Contact & References

- **Repository**: `https://github.com/ZHANGXiyuan2004/ZHANGXiyuan2004.github.io`
- **Live Site**: `https://ZHANGXiyuan2004.github.io`
- **Owner Email**: mail_Xiyuan_Zhang@126.com
- **DEPLOY.md**: Chinese deployment instructions for reference
