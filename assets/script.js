// DOM Elements & Config
const config = {
    typewriterText: ["an Undergraduate", "a Researcher", "a Developer", "a Runner"],
    typewriterSpeed: 100,
    typewriterDelay: 2000
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initScrollAnimations();
    initBackToTop();
    initTypewriter();
    initFilters();
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
