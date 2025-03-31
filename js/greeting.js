// 问候语功能

// 根据当前时间获取适当的问候语
function getGreeting() {
    const hour = new Date().getHours();
    
    // 中文问候语
    let greetingZh = '';
    // 英文问候语
    let greetingEn = '';
    
    if (hour >= 0 && hour < 6) {
        greetingZh = "注意休息，凌晨早安！💤";
        greetingEn = "Take care, early morning greetings! 💤";
    } else if (hour >= 6 && hour < 10) {
        greetingZh = "早安！欢迎😀";
        greetingEn = "Good morning! Welcome 😀";
    } else if (hour >= 10 && hour < 15) {
        greetingZh = "中午好！😎";
        greetingEn = "Good afternoon! 😎";
    } else if (hour >= 15 && hour < 19) {
        greetingZh = "下午好！🤠";
        greetingEn = "Good afternoon! 🤠";
    } else if (hour >= 19 && hour <= 23) {
        greetingZh = "晚上好，😜";
        greetingEn = "Good evening! 😜";
    }
    
    return { zh: greetingZh, en: greetingEn };
}

// 打字机效果函数
function typeWriter(element, text, speed, callback) {
    let i = 0;
    element.textContent = '';
    
    // 根据当前语言设置字体样式
    const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
    if (currentLang === 'en') {
        element.style.fontFamily = "'Chewy', var(--font-family)";
    } else {
        element.style.fontFamily = "'ZCOOL KuaiLe', var(--font-family)";
    }

    function typing() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        } else if (typeof callback === 'function') {
            callback();
        }
    }
    
    typing();
}

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    const greetingElement = document.querySelector('.greeting');
    if (!greetingElement) return;
    
    const greetings = getGreeting();
    
    // 设置问候语的数据属性
    greetingElement.setAttribute('data-zh', greetings.zh);
    greetingElement.setAttribute('data-en', greetings.en);
    
    // 获取当前语言
    const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
    
    // 显示对应语言的问候语
    const currentGreeting = currentLang === 'en' ? greetings.en : greetings.zh;
    
    // 应用打字机效果
    typeWriter(greetingElement, currentGreeting, 100);
    
    // 监听语言切换事件
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        const originalClickHandler = langToggle.onclick;
        
        langToggle.onclick = function(event) {
            // 如果有原始事件处理器，先执行它
            if (typeof originalClickHandler === 'function') {
                originalClickHandler.call(this, event);
            }
            
            // 更新问候语
            setTimeout(function() {
                const newLang = document.body.classList.contains('en') ? 'en' : 'zh';
                const newGreeting = newLang === 'en' ? greetings.en : greetings.zh;
                
                // 应用打字机效果
                typeWriter(greetingElement, newGreeting, 100);
                
                // 根据语言设置字体
                if (newLang === 'en') {
                    greetingElement.style.fontFamily = "'Chewy', var(--font-family)";
                } else {
                    greetingElement.style.fontFamily = "'ZCOOL KuaiLe', var(--font-family)";
                }
            }, 100);
        };
    }
}); 