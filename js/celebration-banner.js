// 庆祝横幅交互控制 - 中国人民解放军建立98周年
class CelebrationBanner {
    constructor() {
        this.banner = null;
        this.lastScrollTop = 0;
        this.scrollThreshold = 50; // 滚动阈值
        this.isVisible = false;
        this.showTimeout = null;
        this.hideTimeout = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        // 确保在DOM加载完成后初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupBanner());
        } else {
            this.setupBanner();
        }
    }
    
    setupBanner() {
        // 只在首页显示横幅
        if (!this.isHomePage()) {
            return;
        }
        
        this.createBanner();
        this.bindEvents();
        this.showBanner(); // 页面加载时显示横幅
        this.isInitialized = true;
    }
    
    isHomePage() {
        // 检测是否为首页
        const pathname = window.location.pathname;
        const filename = pathname.split('/').pop() || '';
        
        // 首页的各种可能路径
        return pathname === '/' || 
               pathname === '/index.html' || 
               pathname.endsWith('/') ||
               filename === 'index.html' ||
               (pathname.endsWith('/') && !pathname.includes('/pages/'));
    }
    
    createBanner() {
        // 创建横幅元素
        this.banner = document.createElement('div');
        this.banner.className = 'celebration-banner';
        this.banner.setAttribute('role', 'banner');
        this.banner.setAttribute('aria-label', '庆祝中国人民解放军建立98周年');
        
        // 获取当前语言
        const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
        
        // 设置横幅内容
        const content = this.getBannerContent(currentLang);
        this.banner.innerHTML = content;
        
        // 插入到页面中（导航栏后面）
        document.body.appendChild(this.banner);
        
        // 监听语言切换事件
        this.setupLanguageToggle();
    }
    
    getBannerContent(lang) {
        if (lang === 'en') {
            return `
                <div class="celebration-banner-content">
                    <span class="flag-icon">🇨🇳</span>
                    <span class="star-icon">⭐</span>
                    <span class="celebration-banner-text">Celebrating the</span>
                    <span class="celebration-banner-year">98th Anniversary</span>
                    <span class="celebration-banner-text">of the People's Liberation Army</span>
                    <span class="star-icon">⭐</span>
                </div>
            `;
        } else {
            return `
                <div class="celebration-banner-content">
                    <span class="flag-icon">🇨🇳</span>
                    <span class="star-icon">⭐</span>
                    <span class="celebration-banner-text">庆祝中国人民解放军建立</span>
                    <span class="celebration-banner-year">98周年</span>
                    <span class="star-icon">⭐</span>
                </div>
            `;
        }
    }
    
    setupLanguageToggle() {
        // 监听语言切换
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            // 保存原始的点击处理函数
            const originalHandler = langToggle.onclick;
            
            langToggle.onclick = (event) => {
                // 执行原始处理函数
                if (originalHandler) {
                    originalHandler.call(langToggle, event);
                }
                
                // 延迟更新横幅内容，确保语言切换完成
                setTimeout(() => {
                    this.updateBannerContent();
                }, 100);
            };
        }
    }
    
    updateBannerContent() {
        if (!this.banner) return;
        
        const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
        const newContent = this.getBannerContent(currentLang);
        this.banner.innerHTML = newContent;
    }
    
    bindEvents() {
        // 绑定滚动事件
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
        
        // 绑定窗口大小改变事件
        window.addEventListener('resize', this.throttle(this.handleResize.bind(this), 250));
    }
    
    handleScroll() {
        if (!this.banner) return;
        
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDirection = currentScrollTop > this.lastScrollTop ? 'down' : 'up';
        const isAtTop = currentScrollTop <= 10;
        const isAtBottom = (window.innerHeight + currentScrollTop) >= document.documentElement.scrollHeight - 10;
        
        // 清除之前的定时器
        clearTimeout(this.showTimeout);
        clearTimeout(this.hideTimeout);
        
        // 判断是否显示横幅
        const shouldShow = this.shouldShowBanner(scrollDirection, isAtTop, isAtBottom, currentScrollTop);
        
        if (shouldShow && !this.isVisible) {
            this.showBanner();
        } else if (!shouldShow && this.isVisible) {
            this.hideBanner();
        }
        
        this.lastScrollTop = currentScrollTop;
    }
    
    shouldShowBanner(scrollDirection, isAtTop, isAtBottom, currentScrollTop) {
        // 在顶部时显示
        if (isAtTop) {
            return true;
        }
        
        // 在底部时显示
        if (isAtBottom) {
            return true;
        }
        
        // 向上滚动时显示（但不是刚开始滚动）
        if (scrollDirection === 'up' && currentScrollTop > this.scrollThreshold) {
            return true;
        }
        
        // 其他情况隐藏
        return false;
    }
    
    showBanner() {
        if (!this.banner || this.isVisible) return;
        
        // 延迟显示，确保动画流畅
        this.showTimeout = setTimeout(() => {
            this.banner.classList.add('show');
            this.isVisible = true;
            document.body.classList.add('celebration-banner-active');
        }, 50);
    }
    
    hideBanner() {
        if (!this.banner || !this.isVisible) return;
        
        // 延迟隐藏，避免频繁切换
        this.hideTimeout = setTimeout(() => {
            this.banner.classList.remove('show');
            this.isVisible = false;
            document.body.classList.remove('celebration-banner-active');
        }, 100);
    }
    
    handleResize() {
        // 窗口大小改变时重新计算位置
        if (this.banner && this.isVisible) {
            // 重新触发显示逻辑
            this.handleScroll();
        }
    }
    
    // 节流函数，优化性能
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // 销毁横幅（用于未来的移除功能）
    destroy() {
        if (this.banner) {
            this.banner.remove();
            this.banner = null;
        }
        
        // 清除定时器
        clearTimeout(this.showTimeout);
        clearTimeout(this.hideTimeout);
        
        // 移除body类
        document.body.classList.remove('celebration-banner-active');
        
        this.isInitialized = false;
        this.isVisible = false;
    }
    
    // 手动显示横幅
    forceShow() {
        if (this.banner) {
            this.showBanner();
        }
    }
    
    // 手动隐藏横幅
    forceHide() {
        if (this.banner) {
            this.hideBanner();
        }
    }
}

// 创建横幅实例
let celebrationBanner = null;

// 初始化横幅
function initCelebrationBanner() {
    if (!celebrationBanner) {
        celebrationBanner = new CelebrationBanner();
    }
}

// 销毁横幅（供未来使用）
function destroyCelebrationBanner() {
    if (celebrationBanner) {
        celebrationBanner.destroy();
        celebrationBanner = null;
    }
}

// 自动初始化
initCelebrationBanner();

// 导出到全局作用域，方便调试和控制
window.celebrationBanner = celebrationBanner;
window.initCelebrationBanner = initCelebrationBanner;
window.destroyCelebrationBanner = destroyCelebrationBanner; 