// 项目页面的JavaScript功能

document.addEventListener('DOMContentLoaded', function() {
    // 初始化项目过滤器
    initProjectFilters();
    
    // 项目卡片悬停效果
    initProjectCards();
    
    // 页面动画效果
    initPageAnimations();
});

/**
 * 初始化项目过滤器
 */
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    const projectCards = document.querySelectorAll('.project-card');
    
    // 为每个过滤按钮添加点击事件
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的激活状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的激活状态
            this.classList.add('active');
            
            // 获取过滤类别
            const filter = this.getAttribute('data-filter');
            
            // 过滤项目卡片
            filterProjects(filter, projectCards);
        });
    });
}

/**
 * 过滤项目卡片
 * @param {string} filter - 过滤类别
 * @param {NodeList} cards - 项目卡片元素
 */
function filterProjects(filter, cards) {
    cards.forEach(card => {
        // 显示所有卡片
        if (filter === 'all') {
            card.style.display = 'flex';
            // 添加动画效果
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
            return;
        }
        
        // 检查卡片是否匹配过滤条件
        const tags = card.getAttribute('data-tags').split(',');
        
        if (tags.includes(filter)) {
            card.style.display = 'flex';
            // 添加动画效果
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            // 隐藏不匹配的卡片
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

/**
 * 初始化项目卡片交互效果
 */
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // 可以添加鼠标进入卡片时的特效
            const image = this.querySelector('.project-image');
            if (image) {
                image.style.transform = 'scale(1.05)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            // 鼠标离开时恢复
            const image = this.querySelector('.project-image');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        });
    });
}

/**
 * 初始化页面动画效果
 */
function initPageAnimations() {
    // 页面加载时的动画效果
    const header = document.querySelector('.project-header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            header.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // 项目卡片逐个显示的动画
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 100)); // 延迟增加，实现逐个显示的效果
    });
} 