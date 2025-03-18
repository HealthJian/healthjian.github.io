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