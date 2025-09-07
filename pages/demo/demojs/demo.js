// Demo页面专用交互脚本

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initializeDemoPage();
});

// 初始化Demo页面
function initializeDemoPage() {
    // 添加页面入场动画
    addPageAnimations();
    
    // 初始化卡片交互
    initializeCardInteractions();
    
    // 添加滚动效果
    addScrollEffects();
    
    // 初始化工具提示
    initializeTooltips();
    
    // 初始化移动端导航
    initializeMobileNavigation();
    
    console.log('Demo页面初始化完成');
}

// 添加页面入场动画
function addPageAnimations() {
    // 为页面标题添加入场动画
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        pageHeader.style.opacity = '0';
        pageHeader.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            pageHeader.style.transition = 'all 0.8s ease-out';
            pageHeader.style.opacity = '1';
            pageHeader.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // 为demo卡片添加延迟入场动画
    const demoCards = document.querySelectorAll('.demo-card');
    demoCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + index * 200);
    });
}

// 初始化卡片交互
function initializeCardInteractions() {
    const demoCards = document.querySelectorAll('.demo-card');
    
    demoCards.forEach(card => {
        // 鼠标悬停效果
        card.addEventListener('mouseenter', function() {
            // 添加悬停时的特殊效果
            const cardIcon = this.querySelector('.card-icon');
            if (cardIcon) {
                cardIcon.style.transform = 'scale(1.1) rotate(5deg)';
                cardIcon.style.transition = 'all 0.3s ease';
            }
            
            // 算法标签悬停效果
            const algorithmTags = this.querySelectorAll('.algorithm-tag');
            algorithmTags.forEach((tag, index) => {
                setTimeout(() => {
                    tag.style.transform = 'translateY(-2px)';
                }, index * 50);
            });
        });
        
        card.addEventListener('mouseleave', function() {
            // 恢复原状
            const cardIcon = this.querySelector('.card-icon');
            if (cardIcon) {
                cardIcon.style.transform = 'scale(1) rotate(0deg)';
            }
            
            // 恢复算法标签
            const algorithmTags = this.querySelectorAll('.algorithm-tag');
            algorithmTags.forEach(tag => {
                tag.style.transform = 'translateY(0)';
            });
        });
        
        // 点击效果（即使按钮禁用也有反馈）
        card.addEventListener('click', function() {
            // 添加点击波纹效果
            createRippleEffect(this, event);
            
            // 如果是排序卡片且按钮禁用，显示提示
            const sortingCard = this.closest('.sorting-card');
            const disabledBtn = this.querySelector('.demo-btn:disabled');
            
            if (sortingCard && disabledBtn) {
                showComingSoonTooltip(disabledBtn);
            }
        });
    });
}

// 创建波纹效果
function createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(0, 122, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// 添加CSS动画
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// 显示"即将推出"提示
function showComingSoonTooltip(button) {
    // 移除已存在的提示
    const existingTooltip = document.querySelector('.coming-soon-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    const tooltip = document.createElement('div');
    tooltip.className = 'coming-soon-tooltip';
    
    const lang = document.body.classList.contains('en') ? 'en' : 'zh';
    const message = lang === 'en' ? 
        'Sorting algorithms module is under development. Stay tuned!' : 
        '排序算法模块正在开发中，敬请期待！';
    
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--text-color);
        color: var(--background-color);
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        white-space: nowrap;
        z-index: 1000;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        pointer-events: none;
    `;
    
    // 定位提示框
    const rect = button.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 10}px`;
    tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
    
    document.body.appendChild(tooltip);
    
    // 显示动画
    setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateX(-50%) translateY(-100%) translateY(-10px)';
    }, 10);
    
    // 3秒后自动消失
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(() => tooltip.remove(), 300);
    }, 3000);
}

// 添加滚动效果
function addScrollEffects() {
    let ticking = false;
    
    function updateScrollEffects() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // 页面标题视差效果
        const pageHeader = document.querySelector('.page-header');
        if (pageHeader) {
            const parallaxSpeed = 0.3;
            pageHeader.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
        }
        
        // 卡片入场动画
        const demoCards = document.querySelectorAll('.demo-card');
        demoCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < windowHeight * 0.8;
            
            if (isVisible && !card.classList.contains('animated')) {
                card.classList.add('animated');
                card.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
        
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollUpdate);
    
    // 初始检查
    updateScrollEffects();
}

// 初始化工具提示
function initializeTooltips() {
    // 为Beta标签添加工具提示
    const betaBadges = document.querySelectorAll('.beta-badge, .beta-tag');
    betaBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            showTooltip(this, getBetaTooltipText());
        });
        
        badge.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
    
    // 算法标签的浮动介绍功能已删除
}

// 获取Beta标签提示文本
function getBetaTooltipText() {
    const lang = document.body.classList.contains('en') ? 'en' : 'zh';
    return lang === 'en' ? 
        'This feature is currently in beta testing' : 
        '此功能目前处于测试阶段';
}

// 算法工具提示函数已删除

// 显示工具提示
function showTooltip(element, text) {
    hideTooltip(); // 先隐藏已存在的提示
    
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--text-color);
        color: var(--background-color);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.85rem;
        white-space: nowrap;
        z-index: 1000;
        opacity: 0;
        transform: translateY(5px);
        transition: all 0.2s ease;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        pointer-events: none;
        max-width: 300px;
        white-space: normal;
        line-height: 1.4;
    `;
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;
    tooltip.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
}

// 隐藏工具提示
function hideTooltip() {
    const existingTooltip = document.querySelector('.custom-tooltip');
    if (existingTooltip) {
        existingTooltip.style.opacity = '0';
        existingTooltip.style.transform = 'translateX(-50%) translateY(-5px)';
        setTimeout(() => existingTooltip.remove(), 200);
    }
}

// 初始化移动端导航
function initializeMobileNavigation() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.querySelector('.demo-nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            // 切换菜单显示状态
            navMenu.classList.toggle('active');
            
            // 切换汉堡菜单图标动画
            const spans = mobileToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // 点击菜单链接时关闭移动端菜单
        const navLinks = navMenu.querySelectorAll('.demo-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                
                // 重置汉堡菜单图标
                const spans = mobileToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
        
        // 点击外部区域时关闭菜单
        document.addEventListener('click', function(event) {
            if (!mobileToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                
                // 重置汉堡菜单图标
                const spans = mobileToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
}

// 监听语言切换事件
document.addEventListener('DOMContentLoaded', function() {
    // 重写语言切换函数以更新工具提示
    const originalLangToggle = document.getElementById('lang-toggle');
    if (originalLangToggle) {
        originalLangToggle.addEventListener('click', function() {
            // 延迟一点时间确保语言已切换
            setTimeout(() => {
                // 重新初始化工具提示以适应新语言
                initializeTooltips();
            }, 100);
        });
    }
});

// 导出函数供其他脚本使用
window.demoPageUtils = {
    showComingSoonTooltip,
    createRippleEffect,
    showTooltip,
    hideTooltip
};
