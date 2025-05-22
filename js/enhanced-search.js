/**
 * 增强版搜索功能
 * 支持本地博客搜索、Bing搜索和Google搜索
 * 作者: HealthJian
 * 日期: 2025-05-16
 */

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化搜索功能
    initEnhancedSearch();
});

/**
 * 初始化增强版搜索功能
 */
function initEnhancedSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchTypeToggle = document.getElementById('search-type-toggle');
    const searchOptions = document.querySelectorAll('.search-option');
    
    // 当前搜索类型
    let currentSearchType = 'local';
    
    // 搜索引擎URL模板
    const searchEngines = {
        local: function(query) {
            // 本地搜索逻辑
            performLocalSearch(query);
            return null; // 不需要跳转
        },
        bing: function(query) {
            return `https://www.bing.com/search?q=site:healthjian.github.io+${encodeURIComponent(query)}`;
        },
        google: function(query) {
            return `https://www.google.com/search?q=site:healthjian.github.io+${encodeURIComponent(query)}`;
        }
    };
    
    // 点击搜索类型切换按钮显示/隐藏下拉菜单
    searchTypeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const searchOptionsEl = document.querySelector('.search-options');
        const isVisible = searchOptionsEl.classList.contains('visible');
        
        if (isVisible) {
            hideSearchOptions();
        } else {
            showSearchOptions();
        }
    });
    
    /**
     * 显示搜索选项
     */
    function showSearchOptions() {
        const searchOptionsEl = document.querySelector('.search-options');
        const overlay = document.querySelector('.search-overlay');
        
        // 创建遮罩层（如果不存在）
        if (!overlay) {
            const newOverlay = document.createElement('div');
            newOverlay.className = 'search-overlay';
            document.body.appendChild(newOverlay);
            
            // 点击遮罩层关闭下拉菜单
            newOverlay.addEventListener('click', hideSearchOptions);
        }
        
        // 显示选项和遮罩层
        searchOptionsEl.classList.add('visible');
        document.querySelector('.search-overlay').classList.add('visible');
        document.body.style.overflow = 'hidden'; // 防止滚动
    }
    
    /**
     * 隐藏搜索选项
     */
    function hideSearchOptions() {
        const searchOptionsEl = document.querySelector('.search-options');
        const overlay = document.querySelector('.search-overlay');
        
        if (searchOptionsEl) {
            searchOptionsEl.classList.remove('visible');
        }
        
        if (overlay) {
            overlay.classList.remove('visible');
            
            // 添加消失动画
            overlay.addEventListener('transitionend', function handler() {
                document.body.style.overflow = ''; // 恢复滚动
                overlay.removeEventListener('transitionend', handler);
            });
        }
    }
    
    // 点击搜索选项时更新当前搜索类型
    searchOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const searchType = this.getAttribute('data-type');
            
            // 更新当前搜索类型
            currentSearchType = searchType;
            
            // 更新UI
            searchOptions.forEach(opt => {
                opt.setAttribute('data-active', 'false');
            });
            this.setAttribute('data-active', 'true');
            
            // 更新图标
            updateSearchTypeIcon(searchType);
            
            // 更新placeholder
            updatePlaceholder(searchType);
            
            // 隐藏下拉菜单
            hideSearchOptions();
        });
    });
    
    // 点击页面其他区域关闭下拉菜单
    document.addEventListener('click', function() {
        hideSearchOptions();
    });
    
    // 阻止点击下拉菜单内部时关闭
    document.querySelector('.search-dropdown').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // 点击搜索按钮执行搜索
    searchButton.addEventListener('click', function() {
        executeSearch();
    });
    
    // 按回车键执行搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            executeSearch();
        }
    });
    
    /**
     * 执行搜索
     */
    function executeSearch() {
        const query = searchInput.value.trim();
        
        if (query) {
            const searchUrl = searchEngines[currentSearchType](query);
            
            // 如果返回URL，则跳转
            if (searchUrl) {
                window.open(searchUrl, '_blank');
            }
        }
    }
    
    /**
     * 更新搜索类型图标
     */
    function updateSearchTypeIcon(searchType) {
        const iconMap = {
            local: 'fa-file-alt',
            bing: 'fa-microsoft',
            google: 'fa-google'
        };
        
        searchTypeToggle.innerHTML = `<i class="fab ${iconMap[searchType]}"></i>`;
    }
    
    /**
     * 更新搜索框占位符
     */
    function updatePlaceholder(searchType) {
        const isZh = document.body.classList.contains('zh');
        
        const placeholders = {
            local: {
                zh: '搜索博客文章...',
                en: 'Search blog posts...'
            },
            bing: {
                zh: '使用必应搜索...',
                en: 'Search with Bing...'
            },
            google: {
                zh: '使用谷歌搜索...',
                en: 'Search with Google...'
            }
        };
        
        const language = isZh ? 'zh' : 'en';
        searchInput.placeholder = placeholders[searchType][language];
        
        // 更新data属性用于语言切换
        searchInput.setAttribute('data-zh-placeholder', placeholders[searchType].zh);
        searchInput.setAttribute('data-en-placeholder', placeholders[searchType].en);
    }
    
    /**
     * 执行本地搜索
     */
    function performLocalSearch(query) {
        // 获取所有博客文章
        const blogPosts = document.querySelectorAll('.blog-post');
        let found = false;
        let firstMatch = null;
        
        // 隐藏之前的无结果提示
        const noResultsEl = document.querySelector('.no-search-results');
        if (noResultsEl) {
            noResultsEl.style.display = 'none';
        }
        
        // 清除之前的搜索结果高亮
        blogPosts.forEach(post => {
            post.classList.remove('search-highlight');
            post.style.display = '';
        });
        
        // 如果查询为空，显示所有文章
        if (!query) {
            return;
        }
        
        // 显示搜索动画
        showSearchingAnimation();
        
        // 使用setTimeout来模拟异步搜索，增强用户体验
        setTimeout(() => {
            // 搜索文章
            blogPosts.forEach(post => {
                const title = post.querySelector('.blog-post-title').textContent.toLowerCase();
                const content = post.querySelector('.blog-post-excerpt').textContent.toLowerCase();
                const tags = post.getAttribute('data-tags') ? post.getAttribute('data-tags').toLowerCase() : '';
                
                if (title.includes(query.toLowerCase()) || 
                    content.includes(query.toLowerCase()) || 
                    tags.includes(query.toLowerCase())) {
                    post.classList.add('search-highlight');
                    post.style.display = '';
                    found = true;
                    
                    // 记录第一个匹配项
                    if (!firstMatch) {
                        firstMatch = post;
                    }
                    
                    // 高亮搜索关键词
                    highlightSearchTerms(post, query);
                } else {
                    post.style.display = 'none';
                }
            });
            
            // 隐藏搜索动画
            hideSearchingAnimation();
            
            // 如果找到了匹配项，滚动到第一个
            if (found && firstMatch) {
                setTimeout(() => {
                    firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            } else {
                // 如果没有找到匹配的文章，显示提示
                showNoResultsMessage(query);
            }
        }, 300); // 延迟300毫秒执行搜索，增强用户体验
    }
    
    /**
     * 显示搜索动画
     */
    function showSearchingAnimation() {
        // 检查是否已存在搜索动画
        let searchingEl = document.querySelector('.searching-animation');
        
        if (!searchingEl) {
            searchingEl = document.createElement('div');
            searchingEl.className = 'searching-animation';
            
            // 创建动画内容
            const isZh = document.body.classList.contains('zh');
            const message = isZh ? '正在搜索...' : 'Searching...';
            
            searchingEl.innerHTML = `
                <div class="searching-spinner"></div>
                <div class="searching-text">${message}</div>
            `;
            
            document.querySelector('.blog-list').insertBefore(searchingEl, document.querySelector('.blog-list').firstChild);
        }
        
        searchingEl.style.display = 'flex';
    }
    
    /**
     * 隐藏搜索动画
     */
    function hideSearchingAnimation() {
        const searchingEl = document.querySelector('.searching-animation');
        if (searchingEl) {
            searchingEl.style.display = 'none';
        }
    }
    
    /**
     * 高亮搜索关键词
     */
    function highlightSearchTerms(post, query) {
        // 高亮标题和内容中的关键词
        const title = post.querySelector('.blog-post-title');
        const excerpt = post.querySelector('.blog-post-excerpt');
        
        if (title && excerpt) {
            // 保存原始内容（如果还没有保存）
            if (!title.getAttribute('data-original')) {
                title.setAttribute('data-original', title.innerHTML);
            }
            if (!excerpt.getAttribute('data-original')) {
                excerpt.setAttribute('data-original', excerpt.innerHTML);
            }
            
            // 恢复原始内容
            title.innerHTML = title.getAttribute('data-original');
            excerpt.innerHTML = excerpt.getAttribute('data-original');
            
            // 高亮关键词
            const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
            title.innerHTML = title.innerHTML.replace(regex, '<span class="search-term-highlight">$1</span>');
            excerpt.innerHTML = excerpt.innerHTML.replace(regex, '<span class="search-term-highlight">$1</span>');
        }
    }
    
    /**
     * 转义正则表达式特殊字符
     */
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * 显示无搜索结果消息
     */
    function showNoResultsMessage(query) {
        const isZh = document.body.classList.contains('zh');
        const message = isZh ? 
            `没有找到与 "${query}" 相关的文章。尝试使用必应或谷歌搜索更多内容。` : 
            `No posts found for "${query}". Try using Bing or Google to search for more content.`;
            
        // 检查是否已存在提示消息
        let noResultsEl = document.querySelector('.no-search-results');
        
        if (!noResultsEl) {
            noResultsEl = document.createElement('div');
            noResultsEl.className = 'no-search-results';
            document.querySelector('.blog-list').appendChild(noResultsEl);
        }
        
        noResultsEl.textContent = message;
        noResultsEl.style.display = 'block';
    }
}
