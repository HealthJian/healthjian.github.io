// 主要JavaScript文件

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
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