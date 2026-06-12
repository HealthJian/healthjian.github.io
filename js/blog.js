// 博客页面功能

// 全局配置：每页显示的文章数量
const POSTS_PER_PAGE = 8;

// 允许某些页面仅复用数据而不初始化旧版UI
if (!window.SKIP_BLOG_INIT) {
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化博客功能
        initBlog();
    });
}

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
    const postsPerPage = POSTS_PER_PAGE;
    
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
function updateSearchPagination(totalPages, posts, postsPerPage = POSTS_PER_PAGE) {
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
function displaySearchPage(page, posts, postsPerPage = POSTS_PER_PAGE) {
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
            updateSearchPagination(Math.ceil(filteredPosts.length / POSTS_PER_PAGE), filteredPosts);
        }
    }
}

function resolveBlogPostUrl(url) {
    if (!url || /^(https?:|mailto:|#)/.test(url)) return url || '#';
    if (url.charAt(0) !== '/') return url;

    const targetParts = url.replace(/^\/+/, '').split('/');
    const pathName = (window.location && window.location.pathname ? window.location.pathname : '').replace(/\\/g, '/');
    const pagesIndex = pathName.lastIndexOf('/pages/');
    const currentSitePath = pagesIndex >= 0
        ? pathName.slice(pagesIndex + 1)
        : pathName.replace(/^\/+/, '').split('/').pop();
    const currentDir = currentSitePath.split('/').slice(0, -1).filter(Boolean);
    let shared = 0;

    while (shared < currentDir.length && shared < targetParts.length && currentDir[shared] === targetParts[shared]) {
        shared++;
    }

    return '../'.repeat(currentDir.length - shared) + targetParts.slice(shared).join('/');
}

// 获取博客文章数据
function getBlogPosts() {
    if (Array.isArray(window.BLOG_POSTS_DATA)) {
        return window.BLOG_POSTS_DATA.map(post => ({
            ...post,
            url: resolveBlogPostUrl(post.url)
        }));
    }
    console.warn('[blog] BLOG_POSTS_DATA is not loaded; returning an empty article list.');
    return [];
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
    
    // 清除之前所有可能的事件监听器
    blogList.innerHTML = '';
    
    // 为每篇文章创建元素而不是使用innerHTML字符串
    posts.forEach(post => {
        // 创建文章容器
        const article = document.createElement('article');
        article.className = 'blog-post';
        
        // 创建标题部分
        const header = document.createElement('header');
        header.className = 'blog-post-header';
        
        // 创建标题
        const title = document.createElement('h2');
        title.className = 'blog-post-title';
        
        // 创建标题链接
        const titleLink = document.createElement('a');
        titleLink.href = post.url;
        titleLink.target = "_blank"; // 在新标签页打开
        titleLink.style.color = 'inherit';
        titleLink.style.textDecoration = 'none';
        titleLink.style.display = 'block';
        titleLink.style.width = '100%';
        titleLink.style.height = '100%';
        titleLink.style.position = 'relative';
        titleLink.style.zIndex = '50';
        titleLink.setAttribute('data-en', post.title_en);
        titleLink.setAttribute('data-zh', post.title);
        titleLink.textContent = currentLang === 'en' ? post.title_en : post.title;
        
        // 添加标题链接到标题
        title.appendChild(titleLink);
        
        // 创建日期元素
        const meta = document.createElement('div');
        meta.className = 'blog-post-meta';
        meta.textContent = post.date;
        
        // 添加标题和日期到header
        header.appendChild(title);
        header.appendChild(meta);
        
        // 创建摘要
        const excerpt = document.createElement('p');
        excerpt.className = 'blog-post-excerpt';
        excerpt.setAttribute('data-en', post.excerpt_en);
        excerpt.setAttribute('data-zh', post.excerpt);
        excerpt.textContent = currentLang === 'en' ? post.excerpt_en : post.excerpt;
        
        // 创建文章底部
        const footer = document.createElement('footer');
        footer.className = 'blog-post-footer';
        
        // 创建标签容器
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'blog-post-tags';
        
        // 添加标签
        if (post.tags) {
            post.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                const tagEn = getTagTranslation(tag, 'en');
                const tagZh = getTagTranslation(tag, 'zh');
                tagSpan.setAttribute('data-en', tagEn);
                tagSpan.setAttribute('data-zh', tagZh);
                tagSpan.textContent = currentLang === 'en' ? tagEn : tagZh;
                tagsContainer.appendChild(tagSpan);
            });
        }
        
        // 创建阅读更多链接
        const readMore = document.createElement('a');
        readMore.className = 'read-more';
        readMore.href = post.url;
        readMore.target = "_blank"; // 在新标签页打开
        readMore.style.position = 'relative';
        readMore.style.zIndex = '50';
        readMore.setAttribute('data-en', 'Read More');
        readMore.setAttribute('data-zh', '阅读更多');
        readMore.textContent = currentLang === 'en' ? 'Read More' : '阅读更多';
        
        // 添加标签和阅读更多到footer
        footer.appendChild(tagsContainer);
        footer.appendChild(readMore);
        
        // 组装文章
        article.appendChild(header);
        article.appendChild(excerpt);
        article.appendChild(footer);
        
        // 添加到博客列表
        blogList.appendChild(article);
    });
    
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
        'Blog Template': '博客模板',
        'Code Highlighting': '代码高亮',
        'Responsive Design': '响应式设计',
        'Theme Switching': '主题切换',
        'Smart Education': '智慧教育',
        'Big Data': '大数据',
        'Data Mining': '数据挖掘',
        'Data Analysis': '数据分析',
        'Smoker': '烟民',
        'Hotbed': '温床',
        'Persistence': '坚持',
        'Motivation': '励志',
        'Academic Reality': '学术现实',
        'Digital Performance': '数字表演',
        'Alternative Success Stories': '另类成功故事',
        'Redefining Success': '重新定义成功',
        'University': '大学',
        'History': '历史',
        'Future Path': '未来之路',
        'Network Leftists': '网络左翼',
        'Criticism': '批判',
        'Paper Review': '论文精读',
        'LLM Agent': 'LLM Agent',
        'ReAct': 'ReAct',
        'Reasoning & Acting': '推理与行动',
        'Prompt Engineering': '提示词工程',
        'RAG': 'RAG',
        'Retrieval-Augmented Generation': '检索增强生成',
        'Vector Database': '向量数据库',
        'LangChain': 'LangChain',
        'LlamaIndex': 'LlamaIndex',
        'LangGraph': 'LangGraph',
        'ReAct': 'ReAct',
        'Reasoning & Acting': '推理与行动',
        'Prompt Engineering': '提示词工程',
        'RAG': 'RAG',
        'Retrieval-Augmented Generation': '检索增强生成',
        'Vector Database': '向量数据库',
        'LangChain': 'LangChain',
        'LlamaIndex': 'LlamaIndex',
        'AI Agent': 'AI Agent',
        'LLM': 'LLM',
        '自主智能体': 'Autonomous Agent',
        '思维链': 'Chain-of-Thought',
        '规划-执行': 'Plan-and-Solve',
        '反思机制': 'Reflection Mechanism',
        '提示词工程': 'Prompt Engineering',
        'Tool Use': 'Tool Use',
        'Function Calling': 'Function Calling',
        'Codex CLI': 'Codex CLI',
        'Memory Module': '记忆模块',
        'Knowledge Graph': '知识图谱',
        'Multi-Agent': '多智能体',
        'AutoGen': 'AutoGen',
        'CrewAI': 'CrewAI',
        'LCEL': 'LCEL',
        'Statistics': '统计学',
        'Data Visualization': '数据可视化',
        'Bayesian': '贝叶斯',
        'EDA': 'EDA',
        'GWO-AlexNet': 'GWO-AlexNet',
        'Bearing Fault Diagnosis': '轴承故障诊断',
        'Grad-CAM': 'Grad-CAM',
        'Philosophy': '哲学',
        'Dialectics': '辩证',
        'Self-Consistency': '自洽',
        'Accumulation': '厚积薄发',
        'Destiny': '知命',
        'E-Commerce': '电商',
        'Multi-Agent': '多智能体',
        'FastAPI': 'FastAPI',
        'Thesis': '毕业设计',
        'Resume Generation': '简历生成',
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
        'Mingw': 'Mingw',
        'C/C++': 'C/C++',
        '编译器': 'Compiler',
        'Windows': 'Windows',
        '考研辅导机构': 'Graduate Exam Coaching Institutions',
        '人生': 'Life',
        '彼岸': 'Shore',
        '汪洋': 'Ocean',
        '成功学': 'Success Studies',
        '资本浪潮': 'Capital Tides',
        '随笔': 'Essay',
        '思考': 'Thought',
        '机器学习': 'Machine Learning',
        '房价预测': 'House Price Prediction',
        '数据预处理': 'Data Preprocessing',
        '特征选择': 'Feature Selection',
        '模型训练': 'Model Training',
        '评估': 'Evaluation',
        '混淆矩阵': 'Confusion Matrix',
        '分类报告': 'Classification Report',
        '结果总结': 'Result Summary',
        '优化后': 'Optimized',
        '假阴性': 'False Negative',
        '假阳性': 'False Positive',
        '支持向量机': 'Support Vector Machine',
        '分类': 'Classification',
        '回归': 'Regression',
        '机器学习': 'Machine Learning',
        '房价预测': 'House Price Prediction',
        '数据预处理': 'Data Preprocessing',
        '学习进度与心态的反思': 'Reflection on Learning Progress and Mindset',
        '学习': 'Learning',
        '心态': 'Mindset',
        '反思': 'Reflection',
        '效率': 'Efficiency',
        'PaddlePaddle': 'PaddlePaddle',
        '卷积神经网络': 'Convolutional Neural Network',
        '猫咪分类': 'Cat Classification',
        '智慧教育': 'Smart Education',
        '大数据': 'Big Data',
        '数据挖掘': 'Data Mining',
        '数据分析': 'Data Analysis',
        '坚持': 'Persistence',
        '励志': 'Motivation',
        '学术现实': 'Academic Reality',
        '数字表演': 'Digital Performance',
        '另类成功故事': 'Alternative Success Stories',
        '重新定义成功': 'Redefining Success',
        '历史': 'History',
        '未来之路': 'Future Path',
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
        '博客模板': 'Blog Template',
        '代码高亮': 'Code Highlighting',
        '响应式设计': 'Responsive Design',
        '主题切换': 'Theme Switching',
        '智慧教育': 'Smart Education',
        '大数据': 'Big Data',
        '数据挖掘': 'Data Mining',
        '数据分析': 'Data Analysis',
        '烟民': 'Smoker',
        '温床': 'Hotbed',
        '历史': 'History',
        '未来之路': 'Future Path',
        '网络左翼': 'Network Leftists',
        '批判': 'Criticism',
        '论文精读': 'Paper Review',
        'LLM Agent': 'LLM Agent',
        'ReAct': 'ReAct',
        '推理与行动': 'Reasoning & Acting',
        '提示词工程': 'Prompt Engineering',
        'RAG': 'RAG',
        '检索增强生成': 'Retrieval-Augmented Generation',
        '向量数据库': 'Vector Database',
        'LangChain': 'LangChain',
        'LlamaIndex': 'LlamaIndex',
        'LangGraph': 'LangGraph',
        'ReAct': 'ReAct',
        '推理ing & Acting': 'Reasoning & Acting',
        'Prompt Engineering': 'Prompt Engineering',
        'RAG': 'RAG',
        'Retrieval-Augmented Generation': 'Retrieval-Augmented Generation',
        '向量数据库': 'Vector Database',
        'LangChain': 'LangChain',
        'LlamaIndex': 'LlamaIndex',
        'AI Agent': 'AI Agent',
        'LLM': 'LLM',
        '自主智能体': 'Autonomous Agent',
        '思维链': 'Chain-of-Thought',
        '规划-执行': 'Plan-and-Solve',
        '反思机制': 'Reflection Mechanism',
        '提示词工程': 'Prompt Engineering',
        '记忆模块': 'Memory Module',
        '知识图谱': 'Knowledge Graph',
        '多智能体': 'Multi-Agent',
        'Tool Use': 'Tool Use',
        'Function Calling': 'Function Calling',
        'Codex CLI': 'Codex CLI',
        'AutoGen': 'AutoGen',
        'CrewAI': 'CrewAI',
        'LCEL': 'LCEL',
        '统计学': 'Statistics',
        '数据可视化': 'Data Visualization',
        '贝叶斯': 'Bayesian',
        'EDA': 'EDA',
        'GWO-AlexNet': 'GWO-AlexNet',
        '轴承故障诊断': 'Bearing Fault Diagnosis',
        'Grad-CAM': 'Grad-CAM',
        '哲学': 'Philosophy',
        '辩证': 'Dialectics',
        '自洽': 'Self-Consistency',
        '厚积薄发': 'Accumulation',
        '知命': 'Destiny',
        '电商': 'E-Commerce',
        'FastAPI': 'FastAPI',
        '毕业设计': 'Thesis',
        '简历生成': 'Resume Generation',
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
        'Mingw': 'Mingw',
        'C/C++': 'C/C++',
        '编译器': 'Compiler',
        'Windows': 'Windows',
        '考研辅导机构': 'Graduate Exam Coaching Institutions',
        '人生': 'Life',
        '彼岸': 'Shore',
        '汪洋': 'Ocean',
        '成功学': 'Success Studies',
        '资本浪潮': 'Capital Tides',
        '上岸': 'Coming Ashore',
        '学术现实': 'Academic Reality',
        '数字表演': 'Digital Performance',
        '另类成功故事': 'Alternative Success Stories',
        '重新定义成功': 'Redefining Success',
        '随笔': 'Essay',
        '思考': 'Thought',
        '机器学习': 'Machine Learning',
        '房价预测': 'House Price Prediction',
        '数据预处理': 'Data Preprocessing',
        '特征选择': 'Feature Selection',
        '模型训练': 'Model Training',
        '评估': 'Evaluation',
        '混淆矩阵': 'Confusion Matrix',
        '分类报告': 'Classification Report',
        '结果总结': 'Result Summary',
        '优化后': 'Optimized',
        '假阴性': 'False Negative',
        '假阳性': 'False Positive',
        '房价预测': 'House Price Prediction',
        '数据预处理': 'Data Preprocessing',
        '特征选择': 'Feature Selection',
        '模型训练': 'Model Training',
        '评估': 'Evaluation',
        '混淆矩阵': 'Confusion Matrix',
        '分类报告': 'Classification Report',
        '支持向量机': 'Support Vector Machine',
        '分类': 'Classification',
        '回归': 'Regression',
        '机器学习': 'Machine Learning',
        '房价预测': 'House Price Prediction',
        '数据预处理': 'Data Preprocessing',
        '学习进度与心态的反思': 'Reflection on Learning Progress and Mindset',
        '学习': 'Learning',
        '心态': 'Mindset',
        '反思': 'Reflection',
        '效率': 'Efficiency',
        'PaddlePaddle': 'PaddlePaddle',
        '卷积神经网络': 'Convolutional Neural Network',
        '猫咪分类': 'Cat Classification',
        '智慧教育': 'Smart Education',
        '大数据': 'Big Data',
        '数据挖掘': 'Data Mining',
        '数据分析': 'Data Analysis',
        '坚持': 'Persistence',
        '励志': 'Motivation',
        '学术现实': 'Academic Reality',
        '数字表演': 'Digital Performance',
        '另类成功故事': 'Alternative Success Stories',
        '重新定义成功': 'Redefining Success',
        '大学': 'University',
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
    
    // 获取所有文章数量
    const allPosts = getAllPosts();
    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
    
    // 重新生成页码按钮
    const pageNumbers = pagination.querySelector('.page-numbers');
    if (pageNumbers) {
        pageNumbers.innerHTML = ''; // 清空现有按钮
        
        // 根据实际页数创建按钮
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            if (i === 1) button.classList.add('active');
            pageNumbers.appendChild(button);
        }
    }
    
    const pageButtons = pagination.querySelectorAll('.page-numbers button');
    const prevButton = pagination.querySelector('.prev');
    const nextButton = pagination.querySelector('.next');
    
    // 设置初始状态
    prevButton.disabled = true;
    nextButton.disabled = totalPages <= 1;
    
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
    const postsPerPage = POSTS_PER_PAGE;
    
    // 计算当前页应显示的文章
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = Math.min(startIndex + postsPerPage, allPosts.length);
    const pageItems = allPosts.slice(startIndex, endIndex);
    
    // 显示当前页的文章
    displayPosts(pageItems);
}

// 更新分页按钮状态
function updatePaginationButtons() {
    const activePage = document.querySelector('.pagination .page-numbers button.active');
    const prevButton = document.querySelector('.pagination .prev');
    const nextButton = document.querySelector('.pagination .next');
    
    if (activePage && prevButton && nextButton) {
        // 如果是第一页，禁用上一页按钮
        if (!activePage.previousElementSibling) {
            prevButton.disabled = true;
        } else {
            prevButton.disabled = false;
        }
        
        // 如果是最后一页，禁用下一页按钮
        if (!activePage.nextElementSibling) {
            nextButton.disabled = true;
        } else {
            nextButton.disabled = false;
        }
    }
}
