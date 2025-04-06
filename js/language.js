// 语言切换功能

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 添加语言切换按钮事件监听器
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', function() {
            // 检查当前语言
            const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
            const newLang = currentLang === 'en' ? 'zh' : 'en';
            
            // 切换body类
            document.body.classList.remove(currentLang);
            document.body.classList.add(newLang);
            
            // 更新语言切换按钮文本
            const langText = langToggle.querySelector('span');
            if (langText) {
                langText.textContent = langText.getAttribute(`data-${newLang}`);
            }
            
            // 更新引言文本和提示
            const quoteEl = document.querySelector('.quote-text');
            
            if (quoteEl) {
                if (newLang === 'en') {
                    // 切换到英文时显示英文引言
                    quoteEl.textContent = 'Think less, and happiness will chase after you!';
                } else {
                    // 切换到中文时显示中文引言
                    quoteEl.textContent = '只要想的少 快乐追着跑！';
                }
                
                // 应用引言文本字体
                if (typeof applyQuoteFont === 'function') {
                    applyQuoteFont();
                }
            }
            
            // 更新所有带有data-en和data-zh属性的元素
            updateAllLanguageElements(newLang);
            
            // 保存语言偏好
            localStorage.setItem('language', newLang);
            
            // 如果在博客页面，重新加载当前页的文章以更新语言
            if (window.location.href.includes('/blog.html')) {
                const activePage = document.querySelector('.pagination .active');
                if (activePage) {
                    const currentPage = parseInt(activePage.textContent);
                    loadPagePosts(currentPage);
                } else {
                    loadPagePosts(1);
                }
            }
        });
    }
    
    // 检查用户之前的语言偏好
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        // 应用保存的语言设置
        document.body.classList.remove('en', 'zh');
        document.body.classList.add(savedLang);
        
        // 更新所有文本
        updateAllLanguageElements(savedLang);
        
        // 更新引言文本和提示
        const quoteEl = document.querySelector('.quote-text');
        
        if (quoteEl) {
            if (savedLang === 'en') {
                quoteEl.textContent = 'Think less, and happiness will chase after you!';
            } else {
                quoteEl.textContent = '只要想的少 快乐追着跑！';
            }
            
            // 应用引言文本字体
            if (typeof applyQuoteFont === 'function') {
                applyQuoteFont();
            }
        }
    } else {
        // 如果没有保存的语言偏好，默认显示中文
        document.body.classList.add('zh');
        
        // 更新所有文本为中文
        updateAllLanguageElements('zh');
        
        // 确保引言显示中文
        const quoteEl = document.querySelector('.quote-text');
        
        if (quoteEl) {
            quoteEl.textContent = '只要想的少 快乐追着跑！';
            
            // 应用引言文本字体
            if (typeof applyQuoteFont === 'function') {
                applyQuoteFont();
            }
        }
    }
});

// 更新所有带有语言属性的元素
function updateAllLanguageElements(lang) {
    const elements = document.querySelectorAll('[data-en][data-zh]');
    elements.forEach(element => {
        element.textContent = element.getAttribute(`data-${lang}`);
    });
    
    // 更新搜索框占位符
    const searchInputs = document.querySelectorAll('input[data-en-placeholder][data-zh-placeholder]');
    searchInputs.forEach(input => {
        input.placeholder = input.getAttribute(`data-${lang}-placeholder`);
    });
} 