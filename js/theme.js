// 主题切换功能

// 根据当前时间获取合适的主题
function getThemeByTime() {
    const hour = new Date().getHours();
    // 6:00-18:00 为日间模式，19:00-5:00 为夜间模式
    return (hour >= 6 && hour <= 18) ? 'light-mode' : 'dark-mode';
}

// 检查用户之前的主题偏好
function checkThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    // 如果用户手动设置了主题，优先使用
    if (savedTheme) {
        document.body.className = savedTheme;
        updateThemeToggleIcon(savedTheme);
    } 
    // 如果没有手动设置，根据时间自动判断
    else {
        const timeBasedTheme = getThemeByTime();
        document.body.className = timeBasedTheme;
        updateThemeToggleIcon(timeBasedTheme);
    }
}

// 更新主题切换按钮图标
function updateThemeToggleIcon(theme) {
    const moonIcon = document.querySelector('.theme-toggle .fa-moon');
    const sunIcon = document.querySelector('.theme-toggle .fa-sun');
    
    if (theme === 'dark-mode') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'inline-block';
    } else {
        moonIcon.style.display = 'inline-block';
        sunIcon.style.display = 'none';
    }
}

// 切换主题
function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light-mode');
        updateThemeToggleIcon('light-mode');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark-mode');
        updateThemeToggleIcon('dark-mode');
    }
}

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查主题偏好
    checkThemePreference();
    
    // 添加主题切换按钮事件监听器
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}); 