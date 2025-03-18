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
    
    // 加载博客文章 - 默认加载第一页
    loadPagePosts(1);
    
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

// 获取博客文章数据
function getBlogPosts() {
    // 使用与首页一致的文章数据
    return [
        {
            id: 1,
            title: 'C语言入门：常用调用API在算法题中的应用',
            title_en: 'C Language Basics: Using APIs in Algorithm Problems',
            excerpt: '在刷题过程中总是有思路却写不出代码，即使实现功能也往往非常复杂，但是却可以调用已经封装好的API，事半功倍。',
            excerpt_en: 'While solving algorithm problems, we often have ideas but struggle to implement them efficiently. Using built-in APIs can significantly simplify our solutions.',
            date: '2025-03-18',
            category: 'tech',
            tags: ['C语言', '算法', 'API']
        },
        {
            id: 2,
            title: '数据结构：链表、栈、队列、串',
            title_en: 'Data Structures: Lists, Stacks, Queues, and Strings',
            excerpt: '学习数据结构往往离不开链表、栈、队列、串；但是知识总是学了忘，忘了继续学，所以总结一个文章，提供未来的继续学习。',
            excerpt_en: 'Learning data structures inevitably involves lists, stacks, queues, and strings. Knowledge tends to fade with time, so here\'s a comprehensive guide for future reference.',
            date: '2025-03-17',
            category: 'tech',
            tags: ['数据结构', '链表', '栈', '队列']
        },
        {
            id: 3,
            title: '简单讲讲HTML+CSS+Javascript',
            title_en: 'A Brief Introduction to HTML, CSS, and JavaScript',
            excerpt: '简单唠唠前端三件套。',
            excerpt_en: 'A simple overview of the frontend development trinity.',
            date: '2025-03-16',
            category: 'tech',
            tags: ['前端', 'HTML', 'CSS', 'JavaScript']
        }
    ];
}

// 显示文章列表
function displayPosts(posts) {
    const blogList = document.querySelector('.blog-list');
    if (!blogList) return;
    
    if (posts.length === 0) {
        const noPostsText = document.body.classList.contains('en') ? 'No posts available' : '暂无文章';
        blogList.innerHTML = `<div class="no-posts">${noPostsText}</div>`;
        return;
    }
    
    // 获取当前语言
    const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
    
    blogList.innerHTML = posts.map(post => `
        <article class="blog-post">
            <header class="blog-post-header">
                <h2 class="blog-post-title" data-en="${post.title_en}" data-zh="${post.title}">${currentLang === 'en' ? post.title_en : post.title}</h2>
                <div class="blog-post-meta">${post.date}</div>
            </header>
            <p class="blog-post-excerpt" data-en="${post.excerpt_en}" data-zh="${post.excerpt}">${currentLang === 'en' ? post.excerpt_en : post.excerpt}</p>
            <footer class="blog-post-footer">
                <div class="blog-post-tags">
                    ${post.tags ? post.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <a href="blog/${post.id}.html" class="read-more" data-en="Read More" data-zh="阅读更多">${currentLang === 'en' ? 'Read More' : '阅读更多'}</a>
            </footer>
        </article>
    `).join('');
    
    // 如果语言已经切换，确保新加载的元素也应用正确的语言
    updateAllLanguageElements(currentLang);
}

// 初始化分页
function initPagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    const pageButtons = pagination.querySelectorAll('.page-numbers button');
    const prevButton = pagination.querySelector('.prev');
    const nextButton = pagination.querySelector('.next');
    
    // 设置初始状态
    prevButton.disabled = true;
    
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = parseInt(this.textContent);
            
            // 加载对应页的文章
            loadPagePosts(page);
            
            // 更新按钮状态
            pageButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 更新前后页按钮状态
            prevButton.disabled = page === 1;
            nextButton.disabled = page === pageButtons.length;
        });
    });
    
    prevButton.addEventListener('click', function() {
        if (this.disabled) return;
        
        const activeButton = pagination.querySelector('.page-numbers button.active');
        if (activeButton) {
            const currentPage = parseInt(activeButton.textContent);
            if (currentPage > 1) {
                const prevPageButton = pagination.querySelector(`.page-numbers button:nth-child(${currentPage - 1})`);
                if (prevPageButton) {
                    prevPageButton.click();
                }
            }
        }
    });
    
    nextButton.addEventListener('click', function() {
        if (this.disabled) return;
        
        const activeButton = pagination.querySelector('.page-numbers button.active');
        if (activeButton) {
            const currentPage = parseInt(activeButton.textContent);
            const totalPages = pageButtons.length;
            if (currentPage < totalPages) {
                const nextPageButton = pagination.querySelector(`.page-numbers button:nth-child(${currentPage + 1})`);
                if (nextPageButton) {
                    nextPageButton.click();
                }
            }
        }
    });
}

// 加载指定页的文章
function loadPagePosts(page) {
    if (page === 1) {
        // 第一页显示最新的三篇文章
        displayPosts(getBlogPosts());
    } else if (page === 2) {
        // 第二页显示"我的第一篇博客"
        const firstBlogPost = {
            id: 4,
            title: '我的第一篇博客',
            title_en: 'My First Blog Post',
            excerpt: '第一篇博客',
            excerpt_en: 'My first blog post',
            date: '2024-12-30',
            category: 'life',
            tags: ['博客', '随想']
        };
        
        displayPosts([firstBlogPost]);
    } else if (page === 3) {
        // 第三页暂无文章
        displayPosts([]);
    }
} 