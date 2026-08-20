/**
 * demo-hub.js - Demo Hub Landing Page Controller (pages/demo/index.html)
 * Handles: i18n toggle (data-zh/data-en), dark/light theme, particle background
 * Independent from main-site scripts; hooks used (see demo-hub.css header):
 *   #d-particle-canvas #d-lang-toggle #d-theme-toggle
 */
(function () {
  'use strict';

  /* ========== State ========== */
  let lang = 'zh';

  /* ========== DOM Refs ========== */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ========== Theme ========== */
  function initTheme() {
    const saved = localStorage.getItem('d-theme');
    if (saved === 'dark') {
      document.body.classList.add('dark-mode');
    }
    updateThemeIcon();
  }

  function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('d-theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
    if (particleCtx) initParticles();
  }

  function updateThemeIcon() {
    const btn = $('#d-theme-toggle');
    if (!btn) return;
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = isDark
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }

  /* ========== Language (data-zh / data-en driven) ========== */
  function initLang() {
    const saved = localStorage.getItem('d-lang');
    if (saved === 'en') {
      lang = 'en';
    }
    applyLang();
  }

  function toggleLang() {
    lang = lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('d-lang', lang);
    applyLang();
  }

  function applyLang() {
    $$('[data-zh][data-en]').forEach((el) => {
      const value = el.getAttribute('data-' + lang);
      if (value !== null) el.textContent = value;
    });
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.body.classList.remove('zh', 'en');
    document.body.classList.add(lang);
  }

  /* ========== Particle Background ========== */
  let particleCtx = null;
  let particles = [];
  let animFrameId = null;

  function initParticles() {
    const canvas = $('#d-particle-canvas');
    if (!canvas) return;

    if (animFrameId) cancelAnimationFrame(animFrameId);

    const ctx = canvas.getContext('2d');
    particleCtx = ctx;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const isDark = document.body.classList.contains('dark-mode');
    const count = Math.min(Math.floor(window.innerWidth / 18), 60);

    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.8,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = isDark ? '126, 180, 230' : '62, 109, 156';

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${color}, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animFrameId = requestAnimationFrame(draw);
    }

    draw();
  }

  /* ========== Init ========== */
  function init() {
    initTheme();
    initLang();
    initParticles();

    const themeBtn = $('#d-theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    const langBtn = $('#d-lang-toggle');
    if (langBtn) langBtn.addEventListener('click', toggleLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
