/**
 * Site footer controller
 * Renders global quick links and keeps the Beijing clock in sync with language.
 */
(function () {
  const QUICK_LINKS = [
    { path: 'index.html', zh: '首页', en: 'Home' },
    { path: 'pages/blog.html', zh: '博客', en: 'Blog' },
    { path: 'pages/categories.html', zh: '分类', en: 'Categories' },
    { path: 'pages/about.html', zh: '关于', en: 'About' },
    { path: 'resume/resume.html', zh: '简历', en: 'Resume' },
    { path: 'pages/project/project.html', zh: '项目', en: 'Projects' },
    { path: 'pages/project/personalgallery.html', zh: '图集', en: 'Gallery' },
    { path: 'pages/links.html', zh: '链接', en: 'Links' },
    { path: 'pages/changelog.html', zh: '更新日志', en: 'ChangeLog' },
    { path: 'pages/project/datacenter.html', zh: '数据中心', en: 'Data Center' },
    { path: 'pages/demo/index.html', zh: '演示', en: 'Demos' },
    { path: 'pages/blog/noval/novel.html', zh: '小说', en: 'Novel' }
  ];

  function getCurrentLang() {
    if (document.body.classList.contains('en')) return 'en';
    if (document.body.classList.contains('zh')) return 'zh';
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'zh') return saved;
    return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'zh';
  }

  function getRootPrefix() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/pages/blog/noval/')) return '../../../';
    if (path.includes('/pages/blog/')) return '../../';
    if (path.includes('/pages/project/yixin/')) return '../../../';
    if (path.includes('/pages/project/')) return '../../';
    if (path.includes('/pages/demo/')) return '../../';
    if (path.includes('/pages/')) return '../';
    if (path.includes('/resume/')) return '../';
    return '';
  }

  function resolveSitePath(path) {
    if (!path || /^(https?:|mailto:|#)/i.test(path)) return path || '#';
    return getRootPrefix() + path.replace(/^\/+/, '');
  }

  function renderQuickLinks() {
    const lang = getCurrentLang();
    document.querySelectorAll('.footer-links-grid').forEach(function (grid) {
      grid.innerHTML = '';
      QUICK_LINKS.forEach(function (item) {
        const link = document.createElement('a');
        link.href = resolveSitePath(item.path);
        link.setAttribute('data-zh', item.zh);
        link.setAttribute('data-en', item.en);
        link.textContent = lang === 'en' ? item.en : item.zh;
        grid.appendChild(link);
      });
    });
  }

  function getBeijingDate() {
    return new Date();
  }

  function formatBeijingDate(date, lang) {
    if (lang === 'en') {
      const weekday = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Shanghai',
        weekday: 'long'
      }).format(date);
      const dateText = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: 'long',
        day: '2-digit'
      }).format(date);
      return `${dateText} ${weekday}`;
    }

    const parts = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date).reduce(function (acc, part) {
      if (part.type !== 'literal') acc[part.type] = part.value;
      return acc;
    }, {});
    const weekday = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      weekday: 'long'
    }).format(date);
    return `${parts.year}年${parts.month}月${parts.day}日 ${weekday}`;
  }

  function updateBeijingTime() {
    const beijingTime = getBeijingDate();
    const lang = getCurrentLang();
    const clockElement = document.querySelector('.footer-clock');
    const dateElement = document.querySelector('.footer-date');

    if (clockElement) {
      clockElement.textContent = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(beijingTime);
    }

    if (dateElement) {
      const zhDateText = formatBeijingDate(beijingTime, 'zh');
      const enDateText = formatBeijingDate(beijingTime, 'en');
      dateElement.setAttribute('data-zh', zhDateText);
      dateElement.setAttribute('data-en', enDateText);
      dateElement.textContent = lang === 'en' ? enDateText : zhDateText;
    }
  }

  function syncFooterLanguage(lang) {
    const nextLang = lang || getCurrentLang();
    document.querySelectorAll('.footer-links-grid a[data-en][data-zh]').forEach(function (link) {
      link.textContent = link.getAttribute(`data-${nextLang}`) || link.textContent;
    });
    updateBeijingTime();
  }

  function initFooter() {
    renderQuickLinks();
    updateBeijingTime();
    setInterval(updateBeijingTime, 1000);

    window.addEventListener('sitewide-language-change', function (event) {
      syncFooterLanguage(event.detail && event.detail.lang);
    });

    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', function () {
        setTimeout(function () {
          syncFooterLanguage();
        }, 0);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }
})();
