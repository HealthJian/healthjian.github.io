// 语言切换功能

// 当前语言状态
let currentLang = 'zh'; // 默认中文

// 检查用户之前的语言偏好
function checkLanguagePreference() {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        currentLang = savedLang;
        changeLanguage(currentLang);
    }
}

// 切换语言
function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('language', currentLang);
    changeLanguage(currentLang);
}

// 更改页面上的所有文本
function changeLanguage(lang) {
    // 更新语言切换按钮文本
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        const langText = langToggle.querySelector('span');
        langText.textContent = langText.getAttribute(`data-${lang}`);
    }
    
    // 更新所有带有data-en和data-zh属性的元素
    const elements = document.querySelectorAll('[data-en][data-zh]');
    elements.forEach(element => {
        element.textContent = element.getAttribute(`data-${lang}`);
    });
}

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查语言偏好
    checkLanguagePreference();
    
    // 添加语言切换按钮事件监听器
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }
});

// 语言切换处理
document.getElementById('lang-toggle').addEventListener('click', function() {
    const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
    const newLang = currentLang === 'en' ? 'zh' : 'en';
    
    document.body.classList.remove(currentLang);
    document.body.classList.add(newLang);
    
    // 更新引言文本和提示
    const quoteEl = document.querySelector('.quote-text');
    const hintEl = document.querySelector('.language-hint');
    
    if (newLang === 'en') {
        // 切换到英文时显示英文引言
        quoteEl.textContent = 'Man\'s life is less than a hundred years, yet he harbors griefs for a thousand.';
        hintEl.textContent = '[click language]';
    } else {
        // 切换到中文时显示中文引言
        quoteEl.textContent = '人生不满百，常怀千岁忧。';
        hintEl.textContent = '【点击语言】';
    }
    
    // 更新其他元素...
}); 