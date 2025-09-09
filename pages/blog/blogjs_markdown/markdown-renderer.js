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

        // 自定义图片渲染，修正路径问题
        renderer.image = (href, title, text) => {
            // 修正相对路径
            const correctedHref = this.correctImagePath(href);
            const titleAttr = title ? ` title="${title}"` : '';
            const altAttr = text ? ` alt="${text}"` : '';
            
            return `<img src="${correctedHref}"${altAttr}${titleAttr} loading="lazy" onerror="this.onerror=null; this.classList.add('image-error'); this.style.display='block';">`;
        };

        marked.use({ renderer });
        
        // 配置数学公式支持
        this.setupMathSupport();
    }

    // 生成标题的slug
    generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fa5]/g, '') // 保留中文字符
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // 修正图片路径
    correctImagePath(originalPath) {
        // 如果是绝对路径或完整URL，直接返回
        if (originalPath.startsWith('http://') || originalPath.startsWith('https://') || originalPath.startsWith('/')) {
            return originalPath;
        }

        // 处理相对路径
        // 当前页面路径：pages/blog/moban_new_md.html
        // Markdown文件路径：context/test.md
        // 需要将相对于Markdown文件的路径转换为相对于当前页面的路径
        
        // 如果路径以 ../ 开头，说明是从Markdown文件位置开始的相对路径
        if (originalPath.startsWith('../')) {
            // 从 context/ 目录开始，../images/ 应该变成 ../../images/
            // 因为当前页面在 pages/blog/ 目录下
            return '../../' + originalPath.substring(3);
        } else if (originalPath.startsWith('./')) {
            // 如果是 ./images/，转换为相对于当前页面的路径
            return '../../context/' + originalPath.substring(2);
        } else {
            // 相对路径，假设是相对于项目根目录
            return '../../' + originalPath;
        }
    }

    // 配置数学公式支持
    setupMathSupport() {
        // 数学公式的正则表达式
        this.mathPatterns = {
            // 块级公式：$$...$$
            blockMath: /\$\$([^$]+?)\$\$/g,
            // 行内公式：$...$（但不匹配$$...$$）
            inlineMath: /(?<!\$)\$([^$\n]+?)\$(?!\$)/g
        };
    }

    // 预处理数学公式
    preprocessMath(text) {
        let processedText = text;
        const mathBlocks = [];
        let blockIndex = 0;

        // 先处理块级公式
        processedText = processedText.replace(this.mathPatterns.blockMath, (match, formula) => {
            const placeholder = `__MATH_BLOCK_${blockIndex}__`;
            mathBlocks.push({
                type: 'block',
                formula: formula.trim(),
                placeholder: placeholder
            });
            blockIndex++;
            return placeholder;
        });

        // 再处理行内公式
        processedText = processedText.replace(this.mathPatterns.inlineMath, (match, formula) => {
            const placeholder = `__MATH_INLINE_${blockIndex}__`;
            mathBlocks.push({
                type: 'inline',
                formula: formula.trim(),
                placeholder: placeholder
            });
            blockIndex++;
            return placeholder;
        });

        return {
            text: processedText,
            mathBlocks: mathBlocks
        };
    }

    // 后处理数学公式
    postprocessMath(html, mathBlocks) {
        let processedHtml = html;

        mathBlocks.forEach(mathBlock => {
            const { type, formula, placeholder } = mathBlock;
            
            if (type === 'block') {
                // 块级公式
                const mathHtml = `<div class="math-block" data-formula="${this.escapeHtml(formula)}">$$${formula}$$</div>`;
                processedHtml = processedHtml.replace(placeholder, mathHtml);
            } else if (type === 'inline') {
                // 行内公式
                const mathHtml = `<span class="math-inline" data-formula="${this.escapeHtml(formula)}">$${formula}$</span>`;
                processedHtml = processedHtml.replace(placeholder, mathHtml);
            }
        });

        return processedHtml;
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 渲染Markdown内容
    async renderMarkdown(markdownText, targetElement) {
        try {
            // 重置目录项
            this.tocItems = [];

            let htmlContent;
            let mathBlocks = [];
            
            if (this.useBasicRenderer) {
                // 基础渲染器也支持数学公式
                const mathResult = this.preprocessMath(markdownText);
                const basicHtml = this.basicMarkdownRender(mathResult.text);
                htmlContent = this.postprocessMath(basicHtml, mathResult.mathBlocks);
                mathBlocks = mathResult.mathBlocks;
            } else {
                // 使用marked.js渲染
                const mathResult = this.preprocessMath(markdownText);
                const markedHtml = marked(mathResult.text);
                htmlContent = this.postprocessMath(markedHtml, mathResult.mathBlocks);
                mathBlocks = mathResult.mathBlocks;
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

                // 渲染数学公式
                await this.renderMathFormulas(targetElement);

                // 添加图片懒加载
                this.setupImageLazyLoading(targetElement);
                
                // 添加链接处理
                this.setupLinkHandling(targetElement);
            }

            return {
                html: htmlContent,
                toc: this.tocItems,
                mathBlocks: mathBlocks
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

    // 设置图片懒加载和错误处理
    setupImageLazyLoading(container) {
        const images = container.querySelectorAll('img');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        // 图片进入视口时，添加loaded类用于动画效果
                        img.classList.add('loaded');
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => {
                // 为所有图片添加懒加载类
                img.classList.add('lazy');
                imageObserver.observe(img);
                
                // 添加加载成功事件
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                    img.classList.remove('lazy');
                });
                
                // 图片加载错误处理已在renderer中通过onerror属性处理
            });
        } else {
            // 不支持IntersectionObserver时，直接显示所有图片
            images.forEach(img => {
                img.classList.add('loaded');
                img.classList.remove('lazy');
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

    // 渲染数学公式
    async renderMathFormulas(container) {
        // 等待KaTeX加载完成
        if (typeof katex === 'undefined' || typeof renderMathInElement === 'undefined') {
            console.warn('KaTeX未加载，跳过数学公式渲染');
            return;
        }

        try {
            // 使用KaTeX的auto-render扩展
            renderMathInElement(container, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ],
                throwOnError: false,
                errorColor: '#cc0000',
                strict: 'warn',
                trust: false,
                macros: {
                    "\\RR": "\\mathbb{R}",
                    "\\NN": "\\mathbb{N}",
                    "\\ZZ": "\\mathbb{Z}",
                    "\\QQ": "\\mathbb{Q}",
                    "\\CC": "\\mathbb{C}"
                }
            });

            // 为数学公式添加复制功能
            this.addMathCopyFeature(container);
            
            console.log('数学公式渲染完成');
        } catch (error) {
            console.error('数学公式渲染失败:', error);
        }
    }

    // 为数学公式添加复制功能
    addMathCopyFeature(container) {
        const mathElements = container.querySelectorAll('.math-block, .math-inline');
        
        mathElements.forEach(mathEl => {
            mathEl.style.position = 'relative';
            mathEl.style.cursor = 'pointer';
            mathEl.title = '点击复制LaTeX代码';
            
            mathEl.addEventListener('click', () => {
                const formula = mathEl.dataset.formula || mathEl.textContent;
                
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(formula).then(() => {
                        this.showMathCopySuccess(mathEl);
                    }).catch(err => {
                        console.error('复制失败:', err);
                        this.fallbackCopyText(formula);
                        this.showMathCopySuccess(mathEl);
                    });
                } else {
                    this.fallbackCopyText(formula);
                    this.showMathCopySuccess(mathEl);
                }
            });
        });
    }

    // 显示复制成功提示
    showMathCopySuccess(element) {
        const tooltip = document.createElement('div');
        tooltip.textContent = '已复制！';
        tooltip.className = 'math-copy-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
        `;
        
        element.appendChild(tooltip);
        
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 2000);
    }

    // 降级复制文本方法
    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
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
