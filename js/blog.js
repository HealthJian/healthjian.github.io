// 博客页面功能

document.addEventListener('DOMContentLoaded', function() {
    // 初始化博客功能
    initBlog();
});

function initBlog() {
    // 初始化搜索功能
    initSearch();
    
    // 初始化分类过滤器
    initFilters();
    
    // 加载博客文章
    loadBlogPosts();
    
    // 初始化分页
    initPagination();
}

function initSearch() {
    const searchInput = document.querySelector('.blog-search input');
    const searchButton = document.querySelector('.blog-search button');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                searchPosts(searchTerm);
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    searchPosts(searchTerm);
                }
            }
        });
    }
}

function searchPosts(term) {
    // 实现搜索逻辑
    console.log('Searching for:', term);
    // TODO: 实现实际的搜索功能
}

function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-tags button');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除其他按钮的active类
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的active类
            button.classList.add('active');
            
            const category = button.dataset.category;
            filterPosts(category);
        });
    });
}

function filterPosts(category) {
    // 实现分类过滤逻辑
    console.log('Filtering by category:', category);
    // TODO: 实现实际的过滤功能
}

function loadBlogPosts(page = 1) {
    // 这里可以从后端API或静态JSON文件加载博客文章
    // 示例数据结构：
    const posts = [
        {
            id: 1,
            title: 'React入门指南',
            title_en: 'Getting Started with React',
            excerpt: 'React框架及其核心概念的入门指南。',
            excerpt_en: 'A beginner\'s guide to React framework and its core concepts.',
            date: '2023-06-15',
            category: 'tech',
            tags: ['React', 'JavaScript', 'Web开发']
        },
        // 更多文章...
    ];
    
    displayPosts(posts);
}

function displayPosts(posts) {
    const blogList = document.querySelector('.blog-list');
    if (!blogList) return;
    
    blogList.innerHTML = posts.map(post => `
        <article class="blog-post">
            <header class="blog-post-header">
                <h2 class="blog-post-title" data-en="${post.title_en}" data-zh="${post.title}">${post.title}</h2>
                <div class="blog-post-meta">${post.date}</div>
            </header>
            <p class="blog-post-excerpt" data-en="${post.excerpt_en}" data-zh="${post.excerpt}">${post.excerpt}</p>
            <footer class="blog-post-footer">
                <div class="blog-post-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="blog/${post.id}.html" class="read-more" data-en="Read More" data-zh="阅读更多">阅读更多</a>
            </footer>
        </article>
    `).join('');
}

function initPagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    const pageButtons = pagination.querySelectorAll('.page-numbers button');
    const prevButton = pagination.querySelector('.prev');
    const nextButton = pagination.querySelector('.next');
    
    pageButtons.forEach(button => {
        button.addEventListener('click', () => {
            const page = parseInt(button.textContent);
            loadBlogPosts(page);
            
            // 更新按钮状态
            pageButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 更新前后页按钮状态
            prevButton.disabled = page === 1;
            nextButton.disabled = page === pageButtons.length;
        });
    });
    
    prevButton.addEventListener('click', () => {
        const currentPage = parseInt(pagination.querySelector('.active').textContent);
        if (currentPage > 1) {
            loadBlogPosts(currentPage - 1);
            pageButtons[currentPage - 2].click();
        }
    });
    
    nextButton.addEventListener('click', () => {
        const currentPage = parseInt(pagination.querySelector('.active').textContent);
        if (currentPage < pageButtons.length) {
            loadBlogPosts(currentPage + 1);
            pageButtons[currentPage].click();
        }
    });
} 