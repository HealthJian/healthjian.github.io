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
            const hintEl = document.querySelector('.language-hint');
            
            if (quoteEl && hintEl) {
                if (newLang === 'en') {
                    // 切换到英文时显示英文引言
                    quoteEl.textContent = 'Man\'s life is less than a hundred years, yet he harbors griefs for a thousand.';
                    hintEl.textContent = '[click language]';
                } else {
                    // 切换到中文时显示中文引言
                    quoteEl.textContent = '人生不满百，常怀千岁忧。';
                    hintEl.textContent = '【点击语言】';
                }
            }
            
            // 更新所有带有data-en和data-zh属性的元素
            const elements = document.querySelectorAll('[data-en][data-zh]');
            elements.forEach(element => {
                element.textContent = element.getAttribute(`data-${newLang}`);
            });
            
            // 保存语言偏好
            localStorage.setItem('language', newLang);
        });
    }
    
    // 检查用户之前的语言偏好
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        // 应用保存的语言设置
        document.body.classList.remove('en', 'zh');
        document.body.classList.add(savedLang);
        
        // 更新所有文本
        const elements = document.querySelectorAll('[data-en][data-zh]');
        elements.forEach(element => {
            element.textContent = element.getAttribute(`data-${savedLang}`);
        });
        
        // 更新引言文本和提示
        const quoteEl = document.querySelector('.quote-text');
        const hintEl = document.querySelector('.language-hint');
        
        if (quoteEl && hintEl) {
            if (savedLang === 'en') {
                quoteEl.textContent = 'Man\'s life is less than a hundred years, yet he harbors griefs for a thousand.';
                hintEl.textContent = '[click language]';
            } else {
                quoteEl.textContent = '人生不满百，常怀千岁忧。';
                hintEl.textContent = '【点击语言】';
            }
        }
    }
}); 