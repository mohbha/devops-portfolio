/* enhance.js v2 (Chunks 1+2). Load AFTER script.js. Overwrites the v1 file. Idempotent; re-runs after every Barba swap. */
(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const motion = fine && !reduce && window.gsap;
    const TECH = ['AWS', 'Azure', 'Docker', 'ECS', 'CodeBuild', 'CloudFront', 'RDS', 'Python', 'Boto3', 'PowerShell', 'Prometheus', 'Grafana', 'GitHub Actions', 'Linux'];
    const HUBS = ['CloudFront', 'ALB', 'ECS', 'RDS', 'S3', 'Lambda', 'CodeBuild'];
    const add = (cls) => document.body.appendChild(Object.assign(document.createElement('div'), { className: cls }));
    const mouse = { cx: -9999, cy: -9999 };

    // Scroll progress lives on <body>, so it survives Barba swaps
    const bar = add('scroll-progress');
    const setBar = () => {
        const h = document.documentElement;
        bar.style.transform = `scaleX(${h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)})`;
    };
    addEventListener('scroll', setBar, { passive: true });

    // Cursor glow (mouse devices only)
    let glow, gx, gy;
    if (motion) {
        glow = add('cursor-glow');
        gx = gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3' });
        gy = gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3' });
        document.documentElement.addEventListener('mouseleave', () => glow.classList.remove('on'));
    }
    addEventListener('pointermove', (e) => {
        mouse.cx = e.clientX; mouse.cy = e.clientY;
        if (glow) { glow.classList.add('on'); gx(e.clientX); gy(e.clientY); }
    }, { passive: true });

    // Reduced motion: finish every GSAP animation ~instantly (script.js ignores this setting)
    if (reduce && window.gsap) gsap.globalTimeline.timeScale(100);

    // Chunk 2: living infrastructure graph. Nodes drift, packets hop node to node, the cursor repels and links.
    function network(hero) {
        const cv = document.createElement('canvas');
        cv.className = 'hero-net';
        cv.setAttribute('aria-hidden', 'true');
        hero.prepend(cv);
        const ctx = cv.getContext('2d');
        let W = 0, H = 0, nodes = [], packets = [], vignette, visible = true, spawnAt = 0;
        const D = () => (W < 700 ? 125 : 175);
        const near = (a, d) => nodes.filter((b) => b !== a && Math.hypot(a.x - b.x, a.y - b.y) < d);

        const seed = () => {
            if (W && Math.abs(hero.clientWidth - W) < 40 && Math.abs(hero.clientHeight - H) < 160) return; // ignore mobile URL-bar jitter
            const dpr = Math.min(devicePixelRatio || 1, 2);
            W = hero.clientWidth; H = hero.clientHeight;
            cv.width = W * dpr; cv.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            vignette = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.45);
            vignette.addColorStop(0, 'rgba(0,0,0,.75)'); // dims the middle so the headline stays readable
            vignette.addColorStop(1, 'rgba(0,0,0,0)');
            nodes = Array.from({ length: W < 700 ? 30 : 56 }, (_, i) => ({
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
                hub: HUBS[i] || null, hot: 0
            }));
            packets = [];
        };

        const step = (t) => {
            const d = D(), r = hero.getBoundingClientRect();
            const mx = mouse.cx - r.left, my = mouse.cy - r.top;
            ctx.clearRect(0, 0, W, H);

            for (const p of nodes) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > W) { p.vx *= -1; p.x = Math.max(0, Math.min(W, p.x)); }
                if (p.y < 0 || p.y > H) { p.vy *= -1; p.y = Math.max(0, Math.min(H, p.y)); }
                const dx = p.x - mx, dy = p.y - my, q = dx * dx + dy * dy;
                p.hot = q < 24000 ? 1 - q / 24000 : 0;
                if (p.hot && q > 1) { const k = (p.hot * 0.8) / Math.sqrt(q); p.x += dx * k; p.y += dy * k; }
            }

            ctx.lineWidth = 1;
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j], dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist < d) {
                        ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / d) * 0.16})`;
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                    }
                }
            }
            for (const p of nodes) if (p.hot) {
                ctx.strokeStyle = `rgba(229,169,59,${p.hot * 0.55})`;
                ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(p.x, p.y); ctx.stroke();
            }

            if (t > spawnAt && packets.length < 16) { // a "request" enters the graph
                spawnAt = t + 180;
                const a = nodes[(Math.random() * nodes.length) | 0], n = near(a, d);
                if (n.length) packets.push({ a, b: n[(Math.random() * n.length) | 0], t: 0, v: 0.014 + Math.random() * 0.012, hops: 0 });
            }
            packets = packets.filter((k) => {
                k.t += k.v;
                if (k.t >= 1) { // arrived: usually forward to another neighbour, up to 5 hops
                    const n = near(k.b, d).filter((x) => x !== k.a);
                    if (k.hops++ < 5 && n.length) { k.a = k.b; k.b = n[(Math.random() * n.length) | 0]; k.t = 0; } else return false;
                }
                const x = k.a.x + (k.b.x - k.a.x) * k.t, y = k.a.y + (k.b.y - k.a.y) * k.t, s = Math.max(0, k.t - 0.18);
                const tx = k.a.x + (k.b.x - k.a.x) * s, ty = k.a.y + (k.b.y - k.a.y) * s;
                const g = ctx.createLinearGradient(tx, ty, x, y);
                g.addColorStop(0, 'rgba(229,169,59,0)'); g.addColorStop(1, 'rgba(255,214,130,.95)');
                ctx.strokeStyle = g; ctx.lineWidth = 1.6;
                ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
                ctx.fillStyle = 'rgba(229,169,59,.25)'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 6.283); ctx.fill();
                ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(x, y, 2, 0, 6.283); ctx.fill();
                return true;
            });

            for (const p of nodes) {
                ctx.fillStyle = p.hub ? 'rgba(229,169,59,.95)' : `rgba(255,255,255,${0.25 + p.hot * 0.6})`;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.hub ? 3.4 : 1.6 + p.hot * 1.6, 0, 6.283); ctx.fill();
                if (p.hub) {
                    ctx.strokeStyle = 'rgba(229,169,59,.35)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.arc(p.x, p.y, 9 + Math.sin(t / 600 + p.x) * 2, 0, 6.283); ctx.stroke();
                    ctx.fillStyle = `rgba(232,230,227,${0.35 + p.hot * 0.5})`;
                    ctx.font = '500 10px "JetBrains Mono", monospace';
                    ctx.fillText(p.hub.toUpperCase(), p.x + 14, p.y + 3);
                }
            }

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
            ctx.globalCompositeOperation = 'source-over';
        };

        const loop = (t) => {
            if (!cv.isConnected) return; // page was swapped by Barba: stop quietly
            if (visible && !document.hidden) step(t);
            requestAnimationFrame(loop);
        };
        seed();
        new ResizeObserver(seed).observe(hero);
        new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);
        reduce ? step(0) : requestAnimationFrame(loop); // reduced motion = one still frame
    }

    const init = () => {
    document.querySelectorAll('[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
    document.querySelectorAll('.nav-links a.active, .mobile-nav-overlay a.active').forEach((a) => a.setAttribute('aria-current', 'page'));
        const hero = document.querySelector('.hero');
        if (hero && !document.querySelector('.marquee')) {
            const set = TECH.map((t) => `<span>${t}</span>`).join('');
            const m = document.createElement('div');
            m.className = 'marquee';
            m.setAttribute('aria-hidden', 'true');
            m.innerHTML = `<div class="marquee-track">${set}${set}</div>`;
            hero.after(m);
        }
        if (hero && !hero.querySelector('.hero-net')) network(hero);
        if (motion) document.querySelectorAll('.cta-btn, .cta-btn-outline').forEach((b) => {
            if (b._mag) return;
            b._mag = true;
            const mx = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' });
            const my = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
            b.addEventListener('pointermove', (e) => {
                const r = b.getBoundingClientRect();
                mx((e.clientX - r.left - r.width / 2) * 0.25);
                my((e.clientY - r.top - r.height / 2) * 0.35);
            });
            b.addEventListener('pointerleave', () => { mx(0); my(0); });
        });
        setBar();
    };

    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
    if (window.barba) barba.hooks.after(() => setTimeout(init, 60));
})();