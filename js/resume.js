/**
 * resume.js - Resume Landing Page Controller
 * Handles: i18n toggle, dark/light theme, particle background, logo animation
 */
(function () {
  'use strict';

  /* ========== i18n Data ========== */
  const I18N = {
    heroTerminal: {
      zh: '$ cd ~/career && ls directions/',
      en: '$ cd ~/career && ls directions/'
    },
    heroTitle: {
      zh: '选择你感兴趣的<span class="r-highlight">职业方向</span>',
      en: 'Pick a <span class="r-highlight">Career Track</span> You\'re Interested In'
    },
    heroDesc: {
      zh: '不同岗位需要不同的简历侧重点。请选择下方的方向入口，查看针对该 JD 定制的个人简历。',
      en: 'Different roles call for different resume focuses. Choose a direction below to view the tailored resume for that role.'
    },
    btnLang: { zh: 'EN', en: '中文' },
    btnHome: { zh: '主站', en: 'Home' },
    cardArrow: { zh: '查看简历', en: 'View Resume' },
    footerCopy: {
      zh: '&copy; 2026 高健 &middot; <a href="../index.html">返回主站</a>',
      en: '&copy; 2026 Gao Jian &middot; <a href="../index.html">Back to Home</a>'
    },
    footerMotto: {
      zh: '"我本将心向明月，奈何明月照沟渠"',
      en: '"I offered my heart to the bright moon, but the moon shines upon the ditch."'
    },
    cards: [
      {
        title: { zh: '良率大数据工程师', en: 'Yield Big Data Engineer' },
        desc: {
          zh: '聚焦半导体/制造业良率分析，利用大数据平台与机器学习驱动产线优化。',
          en: 'Focus on semiconductor / manufacturing yield analysis, leveraging big data platforms and ML to optimize production lines.'
        },
        tags: ['Spark', 'Hive', 'Python', 'ML']
      },
      {
        title: { zh: 'AI Agent 应用开发工程师', en: 'AI Agent App Developer' },
        desc: {
          zh: '基于大模型构建智能体应用，涵盖 RAG、Prompt Engineering 与多智能体协作。',
          en: 'Build intelligent agent apps on top of LLMs, covering RAG, Prompt Engineering, and multi-agent orchestration.'
        },
        tags: ['LLM', 'RAG', 'Agent', 'LangChain']
      },
      {
        title: { zh: '前端开发工程师', en: 'Frontend Developer' },
        desc: {
          zh: '擅长响应式 Web 开发与交互设计，注重用户体验与性能优化。',
          en: 'Skilled in responsive web development and interaction design, emphasizing UX and performance.'
        },
        tags: ['HTML/CSS', 'JavaScript', 'Vue', 'React']
      },
      {
        title: { zh: '数据分析工程师', en: 'Data Analyst Engineer' },
        desc: {
          zh: '通过数据挖掘与可视化洞察业务趋势，赋能产品决策与增长策略。',
          en: 'Uncover business trends via data mining and visualization, empowering product decisions and growth strategies.'
        },
        tags: ['SQL', 'Python', 'EDA', 'Tableau']
      }
    ]
  };

  /* ========== State ========== */
  let lang = 'zh';

  /* ========== DOM Refs ========== */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ========== Theme ========== */
  function initTheme() {
    const saved = localStorage.getItem('r-theme');
    if (saved === 'dark') {
      document.body.classList.add('dark-mode');
    }
    updateThemeIcon();
  }

  function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('r-theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
    if (particleCtx) initParticles();
  }

  function updateThemeIcon() {
    const btn = $('#r-theme-toggle');
    if (!btn) return;
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = isDark
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }

  /* ========== Language ========== */
  function initLang() {
    const saved = localStorage.getItem('r-lang');
    if (saved === 'en') {
      lang = 'en';
    }
    applyLang();
  }

  function toggleLang() {
    lang = lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('r-lang', lang);
    applyLang();
  }

  function applyLang() {
    const t = (key) => I18N[key]?.[lang] ?? '';

    const heroTerminal = $('#r-hero-terminal');
    if (heroTerminal) heroTerminal.textContent = t('heroTerminal');

    const heroTitle = $('#r-hero-title');
    if (heroTitle) heroTitle.innerHTML = t('heroTitle');

    const heroDesc = $('#r-hero-desc');
    if (heroDesc) heroDesc.textContent = t('heroDesc');

    const langBtn = $('#r-lang-toggle');
    if (langBtn) langBtn.textContent = t('btnLang');

    const homeBtn = $('#r-home-btn');
    if (homeBtn) {
      homeBtn.innerHTML = '<i class="fas fa-home"></i> ' + t('btnHome');
    }

    const footerCopy = $('#r-footer-copy');
    if (footerCopy) footerCopy.innerHTML = t('footerCopy');

    const footerMotto = $('#r-footer-motto');
    if (footerMotto) footerMotto.textContent = t('footerMotto');

    $$('.r-card').forEach((card, i) => {
      const data = I18N.cards[i];
      if (!data) return;
      const titleEl = card.querySelector('.r-card-title');
      const descEl = card.querySelector('.r-card-desc');
      const arrowEl = card.querySelector('.r-card-arrow-text');
      if (titleEl) titleEl.textContent = data.title[lang];
      if (descEl) descEl.textContent = data.desc[lang];
      if (arrowEl) arrowEl.textContent = t('cardArrow');
    });

    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }

  /* ========== Logo Animation ========== */
  function initLogoAnimation() {
    const logoEl = $('#r-logo-letter');
    if (!logoEl) return;
    const letters = 'GAOJIAN'.split('');
    let idx = 0;
    setInterval(() => {
      logoEl.textContent = letters[idx % letters.length];
      idx++;
    }, 2000);
  }

  /* ========== Particle Background ========== */
  let particleCtx = null;
  let particles = [];
  let animFrameId = null;

  function initParticles() {
    const canvas = $('#r-particle-canvas');
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
      const color = isDark ? '90, 200, 250' : '0, 122, 255';

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
    initLogoAnimation();
    initParticles();

    const themeBtn = $('#r-theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    const langBtn = $('#r-lang-toggle');
    if (langBtn) langBtn.addEventListener('click', toggleLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
