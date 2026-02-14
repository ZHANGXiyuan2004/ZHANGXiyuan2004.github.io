const config = {
    typewriterText: ["a Startup Explorer", "an AI Researcher", "a Game Streamer", "a Tennis Player", "a Long-distance Runner"],
    typewriterSpeed: 100,
    typewriterDelay: 2000
};

/* -------------------
   0. Immediate Audio Init (Pre-DOM)
------------------- */
const audioContext = {
    click: new Audio('assets/audio/click.mp3'),
    pop: new Audio('assets/audio/pop.mp3'),
    toast: new Audio('assets/audio/levelup.mp3')
};

// Force preload
Object.values(audioContext).forEach(audio => {
    audio.preload = 'auto';
    audio.load();
});

// Set volumes
audioContext.click.volume = 0.6;
audioContext.pop.volume = 0.5;
audioContext.toast.volume = 0.8;

function playAudio(key) {
    if (audioContext[key]) {
        let sound;
        if (key === 'toast') {
            // Use main instance for Level Up to ensure 0-latency (no cloning)
            sound = audioContext[key];
            sound.currentTime = 0.1; // Skip 0.1s as requested to reduce perceived latency
        } else {
            // Clone others to allow overlapping (e.g. rapid clicks)
            sound = audioContext[key].cloneNode();
        }

        sound.volume = audioContext[key].volume;
        sound.play().catch((e) => {
            console.warn('Audio play failed:', e);
        });
    }
}

// Check for pending nav sound from previous page IMMEDIATELY
if (sessionStorage.getItem('mc_play_nav_sound')) {
    sessionStorage.removeItem('mc_play_nav_sound');
    playAudio('toast');
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initScrollAnimations();
    initBackToTop();
    initTypewriter();
    initFilters();
    initParallax(); // New
    initTiltEffect(); // New

    // Minecraft Enhancements
    initSplashText();
    initMinecraftAudio();
    initMinecraftTooltips();
    initAdvancements();
    initGuestbook();
});

/* -------------------
   1. Theme Toggle
------------------- */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');

    // Set initial state
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        // Update icon if exists
        if (themeToggle) updateThemeIcon(true);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcon(isDark);
        });
    }
}

function updateThemeIcon(isDark) {
    const icon = document.querySelector('#theme-toggle .icon');
    if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
    }
}

/* -------------------
   2. Mobile Menu
------------------- */
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('.nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', nav.classList.contains('open'));
        });
    }
}

/* -------------------
   3. Scroll Animations
------------------- */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
}

/* -------------------
   4. Back To Top
------------------- */
function initBackToTop() {
    let backToTopBtn = document.getElementById('back-to-top');

    // Create if doesn't exist (optional, but robust)
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'back-to-top';
        backToTopBtn.innerHTML = '↑';
        backToTopBtn.setAttribute('aria-label', 'Back to Top');
        document.body.appendChild(backToTopBtn);
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* -------------------
   5. Typewriter Effect
------------------- */
function initTypewriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let txt = '';

    function type() {
        const current = config.typewriterText[textIndex];

        if (isDeleting) {
            txt = current.substring(0, txt.length - 1);
        } else {
            txt = current.substring(0, txt.length + 1);
        }

        el.innerHTML = txt;

        let typeSpeed = config.typewriterSpeed;
        if (isDeleting) typeSpeed /= 2;

        if (!isDeleting && txt === current) {
            typeSpeed = config.typewriterDelay;
            isDeleting = true;
        } else if (isDeleting && txt === '') {
            isDeleting = false;
            textIndex = (textIndex + 1) % config.typewriterText.length;
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

/* -------------------
   6. Filtering
------------------- */
function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.filter-item');

    if (!buttons.length || !items.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            buttons.forEach(b => b.classList.remove('active'));
            // Add to click
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            items.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.remove('hidden');
                    // Trigger reflow/animation if needed
                    setTimeout(() => item.classList.add('visible'), 50);
                } else {
                    item.classList.add('hidden');
                    item.classList.remove('visible');
                }
            });
        });
    });
}

/* -------------------
   7. Parallax & Scroll Reactions
------------------- */
function initParallax() {
    const heroTitle = document.querySelector('.hero h2');
    const heroAvatar = document.querySelector('.avatar');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        // Parallax for Hero Title (slower scroll)
        if (heroTitle) {
            heroTitle.style.transform = `translateY(${scrolled * 0.4}px)`;
            // Subtle fade out
            heroTitle.style.opacity = 1 - (scrolled / 500);
        }

        // Scale down avatar slightly on scroll
        if (heroAvatar) {
            const scale = Math.max(0.9, 1 - (scrolled / 1000));
            heroAvatar.style.transform = `scale(${scale})`;
        }
    });
}

/* -------------------
   8. 3D Tilt Effect
------------------- */
function initTiltEffect() {
    // Disable on touch devices (mobile/tablet) for better performance and UX
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    // Select cards to apply tilt to
    const cards = document.querySelectorAll('.lead-card, .collab-card, .blog-card, .pub-section .entry');

    cards.forEach(card => {
        card.classList.add('tilt-card'); // Ensure CSS class is present

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation (max +/- 5 degrees)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5; // Invert Y for tilt
            const rotateY = ((x - centerX) / centerX) * 5;

            // Apply transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            // Reset
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

/* -------------------
   9. Minecraft Enhancements
------------------- */

/* Audio System moved to top for immediate playback */

function initMinecraftAudio() {
    // Add click sounds to standard interactive elements (exclude nav)
    const interactiles = document.querySelectorAll('a:not(.nav a), button, .btn');
    interactiles.forEach(el => {
        el.addEventListener('mousedown', () => playAudio('click'));
        // el.addEventListener('mouseenter', () => playAudio('pop')); 
    });

    // Special handling for Navigation links: Flag for next page
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // Only capture if it's a local link
            if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
                // Don't prevent default. Let navigation happen immediately.
                // Just set flag for next page.
                sessionStorage.setItem('mc_play_nav_sound', 'true');
            }
        });
    });
}

/* Splash Text */
const splashTexts = [
    "Herobrine Removed!"
];

function initSplashText() {
    const splashEl = document.getElementById('splash-text');
    if (!splashEl) return;

    const randomSplash = splashTexts[Math.floor(Math.random() * splashTexts.length)];
    splashEl.innerText = randomSplash;

    // Trigger animation start
    setTimeout(() => {
        splashEl.classList.add('visible');
    }, 100);
}

/* Custom Tooltips */
function initMinecraftTooltips() {
    // Disable on touch devices (mobile/tablet)
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const tooltip = document.createElement('div');
    tooltip.id = 'mc-tooltip';
    document.body.appendChild(tooltip);

    // Delegate event listeners for better performance
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[title], .nav a, .btn, .contact-badge-link, .icon, .btn-bilibili, .mc-char, .filter-btn, .small-btn');
        if (target) {
            let content = target.getAttribute('title') || target.innerText || target.getAttribute('aria-label');

            // Custom content for specific elements
            if (target.classList.contains('contact-badge-link')) {
                content = "Open " + (target.querySelector('img')?.alt || "Link");
                tooltip.style.color = "#55ffff";
            } else if (target.tagName === 'A' && target.closest('.nav')) {
                content = "Go to " + target.innerText;
                tooltip.style.color = "#fff";
            } else if (target.classList.contains('btn-bilibili')) {
                content = "Watch on Bilibili";
                tooltip.style.color = "#FF7BAC";
            } else if (target.classList.contains('mc-char')) {
                content = "Leave a Message";
                tooltip.style.color = "#ffff55";
            } else if (target.classList.contains('filter-btn')) {
                content = "Filter: " + target.innerText;
                tooltip.style.color = "#55ff55";
            } else if (target.classList.contains('small-btn')) {
                const href = target.getAttribute('href') || '';
                const username = href.split('github.com/')[1] || 'Profile';
                content = "Visit GitHub: " + username;
                tooltip.style.color = "#aaaaaa";
            } else {
                tooltip.style.color = "#fff";
            }

            if (!content) return;

            // Disable default browser tooltip
            if (target.getAttribute('title')) {
                target.setAttribute('data-original-title', target.getAttribute('title'));
                target.removeAttribute('title');
            }

            tooltip.innerHTML = `<span class="tooltip-title">${content}</span>`;
            tooltip.style.display = 'block';
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-original-title], .nav a, .btn, .contact-badge-link, .icon, .btn-bilibili, .mc-char, .filter-btn, .small-btn');
        if (target) {
            tooltip.style.display = 'none';
            if (target.getAttribute('data-original-title')) {
                target.setAttribute('title', target.getAttribute('data-original-title'));
            }
        }
    });

    document.addEventListener('mousemove', (e) => {
        // Offset from cursor
        const x = e.clientX + 15;
        const y = e.clientY - 30;

        // Boundary checks can be added here
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    });
}

/* Advancements */
function initAdvancements() {
    // Example: Scroll to bottom advancement
    let scrolledBottom = false;
    window.addEventListener('scroll', () => {
        if (!scrolledBottom && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            showAdvancement("We Need to Go Deeper!", "💌");
            scrolledBottom = true;
        }
    });

    // Welcome Achievement
    setTimeout(() => {
        showAdvancement("Find A Tree And Get Some Wood", "🌳");
    }, 5000);
}

function showAdvancement(text, icon = '💎') {
    // Check if already shown in session
    const key = `advancement-${text}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, 'true');

    let toast = document.getElementById('advancement-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'advancement-toast';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `
        <div class="advancement-icon">${icon}</div>
        <div class="advancement-text">
            <div class="advancement-title">${text}</div>
        </div>
    `;

    // playAudio('toast'); // Sound disabled by user request

    // Force reflow/wait specifically for animation to catch
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

/* -------------------
   10. Loading Screen
------------------- */
// Only show loading animation on first visit per session
(function () {
    const loader = document.getElementById('loading-overlay');
    if (!loader) return;

    if (sessionStorage.getItem('loader_shown')) {
        // Already shown this session — remove immediately, no animation
        loader.remove();
        return;
    }

    // First visit: show loading animation, then fade out on load
    window.addEventListener('load', () => {
        sessionStorage.setItem('loader_shown', 'true');
        setTimeout(() => {
            loader.classList.add('loaded');
        }, 500);
    });
})();

/* -------------------
   11. Guestbook (Book & Quill)
------------------- */
function initGuestbook() {
    // 1. Inject Modal HTML
    const modalHTML = `
    <div id="guestbook-modal" class="hidden">
        <div class="book-container">
            <div class="book-page left-page">
                <h2>Guestbook</h2>
                <p>Leave a private message for the author.</p>
                <div class="book-divider"></div>
                <div class="helper-text">To: Shine Yuan</div>
            </div>
            <div class="book-page right-page">
                <textarea id="guestbook-msg" placeholder="Write your message here..."></textarea>
                <div class="book-controls">
                    <button id="guestbook-sign" class="mc-btn">Sign & Close</button>
                    <button id="guestbook-cancel" class="mc-btn cancel">Cancel</button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 2. Select Elements
    const boardBtn = document.querySelector('.mc-char'); // The "Board" image
    const modal = document.getElementById('guestbook-modal');
    const msgInput = document.getElementById('guestbook-msg');
    const signBtn = document.getElementById('guestbook-sign');
    const cancelBtn = document.getElementById('guestbook-cancel');

    if (!boardBtn || !modal) return;

    // 3. Open Modal
    boardBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.classList.add('visible');
        playAudio('click');
    });

    // 4. Close Modal
    function closeModal() {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
            msgInput.value = ''; // Clear input
        }, 300); // Wait for fade out
        playAudio('click');
    }

    cancelBtn.addEventListener('click', closeModal);

    // Close on click outside (optional, maybe keep it modal for "book feel")
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // 5. Submit (Mailto)
    signBtn.addEventListener('click', () => {
        const message = msgInput.value.trim();
        if (!message) {
            alert("Please write a message first!");
            return;
        }

        // Play "signing" sound? (reuse pop or click)
        playAudio('toast');

        const subject = encodeURIComponent("Guestbook Message from Website Visitor");
        const body = encodeURIComponent(message);

        // Open Mail Client
        window.location.href = `mailto:mail_Xiyuan_Zhang@126.com?subject=${subject}&body=${body}`;

        closeModal();
    });
}
