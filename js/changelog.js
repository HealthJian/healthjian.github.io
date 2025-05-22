/**
 * 更新日志页面交互脚本
 * 作者: HealthJian
 * 日期: 2025-05-19
 * 描述: 为更新日志页面提供交互增强功能
 */

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 创建滚动到顶部按钮
  const scrollTopBtn = document.createElement('div');
  scrollTopBtn.className = 'scroll-top';
  scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(scrollTopBtn);
  
  // 监听滚动事件
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });
  
  // 点击事件
  scrollTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // 为时间线项添加鼠标悬停效果
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach(item => {
    // 添加鼠标进入动画
    item.addEventListener('mouseenter', function() {
      this.style.transition = 'transform 0.3s ease';
      this.style.transform = 'translateX(5px)';
    });
    
    // 添加鼠标离开动画
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0)';
    });
  });
  
  // 为标题添加打字机效果
  const title = document.querySelector('.changelog-header h1');
  if (title) {
    const text = title.textContent;
    title.textContent = '';
    let i = 0;
    
    function typeWriter() {
      if (i < text.length) {
        title.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 80);
      }
    }
    
    // 延迟启动打字效果
    setTimeout(typeWriter, 500);
  }
});

// 根据页面滚动位置添加淡入效果
window.addEventListener('scroll', function() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  const windowHeight = window.innerHeight;
  
  timelineItems.forEach(item => {
    const itemPosition = item.getBoundingClientRect().top;
    
    // 当元素即将进入视口时添加显示效果
    if (itemPosition < windowHeight - 100) {
      item.classList.add('show');
    }
  });
}); 