/* ============================================================
   MOHAN JHA — Portfolio Animation Engine v3.1
   Clean, Resilient, Dependency-Free Text Splitting
   Powered by GSAP, ScrollTrigger, Lenis & Barba.js
   ============================================================ */

/* ------------------------------------------------------------
   1. LENIS SMOOTH SCROLL
   ------------------------------------------------------------ */
let lenis = null;

function initLenis() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // chunk 5: respect reduced motion
  if (typeof Lenis === 'undefined') return;
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  } catch (err) {
    console.warn('Lenis initialization skipped:', err);
  }
}

/* ------------------------------------------------------------
   2. GSAP PLUGIN REGISTRATION
   ------------------------------------------------------------ */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------
   3. DEPENDENCY-FREE WORD SPLITTER
   Splits text into animated inline-block word spans while
   preserving nested HTML tags like <span class="text-accent">
   ------------------------------------------------------------ */
function splitTextWords(element) {
  if (!element || element._splitDone) return element ? Array.from(element.querySelectorAll('.split-word')) : [];
  element._splitDone = true;

  const words = [];

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text.trim()) return;

      const parts = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();

      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'split-word';
          span.style.display = 'inline-block';
          span.textContent = part;
          frag.appendChild(span);
          words.push(span);
        }
      });

      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Don't split <svg>, <script>, <style>
      const tag = node.tagName.toLowerCase();
      if (tag === 'svg' || tag === 'script' || tag === 'style') return;
      Array.from(node.childNodes).forEach(walk);
    }
  }

  Array.from(element.childNodes).forEach(walk);
  return words;
}

/* ------------------------------------------------------------
   4. HERO ENTRANCE TIMELINE
   ------------------------------------------------------------ */
function initHeroAnimation() {
  if (typeof gsap === 'undefined') return;

  const heroHeading = document.querySelector('.hero h1');
  const heroStatus = document.querySelector('.hero-status');
  const heroParagraph = document.querySelector('.hero p');
  const heroButtons = document.querySelector('.hero-buttons');

  if (!heroHeading) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (heroStatus) {
    tl.fromTo(heroStatus, 
      { opacity: 0, y: -15 }, 
      { opacity: 1, y: 0, duration: 0.6 }, 
      0.1
    );
  }

  const words = splitTextWords(heroHeading);
  if (words.length) {
    tl.fromTo(words, 
      { opacity: 0, y: 35 }, 
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.05 }, 
      0.2
    );
  } else {
    tl.fromTo(heroHeading, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.7 }, 
      0.2
    );
  }

  if (heroParagraph) {
    tl.fromTo(heroParagraph, 
      { opacity: 0, y: 25 }, 
      { opacity: 1, y: 0, duration: 0.6 }, 
      0.5
    );
  }

  if (heroButtons) {
    tl.fromTo(heroButtons, 
      { opacity: 0, y: 25 }, 
      { opacity: 1, y: 0, duration: 0.6 }, 
      0.7
    );
  }
}

/* ------------------------------------------------------------
   5. SCROLL REVEALS (GSAP ScrollTrigger with fromTo)
   ------------------------------------------------------------ */
function initScrollReveals() {
  if (typeof gsap === 'undefined') return;

  const elements = document.querySelectorAll('[data-scroll]');
  if (!elements.length) return;

  elements.forEach((el) => {
    // Skip hero elements; they are already animated on page load by hero timeline
    if (el.closest('.hero')) return;

    const direction = el.getAttribute('data-scroll') || 'up';
    const delay = parseFloat(el.getAttribute('data-scroll-delay') || 0) / 1000;

    let startX = 0;
    let startY = 0;
    let startScale = 1;

    switch (direction) {
      case 'up': startY = 35; break;
      case 'down': startY = -35; break;
      case 'left': startX = -35; break;
      case 'right': startX = 35; break;
      case 'scale': startScale = 0.95; break;
      case 'fade': break;
      default: startY = 35;
    }

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.fromTo(el, 
        {
          opacity: 0,
          x: startX,
          y: startY,
          scale: startScale
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: 'power3.out',
          delay: delay,
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            toggleActions: 'play none none none'
          }
        }
      );
    } else {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
  });
}

/* ------------------------------------------------------------
   6. STATS COUNTER ANIMATION
   ------------------------------------------------------------ */
function initCounterAnimation() {
  if (typeof gsap === 'undefined') return;

  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  counters.forEach((el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const counter = { value: 0 };

    const tweenVars = {
      value: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = Math.floor(counter.value).toLocaleString() + suffix;
      }
    };

    if (typeof ScrollTrigger !== 'undefined') {
      tweenVars.scrollTrigger = {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none'
      };
    }

    gsap.to(counter, tweenVars);
  });
}

/* ------------------------------------------------------------
   7. PAGE HEADER TEXT REVEAL
   ------------------------------------------------------------ */
function initPageHeaderReveal() {
  if (typeof gsap === 'undefined') return;

  const headings = document.querySelectorAll('.project-header h1, .journey-page-header h1');
  if (!headings.length) return;

  headings.forEach((heading) => {
    const words = splitTextWords(heading);
    if (words.length) {
      gsap.fromTo(words, 
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out', delay: 0.15 }
      );
    } else {
      gsap.fromTo(heading,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.15 }
      );
    }
  });
}

/* ------------------------------------------------------------
   8. TILT CARDS (GSAP 3D perspective)
   ------------------------------------------------------------ */
function initTiltCards() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
  if (typeof gsap === 'undefined') return;

  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    if (card._tiltDone) return;
    card._tiltDone = true;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  });
}

/* ------------------------------------------------------------
   9. SMOOTH HOVER MOUSE TRACKING
   Updates CSS vars --mouse-x and --mouse-y for subtle radial highlight
   ------------------------------------------------------------ */
function initSmoothHoverCards() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const cards = document.querySelectorAll('.card, .project-detail-card, .stat-item, .skill-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    if (card._hoverDone) return;
    card._hoverDone = true;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ------------------------------------------------------------
   10. NAVIGATION SCROLL, ACTIVE & HAMBURGER
   ------------------------------------------------------------ */
function initNavScrollEffect() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function initNavActiveState() {
  const path = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a, .mobile-nav-overlay a').forEach((link) => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function initHamburgerMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav-overlay');
  if (!hamburger || !mobileNav) return;

  const newHamburger = hamburger.cloneNode(true);
  hamburger.parentNode.replaceChild(newHamburger, hamburger);

  newHamburger.addEventListener('click', () => {
    const isActive = newHamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    newHamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    document.body.classList.toggle('nav-open', isActive);
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      newHamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      newHamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    });
  });
}

/* ------------------------------------------------------------
   11. BARBA.JS PAGE TRANSITIONS
   ------------------------------------------------------------ */
function initBarba() {
  if (typeof barba === 'undefined' || window.location.protocol === 'file:') return;

  try {
    barba.init({
      timeout: 5000,
      transitions: [{
        name: 'page-transition',
        leave(data) {
          if (typeof gsap !== 'undefined') {
            return gsap.to(data.current.container, {
              opacity: 0,
              y: -10,
              duration: 0.3,
              ease: 'power2.inOut'
            });
          }
        },
        enter(data) {
          if (lenis) {
            lenis.scrollTo(0, { immediate: true });
          } else {
            window.scrollTo(0, 0);
          }
          if (typeof gsap !== 'undefined') {
            return gsap.fromTo(data.next.container, 
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.3, ease: 'power2.inOut' }
            );
          }
        },
        after() {
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.getAll().forEach((t) => t.kill());
          }
          initPage();
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }
      }]
    });
  } catch (err) {
    console.warn('Barba init failed:', err);
  }
}

/* ------------------------------------------------------------
   12. MASTER PAGE INIT
   ------------------------------------------------------------ */
function initPage() {
  initHeroAnimation();
  initScrollReveals();
  initCounterAnimation();
  initPageHeaderReveal();
  initTiltCards();
  initSmoothHoverCards();
  initNavScrollEffect();
  initNavActiveState();
  initHamburgerMenu();
}

// Start everything once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initPage();
    initBarba();
  });
} else {
  initLenis();
  initPage();
  initBarba();
}
