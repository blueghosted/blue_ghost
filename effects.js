(function () {
  const els = document.querySelectorAll('section, .stat-row, .feature-grid');
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });
  els.forEach(el => io.observe(el));
})();

(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const ACCENT = '0,229,255';
  const N = 55;
  const NS = 40;
  let W, H, mouse = { x: -9999, y: -9999 };
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  const pts = Array.from({ length: N }, () => ({
    x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
    r: Math.random() * 2.8 + 1.4,
  }));

  function mkSpark() {
    const angle = Math.random() * Math.PI * 2;
    const spd = Math.random() * 1.8 + 0.8;
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r: Math.random() * 0.9 + 0.3,
      life: 1.0,
      decay: Math.random() * 0.004 + 0.002,
      tail: [],
    };
  }
  const sparks = Array.from({ length: NS }, mkSpark);

  function draw() {
    ctx.clearRect(0, 0, W, H);

    sparks.forEach((s, i) => {
      s.tail.unshift({ x: s.x, y: s.y });
      if (s.tail.length > 10) s.tail.length = 10;
      s.x += s.vx; s.y += s.vy;
      s.life -= s.decay;
      if (s.life <= 0 || s.x < 0 || s.x > W || s.y < 0 || s.y > H) {
        sparks[i] = mkSpark();
        return;
      }
      for (let t = 0; t < s.tail.length; t++) {
        const a = (1 - t / s.tail.length) * s.life * 0.55;
        const tr = s.r * (1 - t / s.tail.length);
        ctx.beginPath();
        ctx.arc(s.tail[t].x, s.tail[t].y, Math.max(tr, 0.1), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT},${a})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT},${s.life * 0.85})`;
      ctx.fill();
    });

    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0) {
        const force = (120 - dist) / 120 * 0.35;
        p.vx += (dx / dist) * force; p.vy += (dy / dist) * force;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 1.2) { p.vx = p.vx / spd * 1.2; p.vy = p.vy / spd * 1.2; }
      }
    });

    const LINK = 160;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${ACCENT},${(1 - d / LINK) * 0.28})`;
          ctx.lineWidth = 0.8; ctx.stroke();
        }
      }
    }

    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT},0.75)`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

(function () {
  const h1 = document.querySelector('.header-text h1');
  if (!h1) return;
  const txt = h1.textContent.trim();
  const wrap = document.createElement('span');
  wrap.className = 'glitch-wrap';
  wrap.setAttribute('data-text', txt);
  wrap.textContent = txt;
  h1.textContent = '';
  h1.appendChild(wrap);
})();

(function () {
  document.querySelectorAll('.faq-item .faq-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

(function () {
  const page = location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.navbar a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http')) return;
    a.classList.toggle('active', href === page);
  });
})();

(function () {
  const cards = document.querySelectorAll('.stat-card');
  if (!cards.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target.querySelector('.stat-num');
      const raw = el.textContent.trim();
      const num = parseInt(raw, 10);
      if (isNaN(num) || num === 0) return;
      io.unobserve(e.target);
      let start = null;
      const dur = 900;
      function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * num);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = raw;
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  cards.forEach(c => io.observe(c));
})();

(function () {
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return;
    a.addEventListener('click', e => {
      e.preventDefault();
      document.querySelector('.frame').classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 210);
    });
  });
})();

(function () {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 60); }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

(function () {
  const labels = {
    'ecdh handshake': '// ecdh handshake',
    'double ratchet':  '// double ratchet flow',
    'ble transport':   '// ble transport model',
    'session lifecycle': '// session lifecycle',
    'architecture':    '// architecture overview',
  };
  document.querySelectorAll('pre').forEach(pre => {
    if (pre.closest('.pre-wrap')) return;
    const txt = pre.textContent.toLowerCase();
    let label = '// diagram';
    for (const [key, val] of Object.entries(labels)) {
      if (txt.includes(key)) { label = val; break; }
    }
    const wrap = document.createElement('div');
    wrap.className = 'pre-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    const bar = document.createElement('div');
    bar.className = 'pre-label';
    bar.innerHTML = `<span>${label}</span>`;
    wrap.insertBefore(bar, pre);
  });
})();
