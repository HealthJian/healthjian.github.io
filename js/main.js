// 主要JavaScript文件

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 确保页面内容立即可见
    document.body.style.visibility = 'visible';
    
    // 处理可能的字体加载问题
    if ('fonts' in document) {
        Promise.all([
            document.fonts.load('1em SF Pro Display'),
            document.fonts.load('1em "SF Pro Display"')
        ]).then(function() {
            console.log('字体加载成功');
            document.body.classList.add('fonts-loaded');
        }).catch(function() {
            console.log('字体加载失败，使用后备字体');
            document.body.classList.add('fonts-fallback');
        });
    }
    
    // 头像交互效果
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.addEventListener('click', function() {
            this.style.transform = 'scale(1.1) rotate(360deg)';
            setTimeout(() => {
                this.style.transform = '';
            }, 1000);
        });
    }

    // 在这里可以添加更多的交互功能
    // 例如：博客文章加载、搜索功能等

    // 初始化分页功能
    initPagination();

    // 检测Font Awesome图标是否正确加载
    setTimeout(function() {
        const testIcon = document.querySelector('.fab.fa-weixin');
        if (testIcon && window.getComputedStyle(testIcon, ':before').content === 'none') {
            // 图标未正确加载，添加备用类
            document.body.classList.add('icons-fallback');
        }
    }, 1000);
});

// 这个函数可以用来动态加载博客文章
function loadBlogPosts() {
    // 这里可以通过AJAX或Fetch API从后端或JSON文件加载博客文章
    // 示例代码：
    /*
    fetch('data/posts.json')
        .then(response => response.json())
        .then(data => {
            const postsContainer = document.querySelector('.posts-container');
            postsContainer.innerHTML = '';
            
            data.posts.forEach(post => {
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
            });
        })
        .catch(error => console.error('Error loading blog posts:', error));
    */
}

// 创建博客文章元素的辅助函数
function createPostElement(post) {
    // 这个函数将创建一个博客文章卡片元素
    // 示例代码：
    /*
    const article = document.createElement('article');
    article.className = 'post-card';
    
    const dateDiv = document.createElement('div');
    dateDiv.className = 'post-date';
    dateDiv.textContent = post.date;
    
    const title = document.createElement('h3');
    title.textContent = post.title;
    title.setAttribute('data-en', post.title_en);
    title.setAttribute('data-zh', post.title_zh);
    
    const content = document.createElement('p');
    content.textContent = post.excerpt;
    content.setAttribute('data-en', post.excerpt_en);
    content.setAttribute('data-zh', post.excerpt_zh);
    
    const link = document.createElement('a');
    link.href = post.url;
    link.textContent = '阅读更多';
    link.setAttribute('data-en', 'Read More');
    link.setAttribute('data-zh', '阅读更多');
    
    article.appendChild(dateDiv);
    article.appendChild(title);
    article.appendChild(content);
    article.appendChild(link);
    
    return article;
    */
}

// 初始化分页功能
function initPagination() {
    const paginationContainer = document.querySelector('.blog-pagination');
    if (!paginationContainer) return;
    
    const pageButtons = paginationContainer.querySelectorAll('button:not(.prev):not(.next)');
    const prevButton = paginationContainer.querySelector('.prev');
    const nextButton = paginationContainer.querySelector('.next');
    
    // 为页码按钮添加点击事件
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            pageButtons.forEach(btn => btn.classList.remove('active'));
            // 为当前点击的按钮添加active类
            this.classList.add('active');
            
            // 获取当前页码
            const currentPage = parseInt(this.textContent);
            
            // 更新上一页/下一页按钮状态
            prevButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage === pageButtons.length;
            
            // 加载对应页的文章（这里可以调用加载文章的函数）
            loadPagePosts(currentPage);
        });
    });
    
    // 为上一页按钮添加点击事件
    prevButton.addEventListener('click', function() {
        const activeButton = paginationContainer.querySelector('button.active');
        const currentPage = parseInt(activeButton.textContent);
        
        if (currentPage > 1) {
            // 点击上一页对应的页码按钮
            pageButtons[currentPage - 2].click();
        }
    });
    
    // 为下一页按钮添加点击事件
    nextButton.addEventListener('click', function() {
        const activeButton = paginationContainer.querySelector('button.active');
        const currentPage = parseInt(activeButton.textContent);
        
        if (currentPage < pageButtons.length) {
            // 点击下一页对应的页码按钮
            pageButtons[currentPage].click();
        }
    });
}

// 加载指定页的文章
function loadPagePosts(page) {
    console.log('加载第', page, '页的文章');
    // 这里可以实现加载不同页文章的逻辑
    // 例如通过AJAX请求或者显示/隐藏预先加载的文章
} 