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
 * 显示搜索结果的指定页
 * @param {number} page - 页码
 * @param {Array} posts - 匹配的文章数组
 * @param {number} postsPerPage - 每页显示的文章数量
 */
function displaySearchPage(page, posts, postsPerPage = 4) {
    // 计算当前页应该显示的文章范围
    const start = (page - 1) * postsPerPage;
    const end = Math.min(start + postsPerPage, posts.length);
    const pagePosts = posts.slice(start, end);
    
    // 显示文章
    displayPosts(pagePosts);
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
    
    // 合并所有文章
    return firstPagePosts;
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
    // 文章数据
    return [
        {
            id: 'blog-building',
            title: '从零开始构建博客：技术栈、架构设计与实现',
            title_en: 'Building a Blog from Scratch: Technical Stack, Architecture Design, and Implementation',
            excerpt: '本文将详细介绍这个博客的技术栈、架构设计、核心JavaScript功能实现以及部署方案。',
            excerpt_en: 'This article will detail the technical stack, architectural design, core JavaScript functionality implementation, and deployment solutions of this blog.',
            date: '2025-04-06',
            url: 'blog/tech/blog-building.html',
            category: 'tech',
            tags: ['博客', '技术栈', '架构设计', 'JavaScript'],
            tags_en: ['Blog', 'Technical Stack', 'Architecture Design', 'JavaScript']
        },
        {
            id: 'Detailed Analysis of 2025 Graduate Entrance Examination Mathematics II Syllabus',
            title: '2025年考研数学二大纲详解',
            title_en: 'Detailed Analysis of 2025 Graduate Entrance Examination Mathematics II Syllabus',
            excerpt: '系统梳理2025年考研数学二大纲的重要概念、定理和方法，包括多元微积分、级数理论、微分方程等内容，为深入学习打下基础。',
            excerpt_en: 'A systematic review of important concepts, theorems, and methods in 2025 Graduate Entrance Examination Mathematics II Syllabus, including multivariable calculus, series theory, and differential equations, laying the foundation for in-depth study.',
            date: '2025-04-01',
            url: 'blog/tech/outline-for-advanced-mathematicsⅡ.html',
            category: 'tech',
            tags: ['考研', '数学', '大纲'],
            tags_en: ['Graduate Entrance Examination', 'Mathematics', 'Syllabus']
        },
        {
            id: 'c-api-algorithms',
            title: 'C语言入门：常用调用API在算法题中的应用',
            title_en: 'C Language Basics: Using APIs in Algorithm Problems',
            excerpt: '在刷题过程中总是有思路却写不出代码，即使实现功能也往往非常复杂，但是却可以调用已经封装好的API，事半功倍。',
            excerpt_en: 'While solving algorithm problems, we often have ideas but struggle to implement them efficiently. Using built-in APIs can significantly simplify our solutions.',
            date: '2025-03-18',
            url: 'blog/tech/c-api-algorithms.html',
            category: 'tech',
            tags: ['C语言', '算法', 'API'],
            tags_en: ['C Language', 'Algorithms', 'API']
        },
        {
            id: 'data-structures',
            title: '数据结构：链表、栈、队列、串',
            title_en: 'Data Structures: Linked List, Stack, Queue, String',
            excerpt: '学习数据结构往往离不开链表、栈、队列、串；但是知识总是学了忘，忘了继续学，所以总结一个文章，提供未来的继续学习。',
            excerpt_en: 'Learning data structures inevitably involves lists, stacks, queues, and strings. Knowledge tends to fade with time, so here\'s a comprehensive guide for future reference.',
            date: '2025-03-17',
            url: 'blog/tech/data-structures.html',
            category: 'tech',
            tags: ['数据结构', '链表', '栈', '队列'],
            tags_en: ['Data Structures', 'Linked List', 'Stack', 'Queue']
        },
        {
            id: 'first-blog',
            title: '我的第一篇博客：代码与心灵的共振',
            title_en: 'My First Blog: The Resonance Between Code and Soul',
            excerpt: '作为一名程序员，我一直在寻找代码与人文思考之间的平衡点。这是我的第一篇博客，记录了我对编程与生活的思考。',
            excerpt_en: 'As a programmer, I have always been searching for the balance between code and humanistic thinking. This is my first blog, recording my thoughts on programming and life.',
            date: '2025-03-16',
            url: 'blog/life/first-blog.html',
            category: 'life',
            tags: ['博客', '随想', '生活'],
            tags_en: ['Blog', 'Thoughts', 'Life']
        },
        
        /* -------- 以下是新增文章数据（目前已注释） -------- */
        /*
        {
            id: 'parallel-computing-gpu-programming',
            title: '并行计算与GPU编程CUDA',
            title_en: 'Parallel Computing and GPU Programming CUDA',
            excerpt: '探索并行计算的核心概念和使用CUDA进行GPU编程的基础知识，了解如何利用图形处理器加速计算密集型任务。',
            excerpt_en: 'Explore the core concepts of parallel computing and the fundamentals of GPU programming using CUDA, learning how to leverage graphics processors to accelerate computationally intensive tasks.',
            date: '2025-04-01',
            url: 'blog/tech/parallel-computing-and-gpu-programming-cud.html',
            category: 'tech',
            tags: ['CUDA', 'GPU编程', '并行计算', '高性能计算'],
            tags_en: ['CUDA', 'GPU Programming', 'Parallel Computing', 'High-Performance Computing']
        },
        {
            id: 'machine-learning-fundamentals',
            title: '机器学习基础与应用',
            title_en: 'Machine Learning Fundamentals and Applications',
            excerpt: '介绍机器学习的核心概念、常用算法以及在实际场景中的应用，帮助初学者建立机器学习的知识体系。',
            excerpt_en: 'Introducing core concepts of machine learning, common algorithms, and their applications in real-world scenarios, helping beginners build a knowledge framework for machine learning.',
            date: '2025-04-02',
            url: 'blog/tech/machine-learning.html',
            category: 'tech',
            tags: ['机器学习', '人工智能', '数据科学', '算法'],
            tags_en: ['Machine Learning', 'Artificial Intelligence', 'Data Science', 'Algorithms']
        },
        {
            id: 'advanced-mathematics-outline',
            title: '高等数学Ⅱ知识梳理',
            title_en: 'Outline for Advanced Mathematics Ⅱ',
            excerpt: '系统梳理高等数学Ⅱ的重要概念、定理和方法，包括多元微积分、级数理论、微分方程等内容，为深入学习打下基础。',
            excerpt_en: 'A systematic review of important concepts, theorems, and methods in Advanced Mathematics Ⅱ, including multivariable calculus, series theory, and differential equations, laying the foundation for in-depth study.',
            date: '2025-04-03',
            url: 'blog/tech/outline-for-advanced-mathematicsⅡ.html',
            category: 'tech',
            tags: ['高等数学', '微积分', '级数', '微分方程'],
            tags_en: ['Advanced Mathematics', 'Calculus', 'Series', 'Differential Equations']
        },
        {
            id: 'recommendation-system-overview',
            title: '推荐系统原理与实践',
            title_en: 'Recommendation System Principles and Practices',
            excerpt: '详解推荐系统的基本原理、主流算法和实际应用，从协同过滤到深度学习推荐模型，探讨个性化推荐的技术演进。',
            excerpt_en: 'A detailed explanation of the basic principles, mainstream algorithms, and practical applications of recommendation systems, from collaborative filtering to deep learning recommendation models, discussing the technical evolution of personalized recommendations.',
            date: '2025-04-04',
            url: 'blog/tech/recommendation-system.html',
            category: 'tech',
            tags: ['推荐系统', '机器学习', '协同过滤', '深度学习'],
            tags_en: ['Recommendation System', 'Machine Learning', 'Collaborative Filtering', 'Deep Learning']
        },
        {
            id: 'accomplishments',
            title: '成就与优绩主义',
            title_en: 'Accomplishments and Meritocracy',
            excerpt: '探讨成就与优绩主义的本质，分析其在现代社会中的作用和影响。',
            excerpt_en: 'Exploring the essence of accomplishments and meritocracy, analyzing its role and impact in modern society.',
            date: '2025-04-05',
            url: 'blog/life/talk-about-meritocracy.html',
            category: 'life',
            tags: ['成就', '优绩主义', '大学生活'],
            tags_en: ['Accomplishments', 'Meritocracy', 'College Life']
        }
        */
        /* -------- 新增文章数据结束 -------- */
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
                <a href="/pages/${post.url}" class="read-more" data-en="Read More" data-zh="阅读更多">${currentLang === 'en' ? 'Read More' : '阅读更多'}</a>
            </footer>
        </article>
    `).join('');
    
    // 如果语言已经切换，确保新加载的元素也应用正确的语言
    updateAllLanguageElements(currentLang);
}

// 获取标签的翻译
function getTagTranslation(tag, targetLang) {
    // 标签翻译字典
    const tagTranslations = {
        // 英文到中文的映射
        'API': 'API',
        'Algorithms': '算法',
        'C Language': 'C语言',
        'Data Structures': '数据结构',
        'Linked List': '链表',
        'Stack': '栈',
        'Queue': '队列',
        'String': '串',
        'HTML': 'HTML',
        'CSS': 'CSS',
        'JavaScript': 'JavaScript',
        'Frontend': '前端',
        'Blog': '博客',
        'Thoughts': '随想',
        'Life': '生活',
        /* 新增标签翻译 */
        'CUDA': 'CUDA',
        'GPU Programming': 'GPU编程', 
        'Parallel Computing': '并行计算',
        'High-Performance Computing': '高性能计算',
        'Machine Learning': '机器学习',
        'Artificial Intelligence': '人工智能',
        'Data Science': '数据科学',
        'Advanced Mathematics': '高等数学',
        'Calculus': '微积分',
        'Series': '级数',
        'Differential Equations': '微分方程',
        'Recommendation System': '推荐系统',
        'Collaborative Filtering': '协同过滤',
        'Deep Learning': '深度学习',
        'accomplishments': '成就',
        'meritocracy': '优绩主义',
        'College Life': '大学生活',
        '考研': 'Graduate Entrance Examination',
        '数学': 'Mathematics',
        '大纲': 'Syllabus',
        '博客': 'Blog',
        '技术栈': 'Technical Stack',
        '架构设计': 'Architecture Design',
        'JavaScript': 'JavaScript',
        '部署方案': 'Deployment Solutions',
        /* 新增标签翻译结束 */
        
        // 中文到英文的映射
        'API': 'API',
        '算法': 'Algorithms',
        'C语言': 'C Language',
        '数据结构': 'Data Structures',
        '链表': 'Linked List',
        '栈': 'Stack',
        '队列': 'Queue',
        '串': 'String',
        'HTML': 'HTML',
        'CSS': 'CSS',
        'JavaScript': 'JavaScript',
        '前端': 'Frontend',
        '博客': 'Blog',
        '随想': 'Thoughts',
        '生活': 'Life',
        /* 新增标签翻译 */
        'CUDA': 'CUDA',
        'GPU编程': 'GPU Programming',
        '并行计算': 'Parallel Computing',
        '高性能计算': 'High-Performance Computing',
        '机器学习': 'Machine Learning',
        '人工智能': 'Artificial Intelligence',
        '数据科学': 'Data Science',
        '高等数学': 'Advanced Mathematics',
        '微积分': 'Calculus',
        '级数': 'Series',
        '微分方程': 'Differential Equations',
        '推荐系统': 'Recommendation System',
        '协同过滤': 'Collaborative Filtering',
        '深度学习': 'Deep Learning',
        '成就': 'accomplishments',
        '优绩主义': 'meritocracy',
        '大学生活': 'College Life',
        '考研': 'Graduate Entrance Examination',
        '数学': 'Mathematics',
        '大纲': 'Syllabus',
        '博客': 'Blog',
        '技术栈': 'Technical Stack',
        '架构设计': 'Architecture Design',
        'JavaScript': 'JavaScript',
        '部署方案': 'Deployment Solutions',
        /* 新增标签翻译结束 */
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