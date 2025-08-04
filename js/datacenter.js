// Datacenter JavaScript
(function() {
    'use strict';

    // Language Translations
    const translations = {
        'zh': {
            'title': '数据中心 - Data Center',
            'site-name': '数据中心',
            'theme-slogan': '"数据之美，光影之诗"',
            'lang-toggle': '中 / EN',
            'global-status': '全局状态',
            'system-online': '系统在线',
            'uptime': '100% 运行时间 (近24小时)',
            'live-visitors': '实时访客 (近60分钟)',
            'today-visitors': '今日访客',
            'vs-yesterday': '较昨日 +12%',
            'visitor-sources': '访客来源',
            'top-regions': '主要访问地区',
            'united-states': '美国',
            'jiangsu': '中国江苏',
            'singapore': '新加坡',
            'shandong': '中国山东',
            'shanxi': '中国山西',
            'server-status': '核心服务状态',
            'api-service': 'API 服务',
            'database': '数据库',
            'cdn-network': 'CDN 网络',
            'operational': '运行正常',
            'page-load': '页面加载性能',
            'your-name': '健健',
            'powered-by': 'Powered by Passion'
        },
        'en': {
            'title': 'Data Center - 数据中心',
            'site-name': 'Data Center',
            'theme-slogan': '"The Beauty of Data, a Poem of Light and Shadow"',
            'lang-toggle': 'EN / 中',
            'global-status': 'Global Status',
            'system-online': 'SYSTEM ONLINE',
            'uptime': '100% Uptime (Last 24h)',
            'live-visitors': 'Live Visitors (Last 60 Mins)',
            'today-visitors': 'Today\'s Visitors',
            'vs-yesterday': 'vs Yesterday +12%',
            'visitor-sources': 'Visitor Sources',
            'top-regions': 'Top Regions',
            'united-states': 'United States',
            'jiangsu': 'Jiangsu, China',
            'singapore': 'Singapore',
            'shandong': 'Shandong, China',
            'shanxi': 'Shanxi, China',
            'server-status': 'Core Services Status',
            'api-service': 'API Service',
            'database': 'Database',
            'cdn-network': 'CDN Network',
            'operational': 'OPERATIONAL',
            'page-load': 'Page Load Performance',
            'your-name': 'Jianjian',
            'powered-by': 'Powered by Passion'
        }
    };

    // Application State
    let currentLang = 'zh';
    let currentTheme = localStorage.getItem('theme') || 'light';
    let visitorChart = null;
    let performanceChart = null;

    // Data Update Configuration
    const UPDATE_INTERVALS = {
        VISITOR_CHART: 43200000,    // 12 hours = 12 * 60 * 60 * 1000 ms
        VISITOR_COUNT: 86400000,    // 24 hours = 24 * 60 * 60 * 1000 ms
        MAX_VISITORS: 50,           // 最大访客数限制
        MIN_VISITORS: 1             // 最小访客数限制
    };

    // Initialize Application
    function init() {
        initTheme();
        initLanguage();
        initEventListeners();
        initCharts();
        initAnimations();
        startDataUpdates();
    }

    // Theme Management
    function initTheme() {
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon();
    }

    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateThemeIcon();
        updateChartColors();
    }

    function updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('.theme-icon');
        if (currentTheme === 'dark') {
            icon.style.transform = 'rotate(180deg)';
        } else {
            icon.style.transform = 'rotate(0deg)';
        }
    }

    // Language Management
    function initLanguage() {
        updateLanguage();
    }

    function toggleLanguage() {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        updateLanguage();
    }

    function updateLanguage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[currentLang] && translations[currentLang][key]) {
                element.textContent = translations[currentLang][key];
            }
        });
        
        // Update document title
        document.title = translations[currentLang]['title'];
    }

    // Event Listeners
    function initEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        const langToggle = document.getElementById('langToggle');

        themeToggle.addEventListener('click', toggleTheme);
        langToggle.addEventListener('click', toggleLanguage);

        // World map visitor dots
        const visitorDots = document.querySelectorAll('.visitor-dot');
        visitorDots.forEach(dot => {
            dot.addEventListener('click', function() {
                const region = this.getAttribute('data-region');
                showRegionTooltip(region, this);
            });
        });

        // Card hover effects
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(-5px)';
            });
        });
    }

    // Animations
    function initAnimations() {
        // Animate big number
        animateNumber('todayCount', 42, 2000);
        
        // Animate progress bars
        setTimeout(() => {
            const bars = document.querySelectorAll('.bar-fill');
            bars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        }, 500);
    }

    function animateNumber(elementId, target, duration) {
        const element = document.getElementById(elementId);
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    // Charts
    function initCharts() {
        initVisitorChart();
        initPerformanceChart();
    }

    function initVisitorChart() {
        const ctx = document.getElementById('visitorChart').getContext('2d');
        const data = generateVisitorData();
        
        visitorChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: currentLang === 'zh' ? '访客数' : 'Visitors',
                    data: data.values,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim(),
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim() + '20',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false,
                        beginAtZero: true
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    function initPerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        const data = {
            labels: ['Homepage', 'Blog Post', 'About', 'Projects', 'Gallery'],
            datasets: [{
                label: currentLang === 'zh' ? '加载时间 (ms)' : 'Load Time (ms)',
                data: [120, 180, 95, 150, 110],
                backgroundColor: [
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim() + '80',
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-green').trim() + '80',
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim() + '60',
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-green').trim() + '60',
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim() + '40'
                ],
                borderColor: [
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim(),
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-green').trim(),
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim(),
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-green').trim(),
                    getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim()
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        };

        performanceChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                        }
                    },
                    y: {
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateChartColors() {
        if (visitorChart) {
            const accentBlue = getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim();
            visitorChart.data.datasets[0].borderColor = accentBlue;
            visitorChart.data.datasets[0].backgroundColor = accentBlue + '20';
            visitorChart.update();
        }

        if (performanceChart) {
            const accentBlue = getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim();
            const accentGreen = getComputedStyle(document.documentElement).getPropertyValue('--accent-green').trim();
            const textSecondary = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
            const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
            
            performanceChart.data.datasets[0].backgroundColor = [
                accentBlue + '80',
                accentGreen + '80',
                accentBlue + '60',
                accentGreen + '60',
                accentBlue + '40'
            ];
            performanceChart.data.datasets[0].borderColor = [
                accentBlue,
                accentGreen,
                accentBlue,
                accentGreen,
                accentBlue
            ];
            
            performanceChart.options.scales.x.ticks.color = textSecondary;
            performanceChart.options.scales.y.ticks.color = textSecondary;
            performanceChart.options.scales.y.grid.color = borderColor;
            
            performanceChart.update();
        }
    }

    function generateVisitorData() {
        const labels = [];
        const values = [];
        const now = new Date();
        
        for (let i = 59; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60000);
            labels.push(time.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            }));
            values.push(Math.floor(Math.random() * 8) + 1); // 1-8 范围更符合小访问量
        }
        
        return { labels, values };
    }

    // Data Updates
    function startDataUpdates() {
        // Update visitor chart every 12 hours
        setInterval(() => {
            if (visitorChart) {
                const newData = generateVisitorData();
                visitorChart.data.labels = newData.labels;
                visitorChart.data.datasets[0].data = newData.values;
                visitorChart.update('none');
            }
        }, UPDATE_INTERVALS.VISITOR_CHART);

        // Update visitor count every 24 hours
        setInterval(() => {
            const currentCount = parseInt(document.getElementById('todayCount').textContent.replace(/,/g, ''));
            // 随机增减1-3，但保持在配置的范围内
            const change = Math.floor(Math.random() * 7) - 3; // -3到+3的变化
            const newCount = Math.max(UPDATE_INTERVALS.MIN_VISITORS, 
                                    Math.min(UPDATE_INTERVALS.MAX_VISITORS, currentCount + change));
            animateNumber('todayCount', newCount, 1000);
        }, UPDATE_INTERVALS.VISITOR_COUNT);
    }

    // Region Tooltip
    function showRegionTooltip(region, element) {
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'region-tooltip';
        tooltip.textContent = `Active visitors from ${region}`;
        tooltip.style.cssText = `
            position: absolute;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 0.8rem;
            color: var(--text-primary);
            backdrop-filter: blur(10px);
            z-index: 1000;
            pointer-events: none;
            transform: translate(-50%, -100%);
            margin-top: -10px;
        `;

        // Position tooltip
        const rect = element.getBoundingClientRect();
        const container = element.closest('.world-map');
        const containerRect = container.getBoundingClientRect();
        
        tooltip.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
        tooltip.style.top = (rect.top - containerRect.top) + 'px';

        container.style.position = 'relative';
        container.appendChild(tooltip);

        // Remove tooltip after 3 seconds
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);

        // Add pulse effect to dot
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'blink 3s infinite';
        }, 100);
    }

    // Utility Functions
    function formatNumber(num) {
        return num.toLocaleString();
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Performance Monitoring (Simulated)
    function simulatePerformanceData() {
        const pages = ['Homepage', 'Blog Post', 'About', 'Projects', 'Gallery'];
        return pages.map(page => ({
            name: page,
            loadTime: getRandomInt(80, 200)
        }));
    }

    // Easter Eggs
    function initEasterEggs() {
        // Konami Code
        let konamiCode = [];
        const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
        
        document.addEventListener('keydown', function(e) {
            konamiCode.push(e.keyCode);
            if (konamiCode.length > konamiSequence.length) {
                konamiCode.shift();
            }
            
            if (konamiCode.join(',') === konamiSequence.join(',')) {
                activateEasterEgg();
                konamiCode = [];
            }
        });
    }

    function activateEasterEgg() {
        // Add matrix rain effect
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.1;
        `;
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const chars = "0123456789ABCDEF数据中心";
        const matrix = chars.split("");
        const font_size = 14;
        const columns = canvas.width / font_size;
        const drops = [];
        
        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }
        
        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = getComputedStyle(document.documentElement)
                .getPropertyValue('--accent-green').trim();
            ctx.font = font_size + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = matrix[Math.floor(Math.random() * matrix.length)];
                ctx.fillText(text, i * font_size, drops[i] * font_size);
                
                if (drops[i] * font_size > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        const matrixInterval = setInterval(draw, 35);
        
        // Remove matrix effect after 10 seconds
        setTimeout(() => {
            clearInterval(matrixInterval);
            document.body.removeChild(canvas);
        }, 10000);
        
        // Show achievement message
        const achievement = document.createElement('div');
        achievement.textContent = '🎉 Easter Egg Activated! Matrix Mode Enabled!';
        achievement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-bg);
            border: 1px solid var(--accent-green);
            border-radius: 12px;
            padding: 20px 30px;
            color: var(--accent-green);
            font-weight: bold;
            z-index: 10000;
            backdrop-filter: blur(10px);
            animation: fadeInUp 0.5s ease;
        `;
        document.body.appendChild(achievement);
        
        setTimeout(() => {
            document.body.removeChild(achievement);
        }, 3000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Initialize easter eggs
    initEasterEggs();

    // Export for debugging
    window.DataCenter = {
        toggleTheme,
        toggleLanguage,
        updateChartColors,
        activateEasterEgg
    };

})();