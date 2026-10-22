/* =========================================================
   MAISON AURELIA — script.js
   Vanilla JavaScript (no frameworks)

   Sections:
   1.  Constants, product data & helpers
   2.  Storage (localStorage, safe wrappers)
   3.  Global state
   4.  Page loader
   5.  Announcement bar
   6.  Header scroll state & mobile menu
   7.  Search overlay
   8.  Hero slider (fade / Ken Burns / letter animation)
   9.  Trust marquee
   10. Category counts
   11. Product rendering (cards)
   12. Filter & sort
   13. Quick view modal
   14. Cart (add / remove / qty / totals / coupon)
   15. Cart drawer & checkout summary
   16. Wishlist
   17. Toast notifications
   18. Limited edition countdown
   19. Count-up numbers
   20. Testimonials carousel
   21. Gallery & newsletter / contact forms
   22. Scroll reveal, parallax & back-to-top
   23. Buttons: ripple effect
   24. Custom cursor
   25. Init
   ========================================================= */

(function () {
    'use strict';

    /* =======================================================
       1. CONSTANTS, PRODUCT DATA & HELPERS
       ======================================================= */

    // Business rules (single source of truth)
    const RULES = {
        FREE_SHIPPING_OVER: 500,   // free shipping when discounted subtotal is over $500
        SHIPPING_FEE: 25,          // flat fee otherwise (only when cart has items)
        TAX_RATE: 0.08,            // 8% tax
        COUPONS: { VIP10: 0.10 }   // code -> percentage off
    };

    const STORAGE_KEYS = {
        cart: 'maisonAurelia.cart',
        wishlist: 'maisonAurelia.wishlist',
        coupon: 'maisonAurelia.coupon'
    };

    // Product catalogue. "img" and "img2" are Unsplash photos (hover swap).
    const PRODUCTS = [
        {
            id: 'aur-chrono-01', name: 'Aurelia Chronograph', cat: 'watches', price: 4890, old: null,
            rating: 4.9, reviews: 128, badge: 'new', created: 20260901,
            desc: 'A Swiss-certified chronograph in 18k champagne gold with a sapphire crystal and sunburst dial.',
            material: 'Options', options: ['Gold 18k', 'Rose 18k', 'Steel'],
            img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
            img2: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80',
            alt: 'Gold chronograph wristwatch with sunburst dial'
        },
        {
            id: 'aur-solitaire-02', name: 'Solitaire Diamond Ring', cat: 'rings', price: 3290, old: 3890,
            rating: 4.8, reviews: 86, badge: 'sale', created: 20260815,
            desc: 'A 1.0ct brilliant-cut diamond (GIA certified) set in a six-prong 18k gold band.',
            material: 'Metal', options: ['Yellow Gold', 'White Gold', 'Platinum'],
            img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
            img2: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
            alt: 'Diamond solitaire ring in gold setting'
        },
        {
            id: 'aur-pendant-03', name: 'Lumière Pendant Necklace', cat: 'necklaces', price: 1450, old: null,
            rating: 4.7, reviews: 54, badge: null, created: 20260710,
            desc: 'A fine 18k gold chain with a sculpted teardrop pendant set with a single diamond.',
            material: 'Length', options: ['16 in', '18 in', '20 in'],
            img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
            img2: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80',
            alt: 'Gold pendant necklace'
        },
        {
            id: 'aur-bangle-04', name: 'Eclat Gold Bangle', cat: 'bracelets', price: 980, old: 1190,
            rating: 4.6, reviews: 39, badge: 'sale', created: 20260620,
            desc: 'A polished 18k gold bangle with a hidden clasp and a soft, comfortable inner curve.',
            material: 'Size', options: ['Small', 'Medium', 'Large'],
            img: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
            img2: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80',
            alt: 'Polished gold bangle bracelet'
        },
        {
            id: 'aur-noir-05', name: 'Aurelia Noir 1925', cat: 'watches', price: 7650, old: null,
            rating: 5.0, reviews: 22, badge: 'new', created: 20261001,
            desc: 'Limited, numbered automatic in black PVD steel with a hand-engraved gold rotor.',
            material: 'Strap', options: ['Leather', 'Steel Bracelet'],
            img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
            img2: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80',
            alt: 'Black dial luxury watch'
        },
        {
            id: 'aur-eternity-06', name: 'Eternity Band', cat: 'rings', price: 2140, old: null,
            rating: 4.8, reviews: 61, badge: null, created: 20260501,
            desc: 'A full eternity band with channel-set diamonds in 18k white gold.',
            material: 'Size', options: ['5', '6', '7', '8'],
            img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
            img2: 'https://images.unsplash.com/photo-1609587312208-cea54be969e7?auto=format&fit=crop&w=900&q=80',
            alt: 'Diamond eternity band ring'
        },
        {
            id: 'aur-cuban-07', name: 'Cuban Link Chain', cat: 'necklaces', price: 2680, old: 2990,
            rating: 4.5, reviews: 47, badge: 'sale', created: 20260405,
            desc: 'A heavyweight 14k gold Cuban link chain with a secure box clasp.',
            material: 'Length', options: ['18 in', '20 in', '22 in'],
            img: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80',
            img2: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80',
            alt: 'Heavy gold chain necklace'
        },
        {
            id: 'aur-tennis-08', name: 'Diamond Tennis Bracelet', cat: 'bracelets', price: 3420, old: null,
            rating: 4.9, reviews: 73, badge: 'new', created: 20260925,
            desc: 'Forty round brilliant diamonds in a flexible 18k white gold tennis line.',
            material: 'Size', options: ['6.5 in', '7 in', '7.5 in'],
            img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80',
            img2: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80',
            alt: 'Diamond tennis bracelet'
        },
        {
            id: 'aur-aviator-09', name: 'Aviator Gold Watch', cat: 'watches', price: 3150, old: 3600,
            rating: 4.6, reviews: 95, badge: 'sale', created: 20260720,
            desc: 'A pilot-inspired 42mm watch with a luminous gold case and a date window.',
            material: 'Strap', options: ['Leather', 'Steel Bracelet'],
            img: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=900&q=80',
            img2: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
            alt: 'Gold aviator watch'
        },
        {
            id: 'aur-hoop-10', name: 'Halo Drop Earrings', cat: 'necklaces', price: 1280, old: null,
            rating: 4.7, reviews: 33, badge: 'new', created: 20260915,
            desc: 'Halo-set drop earrings in 18k gold with brilliant-cut stones.',
            material: 'Metal', options: ['Yellow Gold', 'White Gold'],
            img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80',
            img2: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
            alt: 'Gold drop earrings with diamonds'
        }
    ];

    // Quick lookup by id
    const PRODUCT_BY_ID = PRODUCTS.reduce((map, p) => { map[p.id] = p; return map; }, {});

    // Money formatter (USD)
    const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const fmt = (n) => money.format(Math.max(0, n));

    // Tiny DOM helpers
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
    const escapeHTML = (str) => String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    // Prefers-reduced-motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fallback image shown if an Unsplash URL fails to load (keeps layout intact, no console errors)
    const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='880'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%231A1A1A'/><stop offset='1' stop-color='%230B0B0B'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><text x='50%' y='52%' fill='%23D4AF37' font-family='Georgia' font-size='46' text-anchor='middle'>AURELIA</text></svg>"
    );
    // Attach to every <img> (also ones created later) so a broken image never throws
    function handleImgError(e) {
        const img = e.target;
        if (img && img.tagName === 'IMG' && img.dataset.fallbackApplied !== '1') {
            img.dataset.fallbackApplied = '1';
            img.src = FALLBACK_IMG;
        }
    }
    document.addEventListener('error', handleImgError, true); // capture: img errors don't bubble

    /* =======================================================
       2. STORAGE (safe wrappers — never throw)
       ======================================================= */
    const Storage = {
        get(key, fallback) {
            try {
                const raw = window.localStorage.getItem(key);
                return raw === null ? fallback : JSON.parse(raw);
            } catch (err) {
                return fallback; // private mode / corrupt JSON
            }
        },
        set(key, value) {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
            } catch (err) {
                /* storage full or blocked — app keeps working in memory */
            }
        }
    };

    /* =======================================================
       3. GLOBAL STATE
       ======================================================= */
    const state = {
        cart: [],          // [{ key, id, qty, option }]
        wishlist: [],      // [productId]
        coupon: null,      // 'VIP10' or null
        filter: { cat: 'all', maxPrice: 20000, sort: 'newest' },
        quick: { id: null, qty: 1, option: null, imgIndex: 0 },
        heroIndex: 0,
        testiIndex: 0
    };

    // Sanitise cart data read from storage (never trust stored JSON)
    function loadState() {
        const savedCart = Storage.get(STORAGE_KEYS.cart, []);
        state.cart = Array.isArray(savedCart)
            ? savedCart.filter((i) => i && PRODUCT_BY_ID[i.id] && Number.isInteger(i.qty) && i.qty > 0)
                .map((i) => ({ key: i.key, id: i.id, qty: clamp(i.qty, 1, 99), option: String(i.option || '') }))
            : [];

        const savedWish = Storage.get(STORAGE_KEYS.wishlist, []);
        state.wishlist = Array.isArray(savedWish) ? savedWish.filter((id) => PRODUCT_BY_ID[id]) : [];

        const savedCoupon = Storage.get(STORAGE_KEYS.coupon, null);
        state.coupon = RULES.COUPONS[savedCoupon] ? savedCoupon : null;
    }
    function saveCart() { Storage.set(STORAGE_KEYS.cart, state.cart); }
    function saveWishlist() { Storage.set(STORAGE_KEYS.wishlist, state.wishlist); }
    function saveCoupon() { Storage.set(STORAGE_KEYS.coupon, state.coupon); }

    /* =======================================================
       4. PAGE LOADER
       ======================================================= */
    function initLoader() {
        const loader = $('#loader');
        if (!loader) return;
        const hide = () => {
            loader.classList.add('is-done');
            loader.setAttribute('aria-hidden', 'true');
            setTimeout(() => loader.remove(), 900);
            revealInView(); // start reveal animations once page is visible
        };
        // Hide after the window loads, with a minimum display time for the brand animation
        const minTime = prefersReducedMotion ? 0 : 1100;
        const start = performance.now();
        const finish = () => {
            const wait = Math.max(0, minTime - (performance.now() - start));
            setTimeout(hide, wait);
        };
        if (document.readyState === 'complete') finish();
        else window.addEventListener('load', finish, { once: true });
        // Safety net so the loader never blocks the page
        setTimeout(hide, 4000);
    }

    /* =======================================================
       5. ANNOUNCEMENT BAR (auto-sliding messages)
       ======================================================= */
    function initAnnouncement() {
        const bar = $('#announce');
        const msgs = $$('.announce__msg');
        const close = $('#announceClose');
        if (!bar || msgs.length === 0) return;

        let index = 0;
        let timer = null;

        function show(next) {
            const current = msgs[index];
            current.classList.remove('is-active');
            current.classList.add('is-leaving');
            setTimeout(() => current.classList.remove('is-leaving'), 650);
            index = next;
            msgs[index].classList.add('is-active');
        }
        function start() {
            if (prefersReducedMotion) return;
            timer = setInterval(() => show((index + 1) % msgs.length), 4000);
        }
        start();

        if (close) {
            close.addEventListener('click', () => {
                bar.classList.add('is-hidden');
                clearInterval(timer);
                document.documentElement.style.setProperty('--announce-h', '0px');
            });
        }
    }

    /* =======================================================
       6. HEADER SCROLL STATE & MOBILE MENU
       ======================================================= */
    function initHeader() {
        const header = $('#header');
        if (!header) return;
        const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    function initMobileMenu() {
        const menu = $('#mobileMenu');
        const toggle = $('#menuToggle');
        if (!menu || !toggle) return;

        let lastFocus = null;

        function open() {
            lastFocus = document.activeElement;
            menu.classList.add('is-open');
            menu.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Close menu');
            document.body.classList.add('is-locked');
            const first = menu.querySelector('a, button');
            if (first) first.focus();
        }
        function close() {
            menu.classList.remove('is-open');
            menu.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open menu');
            document.body.classList.remove('is-locked');
            if (lastFocus) lastFocus.focus();
        }

        toggle.addEventListener('click', () => {
            menu.classList.contains('is-open') ? close() : open();
        });
        $$('[data-close-menu]', menu).forEach((el) => el.addEventListener('click', close));
        menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => close()));

        // Escape closes the menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
        });
        // Close the menu if the viewport becomes desktop-sized
        window.matchMedia('(min-width: 900px)').addEventListener('change', (mq) => {
            if (mq.matches && menu.classList.contains('is-open')) close();
        });
    }

    // PART 1 END

    /* =======================================================
       7. SEARCH OVERLAY
       ======================================================= */
    function initSearch() {
        const overlay = $('#searchOverlay');
        const openBtn = $('#searchBtn');
        const input = $('#searchInput');
        const results = $('#searchResults');
        if (!overlay || !openBtn || !input || !results) return;

        function open() {
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('is-locked');
            setTimeout(() => input.focus(), 50);
            renderResults('');
        }
        function close() {
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('is-locked');
            input.value = '';
            openBtn.focus();
        }
        function renderResults(term) {
            const q = term.trim().toLowerCase();
            const matches = q
                ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.cat.includes(q) || p.desc.toLowerCase().includes(q))
                : PRODUCTS.slice(0, 4);
            if (matches.length === 0) {
                results.innerHTML = '<p class="search__empty">No pieces match your search.</p>';
                return;
            }
            results.innerHTML = matches.slice(0, 6).map((p) => `
        <button class="search__result" type="button" data-search-open="${p.id}">
          <img src="${p.img}" alt="" width="48" height="48" loading="lazy">
          <span>
            <span class="search__result-name" style="display:block">${escapeHTML(p.name)}</span>
            <span class="search__result-price">${fmt(p.price)}</span>
          </span>
        </button>`).join('');
        }

        openBtn.addEventListener('click', open);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        $$('[data-close-search]', overlay).forEach((b) => b.addEventListener('click', close));
        input.addEventListener('input', () => renderResults(input.value));
        results.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-search-open]');
            if (!btn) return;
            const id = btn.dataset.searchOpen;
            close();
            setTimeout(() => openQuickView(id), 250);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
        });
        // Ctrl/Cmd + K opens search (keyboard friendly)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
        });
    }

    /* =======================================================
       8. HERO SLIDER (3 slides, fade + Ken Burns + letter animation)
       ======================================================= */
    const HERO_INTERVAL = 6000;
    let heroTimer = null;

    // Split a headline into per-letter spans for the gold animation
    function splitHeading(el) {
        const text = el.dataset.split || el.textContent;
        el.setAttribute('aria-label', text);
        el.textContent = '';
        let delay = 0;
        [...text].forEach((ch) => {
            const span = document.createElement('span');
            if (ch === ' ') {
                span.className = 'space';
                span.innerHTML = '&nbsp;';
            } else {
                span.className = 'char';
                span.textContent = ch;
                span.setAttribute('aria-hidden', 'true');
                span.style.transitionDelay = `${delay}ms`;
                delay += 30;
            }
            el.appendChild(span);
        });
    }
    function animateHeading(slide) {
        const chars = $$('.char', slide);
        chars.forEach((c) => c.classList.remove('is-in'));
        // Force reflow so the transition restarts
        void slide.offsetWidth;
        chars.forEach((c) => c.classList.add('is-in'));
    }

    function initHero() {
        const slides = $$('.hero__slide');
        const dots = $$('.hero__dot');
        if (slides.length === 0) return;

        $$('.hero__title').forEach(splitHeading);
        const dotTime = prefersReducedMotion ? '0s' : HERO_INTERVAL + 'ms';
        $('#hero').style.setProperty('--dot-time', dotTime);

        function goTo(i) {
            const next = (i + slides.length) % slides.length;
            slides[state.heroIndex].classList.remove('is-active');
            dots[state.heroIndex].classList.remove('is-active');
            dots[state.heroIndex].removeAttribute('aria-current');
            state.heroIndex = next;
            slides[next].classList.add('is-active');
            dots[next].classList.add('is-active');
            dots[next].setAttribute('aria-current', 'true');
            // Restart dot progress bar by re-triggering the animation
            dots.forEach((d) => { d.classList.remove('is-active'); });
            void dots[next].offsetWidth;
            dots[next].classList.add('is-active');
            animateHeading(slides[next]);
            restartHeroTimer();
        }
        function restartHeroTimer() {
            clearInterval(heroTimer);
            if (!prefersReducedMotion) heroTimer = setInterval(() => goTo(state.heroIndex + 1), HERO_INTERVAL);
        }

        dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
        const prev = $('[data-hero-prev]');
        const next = $('[data-hero-next]');
        if (prev) prev.addEventListener('click', () => goTo(state.heroIndex - 1));
        if (next) next.addEventListener('click', () => goTo(state.heroIndex + 1));

        // Pause on hover and when tab is hidden
        const hero = $('#hero');
        hero.addEventListener('mouseenter', () => clearInterval(heroTimer));
        hero.addEventListener('mouseleave', restartHeroTimer);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) clearInterval(heroTimer); else restartHeroTimer();
        });

        // Swipe support on touch devices
        let touchX = null;
        hero.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
        hero.addEventListener('touchend', (e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 45) goTo(state.heroIndex + (dx < 0 ? 1 : -1));
            touchX = null;
        });

        // Initial state
        animateHeading(slides[0]);
        restartHeroTimer();
    }

    /* =======================================================
       9. TRUST MARQUEE (duplicated list for seamless loop)
       ======================================================= */
    function initMarquee() {
        const track = $('#marqueeTrack');
        if (!track) return;
        const brands = ['Swiss Certified', 'GIA Graded', 'Hallmarked 18k', 'Conflict-Free', 'Lifetime Warranty', 'Hand Finished', 'Geneva Since 1925'];
        const group = () => {
            const g = document.createElement('div');
            g.className = 'marquee__group';
            g.setAttribute('aria-hidden', 'true');
            brands.forEach((b) => {
                const item = document.createElement('span');
                item.className = 'marquee__item';
                item.textContent = b;
                const dot = document.createElement('span');
                dot.className = 'marquee__dot';
                g.appendChild(item);
                g.appendChild(dot);
            });
            return g;
        };
        // Two identical groups; CSS translates -50% for a seamless loop
        track.appendChild(group());
        track.appendChild(group());
    }

    /* =======================================================
       10. CATEGORY COUNTS
       ======================================================= */
    function initCategoryCounts() {
        $$('[data-count]').forEach((el) => {
            const cat = el.dataset.count;
            const n = PRODUCTS.filter((p) => p.cat === cat).length;
            el.textContent = `${n} ${n === 1 ? 'piece' : 'pieces'}`;
        });
    }

    /* =======================================================
       11. PRODUCT CARDS (rendered from PRODUCTS)
       ======================================================= */
    function starsHTML(rating) {
        const full = Math.round(rating);
        const icons = Array.from({ length: 5 }, (_, i) =>
            `<svg viewBox="0 0 24 24" fill="${i < full ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>`
        ).join('');
        return `<span class="stars__icons">${icons}</span>`;
    }

    function productCardHTML(p) {
        const wished = state.wishlist.includes(p.id);
        const badge = p.badge === 'new'
            ? '<span class="badge-tag">New</span>'
            : p.badge === 'sale'
                ? '<span class="badge-tag badge-tag--sale">Sale</span>'
                : '';
        const oldPrice = p.old ? `<span class="price price--old">${fmt(p.old)}</span>` : '';
        return `
      <article class="product reveal" role="listitem" data-product="${p.id}">
        <div class="product__media">
          <div class="product__badges">${badge}</div>
          <button class="product__wish${wished ? ' is-active' : ''}" type="button" data-action="wish" data-id="${p.id}"
            aria-pressed="${wished}" aria-label="${wished ? 'Remove' : 'Add'} ${escapeHTML(p.name)} ${wished ? 'from' : 'to'} wishlist">
            ${heartSVG()}
          </button>
          <a href="#shop" data-action="quick" data-id="${p.id}" aria-label="Quick view ${escapeHTML(p.name)}">
            <img class="product__img product__img--main" src="${p.img}" alt="${escapeHTML(p.alt)}" width="900" height="990" loading="lazy">
            <img class="product__img product__img--alt" src="${p.img2}" alt="" aria-hidden="true" width="900" height="990" loading="lazy">
          </a>
          <div class="product__quick">
            <button type="button" data-action="add" data-id="${p.id}">Add to Cart</button>
            <button type="button" data-action="quick" data-id="${p.id}">Quick View</button>
            <button type="button" class="product__quick-wish" data-action="wish" data-id="${p.id}" aria-label="Wishlist ${escapeHTML(p.name)}">${heartSVG()}</button>
          </div>
        </div>
        <div class="product__body">
          <span class="product__cat">${escapeHTML(p.cat)}</span>
          <h3 class="product__name"><a href="#shop" data-action="quick" data-id="${p.id}">${escapeHTML(p.name)}</a></h3>
          <div class="stars" aria-label="Rated ${p.rating} out of 5">
            ${starsHTML(p.rating)}<span>${p.rating.toFixed(1)} (${p.reviews})</span>
          </div>
          <div class="product__price">
            <span class="price">${fmt(p.price)}</span>${oldPrice}
          </div>
        </div>
      </article>`;
    }

    function heartSVG() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
    }

    /* =======================================================
       12. FILTER & SORT (category + max price + sort)
       ======================================================= */
    function getFilteredProducts() {
        const { cat, maxPrice, sort } = state.filter;
        let list = PRODUCTS.filter((p) => (cat === 'all' || p.cat === cat) && p.price <= maxPrice);
        if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
        else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
        else list.sort((a, b) => b.created - a.created); // newest first
        return list;
    }

    function renderProducts() {
        const grid = $('#productGrid');
        const count = $('#resultCount');
        if (!grid) return;
        const list = getFilteredProducts();
        grid.innerHTML = list.length
            ? list.map(productCardHTML).join('')
            : '<p class="empty-state">No pieces match these filters. Try a higher price or another category.</p>';
        if (count) count.textContent = `Showing ${list.length} ${list.length === 1 ? 'piece' : 'pieces'}`;
        // Newly rendered cards should animate in
        revealInView();
    }

    function setCategory(cat) {
        state.filter.cat = cat;
        $$('.chip').forEach((chip) => {
            const active = chip.dataset.cat === cat;
            chip.classList.toggle('is-active', active);
            chip.setAttribute('aria-pressed', String(active));
        });
        renderProducts();
    }

    function initFilters() {
        const range = $('#priceRange');
        const out = $('#priceOut');
        const select = $('#sortSelect');
        if (!range || !out || !select) return;

        // Category chips
        $$('.chip').forEach((chip) => {
            chip.addEventListener('click', () => setCategory(chip.dataset.cat));
        });
        // Category cards link into the filtered grid
        $$('[data-filter-cat]').forEach((card) => {
            card.addEventListener('click', () => setCategory(card.dataset.filterCat));
        });

        // Price range slider with live label and gold fill
        const paint = () => {
            const max = Number(range.max);
            const val = Number(range.value);
            range.style.setProperty('--fill', `${(val / max) * 100}%`);
            out.textContent = `Up to ${fmt(val)}`;
        };
        range.addEventListener('input', () => {
            state.filter.maxPrice = Number(range.value);
            paint();
            renderProducts();
        });
        paint();

        select.addEventListener('change', () => {
            state.filter.sort = select.value;
            renderProducts();
        });
    }

    // PART 2 END

    /* =======================================================
       17. TOAST NOTIFICATIONS (defined early: used everywhere)
       ======================================================= */
    function toast(message, type = 'success') {
        const wrap = $('#toasts');
        if (!wrap) return;
        const el = document.createElement('div');
        el.className = 'toast' + (type === 'error' ? ' toast--error' : '');
        el.setAttribute('role', 'status');
        const icon = type === 'error'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
        el.innerHTML = `${icon}<span>${escapeHTML(message)}</span>`;
        wrap.appendChild(el);
        // Keep at most 3 visible toasts
        while (wrap.children.length > 3) wrap.firstElementChild.remove();
        setTimeout(() => {
            el.classList.add('is-out');
            setTimeout(() => el.remove(), 450);
        }, 2600);
    }

    /* =======================================================
       13. QUICK VIEW MODAL
       ======================================================= */
    let lastTrigger = null;

    function openModal(modal) {
        lastTrigger = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('is-locked');
        const focusable = modal.querySelector('button, [href], input, select');
        if (focusable) setTimeout(() => focusable.focus(), 60);
    }
    function closeModal(modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        if (!$$('.modal.is-open, .cart.is-open, .search.is-open, .mobile-menu.is-open').length) {
            document.body.classList.remove('is-locked');
        }
        if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    }

    function openQuickView(id) {
        const p = PRODUCT_BY_ID[id];
        const modal = $('#quickModal');
        const dialog = $('#quickDialog');
        if (!p || !modal || !dialog) return;

        state.quick = { id, qty: 1, option: p.options[0], imgIndex: 0 };
        renderQuickView();
        openModal(modal);
    }

    function renderQuickView() {
        const p = PRODUCT_BY_ID[state.quick.id];
        const dialog = $('#quickDialog');
        if (!p || !dialog) return;
        const images = [p.img, p.img2];
        const wished = state.wishlist.includes(p.id);
        const oldPrice = p.old ? `<span class="price price--old">${fmt(p.old)}</span>` : '';

        dialog.innerHTML = `
      <button class="modal__close" type="button" data-close-modal aria-label="Close quick view">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="quick">
        <div class="quick__gallery">
          <img class="quick__main" id="qvMain" src="${images[state.quick.imgIndex]}" alt="${escapeHTML(p.alt)}" width="900" height="900">
          <div class="quick__thumbs" role="group" aria-label="Product images">
            ${images.map((src, i) => `
              <button class="quick__thumb${i === state.quick.imgIndex ? ' is-active' : ''}" type="button" data-thumb="${i}" aria-label="Show image ${i + 1}">
                <img src="${src}" alt="" width="68" height="68">
              </button>`).join('')}
          </div>
        </div>
        <div class="quick__info">
          <span class="product__cat">${escapeHTML(p.cat)}</span>
          <h2 id="qvTitle">${escapeHTML(p.name)}</h2>
          <div class="stars" aria-label="Rated ${p.rating} out of 5">${starsHTML(p.rating)}<span>${p.rating.toFixed(1)} (${p.reviews} reviews)</span></div>
          <div class="quick__price"><span class="price">${fmt(p.price)}</span>${oldPrice}</div>
          <p class="quick__desc">${escapeHTML(p.desc)}</p>

          <div>
            <span class="field-label" id="optLabel">${escapeHTML(p.material)}</span>
            <div class="options" role="radiogroup" aria-labelledby="optLabel">
              ${p.options.map((o) => `
                <button class="option${o === state.quick.option ? ' is-active' : ''}" type="button" role="radio"
                  aria-checked="${o === state.quick.option}" data-option="${escapeHTML(o)}">${escapeHTML(o)}</button>`).join('')}
            </div>
          </div>

          <div>
            <span class="field-label" id="qtyLabel">Quantity</span>
            <div class="qty" role="group" aria-labelledby="qtyLabel">
              <button type="button" data-qty="-1" aria-label="Decrease quantity">&minus;</button>
              <output id="qvQty" aria-live="polite">${state.quick.qty}</output>
              <button type="button" data-qty="1" aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div class="quick__actions">
            <button class="btn btn--solid" type="button" data-qv-add="${p.id}">Add to Cart</button>
            <button class="btn btn--ghost" type="button" data-qv-wish="${p.id}" aria-pressed="${wished}">${wished ? 'Wishlisted' : 'Wishlist'}</button>
          </div>
        </div>
      </div>`;
    }

    function initQuickView() {
        const modal = $('#quickModal');
        const dialog = $('#quickDialog');
        if (!modal || !dialog) return;

        // Delegated clicks inside the dialog (re-rendered often)
        dialog.addEventListener('click', (e) => {
            if (e.target.closest('[data-close-modal]')) return closeModal(modal);

            const thumb = e.target.closest('[data-thumb]');
            if (thumb) {
                state.quick.imgIndex = Number(thumb.dataset.thumb);
                const p = PRODUCT_BY_ID[state.quick.id];
                const main = $('#qvMain');
                if (main) main.src = [p.img, p.img2][state.quick.imgIndex];
                $$('.quick__thumb').forEach((t, i) => {
                    t.classList.toggle('is-active', i === state.quick.imgIndex);
                });
                return;
            }

            const opt = e.target.closest('[data-option]');
            if (opt) {
                state.quick.option = opt.dataset.option;
                $$('.option').forEach((o) => {
                    const active = o === opt;
                    o.classList.toggle('is-active', active);
                    o.setAttribute('aria-checked', String(active));
                });
                return;
            }

            const qty = e.target.closest('[data-qty]');
            if (qty) {
                state.quick.qty = clamp(state.quick.qty + Number(qty.dataset.qty), 1, 99);
                const out = $('#qvQty');
                if (out) out.textContent = state.quick.qty;
                return;
            }

            const add = e.target.closest('[data-qv-add]');
            if (add) {
                addToCart(add.dataset.qvAdd, state.quick.qty, state.quick.option);
                closeModal(modal);
                return;
            }

            const wish = e.target.closest('[data-qv-wish]');
            if (wish) {
                toggleWishlist(wish.dataset.qvWish);
                renderQuickView(); // refresh label
                return;
            }
        });

        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(modal);
        });
    }

    /* =======================================================
       14. CART (add / remove / qty / totals / coupon)
       ======================================================= */
    function cartKey(id, option) { return `${id}::${option || ''}`; }

    function addToCart(id, qty = 1, option = '') {
        const p = PRODUCT_BY_ID[id];
        if (!p) return;
        const key = cartKey(id, option);
        const existing = state.cart.find((i) => i.key === key);
        if (existing) existing.qty = clamp(existing.qty + qty, 1, 99);
        else state.cart.push({ key, id, qty: clamp(qty, 1, 99), option: option || '' });
        saveCart();
        renderCart();
        bumpBadge('#cartCount');
        toast(`Added to cart: ${p.name}`);
    }

    function changeQty(key, delta) {
        const item = state.cart.find((i) => i.key === key);
        if (!item) return;
        item.qty += delta;
        if (item.qty < 1) return removeFromCart(key);
        item.qty = clamp(item.qty, 1, 99);
        saveCart();
        renderCart();
    }

    function removeFromCart(key) {
        state.cart = state.cart.filter((i) => i.key !== key);
        saveCart();
        renderCart();
        toast('Item removed from cart', 'error');
    }

    // Totals: discount first, then tax on discounted subtotal, shipping on discounted subtotal
    function computeTotals() {
        const subtotal = state.cart.reduce((sum, item) => {
            const p = PRODUCT_BY_ID[item.id];
            return sum + p.price * item.qty;
        }, 0);
        const rate = state.coupon ? RULES.COUPONS[state.coupon] : 0;
        const discount = Math.round(subtotal * rate * 100) / 100;
        const discounted = subtotal - discount;
        const hasItems = state.cart.length > 0;
        const shipping = !hasItems ? 0 : discounted > RULES.FREE_SHIPPING_OVER ? 0 : RULES.SHIPPING_FEE;
        const tax = Math.round(discounted * RULES.TAX_RATE * 100) / 100;
        const total = discounted + shipping + tax;
        const count = state.cart.reduce((n, i) => n + i.qty, 0);
        return { subtotal, discount, discounted, shipping, tax, total, count };
    }

    function renderCart() {
        const list = $('#cartItems');
        const foot = $('#cartFoot');
        if (!list) return;
        const t = computeTotals();

        if (state.cart.length === 0) {
            list.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M5 7h14l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5 7z"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7"/></svg>
          <p>Your cart is empty.</p>
          <a class="btn btn--ghost btn--small" href="#shop" data-close-cart>Continue Shopping</a>
        </div>`;
        } else {
            list.innerHTML = state.cart.map((item) => {
                const p = PRODUCT_BY_ID[item.id];
                return `
          <div class="cart-item" data-key="${escapeHTML(item.key)}">
            <img src="${p.img}" alt="${escapeHTML(p.alt)}" width="84" height="84" loading="lazy">
            <div>
              <h3 class="cart-item__name">${escapeHTML(p.name)}</h3>
              <p class="cart-item__meta">${item.option ? escapeHTML(item.option) : escapeHTML(p.cat)}</p>
              <div class="cart-item__row">
                <div class="mini-qty" role="group" aria-label="Quantity for ${escapeHTML(p.name)}">
                  <button type="button" data-cart-qty="-1" data-key="${escapeHTML(item.key)}" aria-label="Decrease quantity">&minus;</button>
                  <output aria-live="polite">${item.qty}</output>
                  <button type="button" data-cart-qty="1" data-key="${escapeHTML(item.key)}" aria-label="Increase quantity">+</button>
                </div>
                <span class="cart-item__price">${fmt(p.price * item.qty)}</span>
              </div>
              <button class="cart-item__remove" type="button" data-cart-remove data-key="${escapeHTML(item.key)}">Remove</button>
            </div>
          </div>`;
            }).join('');
        }

        // Totals
        setText('#tSubtotal', fmt(t.subtotal));
        setText('#tShipping', t.shipping === 0 && state.cart.length ? 'Free' : fmt(t.shipping));
        setText('#tTax', fmt(t.tax));
        setText('#tTotal', fmt(t.total));
        const discRow = $('#tDiscountRow');
        if (discRow) {
            discRow.hidden = !state.coupon;
            setText('#tDiscount', `-${fmt(t.discount)}`);
            setText('#tDiscountLabel', state.coupon || '');
        }
        if (foot) foot.hidden = state.cart.length === 0;

        // Header badge + accessible label
        const cartBtn = $('#cartBtn');
        setText('#cartCount', t.count);
        if (cartBtn) cartBtn.setAttribute('aria-label', `Open cart, ${t.count} ${t.count === 1 ? 'item' : 'items'}`);
    }

    function setText(sel, value) {
        const el = $(sel);
        if (el) el.textContent = value;
    }

    // Bounce animation on the badge when count changes
    function bumpBadge(sel) {
        const badge = $(sel);
        if (!badge || prefersReducedMotion) return;
        badge.classList.remove('is-bump');
        void badge.offsetWidth;
        badge.classList.add('is-bump');
    }

    function applyCoupon(raw) {
        const code = String(raw || '').trim().toUpperCase();
        const msg = $('#couponMsg');
        const input = $('#couponInput');
        const show = (text, kind) => {
            if (!msg) return;
            msg.textContent = text;
            msg.className = 'field-msg' + (kind ? ' is-' + kind : '');
        };
        if (!code) return show('Please enter a discount code.', 'error');
        if (!RULES.COUPONS[code]) {
            if (input) input.classList.add('is-invalid');
            return show('That code is not valid.', 'error');
        }
        if (input) input.classList.remove('is-invalid');
        state.coupon = code;
        saveCoupon();
        show(`Code ${code} applied: ${RULES.COUPONS[code] * 100}% off.`, 'success');
        renderCart();
        toast(`Code ${code} applied`);
    }

    function initCart() {
        const list = $('#cartItems');
        if (!list) return;

        // Delegated: quantity / remove inside the drawer
        list.addEventListener('click', (e) => {
            const q = e.target.closest('[data-cart-qty]');
            if (q) return changeQty(q.dataset.key, Number(q.dataset.cartQty));
            const r = e.target.closest('[data-cart-remove]');
            if (r) return removeFromCart(r.dataset.key);
        });

        // Close links inside the empty state
        list.addEventListener('click', (e) => {
            if (e.target.closest('[data-close-cart]')) closeCart();
        });

        const couponForm = $('#couponForm');
        if (couponForm) {
            couponForm.addEventListener('submit', (e) => {
                e.preventDefault();
                applyCoupon($('#couponInput').value);
            });
        }
        const couponInput = $('#couponInput');
        if (couponInput) couponInput.addEventListener('input', () => couponInput.classList.remove('is-invalid'));

        renderCart();
    }

    // PART 3 END

    /* =======================================================
       15. CART DRAWER & CHECKOUT SUMMARY
       ======================================================= */
    function openCart() {
        const drawer = $('#cartDrawer');
        const overlay = $('#cartOverlay');
        if (!drawer || !overlay) return;
        lastTrigger = document.activeElement;
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('is-locked');
        setTimeout(() => {
            const first = drawer.querySelector('button, a[href], input');
            if (first) first.focus();
        }, 80);
    }
    function closeCart() {
        const drawer = $('#cartDrawer');
        const overlay = $('#cartOverlay');
        if (!drawer || !overlay) return;
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        if (!$$('.modal.is-open, .search.is-open, .mobile-menu.is-open').length) {
            document.body.classList.remove('is-locked');
        }
        if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    }

    function openCheckout() {
        if (state.cart.length === 0) return toast('Your cart is empty', 'error');
        const t = computeTotals();
        const body = $('#checkoutBody');
        const modal = $('#checkoutModal');
        if (!body || !modal) return;

        const lines = state.cart.map((item) => {
            const p = PRODUCT_BY_ID[item.id];
            return `<div class="checkout__line"><span>${escapeHTML(p.name)}${item.option ? ' &middot; ' + escapeHTML(item.option) : ''} &times; ${item.qty}</span><span>${fmt(p.price * item.qty)}</span></div>`;
        }).join('');

        body.innerHTML = `
      <h2 id="coTitle">Order Summary</h2>
      <p style="color:var(--c-muted);margin:0">Review your pieces before secure checkout.</p>
      <div class="checkout__lines">
        ${lines}
        <div class="checkout__line"><span>Subtotal</span><span>${fmt(t.subtotal)}</span></div>
        ${state.coupon ? `<div class="checkout__line" style="color:var(--c-success)"><span>Discount (${state.coupon})</span><span>-${fmt(t.discount)}</span></div>` : ''}
        <div class="checkout__line"><span>Shipping</span><span>${t.shipping === 0 ? 'Free' : fmt(t.shipping)}</span></div>
        <div class="checkout__line"><span>Tax (8%)</span><span>${fmt(t.tax)}</span></div>
        <div class="checkout__line checkout__line--total"><span>Order Total</span><span>${fmt(t.total)}</span></div>
      </div>
      <button class="btn btn--solid btn--block" type="button" data-place-order>Place Order</button>
      <p class="cart__note">This is a demo summary. No payment is taken.</p>`;

        // Close the cart drawer first, then show the summary modal
        closeCart();
        setTimeout(() => openModal(modal), 300);
    }

    function initCartDrawer() {
        const openBtn = $('#cartBtn');
        const overlay = $('#cartOverlay');
        const drawer = $('#cartDrawer');
        if (!openBtn || !drawer) return;

        openBtn.addEventListener('click', openCart);
        $$('[data-close-cart]', drawer).forEach((b) => b.addEventListener('click', closeCart));
        if (overlay) overlay.addEventListener('click', closeCart);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeCart();
        });

        const checkoutBtn = $('#checkoutBtn');
        if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);

        // Checkout modal controls
        const coModal = $('#checkoutModal');
        if (coModal) {
            $$('[data-close-checkout]', coModal).forEach((b) => b.addEventListener('click', () => closeModal(coModal)));
            coModal.addEventListener('click', (e) => { if (e.target === coModal) closeModal(coModal); });
            coModal.addEventListener('click', (e) => {
                if (e.target.closest('[data-place-order]')) {
                    closeModal(coModal);
                    toast('Thank you! Your order summary was confirmed.');
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && coModal.classList.contains('is-open')) closeModal(coModal);
            });
        }
    }

    /* =======================================================
       16. WISHLIST (saved in localStorage)
       ======================================================= */
    function toggleWishlist(id) {
        const p = PRODUCT_BY_ID[id];
        if (!p) return;
        const index = state.wishlist.indexOf(id);
        if (index > -1) {
            state.wishlist.splice(index, 1);
            toast(`Removed from wishlist: ${p.name}`, 'error');
        } else {
            state.wishlist.push(id);
            toast(`Saved to wishlist: ${p.name}`);
        }
        saveWishlist();
        renderWishlistCount();
        // Update every visible button for this product without re-rendering the grid
        $$(`[data-action="wish"][data-id="${id}"]`).forEach((btn) => {
            const active = state.wishlist.includes(id);
            btn.classList.toggle('is-active', active && btn.classList.contains('product__wish'));
            if (btn.classList.contains('product__wish')) btn.setAttribute('aria-pressed', String(active));
        });
    }

    function renderWishlistCount() {
        const n = state.wishlist.length;
        setText('#wishlistCount', n);
        const btn = $('#wishlistBtn');
        if (btn) btn.setAttribute('aria-label', `Wishlist, ${n} ${n === 1 ? 'item' : 'items'}`);
        bumpBadge('#wishlistCount');
    }

    function initWishlist() {
        // Wishlist header icon: scroll to the shop and show a summary toast
        const btn = $('#wishlistBtn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const n = state.wishlist.length;
                toast(n ? `You have ${n} saved ${n === 1 ? 'piece' : 'pieces'}` : 'Your wishlist is empty');
                document.getElementById('shop').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        }
        renderWishlistCount();
    }

    /* =======================================================
       Product grid & quick view delegation
       ======================================================= */
    function initProductGrid() {
        const grid = $('#productGrid');
        if (!grid) return;
        grid.addEventListener('click', (e) => {
            const el = e.target.closest('[data-action]');
            if (!el) return;
            e.preventDefault(); // stop "#shop" anchor jumps from quick links
            const { action, id } = el.dataset;
            if (action === 'add') addToCart(id, 1, PRODUCT_BY_ID[id].options[0]);
            if (action === 'quick') openQuickView(id);
            if (action === 'wish') toggleWishlist(id);
        });
        // Also keep the grid in sync if wishlist changes in another tab
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEYS.wishlist || e.key === STORAGE_KEYS.cart) {
                loadState();
                renderWishlistCount();
                renderCart();
                renderProducts();
            }
        });
    }

    // PART 4 END

    /* =======================================================
       18. LIMITED EDITION COUNTDOWN (live, 7 days from first visit)
       ======================================================= */
    function initCountdown() {
        const box = $('#countdown');
        if (!box) return;
        const KEY = 'maisonAurelia.dropEnd';
        let end = Storage.get(KEY, null);
        if (!end || typeof end !== 'number') {
            end = Date.now() + 7 * 24 * 60 * 60 * 1000;
            Storage.set(KEY, end);
        }
        const els = {
            days: box.querySelector('[data-unit="days"]'),
            hours: box.querySelector('[data-unit="hours"]'),
            minutes: box.querySelector('[data-unit="minutes"]'),
            seconds: box.querySelector('[data-unit="seconds"]')
        };
        const pad = (n) => String(n).padStart(2, '0');
        let lastSecond = null;
        let timer = null; // declared before tick() so the first call can safely clear it

        function tick() {
            let diff = Math.max(0, end - Date.now());
            const d = Math.floor(diff / 86400000); diff -= d * 86400000;
            const h = Math.floor(diff / 3600000); diff -= h * 3600000;
            const m = Math.floor(diff / 60000); diff -= m * 60000;
            const s = Math.floor(diff / 1000);
            const values = { days: pad(d), hours: pad(h), minutes: pad(m), seconds: pad(s) };
            Object.keys(values).forEach((k) => {
                if (els[k].textContent !== values[k]) {
                    els[k].textContent = values[k];
                    if (!prefersReducedMotion) {
                        els[k].classList.remove('is-tick');
                        void els[k].offsetWidth;
                        els[k].classList.add('is-tick');
                    }
                }
            });
            if (s !== lastSecond) lastSecond = s;
            if (end - Date.now() <= 0) clearInterval(timer);
        }
        tick();
        timer = setInterval(tick, 1000);
    }

    /* =======================================================
       19. COUNT-UP NUMBERS (features + about stats)
       ======================================================= */
    function countUp(el) {
        if (el.dataset.counted) return; // run only once
        el.dataset.counted = '1';
        const target = Number(el.dataset.countTo);
        const suffix = el.dataset.suffix || '';
        if (Number.isNaN(target)) return;
        const duration = prefersReducedMotion ? 0 : 1600;
        const start = performance.now();
        const format = (n) => n.toLocaleString('en-US') + suffix;
        if (duration === 0) { el.textContent = format(target); return; }
        function step(now) {
            const progress = clamp((now - start) / duration, 0, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = format(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* =======================================================
       20. TESTIMONIALS CAROUSEL (auto-play, dots, swipe)
       ======================================================= */
    function initTestimonials() {
        const slides = $$('.testi__slide');
        const dots = $$('.testi__dot');
        if (slides.length === 0) return;
        let timer = null;

        function show(i) {
            const next = (i + slides.length) % slides.length;
            slides[state.testiIndex].classList.remove('is-active');
            dots[state.testiIndex].classList.remove('is-active');
            dots[state.testiIndex].removeAttribute('aria-current');
            state.testiIndex = next;
            slides[next].classList.add('is-active');
            dots[next].classList.add('is-active');
            dots[next].setAttribute('aria-current', 'true');
        }
        function restart() {
            clearInterval(timer);
            if (!prefersReducedMotion) timer = setInterval(() => show(state.testiIndex + 1), 5500);
        }
        dots.forEach((d, i) => d.addEventListener('click', () => { show(i); restart(); }));

        const box = $('#testimonials');
        if (box) {
            box.addEventListener('mouseenter', () => clearInterval(timer));
            box.addEventListener('mouseleave', restart);
            let tx = null;
            box.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
            box.addEventListener('touchend', (e) => {
                if (tx === null) return;
                const dx = e.changedTouches[0].clientX - tx;
                if (Math.abs(dx) > 40) { show(state.testiIndex + (dx < 0 ? 1 : -1)); restart(); }
                tx = null;
            });
        }
        restart();
    }

    /* =======================================================
       21. NEWSLETTER & CONTACT FORMS (validation + toast)
       ======================================================= */
    // Simple, practical email check
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setFieldMsg(el, text, kind) {
        if (!el) return;
        el.textContent = text;
        el.className = 'field-msg' + (kind ? ' is-' + kind : '');
    }

    function initForms() {
        const news = $('#newsletterForm');
        if (news) {
            news.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = $('#newsEmail', news);
                const value = input.value.trim();
                const msg = $('#newsMsg');
                if (!EMAIL_RE.test(value)) {
                    input.classList.add('is-invalid');
                    input.setAttribute('aria-invalid', 'true');
                    setFieldMsg(msg, 'Please enter a valid email address.', 'error');
                    input.focus();
                    return;
                }
                input.classList.remove('is-invalid');
                input.removeAttribute('aria-invalid');
                setFieldMsg(msg, 'Thank you for subscribing. Welcome to the Aurelia Letter.', 'success');
                toast('Subscribed to the Aurelia Letter');
                news.reset();
            });
            $('#newsEmail', news).addEventListener('input', (e) => {
                e.target.classList.remove('is-invalid');
            });
        }

        const contact = $('#contactForm');
        if (contact) {
            contact.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = contact.elements.name.value.trim();
                const email = contact.elements.email.value.trim();
                const message = contact.elements.message.value.trim();
                const msg = $('#contactMsg');
                if (!name || !EMAIL_RE.test(email) || message.length < 10) {
                    setFieldMsg(msg, 'Please complete all fields with a valid email (message: 10+ characters).', 'error');
                    return;
                }
                setFieldMsg(msg, 'Thank you. A concierge will reply within one business day.', 'success');
                toast('Message sent to our concierge');
                contact.reset();
            });
        }
    }

    /* =======================================================
       22. SCROLL REVEAL, PARALLAX, BACK TO TOP
       ======================================================= */
    let revealObserver = null;

    function initReveal() {
        const items = $$('.reveal, .reveal-left, .reveal-zoom');
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-visible'));
            return;
        }
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                    // Count-up numbers start when their block appears
                    $$('[data-count-to]', entry.target).forEach((n) => {
                        if (!n.dataset.counted) { n.dataset.counted = '1'; countUp(n); }
                    });
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        items.forEach((el) => observeReveal(el));
        // Count-up for stat blocks that are not inside a reveal element
        const stats = $$('.stat-row [data-count-to]');
        const statObs = new IntersectionObserver((entries, obs) => {
            entries.forEach((en) => {
                if (en.isIntersecting) { countUp(en.target); obs.unobserve(en.target); }
            });
        }, { threshold: 0.6 });
        stats.forEach((s) => statObs.observe(s));
    }

    function observeReveal(el) {
        if (revealObserver && !el.classList.contains('is-visible')) revealObserver.observe(el);
        else if (!revealObserver) el.classList.add('is-visible');
    }

    // Called after loader and after every dynamic render
    function revealInView() {
        $$('.reveal, .reveal-left, .reveal-zoom').forEach((el) => {
            if (!el.classList.contains('is-visible')) observeReveal(el);
        });
    }

    function initParallax() {
        const bg = $('[data-parallax]');
        if (!bg || prefersReducedMotion) return;
        const section = bg.closest('section');
        let ticking = false;
        function update() {
            ticking = false;
            const rect = section.getBoundingClientRect();
            const vh = window.innerHeight;
            if (rect.bottom < 0 || rect.top > vh) return;
            // Progress 0 (entering) → 1 (leaving); shift background up to 12% of its height
            const progress = (vh - rect.top) / (vh + rect.height);
            const shift = (progress - 0.5) * 16; // percent
            bg.style.transform = `translate3d(0, ${shift.toFixed(2)}%, 0)`;
        }
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }

    // Thin gold progress bar at the top that fills as the user scrolls
    function initScrollProgress() {
        const bar = $('#scrollProgress');
        if (!bar) return;
        let ticking = false;
        const update = () => {
            ticking = false;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
            bar.style.transform = `scaleX(${ratio})`;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    function initBackToTop() {
        const btn = $('#toTop');
        if (!btn) return;
        const onScroll = () => btn.classList.toggle('is-visible', window.scrollY > 600);
        window.addEventListener('scroll', onScroll, { passive: true });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
        onScroll();
    }

    // PART 5 END

    /* =======================================================
       23. BUTTON RIPPLE (click feedback)
       ======================================================= */
    function initRipple() {
        if (prefersReducedMotion) return;
        document.addEventListener('pointerdown', (e) => {
            const btn = e.target.closest('.btn');
            if (!btn || btn.disabled) return;
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.4;
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 650);
        });
    }

    /* =======================================================
       24. CUSTOM CURSOR (desktop with a fine pointer only)
       ======================================================= */
    function initCursor() {
        const cursor = $('#cursor');
        if (!cursor) return;
        const canUse = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion;
        if (!canUse) return; // CSS also hides it on touch devices

        document.body.classList.add('has-cursor');
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        let cx = x, cy = y;

        document.addEventListener('pointermove', (e) => {
            x = e.clientX; y = e.clientY;
            cursor.classList.remove('is-hidden');
        });
        // Smooth follow using requestAnimationFrame
        (function loop() {
            cx += (x - cx) * 0.25;
            cy += (y - cy) * 0.25;
            cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(loop);
        })();

        // Grow over interactive elements
        const hoverSel = 'a, button, input, select, textarea, label, .product, .cat, .chip';
        document.addEventListener('pointerover', (e) => {
            cursor.classList.toggle('is-hover', !!e.target.closest(hoverSel));
        });
        document.addEventListener('pointerout', (e) => {
            if (!e.relatedTarget) cursor.classList.add('is-hidden');
        });
        document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));
    }

    /* =======================================================
       21b. GALLERY — keyboard users get the same hover overlay on focus (CSS).
       Products + hover images are handled in CSS / product rendering.
       ======================================================= */

    /* =======================================================
       25. INIT
       ======================================================= */
    function init() {
        loadState();

        // Dynamic content first
        renderProducts();
        initCategoryCounts();
        initMarquee();
        initHero();
        initTestimonials();

        // Behaviour
        initAnnouncement();
        initHeader();
        initMobileMenu();
        initSearch();
        initFilters();
        initQuickView();
        initCart();
        initCartDrawer();
        initWishlist();
        initProductGrid();
        initForms();
        initCountdown();
        initParallax();
        initBackToTop();
        initScrollProgress();
        initRipple();
        initCursor();

        // Animations last, so observers see the final DOM
        initReveal();
        initLoader();

        // Footer year
        setText('#year', new Date().getFullYear());
    }

    // Run once the DOM is ready (script is loaded with "defer", so it already is)
    try {
        init();
    } catch (err) {
        // Never leave the page broken: log once for developers, keep content visible
        if (window.console && console.error) console.error('Maison Aurelia init failed:', err);
        document.querySelectorAll('.reveal, .reveal-left, .reveal-zoom').forEach((el) => el.classList.add('is-visible'));
        const loader = document.getElementById('loader');
        if (loader) loader.remove();
    }
})();