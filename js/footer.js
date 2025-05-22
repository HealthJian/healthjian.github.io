/**
 * 页脚增强脚本
 * 作者: HealthJian
 * 日期: 2025-05-19
 * 描述: 为网站页脚提供实时时钟和交互功能
 */

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 更新北京时间的函数
  function updateBeijingTime() {
    // 创建表示当前UTC时间的Date对象
    const now = new Date();
    
    // 获取北京时区的小时差（UTC+8）
    const beijingOffset = 8;
    
    // 获取本地时区与UTC的小时差
    const localOffset = -now.getTimezoneOffset() / 60;
    
    // 计算本地时间与北京时间的小时差
    const hoursDiff = beijingOffset - localOffset;
    
    // 创建北京时间对象 - 在当前时间基础上加上时差
    const beijingTime = new Date(now.getTime() + hoursDiff * 60 * 60 * 1000);
    
    // 格式化小时、分钟和秒，确保它们是两位数
    const hours = beijingTime.getHours().toString().padStart(2, '0');
    const minutes = beijingTime.getMinutes().toString().padStart(2, '0');
    const seconds = beijingTime.getSeconds().toString().padStart(2, '0');
    
    // 格式化年、月、日
    const year = beijingTime.getFullYear();
    // 注意月份是从0开始的，所以需要+1
    const month = (beijingTime.getMonth() + 1).toString().padStart(2, '0');
    const day = beijingTime.getDate().toString().padStart(2, '0');
    
    // 获取星期几
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[beijingTime.getDay()];
    
    // 更新时钟显示
    const clockElement = document.querySelector('.footer-clock');
    if (clockElement) {
      clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // 更新日期显示
    const dateElement = document.querySelector('.footer-date');
    if (dateElement) {
      // 中文格式的日期显示
      const zhDateText = `${year}年${month}月${day}日 ${weekday}`;
      // 英文格式的日期显示
      const enDateText = `${year}-${month}-${day} ${weekdays[beijingTime.getDay()].replace('星期', 'Week ')}`;
      
      // 设置中英文属性
      dateElement.setAttribute('data-zh', zhDateText);
      dateElement.setAttribute('data-en', enDateText);
      
      // 根据当前页面语言显示相应文本
      const isEnglish = document.documentElement.getAttribute('lang') === 'en';
      dateElement.textContent = isEnglish ? enDateText : zhDateText;
    }
  }
  
  // 初始更新时间
  updateBeijingTime();
  
  // 每秒更新一次时间
  setInterval(updateBeijingTime, 1000);
  
  // 如果存在语言切换按钮，监听语言切换事件
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', function() {
      // 在语言切换后更新日期显示
      setTimeout(function() {
        const dateElement = document.querySelector('.footer-date');
        if (dateElement) {
          const isEnglish = document.documentElement.getAttribute('lang') === 'en';
          dateElement.textContent = isEnglish ? 
            dateElement.getAttribute('data-en') : 
            dateElement.getAttribute('data-zh');
        }
      }, 100);
    });
  }
}); 