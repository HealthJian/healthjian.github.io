// 首页专用交互：导航、回到顶部、问答同步
(function() {
    function getLang() {
        return document.body.classList.contains('en') ? 'en' : 'zh';
    }

    function setTextByLang(el, zh, en) {
        el.setAttribute('data-zh', zh || '');
        el.setAttribute('data-en', en || zh || '');
        el.textContent = getLang() === 'en' ? (en || zh || '') : (zh || en || '');
    }

    function initHomeNav() {
        const toggle = document.querySelector('.home-menu-toggle');
        const nav = document.getElementById('homeNavRight');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', function() {
            const isOpen = nav.classList.toggle('is-open');
            toggle.classList.toggle('is-open', isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('is-open');
                toggle.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function initBackToTop() {
        const btn = document.getElementById('homeBackToTop');
        if (!btn) return;

        function syncVisibility() {
            btn.classList.toggle('visible', window.pageYOffset > 360);
        }

        window.addEventListener('scroll', syncVisibility, { passive: true });
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        syncVisibility();
    }

    function normalizeQiaType(item) {
        if (item.classList.contains('issue')) {
            return { key: 'issue', zh: '问题', en: 'Issue', icon: 'fa-fire' };
        }
        if (item.classList.contains('question')) {
            return { key: 'question', zh: '疑问', en: 'Question', icon: 'fa-comment-dots' };
        }
        return { key: 'idea', zh: '想法', en: 'Idea', icon: 'fa-lightbulb' };
    }

    function extractQiaItems(doc) {
        return Array.from(doc.querySelectorAll('#qia .qia-item')).slice(0, 4).map((item, index) => {
            const type = normalizeQiaType(item);
            const titleEl = item.querySelector('.qia-content h3');
            const bodyEl = item.querySelector('.qia-content > p');
            const answerEl = item.querySelector('.qia-answer p');

            const titleZh = titleEl?.getAttribute('data-zh') || titleEl?.textContent.trim() || '';
            const titleEn = titleEl?.getAttribute('data-en') || titleZh;
            const bodyZh = bodyEl?.getAttribute('data-zh') || bodyEl?.textContent.trim() || '';
            const bodyEn = bodyEl?.getAttribute('data-en') || bodyZh;
            const answerZh = answerEl?.getAttribute('data-zh') || answerEl?.textContent.trim() || '';
            const answerEn = answerEl?.getAttribute('data-en') || answerZh;

            return {
                index,
                type,
                titleZh,
                titleEn,
                bodyZh,
                bodyEn,
                detailZh: answerZh ? `${bodyZh}\n\n解答：${answerZh}` : bodyZh,
                detailEn: answerEn ? `${bodyEn}\n\nAnswer: ${answerEn}` : bodyEn
            };
        }).filter(item => item.titleZh || item.titleEn);
    }

    function renderQiaCards(items) {
        const stack = document.getElementById('homeQiaStack');
        if (!stack || !items.length) return;

        stack.innerHTML = '';
        items.forEach((item, index) => {
            const card = document.createElement('article');
            card.className = 'qia-card';
            card.setAttribute('data-qia-card', '');

            const bar = document.createElement('div');
            bar.className = `qia-card-bar ${item.type.key}`;

            const titleWrap = document.createElement('div');
            titleWrap.className = 'qia-card-title';

            const icon = document.createElement('i');
            icon.className = `fas ${item.type.icon}`;

            const typeText = document.createElement('span');
            setTextByLang(typeText, item.type.zh, item.type.en);

            const part = document.createElement('span');
            part.className = 'qia-part';
            part.textContent = String(index + 1).padStart(2, '0');

            titleWrap.appendChild(icon);
            titleWrap.appendChild(typeText);
            bar.appendChild(titleWrap);
            bar.appendChild(part);

            const h3 = document.createElement('h3');
            setTextByLang(h3, item.titleZh, item.titleEn);

            const preview = document.createElement('p');
            preview.className = 'qia-preview';
            setTextByLang(preview, item.bodyZh, item.bodyEn);

            const detail = document.createElement('div');
            detail.className = 'qia-card-body';
            detail.setAttribute('aria-hidden', 'true');
            const detailText = document.createElement('p');
            setTextByLang(detailText, item.detailZh, item.detailEn);
            detail.appendChild(detailText);

            const btn = document.createElement('button');
            btn.className = 'qia-detail-toggle';
            btn.type = 'button';
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('data-zh', '阅览详情');
            btn.setAttribute('data-en', 'View Details');
            btn.textContent = getLang() === 'en' ? 'View Details' : '阅览详情';

            card.appendChild(bar);
            card.appendChild(h3);
            card.appendChild(preview);
            card.appendChild(detail);
            card.appendChild(btn);
            stack.appendChild(card);
        });
    }

    function syncToggleText(button, expanded) {
        const lang = getLang();
        const zh = expanded ? '收回内容' : '阅览详情';
        const en = expanded ? 'Collapse' : 'View Details';
        button.setAttribute('data-zh', zh);
        button.setAttribute('data-en', en);
        button.textContent = lang === 'en' ? en : zh;
    }

    function initQiaInteractions() {
        const stack = document.getElementById('homeQiaStack');
        if (!stack) return;

        stack.addEventListener('click', event => {
            const button = event.target.closest('.qia-detail-toggle');
            if (!button) return;

            const card = button.closest('.qia-card');
            const body = card?.querySelector('.qia-card-body');
            if (!card || !body) return;

            const expanded = !card.classList.contains('is-expanded');
            card.classList.toggle('is-expanded', expanded);
            body.setAttribute('aria-hidden', expanded ? 'false' : 'true');
            button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            syncToggleText(button, expanded);
        });
    }

    async function syncQiaFromAbout() {
        const stack = document.getElementById('homeQiaStack');
        if (!stack) return;

        try {
            const response = await fetch('pages/about.html', { credentials: 'same-origin' });
            if (!response.ok) throw new Error(`about fetch failed: ${response.status}`);

            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const items = extractQiaItems(doc);
            if (items.length) {
                renderQiaCards(items);
                if (typeof updateAllLanguageElements === 'function') {
                    updateAllLanguageElements(getLang());
                }
            }
        } catch (error) {
            console.warn('[home qia sync] fallback to static cards:', error);
        }
    }

    function refreshQiaToggleLabels() {
        document.querySelectorAll('#homeQiaStack .qia-detail-toggle').forEach(button => {
            syncToggleText(button, button.getAttribute('aria-expanded') === 'true');
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.body.classList.add('home-page');
        initHomeNav();
        initBackToTop();
        initQiaInteractions();
        syncQiaFromAbout();
    });

    window.addEventListener('sitewide-language-change', refreshQiaToggleLabels);
})();
