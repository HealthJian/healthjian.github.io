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
        // 点击搜索按钮时执行搜索
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                searchPosts(searchTerm);
            } else {
                // 如果搜索框为空，恢复显示所有文章
                resetSearch();
            }
        });
        
        // 按下回车键时执行搜索
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    searchPosts(searchTerm);
                } else {
                    // 如果搜索框为空，恢复显示所有文章
                    resetSearch();
                }
            }
        });
        
        // 监听输入框内容变化，当清空时恢复所有文章
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() === '') {
                resetSearch();
            }
        });
    }
}

/**
 * 搜索文章
 * @param {string} term - 搜索关键词
 */
function searchPosts(term) {
    // 获取所有文章数据（包括所有页面的文章）
    const allPosts = getAllPosts();
    
    // 转换搜索词为小写，用于不区分大小写的搜索
    const searchTermLower = term.toLowerCase();
    
    // 过滤匹配的文章
    const matchedPosts = allPosts.filter(post => {
        // 检查标题（中英文）
        if (post.title.toLowerCase().includes(searchTermLower) || 
            post.title_en.toLowerCase().includes(searchTermLower)) {
            return true;
        }
        
        // 检查摘要（中英文）
        if (post.excerpt.toLowerCase().includes(searchTermLower) || 
            post.excerpt_en.toLowerCase().includes(searchTermLower)) {
            return true;
        }
        
        // 检查标签
        if (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTermLower))) {
            return true;
        }
        
        return false;
    });
    
    // 显示搜索结果
    displaySearchResults(matchedPosts, term);
}

/**
 * 显示搜索结果
 * @param {Array} posts - 匹配的文章数组
 * @param {string} searchTerm - 搜索关键词
 */
function displaySearchResults(posts, searchTerm) {
    // 获取当前语言
    const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
    
    // 更新搜索结果提示
    const blogHeader = document.querySelector('.blog-header h1');
    if (blogHeader) {
        const searchResultText = currentLang === 'en' 
            ? `Search Results for "${searchTerm}" (${posts.length})` 
            : `"${searchTerm}"的搜索结果 (${posts.length})`;
        
        // 保存原始标题用于恢复
        if (!blogHeader.getAttribute('data-original')) {
            blogHeader.setAttribute('data-original', blogHeader.textContent);
        }
        
        blogHeader.textContent = searchResultText;
    }
    
    // 如果没有匹配结果
    if (posts.length === 0) {
        const noResultsText = currentLang === 'en' 
            ? `No results found for "${searchTerm}". Try different keywords.` 
            : `未找到与"${searchTerm}"相关的文章。请尝试其他关键词。`;
        
        const blogList = document.querySelector('.blog-list');
        if (blogList) {
            blogList.innerHTML = `<div class="no-results">${noResultsText}</div>`;
        }
        
        // 隐藏分页
        const pagination = document.querySelector('.pagination');
        if (pagination) {
            pagination.style.display = 'none';
        }
        
        return;
    }
    
    // 分页显示搜索结果
    displayPaginatedSearchResults(posts);
}

/**
 * 分页显示搜索结果
 * @param {Array} posts - 匹配的文章数组
 */
function displayPaginatedSearchResults(posts) {
    // 每页显示的文章数量
    const postsPerPage = 4;
    
    // 计算总页数
    const totalPages = Math.ceil(posts.length / postsPerPage);
    
    // 显示第一页
    displaySearchPage(1, posts, postsPerPage);
    
    // 更新分页UI
    updateSearchPagination(totalPages, posts, postsPerPage);
}

/**
 * 更新搜索结果的分页
 * @param {number} totalPages - 总页数
 * @param {Array} posts - 匹配的文章数组
 * @param {number} postsPerPage - 每页显示的文章数
 */
function updateSearchPagination(totalPages, posts, postsPerPage = 4) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    // 获取页码容器
    const pageNumbers = pagination.querySelector('.page-numbers');
    if (!pageNumbers) return;
    
    // 清空现有页码
    pageNumbers.innerHTML = '';
    
    // 添加新的页码按钮
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        if (i === 1) button.classList.add('active');
        
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            pageNumbers.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            // 为当前点击的按钮添加active类
            this.classList.add('active');
            
            // 显示对应页的文章
            displaySearchPage(i, posts, postsPerPage);
            
            // 更新前后页按钮状态
            const prevButton = pagination.querySelector('.prev');
            const nextButton = pagination.querySelector('.next');
            
            if (prevButton) prevButton.disabled = i === 1;
            if (nextButton) nextButton.disabled = i === totalPages;
        });
        
        pageNumbers.appendChild(button);
    }
    
    // 更新前后页按钮
    const prevButton = pagination.querySelector('.prev');
    const nextButton = pagination.querySelector('.next');
    
    if (prevButton) {
        prevButton.disabled = true;
        prevButton.onclick = function() {
            if (this.disabled) return;
            
            const activeButton = pageNumbers.querySelector('button.active');
            if (activeButton) {
                const currentPage = parseInt(activeButton.textContent);
                if (currentPage > 1) {
                    pageNumbers.querySelectorAll('button')[currentPage - 2].click();
                }
            }
        };
    }
    
    if (nextButton) {
        nextButton.disabled = totalPages <= 1;
        nextButton.onclick = function() {
            if (this.disabled) return;
            
            const activeButton = pageNumbers.querySelector('button.active');
            if (activeButton) {
                const currentPage = parseInt(activeButton.textContent);
                if (currentPage < totalPages) {
                    pageNumbers.querySelectorAll('button')[currentPage].click();
                }
            }
        };
    }
}

/**
 * 显示特定页的搜索结果
 * @param {number} page - 页码
 * @param {Array} posts - 所有匹配的文章
 * @param {number} postsPerPage - 每页显示的文章数
 */
function displaySearchPage(page, posts, postsPerPage = 4) {
    // 计算当前页应显示的文章
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = Math.min(startIndex + postsPerPage, posts.length);
    const pageItems = posts.slice(startIndex, endIndex);
    
    // 显示当前页的文章
    displayPosts(pageItems);
}

/**
 * 重置搜索，恢复原始文章列表
 */
function resetSearch() {
    // 恢复原始标题
    const blogHeader = document.querySelector('.blog-header h1');
    if (blogHeader && blogHeader.getAttribute('data-original')) {
        blogHeader.textContent = blogHeader.getAttribute('data-original');
    }
    
    // 恢复原始分页
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.style.display = 'flex';
        
        // 重置分页按钮
        initPagination();
        
        // 点击第一页按钮，显示第一页内容
        const firstPageButton = pagination.querySelector('.page-numbers button:first-child');
        if (firstPageButton) {
            firstPageButton.click();
        } else {
            // 如果没有找到按钮，直接加载第一页
            loadPagePosts(1);
        }
    }
}

/**
 * 获取所有文章数据（包括所有页面的文章）
 * @returns {Array} 所有文章的数组
 */
function getAllPosts() {
    // 获取第一页的文章
    const firstPagePosts = getBlogPosts();
    
    // 获取第二页的文章
    const secondPagePost = {
        id: 4,
        title: '我的第一篇博客',
        title_en: 'My First Blog Post',
        excerpt: '第一篇博客',
        excerpt_en: 'My first blog post',
        date: '2024-12-30',
        category: 'life',
        tags: ['博客', '随想']
    };
    
    // 合并所有文章
    return [...firstPagePosts, secondPagePost];
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
    // 获取所有文章
    const allPosts = getAllPosts();
    
    // 如果选择"全部"分类，显示所有文章
    if (category === 'all') {
        // 重置为第一页
        loadPagePosts(1);
        return;
    }
    
    // 根据分类过滤文章
    const filteredPosts = allPosts.filter(post => post.category === category);
    
    // 显示过滤后的文章
    displayPosts(filteredPosts);
    
    // 更新分页
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        // 如果过滤后的文章数量为0，隐藏分页
        if (filteredPosts.length === 0) {
            pagination.style.display = 'none';
        } else {
            pagination.style.display = 'flex';
            // 更新分页UI
            updateSearchPagination(Math.ceil(filteredPosts.length / 4), filteredPosts);
        }
    }
}

// 获取博客文章数据
function getBlogPosts() {
    return [
        {
            id: 1,
            title: 'C语言入门：指针与内存管理',
            title_en: 'C Language Basics: Pointers and Memory Management',
            excerpt: 'C语言中指针是一个强大而复杂的概念，本文将深入探讨指针的基本概念、内存管理以及常见陷阱。',
            excerpt_en: 'Pointers in C are a powerful yet complex concept. This article explores the basics of pointers, memory management, and common pitfalls.',
            date: '2025-04-15',
            category: 'tech',
            tags: ['C语言', '编程', '指针'],
            url: '#'
        },
        {
            id: 2,
            title: '数据结构：链表的实现与应用',
            title_en: 'Data Structures: Implementation and Application of Linked Lists',
            excerpt: '链表是一种基础而重要的数据结构，本文将介绍单链表、双链表的实现方法以及实际应用场景。',
            excerpt_en: 'Linked lists are fundamental and important data structures. This article introduces the implementation of singly and doubly linked lists and their practical applications.',
            date: '2025-04-10',
            category: 'tech',
            tags: ['数据结构', '链表', '算法'],
            url: '#'
        },
        {
            id: 3,
            title: '前端开发：响应式设计原理',
            title_en: 'Frontend Development: Principles of Responsive Design',
            excerpt: '响应式设计是现代网页开发的核心概念，本文将探讨媒体查询、弹性布局和响应式图片等技术。',
            excerpt_en: 'Responsive design is a core concept in modern web development. This article explores technologies such as media queries, flexible layouts, and responsive images.',
            date: '2025-04-05',
            category: 'tech',
            tags: ['前端', 'CSS', '响应式设计'],
            url: '#'
        },
        {
            id: 4,
            title: '我的第一篇博客：代码与心灵的共振',
            title_en: 'My First Blog: The Resonance of Code and Soul',
            excerpt: '作为计算机科学专业的学生，我始终着迷于从无到有的创造过程。',
            excerpt_en: 'As a computer science student, I\'ve always been fascinated by the process of creation from nothingness.',
            date: '2024-12-30',
            category: 'life',
            tags: ['博客', '随想'],
            url: 'blog/life/first-blog.html'
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
                    ${post.tags ? post.tags.map(tag => {
                        // 为每个标签添加中英文翻译
                        const tagEn = getTagTranslation(tag, 'en');
                        const tagZh = getTagTranslation(tag, 'zh');
                        return `<span class="tag" data-en="${tagEn}" data-zh="${tagZh}">${currentLang === 'en' ? tagEn : tagZh}</span>`;
                    }).join('') : ''}
                </div>
                <a href="${post.url}" class="read-more" data-en="Read More" data-zh="阅读更多">${currentLang === 'en' ? 'Read More' : '阅读更多'}</a>
            </footer>
        </article>
    `).join('');
    
    // 如果语言已经切换，确保新加载的元素也应用正确的语言
    updateAllLanguageElements(currentLang);
}

// 获取标签的翻译
function getTagTranslation(tag, targetLang) {
    // 标签翻译映射
    const tagTranslations = {
        // 中文标签及其英文翻译
        'C语言': 'C Language',
        '算法': 'Algorithm',
        'API': 'API',
        '数据结构': 'Data Structure',
        '链表': 'Linked List',
        '栈': 'Stack',
        '队列': 'Queue',
        '前端': 'Frontend',
        'HTML': 'HTML',
        'CSS': 'CSS',
        'JavaScript': 'JavaScript',
        '博客': 'Blog',
        '随想': 'Thoughts',
        
        // 英文标签及其中文翻译
        'C Language': 'C语言',
        'Algorithm': '算法',
        'Data Structure': '数据结构',
        'Linked List': '链表',
        'Stack': '栈',
        'Queue': '队列',
        'Frontend': '前端',
        'Blog': '博客',
        'Thoughts': '随想'
    };
    
    // 如果目标语言是英文
    if (targetLang === 'en') {
        // 如果标签已经是英文，直接返回
        if (/^[a-zA-Z\s]+$/.test(tag)) {
            return tag;
        }
        // 否则返回英文翻译，如果没有翻译则返回原标签
        return tagTranslations[tag] || tag;
    } 
    // 如果目标语言是中文
    else {
        // 如果标签已经是中文，直接返回
        if (/[\u4e00-\u9fa5]/.test(tag)) {
            return tag;
        }
        // 否则返回中文翻译，如果没有翻译则返回原标签
        return tagTranslations[tag] || tag;
    }
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
    
    // 确保有足够的页码按钮
    if (pageButtons.length < 2) {
        const pageNumbers = pagination.querySelector('.page-numbers');
        if (pageNumbers) {
            // 如果只有一个按钮，添加第二个按钮
            if (pageButtons.length === 1) {
                const secondButton = document.createElement('button');
                secondButton.textContent = '2';
                pageNumbers.appendChild(secondButton);
            }
        }
    }
    
    // 重新获取所有页码按钮（包括可能新添加的）
    const updatedPageButtons = pagination.querySelectorAll('.page-numbers button');
    
    updatedPageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = parseInt(this.textContent);
            
            // 加载对应页的文章
            loadPagePosts(page);
            
            // 更新按钮状态
            updatedPageButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 更新前后页按钮状态
            prevButton.disabled = page === 1;
            nextButton.disabled = page === updatedPageButtons.length;
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
            const totalPages = updatedPageButtons.length;
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
    // 获取所有文章
    const allPosts = getAllPosts();
    
    // 每页显示的文章数量
    const postsPerPage = 4;
    
    // 计算当前页应显示的文章
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = Math.min(startIndex + postsPerPage, allPosts.length);
    const pageItems = allPosts.slice(startIndex, endIndex);
    
    // 显示当前页的文章
    displayPosts(pageItems);
} 