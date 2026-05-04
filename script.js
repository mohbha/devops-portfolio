/* ============================================================
   MOHAN JHA — Portfolio Animation Engine
   Pure vanilla JS. No dependencies.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initCursorGlow();
  initScrollReveal();
  initTypingEffect();
  initPageTransitions();
  initHamburgerMenu();
  initCounterAnimation();
  initTiltCards();
  initNavActiveState();
});

/* ============================================================
   1. PARTICLE NETWORK BACKGROUND
   Floating particles with connecting lines + mouse reactivity
   ============================================================ */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = -1000, mouseY = -1000;
  const particles = [];
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 150;
  const MOUSE_RADIUS = 200;

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

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 0.5;
      this.baseAlpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        this.x += dx * force * 0.02;
        this.y += dy * force * 0.02;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(41, 151, 255, ${this.baseAlpha})`;
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

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(41, 151, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Mouse connections
    particles.forEach(p => {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const alpha = (1 - dist / MOUSE_RADIUS) * 0.3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = `rgba(157, 66, 245, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });

    requestAnimationFrame(animate);
  }
  animate();
}


/* ============================================================
   2. CURSOR GLOW — Radial light that follows the mouse
   ============================================================ */
function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  // Only enable on non-touch devices
  if ('ontouchstart' in window) {
    glow.style.display = 'none';
    return;
  }

  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
}


/* ============================================================
   3. SCROLL REVEAL — IntersectionObserver-based
   Elements with data-scroll attribute animate in on scroll
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
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}


/* ============================================================
   4. TYPING EFFECT — Types out the hero headline
   ============================================================ */
function initTypingEffect() {
  const el = document.querySelector('.typing-text');
  if (!el) return;

  const html = el.getAttribute('data-text');
  if (!html) return;

  el.innerHTML = '';
  el.style.visibility = 'visible';

  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.textContent = '|';
  el.appendChild(cursor);

  // We'll type plain text but handle <br> and <span> tags
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
        output += seg.value[charIndex];
        el.innerHTML = output;
        el.appendChild(cursor);
        charIndex++;
        setTimeout(typeNext, 50 + Math.random() * 30);
      } else {
        charIndex = 0;
        segIndex++;
        setTimeout(typeNext, 0);
      }
    }
  }

  // Start after a brief delay
  setTimeout(typeNext, 600);
}


/* ============================================================
   5. PAGE TRANSITIONS — Smooth fade overlay between pages
   ============================================================ */
function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Fade in on page load
  overlay.classList.add('loaded');

  // Intercept internal links
  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || link.getAttribute('target') === '_blank') return;
    if (href.endsWith('.pdf')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.remove('loaded');
      overlay.classList.add('leaving');
      setTimeout(() => {
        window.location.href = href;
      }, 400);
    });
  });
}


/* ============================================================
   6. HAMBURGER MENU — Mobile navigation
   ============================================================ */
function initHamburgerMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav-overlay');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.classList.toggle('nav-open');
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
   7. COUNTER ANIMATION — Numbers count up on scroll
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
        const duration = 2000;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
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
   8. TILT CARDS — Subtle 3D tilt on hover
   ============================================================ */
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}


/* ============================================================
   9. NAV ACTIVE STATE — Auto-detect from URL
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
