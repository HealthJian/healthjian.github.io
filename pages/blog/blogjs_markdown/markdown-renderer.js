// Markdown渲染器模块
// 支持将Markdown文本渲染为HTML，并提供代码高亮和目录生成功能

class MarkdownRenderer {
    constructor() {
        this.tocItems = [];
        this.currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
        this.initializeRenderer();
    }

    // 初始化渲染器
    initializeRenderer() {
        // 检查是否已加载marked.js
        if (typeof marked === 'undefined') {
            console.warn('Marked.js未加载，将使用基础渲染功能');
            this.useBasicRenderer = true;
        } else {
            this.useBasicRenderer = false;
            this.configureMarked();
        }
    }

    // 配置marked.js
    configureMarked() {
        if (this.useBasicRenderer) return;

        // 配置marked选项
        marked.setOptions({
            highlight: (code, lang) => {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.warn('代码高亮失败:', err);
                    }
                }
                return code;
            },
            langPrefix: 'hljs language-',
            breaks: true,
            gfm: true
        });

        // 自定义渲染器
        const renderer = new marked.Renderer();
        
        // 自定义标题渲染，生成目录
        renderer.heading = (text, level) => {
            const slug = this.generateSlug(text);
            
            // 添加到目录
            this.tocItems.push({
                text: text,
                level: level,
                slug: slug
            });

            return `<h${level} id="${slug}">${text}</h${level}>`;
        };

        // 自定义代码块渲染
        renderer.code = (code, language) => {
            const validLang = language && hljs && hljs.getLanguage(language) ? language : 'plaintext';
            const highlightedCode = hljs ? hljs.highlight(code, { language: validLang }).value : code;
            
            return `<div class="code-block">
                <div class="code-header">
                    <span class="code-language">${validLang}</span>
                    <button class="copy-code-btn" onclick="copyToClipboard(this)" title="复制代码">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <pre><code class="hljs language-${validLang}">${highlightedCode}</code></pre>
            </div>`;
        };

        // 自定义表格渲染
        renderer.table = (header, body) => {
            return `<div class="table-wrapper">
                <table class="markdown-table">
                    <thead>${header}</thead>
                    <tbody>${body}</tbody>
                </table>
            </div>`;
        };

        // 自定义引用块渲染
        renderer.blockquote = (quote) => {
            return `<blockquote class="markdown-blockquote">
                <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                ${quote}
            </blockquote>`;
        };

        marked.use({ renderer });
    }

    // 生成标题的slug
    generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fa5]/g, '') // 保留中文字符
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // 渲染Markdown内容
    async renderMarkdown(markdownText, targetElement) {
        try {
            // 重置目录项
            this.tocItems = [];

            let htmlContent;
            
            if (this.useBasicRenderer) {
                htmlContent = this.basicMarkdownRender(markdownText);
            } else {
                htmlContent = marked(markdownText);
            }

            // 将渲染后的HTML插入到目标元素
            if (targetElement) {
                targetElement.innerHTML = htmlContent;
                
                // 重新初始化代码高亮
                if (typeof hljs !== 'undefined') {
                    targetElement.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightElement(block);
                    });
                }

                // 添加图片懒加载
                this.setupImageLazyLoading(targetElement);
                
                // 添加链接处理
                this.setupLinkHandling(targetElement);
            }

            return {
                html: htmlContent,
                toc: this.tocItems
            };
        } catch (error) {
            console.error('Markdown渲染失败:', error);
            throw error;
        }
    }

    // 基础Markdown渲染器（当marked.js不可用时）
    basicMarkdownRender(text) {
        return text
            // 标题
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // 粗体
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            // 斜体
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            // 代码块
            .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
            // 行内代码
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            // 链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
            // 换行
            .replace(/\n/gim, '<br>');
    }

    // 生成目录HTML
    generateTOCHTML() {
        if (this.tocItems.length === 0) {
            return '<p class="no-toc">本文暂无目录</p>';
        }

        let tocHTML = '<ul class="toc-list">';
        let currentLevel = 0;

        this.tocItems.forEach((item, index) => {
            const levelDiff = item.level - currentLevel;
            
            if (levelDiff > 0) {
                // 需要增加嵌套层级
                for (let i = 0; i < levelDiff; i++) {
                    if (currentLevel > 0 || i > 0) {
                        tocHTML += '<ul>';
                    }
                }
            } else if (levelDiff < 0) {
                // 需要减少嵌套层级
                for (let i = 0; i < Math.abs(levelDiff); i++) {
                    tocHTML += '</ul>';
                }
            }

            tocHTML += `<li><a href="#${item.slug}" class="toc-link" data-level="${item.level}">${item.text}</a></li>`;
            currentLevel = item.level;
        });

        // 关闭所有未关闭的ul标签
        for (let i = currentLevel; i > 1; i--) {
            tocHTML += '</ul>';
        }
        tocHTML += '</ul>';

        return tocHTML;
    }

    // 设置图片懒加载
    setupImageLazyLoading(container) {
        const images = container.querySelectorAll('img');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            images.forEach(img => {
                if (img.dataset.src) {
                    img.classList.add('lazy');
                    imageObserver.observe(img);
                }
            });
        }
    }

    // 设置链接处理
    setupLinkHandling(container) {
        const links = container.querySelectorAll('a');
        
        links.forEach(link => {
            // 外部链接在新窗口打开
            if (link.hostname && link.hostname !== window.location.hostname) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
            
            // 内部锚点链接平滑滚动
            if (link.hash && link.hostname === window.location.hostname) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.hash.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // 更新URL
                        history.pushState(null, null, link.hash);
                    }
                });
            }
        });
    }

    // 从文件加载Markdown内容
    async loadMarkdownFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdownText = await response.text();
            return markdownText;
        } catch (error) {
            console.error('加载Markdown文件失败:', error);
            throw error;
        }
    }

    // 更新语言
    updateLanguage(lang) {
        this.currentLang = lang;
    }
}

// 全局辅助函数
window.copyToClipboard = function(button) {
    const codeBlock = button.parentElement.nextElementSibling.querySelector('code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.color = '#28a745';
        
        setTimeout(() => {
            button.innerHTML = originalIcon;
            button.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        // 降级处理
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.color = '#28a745';
        
        setTimeout(() => {
            button.innerHTML = originalIcon;
            button.style.color = '';
        }, 2000);
    });
};

// 导出到全局
window.MarkdownRenderer = MarkdownRenderer;
