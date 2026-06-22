/**
 * datacenter.js - Enhanced Data Center Dashboard
 */
(function () {
    'use strict';

    /* ===== i18n ===== */
    const T = {
        zh: {
            'title': '数据中心 - Data Center',
            'site-name': '数据中心',
            'theme-slogan': '"数据之美，光影之诗"',
            'lang-toggle': '中 / EN',
            'global-status': '全局状态',
            'system-online': '系统在线',
            'uptime': '运行时间 99.97%',
            'uptime-24h': '近 30 天',
            'live-visitors': '实时访客趋势',
            'today-visitors': '今日访客',
            'vs-yesterday': '较昨日 +12%',
            'update-frequency': '近一个月更新频率',
            'real-data': '真实数据',
            'image-storage': '图片库存',
            'image-files': '图片文件',
            'image-storage-note': '按当前 images 目录递归静态快照统计。',
            'tag-heatmap': 'Top-9 标签热力图',
            'visitor-sources': '访客来源',
            'mi-browser': 'MI浏览器',
            'top-regions': '主要访问地区',
            'united-states': '美国',
            'jiangsu': '中国江苏',
            'singapore': '新加坡',
            'shandong': '中国山东',
            'shanxi': '中国山西',
            'browser-analytics': '浏览器 & 设备',
            'server-status': '核心服务状态',
            'all-operational': '全部正常',
            'api-service': 'API 服务',
            'database': '数据库',
            'cdn-network': 'CDN 网络',
            'email-service': '邮件服务',
            'operational': '正常',
            'page-load': '页面加载性能',
            'contribution-map': '内容贡献热力图',
            'contributions': '次贡献',
            'heatmap-less': '少',
            'heatmap-more': '多',
            'activity-feed': '实时活动流',
            'tech-stack': '技术栈',
            'stat-pages': '总页面数',
            'stat-posts': '博客文章',
            'stat-visitors': '累计访客',
            'stat-speed': '平均加载',
            'category-jump-title': '分类与知识图谱',
            'category-jump-desc': '查看作者数据、文章归档与产能 K 线',
            'changelog-archive': '日志归档',
            'changelog-archive-note': '从 changelog 页面抽取原始日志，按专业审计视角逐条检查。',
            'open-changelog': '打开完整更新日志',
            'update-plan': '更新计划',
            'update-plan-note': '下一阶段维护清单，偏工程执行口径。',
            'your-name': '健健',
            'powered-by': 'Powered by Passion & Data'
        },
        en: {
            'title': 'Data Center',
            'site-name': 'Data Center',
            'theme-slogan': '"The Beauty of Data, a Poem of Light and Shadow"',
            'lang-toggle': 'EN / 中',
            'global-status': 'Global Status',
            'system-online': 'SYSTEM ONLINE',
            'uptime': 'Uptime 99.97%',
            'uptime-24h': 'Last 30 days',
            'live-visitors': 'Live Visitor Trend',
            'today-visitors': "Today's Visitors",
            'vs-yesterday': 'vs Yesterday +12%',
            'update-frequency': 'Last 30 Days Update Frequency',
            'real-data': 'REAL DATA',
            'image-storage': 'Image Inventory',
            'image-files': 'image files',
            'image-storage-note': 'Static snapshot from the current images directory, counted recursively.',
            'tag-heatmap': 'Top-9 Tag Heatmap',
            'visitor-sources': 'Visitor Sources',
            'mi-browser': 'MI Browser',
            'top-regions': 'Top Regions',
            'united-states': 'United States',
            'jiangsu': 'Jiangsu, CN',
            'singapore': 'Singapore',
            'shandong': 'Shandong, CN',
            'shanxi': 'Shanxi, CN',
            'browser-analytics': 'Browser & Device',
            'server-status': 'Core Services',
            'all-operational': 'All OK',
            'api-service': 'API Service',
            'database': 'Database',
            'cdn-network': 'CDN Network',
            'email-service': 'Email Service',
            'operational': 'OK',
            'page-load': 'Page Load Performance',
            'contribution-map': 'Contribution Heatmap',
            'contributions': 'contributions',
            'heatmap-less': 'Less',
            'heatmap-more': 'More',
            'activity-feed': 'Live Activity Feed',
            'tech-stack': 'Tech Stack',
            'stat-pages': 'Total Pages',
            'stat-posts': 'Blog Posts',
            'stat-visitors': 'Total Visitors',
            'stat-speed': 'Avg Load',
            'category-jump-title': 'Categories & Knowledge Map',
            'category-jump-desc': 'Open author data, archive, and productivity K-line',
            'changelog-archive': 'Changelog Archive',
            'changelog-archive-note': 'Extracted from the changelog page for direct professional review.',
            'open-changelog': 'Open Full Changelog',
            'update-plan': 'Update Plan',
            'update-plan-note': 'Next-stage maintenance list, written in an engineering execution format.',
            'your-name': 'Jianjian',
            'powered-by': 'Powered by Passion & Data'
        }
    };

    /* ===== State ===== */
    const SITE_PAGE_COUNT = 115;
    const FALLBACK_POST_COUNT = 68;
    const IMAGE_INVENTORY = {
        total: 181,
        updatedAt: '2026-06-22',
        byExt: [
            { ext: 'png', count: 76 },
            { ext: 'avif', count: 66 },
            { ext: 'jpg', count: 34 },
            { ext: 'webp', count: 3 },
            { ext: 'gif', count: 1 },
            { ext: 'jpeg', count: 1 }
        ]
    };
    const UPDATE_PLAN_ITEMS = [
        {
            status: 'P0',
            date: '2026 Q2-Q3',
            zh: '数据源治理：将日志、文章、图集等高频内容逐步迁移到结构化数据源，减少从 HTML 反向解析的维护成本。',
            en: 'Data source governance: move high-frequency content such as logs, posts, and gallery records into structured data sources.'
        },
        {
            status: 'P1',
            date: '2026 Q3',
            zh: '数据中心真实化：访客、性能、更新日志、文章产能等指标继续向可核验数据靠拢，保留静态站点的轻量部署方式。',
            en: 'Data center realism: keep visitor, performance, changelog, and productivity metrics closer to verifiable data while preserving static deployment.'
        },
        {
            status: 'P1',
            date: '2026 Q3',
            zh: '分类与归档增强：继续校准产能 K 线、文章归档和标签热度，提升长期复盘能力。',
            en: 'Category and archive enhancement: continue calibrating productivity K-line, article archive, and tag heat metrics.'
        },
        {
            status: 'P2',
            date: 'Continuous',
            zh: '工程项目补充：在个人简历和项目页持续补充真实工程项目、半导体数据分析实践与 AI Agent 探索。',
            en: 'Engineering project updates: keep adding real engineering work, semiconductor analytics practice, and AI Agent exploration to resume and project pages.'
        }
    ];
    let lang = 'zh';
    let theme = localStorage.getItem('dc-theme') || 'light';
    let changelogEntries = [];
    let visitorChart = null;
    let performanceChart = null;
    let browserChart = null;
    let updateFrequencyChart = null;
    let amap = null;
    let amapMarkers = [];
    let amapPolylines = [];

    /* ===== Helpers ===== */
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const css = (prop) => getComputedStyle(document.documentElement).getPropertyValue(prop).trim();

    /* ===== Init ===== */
    function init() {
        applyTheme();
        applyLang();
        initClock();
        initEventListeners();
        initQuickStats();
        initCharts();
        renderImageInventory();
        renderTopTagHeatmap();
        initAMap();
        initHeatmap();
        initUptimeBars();
        initActivityFeed();
        initChangelogArchive();
        renderUpdatePlan();
        startLiveUpdates();
        initEasterEggs();
    }

    /* ===== Theme ===== */
    function applyTheme() {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = $('#themeToggle .theme-icon');
        if (icon) icon.style.transform = theme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    function toggleTheme() {
        theme = theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('dc-theme', theme);
        applyTheme();
        refreshChartColors();
    }

    /* ===== Language ===== */
    function applyLang() {
        $$('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (T[lang]?.[key]) el.textContent = T[lang][key];
        });
        document.title = T[lang]['title'];
        renderChangelogArchive();
        renderUpdateFrequencyChart();
        renderImageInventory();
        renderTopTagHeatmap();
        renderUpdatePlan();
    }

    function toggleLang() {
        lang = lang === 'zh' ? 'en' : 'zh';
        applyLang();
        refreshAMapMarkers();
    }

    /* ===== Clock ===== */
    function initClock() {
        function tick() {
            const now = new Date();
            const el = $('#liveClock');
            if (el) el.textContent = now.toLocaleTimeString('en-GB');
        }
        tick();
        setInterval(tick, 1000);
    }

    /* ===== Event Listeners ===== */
    function initEventListeners() {
        $('#themeToggle')?.addEventListener('click', toggleTheme);
        $('#langToggle')?.addEventListener('click', toggleLang);
    }

    /* ===== Quick Stats ===== */
    function initQuickStats() {
        const blogPostCount = Array.isArray(window.BLOG_POSTS_DATA) ? window.BLOG_POSTS_DATA.length : FALLBACK_POST_COUNT;

        animateNum('statPages', SITE_PAGE_COUNT, 1800);
        animateNum('statPosts', blogPostCount, 1800);
        animateNum('statVisitors', 2847, 2200);
        animateSpeed('statSpeed', 128, 1600);

        drawMiniSparkline('sparkPages', generateSparkData(12, Math.max(1, SITE_PAGE_COUNT - 24), SITE_PAGE_COUNT + 4));
        drawMiniSparkline('sparkPosts', generateSparkData(12, Math.max(1, blogPostCount - 18), blogPostCount + 3));
        drawMiniSparkline('sparkVisitors', generateSparkData(12, 150, 320));
        drawMiniSparkline('sparkSpeed', generateSparkData(12, 90, 160), true);
    }

    function animateNum(id, target, duration) {
        const el = document.getElementById(id);
        if (!el) return;
        let cur = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            cur += step;
            if (cur >= target) { cur = target; clearInterval(timer); }
            el.textContent = Math.floor(cur).toLocaleString();
        }, 16);
    }

    function animateSpeed(id, target, duration) {
        const el = document.getElementById(id);
        if (!el) return;
        let cur = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            cur += step;
            if (cur >= target) { cur = target; clearInterval(timer); }
            el.innerHTML = Math.floor(cur) + '<small>ms</small>';
        }, 16);
    }

    function generateSparkData(count, min, max) {
        return Array.from({ length: count }, () => rand(min, max));
    }

    function drawMiniSparkline(containerId, data, invert) {
        const wrap = document.getElementById(containerId);
        if (!wrap) return;
        const w = 60, h = 28;
        const canvas = document.createElement('canvas');
        canvas.width = w * 2; canvas.height = h * 2;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        wrap.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);

        const max = Math.max(...data);
        const min2 = Math.min(...data);
        const range = max - min2 || 1;
        const points = data.map((v, i) => ({
            x: (i / (data.length - 1)) * w,
            y: h - ((v - min2) / range) * (h - 4) - 2
        }));

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const cx = (points[i - 1].x + points[i].x) / 2;
            ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, cx, (points[i - 1].y + points[i].y) / 2);
        }
        ctx.quadraticCurveTo(
            points[points.length - 2].x, points[points.length - 2].y,
            points[points.length - 1].x, points[points.length - 1].y
        );
        ctx.strokeStyle = invert ? '#ff9500' : css('--accent-blue') || '#007BFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        const color = invert ? '255,149,0' : '0,123,255';
        grad.addColorStop(0, `rgba(${color},0.25)`);
        grad.addColorStop(1, `rgba(${color},0.02)`);
        ctx.fillStyle = grad;
        ctx.fill();
    }

    /* ===== Charts ===== */
    function initCharts() {
        initVisitorChart();
        initPerformanceChart();
        initBrowserChart();
    }

    function initVisitorChart() {
        const ctx = document.getElementById('visitorChart')?.getContext('2d');
        if (!ctx) return;
        const data = genVisitorData();

        visitorChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: lang === 'zh' ? '访客数' : 'Visitors',
                    data: data.values,
                    borderColor: css('--accent-blue'),
                    backgroundColor: css('--accent-blue') + '18',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: css('--accent-blue')
                }]
            },
            options: chartOpts({ yBeginZero: true })
        });
    }

    function initPerformanceChart() {
        const ctx = document.getElementById('performanceChart')?.getContext('2d');
        if (!ctx) return;
        const labels = ['index.html', 'blog.html', 'about.html', 'project.html', 'gallery.html', 'resume.html'];
        const values = [118, 174, 92, 146, 108, 135];

        const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        const avgEl = document.getElementById('perfAvg');
        if (avgEl) avgEl.textContent = avg + ' ms';

        performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: lang === 'zh' ? '加载时间 (ms)' : 'Load Time (ms)',
                    data: values,
                    backgroundColor: values.map((v, i) =>
                        i % 2 === 0 ? css('--accent-blue') + '70' : css('--accent-green') + '70'
                    ),
                    borderColor: values.map((v, i) =>
                        i % 2 === 0 ? css('--accent-blue') : css('--accent-green')
                    ),
                    borderWidth: 1.5,
                    borderRadius: 6,
                    maxBarThickness: 40
                }]
            },
            options: chartOpts({ showXAxis: true })
        });
    }

    function initBrowserChart() {
        const ctx = document.getElementById('browserChart')?.getContext('2d');
        if (!ctx) return;

        const data = {
            labels: ['Chrome', 'Safari', 'Edge', 'Firefox', 'Other'],
            values: [48, 22, 15, 8, 7],
            colors: ['#4285F4', '#FF9500', '#0078D7', '#FF6611', '#888888']
        };

        browserChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors,
                    borderWidth: 2,
                    borderColor: theme === 'dark' ? '#172533' : '#ffffff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '62%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (item) => `${item.label}: ${item.parsed}%`
                        }
                    }
                }
            }
        });

        const legendEl = document.getElementById('browserLegend');
        if (legendEl) {
            legendEl.innerHTML = data.labels.map((name, i) =>
                `<div class="legend-row">
                    <span class="legend-dot" style="background:${data.colors[i]}"></span>
                    <span class="legend-name">${name}</span>
                    <span class="legend-pct">${data.values[i]}%</span>
                </div>`
            ).join('');
        }
    }

    function chartOpts({ yBeginZero, showXAxis } = {}) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    display: !!showXAxis,
                    grid: { display: false },
                    ticks: { color: css('--text-secondary'), font: { size: 10 } }
                },
                y: {
                    display: false,
                    beginAtZero: !!yBeginZero
                }
            },
            interaction: { intersect: false, mode: 'index' }
        };
    }

    function genVisitorData() {
        const labels = [], values = [];
        const now = Date.now();
        for (let i = 59; i >= 0; i--) {
            const t = new Date(now - i * 60000);
            labels.push(t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            values.push(rand(1, 9));
        }
        return { labels, values };
    }

    /* ===== Data Cards ===== */
    function renderUpdateFrequencyChart() {
        const ctx = document.getElementById('updateFrequencyChart')?.getContext('2d');
        if (!ctx) return;

        const days = getLastNDays(30);
        const counts = new Map();
        changelogEntries.forEach(entry => {
            counts.set(entry.date, (counts.get(entry.date) || 0) + 1);
        });

        const values = days.map(day => counts.get(day.key) || 0);
        const total = values.reduce((sum, value) => sum + value, 0);
        const activeDays = values.filter(Boolean).length;
        const summary = document.getElementById('updateFrequencySummary');
        if (summary) {
            summary.textContent = lang === 'en'
                ? `${total} changelog updates / ${activeDays} active days`
                : `${total} 次日志更新 / ${activeDays} 个活跃日期`;
        }

        if (updateFrequencyChart) updateFrequencyChart.destroy();

        updateFrequencyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days.map(day => day.label),
                datasets: [{
                    label: lang === 'en' ? 'Changelog Updates' : '日志更新',
                    data: values,
                    borderColor: css('--accent-blue'),
                    backgroundColor: css('--accent-blue') + '16',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2.2,
                    pointRadius: values.map(value => value > 0 ? 3 : 0),
                    pointHoverRadius: 5,
                    pointBackgroundColor: css('--accent-green')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: item => lang === 'en'
                                ? `${item.parsed.y} updates`
                                : `${item.parsed.y} 次更新`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: css('--text-secondary'),
                            maxTicksLimit: 6,
                            font: { size: 10 }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            color: css('--text-secondary'),
                            font: { size: 10 }
                        },
                        grid: { color: 'rgba(108,117,125,0.12)' }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
    }

    function getLastNDays(count) {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = count - 1; i >= 0; i--) {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            days.push({
                key: formatDateKey(day),
                label: `${day.getMonth() + 1}/${day.getDate()}`
            });
        }

        return days;
    }

    function formatDateKey(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function renderImageInventory() {
        const total = document.getElementById('imageStorageTotal');
        const breakdown = document.getElementById('imageStorageBreakdown');
        if (total) total.textContent = IMAGE_INVENTORY.total.toLocaleString();
        if (!breakdown) return;

        const max = Math.max(...IMAGE_INVENTORY.byExt.map(item => item.count));
        breakdown.innerHTML = '';
        IMAGE_INVENTORY.byExt.forEach(item => {
            const row = document.createElement('div');
            row.className = 'image-ext-row';

            const name = document.createElement('span');
            name.className = 'image-ext-name';
            name.textContent = `.${item.ext}`;

            const bar = document.createElement('span');
            bar.className = 'image-ext-bar';
            const fill = document.createElement('span');
            fill.style.width = `${Math.max(6, (item.count / max) * 100)}%`;
            bar.appendChild(fill);

            const count = document.createElement('span');
            count.className = 'image-ext-count';
            count.textContent = item.count;

            row.appendChild(name);
            row.appendChild(bar);
            row.appendChild(count);
            breakdown.appendChild(row);
        });
    }

    function renderTopTagHeatmap() {
        const grid = document.getElementById('tagHeatmapGrid');
        if (!grid) return;

        const posts = Array.isArray(window.BLOG_POSTS_DATA) ? window.BLOG_POSTS_DATA : [];
        const counts = new Map();
        posts.forEach(post => {
            (post.tags || []).forEach(tag => {
                counts.set(tag, (counts.get(tag) || 0) + 1);
            });
        });

        const tags = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 9);
        const max = Math.max(1, ...tags.map(([, count]) => count));
        grid.innerHTML = '';

        tags.forEach(([tag, count], index) => {
            const item = document.createElement('div');
            item.className = 'tag-heat-item';
            item.style.background = getTagHeatColor(count, max);
            item.title = lang === 'en' ? `${tag}: ${count} posts` : `${tag}: ${count} 篇`;

            const rank = document.createElement('span');
            rank.className = 'tag-rank';
            rank.textContent = `#${index + 1}`;

            const name = document.createElement('strong');
            name.textContent = tag;

            const value = document.createElement('span');
            value.className = 'tag-count';
            value.textContent = lang === 'en' ? `${count} posts` : `${count} 篇`;

            item.appendChild(rank);
            item.appendChild(name);
            item.appendChild(value);
            grid.appendChild(item);
        });
    }

    function getTagHeatColor(count, max) {
        const ratio = Math.max(0, Math.min(1, count / max));
        const hue = Math.round(210 - ratio * 205);
        const light = Math.round(62 - ratio * 12);
        return `hsl(${hue}, 78%, ${light}%)`;
    }

    function refreshChartColors() {
        setTimeout(() => {
            const ab = css('--accent-blue');
            const ag = css('--accent-green');
            const ts = css('--text-secondary');
            const bgBorder = theme === 'dark' ? '#172533' : '#ffffff';

            if (visitorChart) {
                visitorChart.data.datasets[0].borderColor = ab;
                visitorChart.data.datasets[0].backgroundColor = ab + '18';
                visitorChart.data.datasets[0].pointHoverBackgroundColor = ab;
                visitorChart.update('none');
            }
            if (performanceChart) {
                const ds = performanceChart.data.datasets[0];
                ds.backgroundColor = ds.data.map((_, i) => i % 2 === 0 ? ab + '70' : ag + '70');
                ds.borderColor = ds.data.map((_, i) => i % 2 === 0 ? ab : ag);
                if (performanceChart.options.scales.x.ticks) {
                    performanceChart.options.scales.x.ticks.color = ts;
                }
                performanceChart.update('none');
            }
            if (browserChart) {
                browserChart.data.datasets[0].borderColor = bgBorder;
                browserChart.update('none');
            }
            if (updateFrequencyChart) {
                const ds = updateFrequencyChart.data.datasets[0];
                ds.borderColor = ab;
                ds.backgroundColor = ab + '16';
                ds.pointBackgroundColor = ag;
                updateFrequencyChart.update('none');
            }

            refreshAMap();
        }, 60);
    }

    /* ===== AMap (高德地图) ===== */
    const MAP_LOCATIONS = [
        { name: 'Jiangsu, CN',   nameZh: '中国江苏',  lng: 118.79, lat: 32.06,  radius: 7 },
        { name: 'Singapore',     nameZh: '新加坡',    lng: 103.82, lat: 1.35,   radius: 5 },
        { name: 'Shandong, CN',  nameZh: '中国山东',  lng: 116.99, lat: 36.67,  radius: 5 },
        { name: 'United States', nameZh: '美国',      lng: -122.42, lat: 37.77, radius: 4 },
        { name: 'Shanxi, CN',   nameZh: '中国山西',  lng: 112.55, lat: 37.87,  radius: 4 },
        { name: 'Europe',       nameZh: '欧洲',      lng: 2.35,   lat: 48.86,  radius: 4 }
    ];

    const MAP_CONNECTIONS = [
        [0, 1], [0, 2], [0, 3], [0, 5], [1, 5]
    ];

    function initAMap() {
        if (typeof AMap === 'undefined') {
            setTimeout(initAMap, 300);
            return;
        }

        const mapEl = document.getElementById('worldMap');
        if (!mapEl) return;

        amap = new AMap.Map(mapEl, {
            center: [70, 25],
            zoom: 3,
            zooms: [3, 7],
            viewMode: '2D',
            mapStyle: theme === 'dark' ? 'amap://styles/dark' : 'amap://styles/light',
            features: ['bg', 'point'],
            scrollWheel: false,
            doubleClickZoom: false,
            touchZoom: true,
            dragEnable: true,
            showLabel: false
        });

        addAMapMarkers();
        addAMapConnections();
    }

    function addAMapMarkers() {
        if (!amap) return;
        amapMarkers.forEach(m => amap.remove(m));
        amapMarkers = [];

        const color = css('--accent-blue') || '#007BFF';

        MAP_LOCATIONS.forEach(loc => {
            const marker = new AMap.CircleMarker({
                center: [loc.lng, loc.lat],
                radius: loc.radius,
                fillColor: color,
                fillOpacity: 0.7,
                strokeColor: color,
                strokeWeight: 1.5,
                strokeOpacity: 0.9,
                cursor: 'pointer',
                bubble: true
            });
            marker.setMap(amap);

            marker.setExtData({ loc });

            marker.on('mouseover', function () {
                const l = this.getExtData().loc;
                const label = new AMap.Marker({
                    position: [l.lng, l.lat],
                    content: `<div class="amap-marker-label">${lang === 'zh' ? l.nameZh : l.name}</div>`,
                    offset: new AMap.Pixel(-30, -30),
                    zIndex: 200
                });
                label.setMap(amap);
                this.setExtData({ loc: l, label });
            });

            marker.on('mouseout', function () {
                const data = this.getExtData();
                if (data.label) {
                    amap.remove(data.label);
                    this.setExtData({ loc: data.loc });
                }
            });

            amapMarkers.push(marker);
        });
    }

    function addAMapConnections() {
        if (!amap) return;
        amapPolylines.forEach(p => amap.remove(p));
        amapPolylines = [];

        const color = css('--accent-blue') || '#007BFF';

        MAP_CONNECTIONS.forEach(([a, b]) => {
            const line = new AMap.Polyline({
                path: [
                    [MAP_LOCATIONS[a].lng, MAP_LOCATIONS[a].lat],
                    [MAP_LOCATIONS[b].lng, MAP_LOCATIONS[b].lat]
                ],
                strokeColor: color,
                strokeWeight: 1.2,
                strokeOpacity: 0.3,
                strokeStyle: 'dashed',
                strokeDasharray: [6, 4],
                geodesic: true
            });
            line.setMap(amap);
            amapPolylines.push(line);
        });
    }

    function refreshAMapMarkers() {
        if (!amap) return;
        const color = css('--accent-blue') || '#007BFF';

        amapMarkers.forEach(marker => {
            marker.setOptions({
                fillColor: color,
                strokeColor: color
            });
        });

        amapPolylines.forEach(p => {
            p.setOptions({ strokeColor: color });
        });
    }

    function refreshAMap() {
        if (!amap) return;
        amap.setMapStyle(theme === 'dark' ? 'amap://styles/dark' : 'amap://styles/light');
        setTimeout(refreshAMapMarkers, 60);
    }

    /* ===== Contribution Heatmap ===== */
    function initHeatmap() {
        const wrap = document.getElementById('heatmapWrap');
        if (!wrap) return;

        const weeks = 26;
        let totalContrib = 0;
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (weeks * 7 + dayOfWeek));

        for (let w = 0; w < weeks; w++) {
            const col = document.createElement('div');
            col.className = 'hm-col';
            for (let d = 0; d < 7; d++) {
                const cellDate = new Date(startDate);
                cellDate.setDate(startDate.getDate() + w * 7 + d);

                const cell = document.createElement('span');
                cell.className = 'hm-cell';

                if (cellDate > today) {
                    cell.setAttribute('data-level', '0');
                } else {
                    const r = Math.random();
                    let level;
                    if (r < 0.35) level = 0;
                    else if (r < 0.6) level = 1;
                    else if (r < 0.8) level = 2;
                    else if (r < 0.93) level = 3;
                    else level = 4;
                    cell.setAttribute('data-level', String(level));
                    totalContrib += level;
                }

                const dateStr = cellDate.toISOString().slice(0, 10);
                cell.title = dateStr;
                col.appendChild(cell);
            }
            wrap.appendChild(col);
        }

        const totalEl = document.getElementById('heatmapTotal');
        if (totalEl) {
            const labelKey = lang === 'en' ? 'contributions' : '次贡献';
            totalEl.innerHTML = `${totalContrib} <span data-i18n="contributions">${T[lang]['contributions']}</span>`;
        }
    }

    /* ===== Uptime Bars ===== */
    function initUptimeBars() {
        ['uptimeApi', 'uptimeDb', 'uptimeCdn', 'uptimeEmail'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const days = 30;
            let html = '';
            for (let i = 0; i < days; i++) {
                const r = Math.random();
                let cls = '';
                if (r > 0.97) cls = 'down';
                else if (r > 0.92) cls = 'warn';
                html += `<span class="ub ${cls}" title="Day -${days - i}"></span>`;
            }
            el.innerHTML = html;
        });
    }

    /* ===== Activity Feed ===== */
    const FEED_TEMPLATES = {
        zh: [
            { type: 'page-view', text: '访客浏览了 {page}' },
            { type: 'deploy', text: '站点已部署更新 #{ver}' },
            { type: 'commit', text: '新提交: {msg}' },
            { type: 'page-view', text: '来自 {loc} 的新访客' }
        ],
        en: [
            { type: 'page-view', text: 'Visitor viewed {page}' },
            { type: 'deploy', text: 'Site deployed #{ver}' },
            { type: 'commit', text: 'New commit: {msg}' },
            { type: 'page-view', text: 'New visitor from {loc}' }
        ]
    };

    const PAGES = ['index.html', 'blog.html', 'about.html', 'gallery.html', 'resume.html', 'project.html'];
    const LOCATIONS_ZH = ['江苏徐州', '新加坡', '山东济南', '上海', '广东深圳', '北京', '美国加州'];
    const LOCATIONS_EN = ['Xuzhou, CN', 'Singapore', 'Jinan, CN', 'Shanghai', 'Shenzhen, CN', 'Beijing', 'California, US'];
    const COMMIT_MSGS = ['fix: typo', 'feat: dark mode', 'style: card layout', 'docs: update README', 'refactor: blog.js'];

    function genFeedItem() {
        const templates = FEED_TEMPLATES[lang];
        const tpl = templates[rand(0, templates.length - 1)];
        let text = tpl.text;

        text = text.replace('{page}', PAGES[rand(0, PAGES.length - 1)]);
        text = text.replace('{ver}', 'v1.' + rand(2, 9) + '.' + rand(0, 99));
        text = text.replace('{msg}', COMMIT_MSGS[rand(0, COMMIT_MSGS.length - 1)]);
        const locs = lang === 'zh' ? LOCATIONS_ZH : LOCATIONS_EN;
        text = text.replace('{loc}', locs[rand(0, locs.length - 1)]);

        const now = new Date();
        const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        return { type: tpl.type, text, time };
    }

    function initActivityFeed() {
        const list = document.getElementById('feedList');
        if (!list) return;
        for (let i = 0; i < 8; i++) {
            appendFeedItem(list, genFeedItem(), false);
        }
    }

    function appendFeedItem(list, item, animate) {
        const div = document.createElement('div');
        div.className = 'feed-item';
        if (animate) div.style.animation = 'feedIn .4s ease';
        div.innerHTML = `
            <span class="feed-dot ${item.type}"></span>
            <span class="feed-text">${item.text}</span>
            <span class="feed-time">${item.time}</span>
        `;
        list.insertBefore(div, list.firstChild);

        if (list.children.length > 20) {
            list.removeChild(list.lastChild);
        }
    }

    /* ===== Changelog Archive ===== */
    async function initChangelogArchive() {
        const list = document.getElementById('changelogArchiveList');
        if (!list) return;

        try {
            const res = await fetch('../changelog.html', { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            changelogEntries = Array.from(doc.querySelectorAll('.changelog-timeline .timeline-item')).map(item => {
                const titleEl = item.querySelector('.timeline-content h2');
                const details = Array.from(item.querySelectorAll('.timeline-content li')).map(li => ({
                    zh: cleanLogText(li.getAttribute('data-zh') || li.textContent),
                    en: cleanLogText(li.getAttribute('data-en') || li.textContent)
                }));

                return {
                    date: cleanLogText(item.querySelector('.timeline-date')?.textContent || ''),
                    title: {
                        zh: cleanLogText(titleEl?.getAttribute('data-zh') || titleEl?.textContent || ''),
                        en: cleanLogText(titleEl?.getAttribute('data-en') || titleEl?.textContent || '')
                    },
                    details
                };
            }).filter(entry => entry.date && (entry.title.zh || entry.title.en));
        } catch (err) {
            changelogEntries = [];
            renderUpdateFrequencyChart();
            renderChangelogArchiveError(err);
            return;
        }

        renderChangelogArchive();
        renderUpdateFrequencyChart();
    }

    function cleanLogText(text) {
        return String(text || '').replace(/\s+/g, ' ').trim();
    }

    function renderChangelogArchive() {
        const list = document.getElementById('changelogArchiveList');
        const count = document.getElementById('changelogArchiveCount');
        if (!list) return;
        if (!changelogEntries.length) return;

        const suffix = lang === 'en' ? 'LOGS' : '条日志';
        if (count) count.textContent = `${changelogEntries.length} ${suffix}`;
        list.innerHTML = '';

        changelogEntries.forEach((entry, index) => {
            const record = document.createElement('article');
            record.className = 'raw-log-record';

            const title = lang === 'en' ? (entry.title.en || entry.title.zh) : (entry.title.zh || entry.title.en);
            const details = entry.details.map((detail, detailIndex) => {
                const text = lang === 'en' ? (detail.en || detail.zh) : (detail.zh || detail.en);
                return `${String(detailIndex + 1).padStart(2, '0')}. ${text}`;
            });

            const pre = document.createElement('pre');
            pre.textContent = [
                `#${String(index + 1).padStart(2, '0')} | ${entry.date} | ${title}`,
                `items: ${entry.details.length}`,
                ...details
            ].join('\n');

            record.appendChild(pre);
            list.appendChild(record);
        });
    }

    function renderChangelogArchiveError(err) {
        const list = document.getElementById('changelogArchiveList');
        const count = document.getElementById('changelogArchiveCount');
        if (count) count.textContent = 'N/A';
        if (!list) return;

        const pre = document.createElement('pre');
        pre.textContent = [
            'CHANGELOG_ARCHIVE_LOAD_FAILED',
            `source: ../changelog.html`,
            `reason: ${err && err.message ? err.message : 'unknown error'}`,
            'action: open the full changelog link for manual inspection.'
        ].join('\n');
        list.innerHTML = '';
        list.appendChild(pre);
    }

    /* ===== Update Plan ===== */
    function renderUpdatePlan() {
        const list = document.getElementById('updatePlanList');
        if (!list) return;

        list.innerHTML = '';
        UPDATE_PLAN_ITEMS.forEach(item => {
            const row = document.createElement('div');
            row.className = 'plan-item';

            const meta = document.createElement('div');
            meta.className = 'plan-meta';

            const status = document.createElement('span');
            status.className = 'plan-status';
            status.textContent = item.status;

            const date = document.createElement('span');
            date.className = 'plan-date';
            date.textContent = item.date;

            const text = document.createElement('p');
            text.textContent = lang === 'en' ? item.en : item.zh;

            meta.appendChild(status);
            meta.appendChild(date);
            row.appendChild(meta);
            row.appendChild(text);
            list.appendChild(row);
        });
    }

    /* ===== Live Updates ===== */
    function startLiveUpdates() {
        setInterval(() => {
            const list = document.getElementById('feedList');
            if (list) appendFeedItem(list, genFeedItem(), true);
        }, rand(4000, 8000));

        setInterval(() => {
            if (!visitorChart) return;
            const ds = visitorChart.data;
            ds.labels.shift();
            ds.datasets[0].data.shift();
            const now = new Date();
            ds.labels.push(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            ds.datasets[0].data.push(rand(1, 9));
            visitorChart.update('none');
        }, 60000);
    }

    /* ===== Easter Eggs ===== */
    function initEasterEggs() {
        let code = [];
        const seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

        document.addEventListener('keydown', (e) => {
            code.push(e.keyCode);
            if (code.length > seq.length) code.shift();
            if (code.join(',') === seq.join(',')) {
                matrixRain();
                code = [];
            }
        });
    }

    function matrixRain() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;opacity:.12';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = '01数据中心ABCDEF'.split('');
        const sz = 14;
        const cols = Math.floor(canvas.width / sz);
        const drops = Array(cols).fill(1);

        function draw() {
            ctx.fillStyle = 'rgba(0,0,0,.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = css('--accent-green');
            ctx.font = sz + 'px monospace';
            drops.forEach((y, i) => {
                ctx.fillText(chars[rand(0, chars.length - 1)], i * sz, y * sz);
                if (y * sz > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
        }

        const interval = setInterval(draw, 35);
        setTimeout(() => { clearInterval(interval); canvas.remove(); }, 8000);
    }

    /* ===== Bootstrap ===== */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
