/* ============================================================
   MOHAN JHA — Ultra-Premium Animation Engine v2.0
   Pure vanilla JS. Zero dependencies. Futuristic sci-fi effects.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initGradientMesh();
  initCursorGlow();
  initScrollReveal();
  initTypingEffect();
  initPageTransitions();
  initHamburgerMenu();
  initCounterAnimation();
  initTiltCards();
  initNavActiveState();
  initNavScrollEffect();
  initMagneticElements();
  initSmoothHoverCards();
  initTextReveal();
});


/* ============================================================
   1. PARTICLE NETWORK — Enhanced with gradient particles,
      smarter connections, depth layers & mouse interaction
   ============================================================ */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = -1000, mouseY = -1000;
  const particles = [];
  const PARTICLE_COUNT = Math.min(90, Math.floor(window.innerWidth / 15));
  const CONNECTION_DIST = 160;
  const MOUSE_RADIUS = 220;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 0.5;
      this.baseAlpha = Math.random() * 0.4 + 0.08;
      // Depth layer (0 = far, 1 = close)
      this.depth = Math.random() * 0.6 + 0.4;
      // Color variation
      this.hue = 210 + Math.random() * 40; // Blue to cyan range
      this.saturation = 80 + Math.random() * 20;
    }

    update() {
      this.x += this.vx * this.depth;
      this.y += this.vy * this.depth;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion with easing
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        const easedForce = force * force; // Quadratic easing
        this.x += dx * easedForce * 0.015;
        this.y += dy * easedForce * 0.015;
      }
    }

    draw() {
      const alpha = this.baseAlpha * this.depth;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * this.depth, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, 65%, ${alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw inter-particle connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12 *
            Math.min(particles[i].depth, particles[j].depth);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `hsla(220, 90%, 65%, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Mouse connections with gradient
    particles.forEach(p => {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const alpha = (1 - dist / MOUSE_RADIUS) * 0.25;
        const gradient = ctx.createLinearGradient(p.x, p.y, mouseX, mouseY);
        gradient.addColorStop(0, `hsla(220, 90%, 65%, ${alpha})`);
        gradient.addColorStop(1, `hsla(280, 80%, 65%, ${alpha})`);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    });

    requestAnimationFrame(animate);
  }
  animate();
}


/* ============================================================
   2. GRADIENT MESH — Animated aurora-like background blobs
   ============================================================ */
function initGradientMesh() {
  const mesh = document.querySelector('.gradient-mesh');
  if (!mesh) return;
  // The animation is handled by CSS @keyframes meshFloat
  // This function adds subtle mouse-reactive shifting
  let rafId;
  document.addEventListener('mousemove', (e) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      mesh.style.transform = `translate(${x}px, ${y}px)`;
      rafId = null;
    });
  });
}


/* ============================================================
   3. CURSOR GLOW — Enhanced with color shift & smooth tracking
   ============================================================ */
function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  // Only enable on non-touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    glow.style.display = 'none';
    return;
  }

  let targetX = -1000, targetY = -1000;
  let currentX = -1000, currentY = -1000;

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    glow.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });

  // Smooth lerp tracking
  function update() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(update);
  }
  update();
}


/* ============================================================
   4. SCROLL REVEAL — IntersectionObserver with staggered delays
   ============================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll('[data-scroll]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.getAttribute('data-scroll-delay') || 0;
        setTimeout(() => {
          el.classList.add('revealed');
        }, parseInt(delay));
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}


/* ============================================================
   5. TYPING EFFECT — Enhanced with realistic timing
   ============================================================ */
function initTypingEffect() {
  const el = document.querySelector('.typing-text');
  if (!el) return;

  const html = el.getAttribute('data-text');
  if (!html) return;

  el.innerHTML = '';
  el.style.visibility = 'visible';

  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.textContent = '|';
  el.appendChild(cursor);

  const segments = parseTextSegments(html);

  function parseTextSegments(html) {
    const segs = [];
    let current = '';
    let inTag = false;
    let tag = '';

    for (let c = 0; c < html.length; c++) {
      if (html[c] === '<') {
        if (current) segs.push({ type: 'text', value: current });
        current = '';
        inTag = true;
        tag = '<';
      } else if (html[c] === '>' && inTag) {
        tag += '>';
        inTag = false;
        segs.push({ type: 'tag', value: tag });
        tag = '';
      } else if (inTag) {
        tag += html[c];
      } else {
        current += html[c];
      }
    }
    if (current) segs.push({ type: 'text', value: current });
    return segs;
  }

  let segIndex = 0;
  let charIndex = 0;
  let output = '';

  function typeNext() {
    if (segIndex >= segments.length) {
      cursor.classList.add('blink');
      return;
    }

    const seg = segments[segIndex];
    if (seg.type === 'tag') {
      output += seg.value;
      el.innerHTML = output;
      el.appendChild(cursor);
      segIndex++;
      setTimeout(typeNext, 0);
    } else {
      if (charIndex < seg.value.length) {
        const char = seg.value[charIndex];
        output += char;
        el.innerHTML = output;
        el.appendChild(cursor);
        charIndex++;

        // Realistic timing: pause longer after spaces and punctuation
        let delay = 45 + Math.random() * 25;
        if (char === ' ') delay = 30 + Math.random() * 20;
        if ('.!?'.includes(char)) delay = 200 + Math.random() * 100;
        if (',;:'.includes(char)) delay = 100 + Math.random() * 50;

        setTimeout(typeNext, delay);
      } else {
        charIndex = 0;
        segIndex++;
        setTimeout(typeNext, 0);
      }
    }
  }

  // Start after a brief delay
  setTimeout(typeNext, 700);
}


/* ============================================================
   6. PAGE TRANSITIONS — Cinematic fade with timing
   ============================================================ */
function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Fade in on page load
  requestAnimationFrame(() => {
    overlay.classList.add('loaded');
  });

  // Intercept internal links
  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('http') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('#') ||
        link.getAttribute('target') === '_blank') return;
    if (href.endsWith('.pdf')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.remove('loaded');
      overlay.classList.add('leaving');
      setTimeout(() => {
        window.location.href = href;
      }, 450);
    });
  });
}


/* ============================================================
   7. HAMBURGER MENU — Enhanced with stagger reveal
   ============================================================ */
function initHamburgerMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav-overlay');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.classList.toggle('nav-open');

    // Stagger mobile nav link animations
    if (mobileNav.classList.contains('active')) {
      const links = mobileNav.querySelectorAll('a');
      links.forEach((link, i) => {
        link.style.transitionDelay = `${i * 60 + 100}ms`;
        link.style.opacity = '1';
        link.style.transform = 'translateY(0)';
      });
    }
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.classList.remove('nav-open');
    });
  });
}


/* ============================================================
   8. COUNTER ANIMATION — Smooth count-up with eased timing
   ============================================================ */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 2200;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out quintic for smoother deceleration
          const eased = 1 - Math.pow(1 - progress, 5);
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}


/* ============================================================
   9. TILT CARDS — Refined 3D tilt with light reflection
   ============================================================ */
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    // Only on non-touch devices
    if ('ontouchstart' in window) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;

      // Light reflection effect
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      card.style.background = `
        radial-gradient(circle at ${percentX}% ${percentY}%, rgba(41, 151, 255, 0.06) 0%, transparent 50%),
        rgba(255, 255, 255, 0.03)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      card.style.background = '';
      card.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), background 0.6s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}


/* ============================================================
   10. NAV ACTIVE STATE — Auto-detect from URL
   ============================================================ */
function initNavActiveState() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav-overlay a').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}


/* ============================================================
   11. NAV SCROLL EFFECT — Glass intensifies on scroll
   ============================================================ */
function initNavScrollEffect() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}


/* ============================================================
   12. MAGNETIC ELEMENTS — Subtle pull toward cursor
   ============================================================ */
function initMagneticElements() {
  if ('ontouchstart' in window) return;

  const elements = document.querySelectorAll('.cta-btn, .cta-btn-outline, .socials a');

  elements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.15;
      const deltaY = (e.clientY - centerY) * 0.15;

      el.style.transform = `translate(${deltaX}px, ${deltaY}px) translateY(-3px) scale(1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    });

    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.1s ease';
    });
  });
}


/* ============================================================
   13. SMOOTH HOVER CARDS — Border glow follows cursor
   ============================================================ */
function initSmoothHoverCards() {
  if ('ontouchstart' in window) return;

  const cards = document.querySelectorAll('.card, .project-detail-card, .stat-item, .skill-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Add CSS for the glow effect
  const style = document.createElement('style');
  style.textContent = `
    .card::after,
    .project-detail-card::after,
    .stat-item::after,
    .skill-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background: radial-gradient(
        300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(41, 151, 255, 0.06) 0%,
        transparent 100%
      );
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
      z-index: 0;
    }
    .card:hover::after,
    .project-detail-card:hover::after,
    .stat-item:hover::after,
    .skill-card:hover::after {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
}


/* ============================================================
   14. TEXT REVEAL — Fade-up effect for section headings
   ============================================================ */
function initTextReveal() {
  const headings = document.querySelectorAll('.project-header h1, .journey-page-header h1');

  headings.forEach(heading => {
    // Split text into spans for individual letter animation
    const text = heading.textContent;
    heading.innerHTML = '';
    heading.style.opacity = '1';

    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.cssText = `
        display: inline-block;
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.5s ease ${i * 30}ms, transform 0.5s cubic-bezier(0.25, 1, 0.5, 1) ${i * 30}ms;
      `;
      heading.appendChild(span);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          heading.querySelectorAll('span').forEach(span => {
            span.style.opacity = '1';
            span.style.transform = 'translateY(0)';
          });
          observer.unobserve(heading);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(heading);
  });
}
