// 主题切换功能

// 检查用户之前的主题偏好
function checkThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        updateThemeToggleIcon(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // 如果用户系统偏好暗色模式
        document.body.className = 'dark-mode';
        updateThemeToggleIcon('dark-mode');
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