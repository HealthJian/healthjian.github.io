// 节日横幅自动管理系统
// 支持：元旦、除夕/春节、五一劳动节、端午节、六一儿童节、七一建党日、中秋节、国庆节
// 农历节日通过预计算查表实现，固定节日按公历日期匹配

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════
    //  农历节日 → 公历日期 查询表 (2025–2040)
    // ═══════════════════════════════════════════════════
    const LUNAR_DATES = {
        chuxi: {
            2025: [1, 28],  2026: [2, 16],  2027: [2, 5],   2028: [1, 25],
            2029: [2, 12],  2030: [2, 2],   2031: [1, 22],  2032: [2, 10],
            2033: [1, 30],  2034: [2, 18],  2035: [2, 7],   2036: [1, 27],
            2037: [2, 14],  2038: [2, 3],   2039: [1, 23],  2040: [2, 11]
        },
        duanwu: {
            2025: [5, 31],  2026: [6, 19],  2027: [6, 9],   2028: [5, 28],
            2029: [6, 16],  2030: [6, 5],   2031: [5, 26],  2032: [6, 13],
            2033: [6, 3],   2034: [6, 22],  2035: [6, 11],  2036: [5, 31],
            2037: [6, 19],  2038: [6, 8],   2039: [5, 29],  2040: [6, 16]
        },
        zhongqiu: {
            2025: [10, 6],  2026: [9, 25],  2027: [9, 15],  2028: [10, 3],
            2029: [9, 22],  2030: [9, 12],  2031: [10, 1],  2032: [9, 19],
            2033: [9, 8],   2034: [9, 28],  2035: [9, 17],  2036: [9, 5],
            2037: [9, 24],  2038: [9, 13],  2039: [10, 2],  2040: [9, 21]
        }
    };

    // ═══════════════════════════════════════════════════
    //  节日配置表（按日历顺序排列，国庆优先于中秋处理重叠年份）
    // ═══════════════════════════════════════════════════
    const HOLIDAYS = [
        {
            id: 'newyear',
            theme: 'newyear',
            text:     { zh: '元旦快乐', en: 'Happy New Year' },
            subtitle: { zh: '新的一年，新的开始！', en: 'A New Year, A Fresh Start!' },
            icons: ['\u{1F386}', '\u{1F387}'],
            days: 1,
            getStart: function (year) { return new Date(year, 0, 1); }
        },
        {
            id: 'spring',
            theme: 'spring',
            text:     { zh: '新春快乐', en: 'Happy Chinese New Year' },
            subtitle: { zh: '万事如意，阖家欢乐！', en: 'Wishing You Prosperity & Joy!' },
            icons: ['\u{1F3EE}', '\u{1F9E7}'],
            days: 15,
            getStart: function (year) {
                var d = LUNAR_DATES.chuxi[year];
                return d ? new Date(year, d[0] - 1, d[1]) : null;
            }
        },
        {
            id: 'labor',
            theme: 'labor',
            text:     { zh: '五一国际劳动节快乐', en: 'Happy International Workers\' Day!' },
            subtitle: { zh: '致敬每一位劳动者！', en: 'Salute to Every Worker!' },
            icons: ['\u{1F528}', '\u{1F528}'],
            days: 5,
            getStart: function (year) { return new Date(year, 4, 1); }
        },
        {
            id: 'dragon',
            theme: 'dragon',
            text:     { zh: '端午安康', en: 'Happy Dragon Boat Festival' },
            subtitle: { zh: '粽叶飘香，龙舟竞渡！', en: 'Dragon Boats Race, Zongzi Abound!' },
            icons: ['\u{1F409}', '\u{1F38B}'],
            days: 3,
            getStart: function (year) {
                var d = LUNAR_DATES.duanwu[year];
                return d ? new Date(year, d[0] - 1, d[1]) : null;
            }
        },
        {
            id: 'children',
            theme: 'children',
            text:     { zh: '六一儿童节快乐', en: 'Happy Children\'s Day' },
            subtitle: { zh: '同庆母校校庆日！', en: 'Also Celebrating Our Alma Mater!' },
            icons: ['\u{1F388}', '\u{1F381}'],
            days: 1,
            getStart: function (year) { return new Date(year, 5, 1); }
        },
        {
            id: 'party',
            theme: 'party',
            text:     { zh: '七一建党节', en: 'CPC Founding Anniversary' },
            subtitle: function (year) {
                var n = year - 1921;
                return { zh: '\u5E86\u795D\u5EFA\u515A' + n + '\u5468\u5E74', en: 'Celebrating ' + n + ' Years' };
            },
            icons: ['\u2B50', '\u2B50'],
            days: 1,
            getStart: function (year) { return new Date(year, 6, 1); }
        },
        {
            id: 'national',
            theme: 'national',
            text:     { zh: '国庆节快乐', en: 'Happy National Day' },
            subtitle: function (year) {
                var n = year - 1949;
                return { zh: '\u795D\u798F\u7956\u56FD' + n + '\u5468\u5E74\u534E\u8BDE', en: 'Celebrating ' + n + ' Years' };
            },
            icons: ['\u{1F1E8}\u{1F1F3}', '\u{1F1E8}\u{1F1F3}'],
            days: 10,
            getStart: function (year) { return new Date(year, 9, 1); }
        },
        {
            id: 'midautumn',
            theme: 'midautumn',
            text:     { zh: '中秋节快乐', en: 'Happy Mid-Autumn Festival' },
            subtitle: { zh: '月圆人团圆！', en: 'Reunion Under the Full Moon!' },
            icons: ['\u{1F315}', '\u{1F96E}'],
            days: 5,
            getStart: function (year) {
                var d = LUNAR_DATES.zhongqiu[year];
                return d ? new Date(year, d[0] - 1, d[1]) : null;
            }
        }
    ];

    // ═══════════════════════════════════════════════════
    //  节日检测：返回当天匹配的节日配置，无则返回 null
    // ═══════════════════════════════════════════════════
    function detectHoliday() {
        var now  = new Date();
        var year = now.getFullYear();
        var today = new Date(year, now.getMonth(), now.getDate());

        for (var i = 0; i < HOLIDAYS.length; i++) {
            var h = HOLIDAYS[i];
            var start = h.getStart(year);
            if (!start) continue;

            var end = new Date(start.getTime());
            end.setDate(end.getDate() + (h.days - 1));

            if (today >= start && today <= end) {
                return { config: h, year: year };
            }
        }
        return null;
    }

    // ═══════════════════════════════════════════════════
    //  横幅类
    // ═══════════════════════════════════════════════════
    function CelebrationBanner() {
        this.banner         = null;
        this.holiday        = null;
        this.year           = null;
        this.lastScrollTop  = 0;
        this.scrollThreshold = 50;
        this.isVisible      = false;
        this.showTimeout    = null;
        this.hideTimeout    = null;
        this.isInitialized  = false;
        this._lastLang      = null;
        this._observer      = null;

        this._boundScroll = this._throttle(this._handleScroll.bind(this), 16);
        this._boundResize = this._throttle(this._handleResize.bind(this), 250);

        this.init();
    }

    CelebrationBanner.prototype.init = function () {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this._setup.bind(this));
        } else {
            this._setup();
        }
    };

    CelebrationBanner.prototype._setup = function () {
        if (!this._isHomePage()) return;

        var result = detectHoliday();
        if (!result) return;

        this.holiday = result.config;
        this.year    = result.year;

        this._createBanner();
        this._bindEvents();
        this.show();
        this.isInitialized = true;
    };

    CelebrationBanner.prototype._isHomePage = function () {
        var p = window.location.pathname;
        var f = p.split('/').pop() || '';
        return p === '/' || p === '/index.html' || f === 'index.html' ||
               (p.endsWith('/') && p.indexOf('/pages/') === -1);
    };

    // ── 创建 DOM ──
    CelebrationBanner.prototype._createBanner = function () {
        this.banner = document.createElement('div');
        this.banner.className = 'celebration-banner theme-' + this.holiday.theme;
        this.banner.setAttribute('role', 'banner');

        var lang = this._getLang();
        this._lastLang = lang;
        this.banner.setAttribute('aria-label', this.holiday.text[lang]);
        this.banner.innerHTML = this._buildHTML(lang);

        document.body.appendChild(this.banner);
        this._observeLang();
    };

    CelebrationBanner.prototype._buildHTML = function (lang) {
        var h   = this.holiday;
        var sub = typeof h.subtitle === 'function' ? h.subtitle(this.year) : h.subtitle;
        return '<div class="celebration-banner-content">' +
                   '<span class="flag-icon">' + h.icons[0] + '</span>' +
                   '<span class="star-icon">\u2B50</span>' +
                   '<span class="celebration-banner-text">' + h.text[lang] + '</span>' +
                   '<span class="celebration-banner-year">' + sub[lang] + '</span>' +
                   '<span class="star-icon">\u2B50</span>' +
                   '<span class="flag-icon">' + h.icons[1] + '</span>' +
               '</div>';
    };

    // ── 语言切换监听（MutationObserver）──
    CelebrationBanner.prototype._observeLang = function () {
        var self = this;
        this._observer = new MutationObserver(function () {
            var lang = self._getLang();
            if (lang !== self._lastLang) {
                self._lastLang = lang;
                self._updateContent();
            }
        });
        this._observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    };

    CelebrationBanner.prototype._updateContent = function () {
        if (!this.banner) return;
        var lang = this._getLang();
        this.banner.innerHTML = this._buildHTML(lang);
        this.banner.setAttribute('aria-label', this.holiday.text[lang]);
    };

    CelebrationBanner.prototype._getLang = function () {
        return document.body.classList.contains('en') ? 'en' : 'zh';
    };

    // ── 滚动交互 ──
    CelebrationBanner.prototype._bindEvents = function () {
        window.addEventListener('scroll', this._boundScroll);
        window.addEventListener('resize', this._boundResize);
    };

    CelebrationBanner.prototype._handleScroll = function () {
        if (!this.banner) return;

        var curr = window.pageYOffset || document.documentElement.scrollTop;
        var dir  = curr > this.lastScrollTop ? 'down' : 'up';
        var atTop    = curr <= 10;
        var atBottom = (window.innerHeight + curr) >= document.documentElement.scrollHeight - 10;

        clearTimeout(this.showTimeout);
        clearTimeout(this.hideTimeout);

        var shouldShow = atTop || atBottom || (dir === 'up' && curr > this.scrollThreshold);

        if (shouldShow && !this.isVisible) this.show();
        else if (!shouldShow && this.isVisible) this.hide();

        this.lastScrollTop = curr;
    };

    CelebrationBanner.prototype._handleResize = function () {
        if (this.banner && this.isVisible) this._handleScroll();
    };

    // ── 显示 / 隐藏 ──
    CelebrationBanner.prototype.show = function () {
        if (!this.banner || this.isVisible) return;
        var self = this;
        this.showTimeout = setTimeout(function () {
            self.banner.classList.add('show');
            self.isVisible = true;
            document.body.classList.add('celebration-banner-active');
        }, 50);
    };

    CelebrationBanner.prototype.hide = function () {
        if (!this.banner || !this.isVisible) return;
        var self = this;
        this.hideTimeout = setTimeout(function () {
            self.banner.classList.remove('show');
            self.isVisible = false;
            document.body.classList.remove('celebration-banner-active');
        }, 100);
    };

    // ── 销毁 ──
    CelebrationBanner.prototype.destroy = function () {
        if (this.banner) { this.banner.remove(); this.banner = null; }
        if (this._observer) { this._observer.disconnect(); this._observer = null; }
        clearTimeout(this.showTimeout);
        clearTimeout(this.hideTimeout);
        window.removeEventListener('scroll', this._boundScroll);
        window.removeEventListener('resize', this._boundResize);
        document.body.classList.remove('celebration-banner-active');
        this.isInitialized = false;
        this.isVisible = false;
    };

    // ── 工具：节流 ──
    CelebrationBanner.prototype._throttle = function (fn, limit) {
        var waiting = false;
        return function () {
            if (!waiting) {
                fn.apply(this, arguments);
                waiting = true;
                setTimeout(function () { waiting = false; }, limit);
            }
        };
    };

    // ═══════════════════════════════════════════════════
    //  全局 API
    // ═══════════════════════════════════════════════════
    var instance = null;

    function initCelebrationBanner() {
        if (!instance) instance = new CelebrationBanner();
    }

    function destroyCelebrationBanner() {
        if (instance) { instance.destroy(); instance = null; }
    }

    initCelebrationBanner();

    window.celebrationBanner          = instance;
    window.initCelebrationBanner      = initCelebrationBanner;
    window.destroyCelebrationBanner   = destroyCelebrationBanner;
})();
