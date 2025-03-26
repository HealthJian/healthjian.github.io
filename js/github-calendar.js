/**
 * GitHub 贡献日历脚本
 * 创建一个类似 GitHub 个人主页的贡献热图
 * 作者: HealthJian
 * 日期: 2025-03-26
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化日历
    initGitHubCalendar();
    
    // 监听主题切换，更新日历颜色
    document.getElementById('theme-toggle').addEventListener('click', function() {
        // 延迟执行以确保主题切换完成
        setTimeout(updateCalendarTheme, 100);
    });
});

/**
 * 初始化 GitHub 贡献日历
 */
function initGitHubCalendar() {
    renderCalendar();
    addTooltipBehavior();
}

/**
 * 渲染贡献日历
 */
function renderCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;
    
    // 清空日历
    calendarGrid.innerHTML = '';
    
    // 获取过去一年的日期
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 364);
    
    // 生成模拟数据（实际应用中应从GitHub API获取）
    const contributionData = generateMockData(oneYearAgo, today);
    
    // 填充日历格子
    for (let date = new Date(oneYearAgo); date <= today; date.setDate(date.getDate() + 1)) {
        const dateStr = formatDate(date);
        const level = contributionData[dateStr] || 0;
        
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day level-${level}`;
        dayElement.setAttribute('data-date', dateStr);
        dayElement.setAttribute('data-count', contributionData[dateStr] || 0);
        
        calendarGrid.appendChild(dayElement);
    }
    
    // 添加月份标签
    renderMonthLabels(oneYearAgo);
    
    // 显示统计数据
    renderStats(contributionData);
}

/**
 * 生成模拟贡献数据
 * 在实际应用中，这些数据应该从GitHub API获取
 * 目前API不打算调用，这个先做一个展示，修改后的实际代码已经写好了
 */
function generateMockData(startDate, endDate) {
    const data = {};
    
    // 基础概率（30%的日子有贡献）
    const baseProb = 0.3;
    
    // 增加周末概率（50%的周末有贡献）
    const weekendProb = 0.5;
    
    // 特定日期模式（85%的周二和周四有贡献）
    const patternProb = 0.85;
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = formatDate(date);
        const day = date.getDay();
        
        // 基础概率
        let prob = baseProb;
        
        // 周末概率调整
        if (day === 0 || day === 6) {
            prob = weekendProb;
        }
        
        // 特定模式日概率调整（周二和周四）
        if (day === 2 || day === 4) {
            prob = patternProb;
        }
        
        // 决定是否有贡献
        if (Math.random() < prob) {
            // 生成贡献量 (1-12)
            const count = Math.floor(Math.random() * 12) + 1;
            
            // 根据贡献量确定级别
            let level;
            if (count <= 2) level = 1;
            else if (count <= 5) level = 2;
            else if (count <= 9) level = 3;
            else level = 4;
            
            data[dateStr] = level;
        }
    }
    
    return data;
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 渲染月份标签
 */
function renderMonthLabels(startDate) {
    const months = document.querySelector('.calendar-months');
    if (!months) return;
    
    const monthNames = {
        zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    
    // 清空月份标签
    months.innerHTML = '';
    
    // 获取当前语言
    const lang = document.documentElement.lang === 'en' ? 'en' : 'zh';
    
    // 填充月份标签
    const date = new Date(startDate);
    for (let i = 0; i < 12; i++) {
        const monthIndex = (date.getMonth() + i) % 12;
        const span = document.createElement('span');
        span.textContent = monthNames[lang][monthIndex];
        span.setAttribute('data-en', monthNames['en'][monthIndex]);
        span.setAttribute('data-zh', monthNames['zh'][monthIndex]);
        months.appendChild(span);
    }
}

/**
 * 渲染统计数据
 */
function renderStats(data) {
    const statsContainer = document.querySelector('.contribution-stats');
    if (!statsContainer) return;
    
    // 计算总贡献数
    const totalCount = Object.keys(data).length;
    
    // 计算最长连续贡献天数
    const sortedDates = Object.keys(data).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let prevDate = null;
    
    for (const dateStr of sortedDates) {
        const date = new Date(dateStr);
        
        if (prevDate) {
            const dayDiff = (date - prevDate) / (1000 * 60 * 60 * 24);
            if (dayDiff === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }
        
        longestStreak = Math.max(longestStreak, currentStreak);
        prevDate = date;
    }
    
    // 更新DOM
    document.getElementById('total-contributions').textContent = totalCount;
    document.getElementById('longest-streak').textContent = longestStreak;
}

/**
 * 为日历格子添加提示框行为
 */
function addTooltipBehavior() {
    const days = document.querySelectorAll('.calendar-day');
    const tooltip = document.querySelector('.day-tooltip');
    
    if (!tooltip) return;
    
    days.forEach(day => {
        day.addEventListener('mouseenter', function(e) {
            const date = this.getAttribute('data-date');
            const count = this.getAttribute('data-count');
            
            // 转换日期格式
            const displayDate = formatDisplayDate(date);
            
            // 获取当前语言
            const lang = document.documentElement.lang === 'en' ? 'en' : 'zh';
            
            // 设置提示内容
            const tooltipText = lang === 'en' ? 
                `${count} contributions on ${displayDate}` : 
                `${displayDate}，${count} 次贡献`;
            
            tooltip.textContent = tooltipText;
            
            // 定位提示框
            const rect = this.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - 35}px`;
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.opacity = '1';
        });
        
        day.addEventListener('mouseleave', function() {
            tooltip.style.opacity = '0';
        });
    });
}

/**
 * 格式化显示日期
 */
function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    const lang = document.documentElement.lang === 'en' ? 'en' : 'zh';
    
    if (lang === 'en') {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    } else {
        return date.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

/**
 * 更新日历主题颜色
 */
function updateCalendarTheme() {
    // 此函数不需要做什么，因为我们使用CSS变量和类来控制主题
    // 当body的类改变时，CSS会自动应用正确的颜色
    console.log('GitHub日历主题已更新');
}

// 语言切换时更新月份标签
document.addEventListener('languageChanged', function(e) {
    const days = document.querySelectorAll('.calendar-day');
    const months = document.querySelectorAll('.calendar-months span');
    
    // 当前语言
    const lang = e.detail.lang;
    
    // 更新月份标签
    months.forEach(month => {
        month.textContent = month.getAttribute(`data-${lang}`);
    });
});

/**
 * ==========================================================================
 * GitHub API 集成代码 - 仅作为参考，目前使用模拟数据
 * 要使用真实 GitHub 数据，请按照以下注释替换对应函数
 * ==========================================================================
 */

/**
 * 使用 GitHub API 的 renderCalendar 函数实现
 * 
 * async function renderCalendar() {
 *     const calendarGrid = document.querySelector('.calendar-grid');
 *     if (!calendarGrid) return;
 *     
 *     // 清空日历
 *     calendarGrid.innerHTML = '';
 *     
 *     // 显示加载指示器
 *     calendarGrid.innerHTML = '<div class="loading-indicator">加载中...</div>';
 *     
 *     // 获取过去一年的日期
 *     const today = new Date();
 *     const oneYearAgo = new Date(today);
 *     oneYearAgo.setDate(today.getDate() - 364);
 *     
 *     try {
 *         // 从 GitHub API 获取数据
 *         const contributionData = await fetchGitHubContributions(oneYearAgo, today);
 *         
 *         // 清除加载指示器
 *         calendarGrid.innerHTML = '';
 *         
 *         // 填充日历格子
 *         for (let date = new Date(oneYearAgo); date <= today; date.setDate(date.getDate() + 1)) {
 *             const dateStr = formatDate(date);
 *             const contribution = contributionData[dateStr] || { level: 0, count: 0 };
 *             
 *             const dayElement = document.createElement('div');
 *             dayElement.className = `calendar-day level-${contribution.level}`;
 *             dayElement.setAttribute('data-date', dateStr);
 *             dayElement.setAttribute('data-count', contribution.count);
 *             
 *             calendarGrid.appendChild(dayElement);
 *         }
 *         
 *         // 添加月份标签
 *         renderMonthLabels(oneYearAgo);
 *         
 *         // 显示统计数据
 *         renderStats(contributionData);
 *     } catch (error) {
 *         console.error('加载 GitHub 贡献数据失败:', error);
 *         calendarGrid.innerHTML = '<div class="error-message">无法加载 GitHub 贡献数据</div>';
 *     }
 * }
 */

/**
 * 从 GitHub API 获取贡献数据的函数
 * 
 * async function fetchGitHubContributions(startDate, endDate) {
 *     const username = 'CaiNiaojian'; // 您的 GitHub 用户名
 *     const token = 'YOUR_PERSONAL_ACCESS_TOKEN'; // 您的个人访问令牌
 *     
 *     // 格式化日期为 YYYY-MM-DD
 *     const formatDateForGQL = (date) => {
 *         return date.toISOString().split('T')[0];
 *     };
 *     
 *     // GraphQL 查询
 *     const query = `
 *     query {
 *         user(login: "${username}") {
 *             contributionsCollection(
 *                 from: "${formatDateForGQL(startDate)}"
 *                 to: "${formatDateForGQL(endDate)}"
 *             ) {
 *                 contributionCalendar {
 *                     totalContributions
 *                     weeks {
 *                         contributionDays {
 *                             date
 *                             contributionCount
 *                             contributionLevel
 *                         }
 *                     }
 *                 }
 *             }
 *         }
 *     }`;
 *     
 *     try {
 *         const response = await fetch('https://api.github.com/graphql', {
 *             method: 'POST',
 *             headers: {
 *                 'Authorization': `Bearer ${token}`,
 *                 'Content-Type': 'application/json',
 *             },
 *             body: JSON.stringify({ query })
 *         });
 *         
 *         if (!response.ok) {
 *             throw new Error('GitHub API 请求失败');
 *         }
 *         
 *         const data = await response.json();
 *         
 *         // 处理返回的数据
 *         const contributions = {};
 *         const calendar = data.data.user.contributionsCollection.contributionCalendar;
 *         
 *         // 解析贡献数据
 *         calendar.weeks.forEach(week => {
 *             week.contributionDays.forEach(day => {
 *                 // 将贡献级别映射到 0-4
 *                 let level = 0;
 *                 switch (day.contributionLevel) {
 *                     case 'NONE': level = 0; break;
 *                     case 'FIRST_QUARTILE': level = 1; break;
 *                     case 'SECOND_QUARTILE': level = 2; break;
 *                     case 'THIRD_QUARTILE': level = 3; break;
 *                     case 'FOURTH_QUARTILE': level = 4; break;
 *                 }
 *                 
 *                 contributions[day.date] = {
 *                     level: level,
 *                     count: day.contributionCount
 *                 };
 *             });
 *         });
 *         
 *         return contributions;
 *         
 *     } catch (error) {
 *         console.error('获取 GitHub 贡献数据失败:', error);
 *         // 如果 API 请求失败，回退到模拟数据
 *         return generateMockDataFallback(startDate, endDate);
 *     }
 * }
 */

/**
 * 修改后的 renderStats 函数以处理 API 数据
 * 
 * function renderStats(data) {
 *     const statsContainer = document.querySelector('.contribution-stats');
 *     if (!statsContainer) return;
 *     
 *     // 计算总贡献数
 *     let totalCount = 0;
 *     for (const dateStr in data) {
 *         if (typeof data[dateStr] === 'object') {
 *             // API 返回的格式
 *             totalCount += data[dateStr].count || 0;
 *         } else {
 *             // 模拟数据格式
 *             totalCount += data[dateStr] ? 1 : 0;
 *         }
 *     }
 *     
 *     // 计算最长连续贡献天数
 *     const hasContribution = (date) => {
 *         const contribution = data[date];
 *         if (typeof contribution === 'object') {
 *             return contribution.count > 0;
 *         }
 *         return contribution > 0;
 *     };
 *     
 *     const sortedDates = Object.keys(data).filter(hasContribution).sort();
 *     let currentStreak = 0;
 *     let longestStreak = 0;
 *     let prevDate = null;
 *     
 *     for (const dateStr of sortedDates) {
 *         const date = new Date(dateStr);
 *         
 *         if (prevDate) {
 *             const dayDiff = (date - prevDate) / (1000 * 60 * 60 * 24);
 *             if (dayDiff === 1) {
 *                 currentStreak++;
 *             } else {
 *                 currentStreak = 1;
 *             }
 *         } else {
 *             currentStreak = 1;
 *         }
 *         
 *         longestStreak = Math.max(longestStreak, currentStreak);
 *         prevDate = date;
 *     }
 *     
 *     // 更新DOM
 *     document.getElementById('total-contributions').textContent = totalCount;
 *     document.getElementById('longest-streak').textContent = longestStreak;
 * }
 */

/**
 * 备用的模拟数据生成函数（API 请求失败时使用）
 * 
 * function generateMockDataFallback(startDate, endDate) {
 *     console.log('使用备用模拟数据');
 *     // 调用原始的模拟数据函数，但为了适配新的数据结构，需要转换格式
 *     const originalData = generateMockData(startDate, endDate);
 *     const formattedData = {};
 *     
 *     for (const date in originalData) {
 *         formattedData[date] = {
 *             level: originalData[date],
 *             count: Math.floor(Math.random() * 10) + 1 // 模拟贡献数量
 *         };
 *     }
 *     
 *     return formattedData;
 * }
 */

/**
 * CSS 中添加的加载指示器样式
 * 
 * .loading-indicator {
 *     display: flex;
 *     justify-content: center;
 *     align-items: center;
 *     height: 150px;
 *     color: var(--text-color-light);
 *     font-size: 0.9rem;
 *     grid-column: span 53;
 * }
 * 
 * .error-message {
 *     display: flex;
 *     justify-content: center;
 *     align-items: center;
 *     height: 150px;
 *     color: #e74c3c;
 *     font-size: 0.9rem;
 *     grid-column: span 53;
 * }
 */ 