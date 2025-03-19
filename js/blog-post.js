// 博客文章页面交互功能

document.addEventListener('DOMContentLoaded', function() {
    // 初始化目录高亮
    initTableOfContents();
    
    // 初始化语言切换对文章内容的影响
    initLanguageToggleForPost();
    
    // 监听滚动事件，更新目录高亮
    window.addEventListener('scroll', updateTableOfContents);
});

// 初始化目录高亮功能
function initTableOfContents() {
    const tocLinks = document.querySelectorAll('.toc-list a');
    
    // 为每个目录链接添加点击事件
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标部分的ID
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // 平滑滚动到目标部分
                window.scrollTo({
                    top: targetSection.offsetTop - 100, // 减去导航栏高度和一些额外空间
                    behavior: 'smooth'
                });
                
                // 更新URL，但不刷新页面
                history.pushState(null, null, `#${targetId}`);
                
                // 更新目录高亮
                updateTableOfContents();
            }
        });
    });
    
    // 初始化时更新一次目录高亮
    updateTableOfContents();
}

// 更新目录高亮
function updateTableOfContents() {
    const sections = document.querySelectorAll('.post-body section');
    const tocLinks = document.querySelectorAll('.toc-list a');
    
    // 获取当前滚动位置
    const scrollPosition = window.scrollY;
    
    // 找到当前可见的部分
    let currentSection = sections[0].id;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120; // 减去导航栏高度和一些额外空间
        
        if (scrollPosition >= sectionTop) {
            currentSection = section.id;
        }
    });
    
    // 更新目录高亮
    tocLinks.forEach(link => {
        link.classList.remove('active');
        
        const linkTarget = link.getAttribute('href').substring(1);
        if (linkTarget === currentSection) {
            link.classList.add('active');
        }
    });
}

// 初始化语言切换对文章内容的影响
function initLanguageToggleForPost() {
    const langToggle = document.getElementById('lang-toggle');
    
    if (langToggle) {
        // 检查当前语言并应用
        const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
        updatePostLanguage(currentLang);
        
        // 监听语言切换按钮点击
        langToggle.addEventListener('click', function() {
            // 延迟执行，确保语言切换完成
            setTimeout(() => {
                const newLang = document.body.classList.contains('en') ? 'en' : 'zh';
                updatePostLanguage(newLang);
            }, 50);
        });
    }
}

// 更新文章语言
function updatePostLanguage(lang) {
    // 更新双语内容
    const zhContents = document.querySelectorAll('.zh-content');
    const enContents = document.querySelectorAll('.en-content');
    
    if (lang === 'en') {
        zhContents.forEach(el => el.style.display = 'none');
        enContents.forEach(el => el.style.display = 'block');
    } else {
        zhContents.forEach(el => el.style.display = 'block');
        enContents.forEach(el => el.style.display = 'none');
    }
}

// 评论提交功能（示例）
document.addEventListener('DOMContentLoaded', function() {
    const commentForm = document.querySelector('.comment-form');
    
    if (commentForm) {
        const submitButton = commentForm.querySelector('button');
        const textarea = commentForm.querySelector('textarea');
        
        submitButton.addEventListener('click', function() {
            const commentText = textarea.value.trim();
            
            if (commentText) {
                // 这里可以添加实际的评论提交逻辑
                alert('评论功能正在开发中，敬请期待！');
                textarea.value = '';
            }
        });
    }
}); 