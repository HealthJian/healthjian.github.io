// Markdown渲染器模块
// 支持将Markdown文本渲染为HTML，并提供代码高亮和目录生成功能

class MarkdownRenderer {
    constructor() {
        this.tocItems = [];
        this._mermaidCounter = 0;
        this.currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
        this.initializeRenderer();
        this.initializeMermaid();
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

        // 当前渲染的Markdown文件路径（用于图片相对路径修正）
        this.currentMarkdownFile = null;
    }

    // 初始化 Mermaid（仅配置，不触发渲染）
    initializeMermaid() {
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({
                startOnLoad: false,
                theme: document.body.classList.contains('dark-mode') ? 'dark' : 'default',
                securityLevel: 'loose',
                fontFamily: 'inherit'
            });
        }
    }

    // 渲染页面中所有 Mermaid 图表
    async renderMermaidDiagrams(container) {
        if (typeof mermaid === 'undefined') {
            console.warn('Mermaid 未加载，跳过图表渲染');
            return;
        }
        const nodes = container.querySelectorAll('pre.mermaid');
        if (nodes.length === 0) return;

        const isDark = document.body.classList.contains('dark-mode');
        mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit'
        });

        try {
            await mermaid.run({ nodes: nodes });
        } catch (err) {
            console.error('Mermaid 渲染失败:', err);
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
        
        // 自定义标题渲染，生成目录（纯文本用于 slug / 目录，保留 HTML 用于正文标题）
        renderer.heading = (text, level) => {
            const plainText = String(text)
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .trim();
            const slug = this.generateSlug(plainText);

            this.tocItems.push({
                text: plainText,
                level: level,
                slug: slug
            });

            return `<h${level} id="${slug}">${text}</h${level}>`;
        };

        // 自定义代码块渲染
        renderer.code = (code, language) => {
            // Mermaid 图表：输出占位容器，后续由 mermaid.run() 渲染
            if (language && language.toLowerCase() === 'mermaid') {
                const id = 'mermaid-' + (++this._mermaidCounter);
                return `<div class="mermaid-container"><pre class="mermaid" id="${id}">${this.escapeHtml(code)}</pre></div>`;
            }

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

        // 将基于Markdown文件的相对路径解析为当前页面可用的路径
        try {
            // markdown 文件的完整 URL（相对于当前页面）
            const markdownFileUrl = this.currentMarkdownFile
                ? new URL(this.currentMarkdownFile, window.location.href)
                : new URL(window.location.href);

            // 取到 markdown 文件所在的目录
            const markdownDirUrl = new URL('./', markdownFileUrl);

            // 解析图片相对路径
            const resolvedUrl = new URL(originalPath, markdownDirUrl);

            // 返回相对于站点根的路径，避免包含协议/域名
            return resolvedUrl.pathname + resolvedUrl.search + resolvedUrl.hash;
        } catch (e) {
            console.warn('图片路径解析失败，使用原始路径', originalPath, e);
            return originalPath;
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
            // 重置目录项和 Mermaid 计数器
            this.tocItems = [];
            this._mermaidCounter = 0;

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

                // 渲染 Mermaid 图表
                await this.renderMermaidDiagrams(targetElement);

                // 为 Mermaid 图表添加全屏放大按钮
                this.setupMermaidFullscreen(targetElement);

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

    // 生成目录 HTML：h2 下挂 h3 时可折叠；h1 / h4+ 扁平展示
    generateTOCHTML() {
        if (this.tocItems.length === 0) {
            return '<p class="no-toc">本文暂无目录</p>';
        }

        const esc = (s) => this.escapeHtml(String(s));
        let html = '<div class="toc-tree">';
        const items = this.tocItems;
        let i = 0;

        while (i < items.length) {
            const item = items[i];

            if (item.level === 1) {
                html += `<div class="toc-row toc-level-1"><a href="#${item.slug}" class="toc-link" data-level="1">${esc(item.text)}</a></div>`;
                i++;
            } else if (item.level === 2) {
                const h2 = item;
                const children = [];
                let j = i + 1;
                while (j < items.length && items[j].level === 3) {
                    children.push(items[j]);
                    j++;
                }

                if (children.length > 0) {
                    html += `<div class="toc-branch" data-open="true">`;
                    html += `<div class="toc-h2-head">`;
                    html += `<button type="button" class="toc-branch-toggle" aria-expanded="true" aria-label="折叠或展开小节"></button>`;
                    html += `<a href="#${h2.slug}" class="toc-link toc-h2" data-level="2">${esc(h2.text)}</a>`;
                    html += `</div><ul class="toc-h3-list">`;
                    children.forEach((ch) => {
                        html += `<li><a href="#${ch.slug}" class="toc-link toc-h3" data-level="3">${esc(ch.text)}</a></li>`;
                    });
                    html += `</ul></div>`;
                } else {
                    html += `<div class="toc-row toc-level-2 toc-leaf"><a href="#${h2.slug}" class="toc-link toc-h2" data-level="2">${esc(h2.text)}</a></div>`;
                }
                i = j;
            } else if (item.level === 3) {
                html += `<div class="toc-row toc-level-3 toc-orphan"><a href="#${item.slug}" class="toc-link toc-h3" data-level="3">${esc(item.text)}</a></div>`;
                i++;
            } else {
                html += `<div class="toc-row toc-level-low"><a href="#${item.slug}" class="toc-link" data-level="${item.level}">${esc(item.text)}</a></div>`;
                i++;
            }
        }

        html += '</div>';
        return html;
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
            // 保存当前Markdown文件路径，供图片路径修正使用
            this.currentMarkdownFile = filePath;

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
        if (typeof katex === 'undefined') {
            console.warn('KaTeX未加载，跳过数学公式渲染');
            return;
        }

        try {
            // 渲染块级数学公式
            const blockMathElements = container.querySelectorAll('.math-block');
            blockMathElements.forEach(element => {
                const formula = element.dataset.formula;
                if (formula) {
                    try {
                        // 使用 renderToString 返回 HTML 字符串并插入到元素中
                        const html = katex.renderToString(formula, {
                            displayMode: true,
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
                        element.innerHTML = html;
                    } catch (error) {
                        console.error('块级数学公式渲染失败:', formula, error);
                        element.innerHTML = `<span style="color: #cc0000;">渲染错误: ${formula}</span>`;
                    }
                }
            });

            // 渲染行内数学公式
            const inlineMathElements = container.querySelectorAll('.math-inline');
            inlineMathElements.forEach(element => {
                const formula = element.dataset.formula;
                if (formula) {
                    try {
                        // 行内公式使用 renderToString 并保留为内联
                        const html = katex.renderToString(formula, {
                            displayMode: false,
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
                        element.innerHTML = html;
                    } catch (error) {
                        console.error('行内数学公式渲染失败:', formula, error);
                        element.innerHTML = `<span style="color: #cc0000;">渲染错误: ${formula}</span>`;
                    }
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

    // 渲染完成后为每个 Mermaid 图表注入全屏放大按钮
    setupMermaidFullscreen(container) {
        const mermaidContainers = container.querySelectorAll('.mermaid-container');
        if (mermaidContainers.length === 0) return;

        mermaidContainers.forEach(mc => {
            const svg = mc.querySelector('svg');
            if (!svg) return;

            const btn = document.createElement('button');
            btn.className = 'mermaid-fullscreen-btn';
            btn.type = 'button';
            const lang = document.body.classList.contains('en') ? 'en' : 'zh';
            btn.title = lang === 'en' ? 'View fullscreen' : '全屏查看';
            btn.innerHTML = '<i class="fas fa-expand" aria-hidden="true"></i>';
            mc.appendChild(btn);

            btn.addEventListener('click', () => this.openMermaidFullscreen(svg));
        });
    }

    // 打开 Mermaid 图表全屏查看器
    openMermaidFullscreen(svgElement) {
        const lang = document.body.classList.contains('en') ? 'en' : 'zh';

        const overlay = document.createElement('div');
        overlay.className = 'mermaid-fullscreen-overlay';

        // --- 顶部工具栏 ---
        const toolbar = document.createElement('div');
        toolbar.className = 'mermaid-fullscreen-toolbar';

        const zoomInfo = document.createElement('span');
        zoomInfo.className = 'mermaid-zoom-info';
        zoomInfo.textContent = '100%';

        const makeBtn = (icon, title) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.title = title;
            b.innerHTML = '<i class="fas fa-' + icon + '" aria-hidden="true"></i>';
            return b;
        };

        const zoomOutBtn = makeBtn('search-minus', lang === 'en' ? 'Zoom out' : '缩小');
        const zoomInBtn  = makeBtn('search-plus',  lang === 'en' ? 'Zoom in'  : '放大');
        const resetBtn   = makeBtn('compress-arrows-alt', lang === 'en' ? 'Fit to screen' : '适应屏幕');
        const closeBtn   = makeBtn('times', lang === 'en' ? 'Close' : '关闭');

        toolbar.append(zoomInfo, zoomOutBtn, zoomInBtn, resetBtn, closeBtn);

        // --- SVG 视窗 ---
        const viewport = document.createElement('div');
        viewport.className = 'mermaid-fullscreen-viewport';

        const svgClone = svgElement.cloneNode(true);
        svgClone.style.cssText = 'max-width:none;max-height:none;';
        viewport.appendChild(svgClone);

        // --- 底部操作提示 ---
        const hint = document.createElement('div');
        hint.className = 'mermaid-fullscreen-hint';
        hint.textContent = lang === 'en'
            ? 'Scroll to zoom | Drag to pan | ESC to close'
            : '滚轮缩放 | 拖拽平移 | ESC 关闭';

        overlay.append(toolbar, viewport, hint);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => overlay.classList.add('active'));

        // --- 缩放 / 平移状态 ---
        let scale = 1, translateX = 0, translateY = 0;
        let isDragging = false, hasDragged = false;
        let dragStartX, dragStartY, dragStartTX, dragStartTY;

        const updateTransform = () => {
            svgClone.style.transform =
                'translate(' + translateX + 'px,' + translateY + 'px) scale(' + scale + ')';
            zoomInfo.textContent = Math.round(scale * 100) + '%';
        };

        const getIntrinsicSize = () => {
            const vb = svgClone.getAttribute('viewBox');
            if (vb) {
                const p = vb.split(/[\s,]+/).map(Number);
                if (p.length >= 4 && p[2] > 0 && p[3] > 0) return { w: p[2], h: p[3] };
            }
            const wa = svgClone.getAttribute('width');
            const ha = svgClone.getAttribute('height');
            if (wa && ha && !String(wa).includes('%')) {
                const w = parseFloat(wa), h = parseFloat(ha);
                if (w > 0 && h > 0) return { w, h };
            }
            const rect = svgClone.getBoundingClientRect();
            return { w: rect.width || 800, h: rect.height || 600 };
        };

        const fitToViewport = () => {
            const vw = viewport.clientWidth * 0.92;
            const vh = viewport.clientHeight * 0.88;
            const s = getIntrinsicSize();
            scale = Math.min(vw / s.w, vh / s.h, 3);
            if (scale < 0.05) scale = 0.05;
            translateX = 0;
            translateY = 0;
            updateTransform();
        };

        requestAnimationFrame(fitToViewport);

        // 缩放操作
        const clampScale = (s) => Math.min(Math.max(s, 0.1), 5);

        zoomInBtn.addEventListener('click', () => {
            scale = clampScale(scale * 1.25);
            updateTransform();
        });
        zoomOutBtn.addEventListener('click', () => {
            scale = clampScale(scale / 1.25);
            updateTransform();
        });
        resetBtn.addEventListener('click', fitToViewport);

        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
            scale = clampScale(scale * factor);
            updateTransform();
        }, { passive: false });

        // 鼠标拖拽平移
        viewport.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            hasDragged = false;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            dragStartTX = translateX;
            dragStartTY = translateY;
            e.preventDefault();
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true;
            translateX = dragStartTX + dx;
            translateY = dragStartTY + dy;
            updateTransform();
        };

        const onMouseUp = () => { isDragging = false; };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // 触屏手势：单指拖拽 + 双指缩放
        let lastTouchDist = 0;

        viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                hasDragged = false;
                dragStartX = e.touches[0].clientX;
                dragStartY = e.touches[0].clientY;
                dragStartTX = translateX;
                dragStartTY = translateY;
            } else if (e.touches.length === 2) {
                isDragging = false;
                lastTouchDist = Math.hypot(
                    e.touches[1].clientX - e.touches[0].clientX,
                    e.touches[1].clientY - e.touches[0].clientY
                );
            }
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && isDragging) {
                const dx = e.touches[0].clientX - dragStartX;
                const dy = e.touches[0].clientY - dragStartY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true;
                translateX = dragStartTX + dx;
                translateY = dragStartTY + dy;
                updateTransform();
            } else if (e.touches.length === 2 && lastTouchDist > 0) {
                const dist = Math.hypot(
                    e.touches[1].clientX - e.touches[0].clientX,
                    e.touches[1].clientY - e.touches[0].clientY
                );
                scale = clampScale(scale * (dist / lastTouchDist));
                lastTouchDist = dist;
                updateTransform();
            }
        }, { passive: false });

        viewport.addEventListener('touchend', () => {
            isDragging = false;
            lastTouchDist = 0;
        });

        // 自动隐藏操作提示
        setTimeout(() => { hint.style.opacity = '0'; }, 4000);

        // --- 关闭逻辑 ---
        const closeOverlay = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('keydown', onKeyDown);
            setTimeout(() => overlay.remove(), 300);
        };

        closeBtn.addEventListener('click', closeOverlay);

        viewport.addEventListener('click', (e) => {
            if (e.target === viewport && !hasDragged) closeOverlay();
        });

        const onKeyDown = (e) => { if (e.key === 'Escape') closeOverlay(); };
        document.addEventListener('keydown', onKeyDown);
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
