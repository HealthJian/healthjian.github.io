// 书架页面的JavaScript功能

document.addEventListener('DOMContentLoaded', function() {
    initBookshelf();
    setupLanguageToggle();
});

// 初始化书架功能
function initBookshelf() {
    // 更新每个分类的书籍数量显示
    updateCategoryCount();
    
    // 为所有书籍卡片添加悬停效果
    const bookCards = document.querySelectorAll('.book-card');
    bookCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.setAttribute('data-hovered', 'true');
        });
        
        card.addEventListener('mouseleave', function() {
            this.removeAttribute('data-hovered');
        });
    });
}

// 更新每个分类中的书籍数量
function updateCategoryCount() {
    const categories = document.querySelectorAll('.book-category');
    
    categories.forEach(category => {
        const categoryId = category.id;
        const booksGrid = category.querySelector('.books-grid');
        const bookCount = booksGrid ? booksGrid.querySelectorAll('.book-card').length : 0;
        
        // 查找并更新计数标签
        const countEl = category.querySelector('.category-count');
        if (countEl) {
            countEl.textContent = bookCount;
        }
        
        // 如果这个分类没有书籍，可以隐藏或显示"暂无书籍"提示
        if (bookCount === 0) {
            if (!category.querySelector('.empty-shelf')) {
                const emptyShelf = document.createElement('div');
                emptyShelf.className = 'empty-shelf';
                emptyShelf.innerHTML = `
                    <i class="fas fa-book-open"></i>
                    <p class="bilingual-content">
                        <span class="zh-content">这个书架暂时是空的，敬请期待更多作品。</span>
                        <span class="en-content" style="display:none;">This shelf is currently empty. Stay tuned for more works.</span>
                    </p>
                `;
                
                // 如果有网格但为空，替换它
                if (booksGrid) {
                    booksGrid.replaceWith(emptyShelf);
                } else {
                    // 否则直接添加到分类中
                    category.appendChild(emptyShelf);
                }
            }
        }
    });
}

// 语言切换时更新内容
function setupLanguageToggle() {
    const langToggle = document.getElementById('lang-toggle');
    
    if (langToggle) {
        langToggle.addEventListener('click', function() {
            // 延迟执行以确保语言切换已完成
            setTimeout(() => {
                const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
                
                // 更新所有双语内容
                updateBilingualContent(currentLang);
                
                // 更新筛选按钮标签
                updateFilterLabels(currentLang);
            }, 50);
        });
        
        // 初始执行一次以应用当前语言
        const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
        updateBilingualContent(currentLang);
        updateFilterLabels(currentLang);
    }
}

// 更新双语内容的显示
function updateBilingualContent(lang) {
    const bilingualElements = document.querySelectorAll('.bilingual-content');
    
    bilingualElements.forEach(element => {
        const zhContent = element.querySelector('.zh-content');
        const enContent = element.querySelector('.en-content');
        
        if (zhContent && enContent) {
            if (lang === 'en') {
                zhContent.style.display = 'none';
                enContent.style.display = 'block';
            } else {
                zhContent.style.display = 'block';
                enContent.style.display = 'none';
            }
        }
    });
}

// 更新筛选按钮的标签
function updateFilterLabels(lang) {
    const filterButtons = document.querySelectorAll('.filter-button');
    
    filterButtons.forEach(button => {
        const zhLabel = button.getAttribute('data-zh');
        const enLabel = button.getAttribute('data-en');
        
        if (zhLabel && enLabel) {
            button.textContent = lang === 'en' ? enLabel : zhLabel;
        }
    });
} 