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

// 获取博客文章数据
function getBlogPosts() {
    // 文章数据
    return [
        {
            "id": "langchain-complete-guide-20260423",
            "title": "LangChain 全解：从基础组件到生产级 Agent 开发 -- 2026 年开发者必读指南",
            "title_en": "A Comprehensive Guide to LangChain: From Core Components to Production-Grade Agent Development -- The Essential Developer's Guide for 2026",
            "excerpt": "LangChain 已成为构建大语言模型应用的事实标准框架。2025 年 10 月，LangChain 与 LangGraph 双双达到 v1.0 里程碑，标志着该生态从'原型开发工具'正式跨入'生产级基础设施'阶段。本文将系统梳理 LangChain 的核心组件、编程范式、生态工具与选型策略，涵盖 LCEL 声明式链式编程、LangGraph 图式编排、LangSmith 可观测性平台，以及与 CrewAI、AutoGen、LlamaIndex 等框架的横向对比。",
            "excerpt_en": "LangChain has become the de facto standard framework for building LLM applications. In October 2025, both LangChain and LangGraph reached their v1.0 milestones. This article systematically reviews LangChain's core components, programming paradigms, ecosystem tools, and selection strategies, covering LCEL declarative chain programming, LangGraph graph-based orchestration, LangSmith observability platform, and horizontal comparison with CrewAI, AutoGen, LlamaIndex and other frameworks.",
            "date": "2026-04-23",
            "url": "/pages/blog/moban_new_md.html?md=../../context/20260423_zh_1.md",
            "category": "tech",
            "tags": ["LangChain", "LangGraph", "LCEL", "AI Agent", "LLM"],
            "tags_en": ["LangChain", "LangGraph", "LCEL", "AI Agent", "LLM"]
        },
        {
            "id": "data-analysis-statistics-guide-20260423",
            "title": "数据炼金术：数据分析与统计学的完整知识图谱",
            "title_en": "Data Alchemy: A Complete Knowledge Graph of Data Analysis and Statistics",
            "excerpt": "从零开始系统梳理数据分析与统计学的核心知识体系，涵盖描述统计与推断统计的理论基础、概率论与贝叶斯思维的哲学内核、跨行业应用场景的分类与案例、Python/R/BI工具的完整技术栈评测、可视化方向的深度综述与选型指南，以及统计学与人工智能融合的前沿趋势。全文采用'理论-工具-应用-前沿'四层递进结构。",
            "excerpt_en": "A comprehensive review of the core knowledge system of data analysis and statistics from scratch, covering descriptive and inferential statistics foundations, probability theory and Bayesian thinking, cross-industry application scenarios, Python/R/BI technology stack evaluation, data visualization deep review, and the cutting-edge trends in the integration of statistics and AI. The article adopts a four-layer progressive structure of Theory-Tool-Application-Frontier.",
            "date": "2026-04-23",
            "url": "/pages/blog/moban_new_md.html?md=../../context/20260423_zh_2.md",
            "category": "tech",
            "tags": ["数据分析", "统计学", "Python", "数据可视化", "贝叶斯"],
            "tags_en": ["Data Analysis", "Statistics", "Python", "Data Visualization", "Bayesian"]
        },
        {
            "id": "data-engineering-rag-llm-guide-20260423",
            "title": "数据炼金术：从原始数据到智能应用的全链路实战指南",
            "title_en": "Data Alchemy: A Comprehensive Practical Guide from Raw Data to Intelligent Applications",
            "excerpt": "系统梳理从原始数据到智能应用的全链路数据工程实践，重点聚焦LLM与RAG时代数据工程面临的新挑战：数据预处理、探索性数据分析、特征工程、海量非结构化文档的解析、向量数据库的数据准备、大规模预训练数据的清洗与质量管控、数据脱敏与隐私保护等。全文贯穿工程化视角与最佳实践。",
            "excerpt_en": "A systematic guide to full-chain data engineering from raw data to intelligent applications, focusing on new challenges in the LLM and RAG era: data preprocessing, exploratory data analysis, feature engineering, parsing massive unstructured documents, vector database data preparation, large-scale pre-training data cleaning and quality control, data desensitization and privacy protection. The article adopts an engineering perspective and best practices throughout.",
            "date": "2026-04-23",
            "url": "/pages/blog/moban_new_md.html?md=../../context/20260423_zh_3.md",
            "category": "tech",
            "tags": ["数据预处理", "EDA", "数据挖掘", "RAG", "LLM"],
            "tags_en": ["Data Preprocessing", "EDA", "Data Mining", "RAG", "LLM"]
        },
        {
            "id": "multi-agent-collaboration-20260421",
            "title": "多智能体协作：AI时代的分布式任务处理范式",
            "title_en": "Multi-Agent Collaboration: Distributed Task Processing Paradigm in the AI Era",
            "excerpt": "单一大语言模型的能力再强，终究是'独行侠'——当任务复杂度超出单个模型的认知边界，单个Agent便会陷入瓶颈。多智能体协作正是为解决这一困局而生：通过将复杂任务分解给多个专业化的Agent协同完成，实现'1+1>2'的涌现智能。本文从架构演进、分工机制、通信协议、主流框架到前沿趋势，系统梳理多智能体协作的技术全景。",
            "excerpt_en": "No matter how powerful a single LLM is, it remains a 'lone wolf.' When task complexity exceeds a single model's cognitive boundary, a single Agent hits its bottleneck. Multi-Agent Collaboration decomposes complex tasks to multiple specialized Agents, achieving emergent intelligence where '1+1>2.' This article systematically covers the technical landscape from architecture evolution, division of labor, communication protocols, to frontier trends.",
            "date": "2026-04-21",
            "url": "/pages/blog/moban_new_md.html?md=../../context/20260421_zh_5.md",
            "category": "tech",
            "tags": ["多智能体", "AI Agent", "AutoGen", "LangGraph", "CrewAI"],
            "tags_en": ["Multi-Agent", "AI Agent", "AutoGen", "LangGraph", "CrewAI"]
        },
        
        {
            "id": "llm-memory-module-20260421",
            "title": "大模型记忆模块：从'鱼的记忆'到'终身学习'——AI Agent 记忆系统全解析",
            "title_en": "LLM Memory Module: From 'Goldfish Memory' to 'Lifelong Learning' - AI Agent Memory Systems Complete Guide",
            "excerpt": "和ChatGPT聊了一个小时的项目背景，第二天打开新窗口时它一脸茫然地问'有什么可以帮您？'这种'对话失忆症'是所有大语言模型应用的阿克琉斯之踵。本文系统解析短期记忆与长期记忆的技术原理，深入剖析记忆的存取、压缩、总结三大核心策略，并全景式对比Mem0、Zep、LangMem等主流框架。",
            "excerpt_en": "Have you spent an hour explaining your project to ChatGPT, only to find it clueless when you open a new window the next day? This 'conversational amnesia' is the Achilles' heel of all LLM applications. This article systematically analyzes short-term and long-term memory principles, and provides a panoramic comparison of mainstream frameworks like Mem0, Zep, and LangMem.",
            "date": "2026-04-21",
            "url": "/pages/blog/moban_new_md.html?md=../../context/20260421_zh_4.md",
            "category": "tech",
            "tags": ["记忆模块", "AI Agent", "RAG", "知识图谱", "LLM"],
            "tags_en": ["Memory Module", "AI Agent", "RAG", "Knowledge Graph", "LLM"]
        },
        {
            "id": "tool-use-function-calling-20260421",
            "title": "大模型工具调用（Tool Use / Function Calling）：从原理到终端智能体全解析",
            "title_en": "Large Model Tool Use (Function Calling): From Principles to Terminal AI Agents - A Complete Guide",
            "excerpt": "大语言模型再聪明，终究只是一颗被训练数据'冻住'的大脑——它无法查询实时天气，不能发送邮件，更不可能帮你执行终端命令。工具调用（Tool Use / Function Calling）正是打破这层壁垒的关键技术，让模型从'只会说'进化为'真能做'。本文系统解析OpenAI Function Calling的核心原理，深入剖析Claude Tool Use的实现差异，并解读Codex CLI、Copilot CLI与Cursor等AI Agent如何从API接口走向终端。",
            "excerpt_en": "No matter how intelligent a large language model is, it remains a brain 'frozen' by its training data. Tool Use (Function Calling) is the key technology that breaks this barrier, evolving the model from 'only talking' to 'truly acting.' This article systematically dissects the core principles of OpenAI Function Calling, analyzes Claude Tool Use implementation differences, and interprets how AI agents like Codex CLI, Copilot CLI, and Cursor move from API interfaces to the terminal.",
            "date": "2026-04-21",
            "url": "/pages/blog/moban_new_md.html?md=../../context/20260421_zh_3.md",
            "category": "tech",
            "tags": ["Tool Use", "Function Calling", "AI Agent", "LLM", "Codex CLI"],
            "tags_en": ["Tool Use", "Function Calling", "AI Agent", "LLM", "Codex CLI"]
        },
        {
            "id": "cot-pas-reflexion-guide-20260421",
            "title": "从思考到反思：大模型复杂推理的三种进阶范式详解",
            "title_en": "From Thinking to Reflection: A Detailed Guide to Three Advanced Paradigms for Complex Reasoning in LLMs",
            "excerpt": "大语言模型在简单问答上表现优异，但面对需要多步推理、长期规划或自我纠错的复杂任务时，往往力不从心。思维链（Chain-of-Thought）、规划执行（Plan-and-Solve）和反思机制（Reflexion）是三种逐层递进的提示与增强技术，它们分别赋予模型“边想边算”、“先谋后动”和“知错能改”的能力。本文将深入剖析这三种范式的核心原理、工作流程与实现细节，辅以Mermaid图解和代码示例，并通过对比分析帮助读者在不同业务场景下做出最优技术选型。无论你是正在构建AI Agent的工程师，还是希望提升模型推理质量的研究者，这篇万字长文都将提供系统性的知识框架。",
            "excerpt_en": "Large Language Models perform excellently on simple Q&A, but often struggle with complex tasks requiring multi-step reasoning, long-term planning, or self-correction. Chain-of-Thought, Plan-and-Solve, and Reflexion are three progressively advanced prompting and augmentation techniques. They respectively endow models with the abilities to “think while calculating,” “plan before acting,” and “correct mistakes from reflection.” This article provides an in-depth analysis of the core principles, workflows, and implementation details of these three paradigms, supplemented by Mermaid diagrams and code examples, and helps readers make optimal technical choices for different business scenarios through comparative analysis. Whether you are an engineer building AI agents or a researcher aiming to improve model reasoning quality, this comprehensive guide offers a systematic knowledge framework.",
            "date": "2026-04-21",
            "url": "/pages/blog/moban_new_md.html?md=../../context/20260421_zh_2.md",
            "category": "tech",
            "tags": ["LLM", "思维链", "规划-执行", "反思机制", "提示工程"],
            "tags_en": ["LLM", "Chain-of-Thought", "Plan-and-Solve", "Reflexion", "Prompt Engineering"]
        },
        
        {
            "id": "agent-complete-guide-20260421",
            "title": "从LLM到自主智能体：AI Agent架构深度解析与工程实践",
            "title_en": "From LLM to Autonomous Agent: In-Depth Analysis of AI Agent Architecture and Engineering Practice",
            "excerpt": "系统解析AI Agent的核心架构——感知-规划-行动-观察循环，深入解读四大核心组件（LLM大脑、工具、记忆、规划），以详实的工程案例与代码示例展示Agent与普通LLM调用的本质区别，并探讨多Agent协作、反思机制等前沿话题，助你建立从原理到生产的完整认知。",
            "excerpt_en": "A systematic analysis of the core architecture of AI Agents — the perception-planning-action-observation loop, with in-depth explanations of the four core components (LLM brain, tools, memory, planning). Demonstrates the essential differences between Agents and ordinary LLM calls with detailed engineering cases and code examples, and explores cutting-edge topics such as multi-agent collaboration and reflection mechanisms, helping you build a complete understanding from principles to production.",
            "date": "2026-04-21",
            "url": "/pages/blog/moban_new_md.html?md=../../context/20260421_zh_1.md",
            "category": "tech",
            "tags": ["AI Agent", "LLM", "自主智能体", "LangGraph", "ReAct"],
            "tags_en": ["AI Agent", "LLM", "Autonomous Agent", "LangGraph", "ReAct"]
        },
        {
            id: 'rag-complete-guide-20260420',
            title: 'RAG从入门到生产：构建企业级检索增强生成系统的完整指南',
            title_en: 'RAG from Beginner to Production: A Complete Guide to Building Enterprise-Grade Retrieval-Augmented Generation Systems',
            excerpt: '系统梳理RAG的发展背景、工作原理、核心组件与全流程实战，涵盖知识库构建、分块策略、嵌入模型选型、向量数据库、检索优化、重排序、评估框架等关键环节，并提供LangChain与LlamaIndex的对比分析与完整代码示例。',
            excerpt_en: 'A systematic overview of RAG covering development background, working principles, core components, and end-to-end implementation, including knowledge base construction, chunking strategies, embedding model selection, vector databases, retrieval optimization, reranking, and evaluation frameworks, with LangChain vs LlamaIndex comparison and complete code examples.',
            date: '2026-04-20',
            url: '/pages/blog/moban_new_md.html?md=../../context/20260420_zh.md',
            category: 'tech',
            tags: ['RAG', '检索增强生成', '向量数据库', 'LangChain', 'LlamaIndex'],
            tags_en: ['RAG', 'Retrieval-Augmented Generation', 'Vector Database', 'LangChain', 'LlamaIndex']
        },
        {
            id: 'react-paper-review-20260419',
            title: 'ReAct: 当大语言模型学会"边想边做" -- 一篇改变LLM Agent范式的论文精读',
            title_en: 'ReAct: When LLMs Learn to "Think While Doing" -- A Deep Dive into the Paper That Shaped the Agent Paradigm',
            excerpt: '对ICLR 2023论文ReAct的详细评鉴与深度解析，从推理与行动的协同机制、四大基准实验、错误模式分析到对现代LLM Agent框架的深远影响，面向正在学习大语言模型的学生。',
            excerpt_en: 'A comprehensive review of the ICLR 2023 paper ReAct, covering reasoning-acting synergy, four benchmark experiments, error mode analysis, and its lasting impact on modern LLM Agent frameworks, aimed at students learning about LLMs.',
            date: '2026-04-19',
            url: '/pages/blog/moban_new_md.html?md=../../context/20260419_zh.md',
            category: 'tech',
            tags: ['论文精读', 'LLM Agent', 'ReAct', '推理与行动', '提示词工程'],
            tags_en: ['Paper Review', 'LLM Agent', 'ReAct', 'Reasoning & Acting', 'Prompt Engineering']
        },
        {
            id: 'mindset-reflection-20260410',
            title: '一件事情，暴露出了我的无知、急迫和焦虑',
            title_en: 'One Incident Exposed My Ignorance, Impatience, and Anxiety',
            excerpt: '从考研失利到春招受挫的剧烈起伏中，复盘无知、急迫与焦虑如何放大情绪，并尝试重建更稳健的求职心态。',
            excerpt_en: 'A reflection on how ignorance, urgency, and anxiety amplified emotional swings from exam setback to spring recruiting, and how to rebuild a steadier mindset.',
            date: '2026-04-10',
            url: '/pages/blog/moban_new_md.html?md=../../context/20260410_zh.md',
            category: 'idea',
            tags: ['思想', '求职', '反思', '心态'],
            tags_en: ['Thoughts', 'Job Search', 'Reflection', 'Mindset']
        },
        {
            id: 'hr-interview-prep-and-popular-science-20260408',
            title: '与HR面试准备笔记及科普',
            title_en: 'HR Interview Preparation Notes and Practical Guide',
            excerpt: '围绕薪资结构、合同编制、试用期、作息加班、晋升路径等核心问题，提供清单化提问框架与委婉沟通话术模板。',
            excerpt_en: 'A practical checklist and tactful communication scripts covering compensation, contract terms, probation, work schedule, overtime, and career growth.',
            date: '2026-04-08',
            url: '/pages/blog/moban_new_md.html?md=../../context/20260408_zh.md',
            category: 'interview',
            tags: ['面试', 'HR', '求职沟通', '职业发展'],
            tags_en: ['Interview', 'HR', 'Job Communication', 'Career Growth']
        },
        {
            id: 'readme-devdoc-sync-20260404',
            title: '仓库 README 与开发文档（博客同步版）',
            title_en: 'Repository README & Developer Guide (Blog Sync)',
            excerpt: '与根目录 README.md 对齐：项目结构、Markdown 子系统、博客注册流程、中英 md 约定、本地预览与 GitHub Pages 部署说明。',
            excerpt_en: 'Aligned with root README.md: repo layout, Markdown subsystem, blog registration flow, zh/en md pairing, local preview, and GitHub Pages deployment.',
            date: '2026-04-04',
            url: '/pages/blog/moban_new_md.html?md=../../context/20260404_readme_zh.md',
            category: 'tech',
            tags: ['README', '开发文档', 'GitHub Pages', 'Markdown'],
            tags_en: ['README', 'Developer Docs', 'GitHub Pages', 'Markdown']
        },
        {
            id: 'crmicro-interview-prep-20260404',
            title: '华润微电子技术面试准备笔记',
            title_en: 'CR Microelectronics Technical Interview Prep Notes',
            excerpt: '技术/就业向：半导体智能制造缺陷检测场景下的项目问答整理，涵盖 CWT、AlexNet、GWO、Grad-CAM 与产线落地，供面试复盘使用。',
            excerpt_en: 'Tech & career notes: Q&A on semiconductor smart manufacturing defect detection, covering CWT, AlexNet, GWO, Grad-CAM, and line deployment for interview review.',
            date: '2026-04-04',
            url: '/pages/blog/moban_new_md.html?md=../../context/20260404.md',
            category: 'interview',
            tags: ['面试', '半导体', '缺陷检测', '深度学习'],
            tags_en: ['Interview', 'Semiconductor', 'Defect Detection', 'Deep Learning']
        },
        {
            id: 'engineering-blog-post-20260314',
            title: '从原始招聘数据到可训练大模型语料：一次完整数据工程实战总结',
            title_en: 'From Raw Recruitment Data to Trainable LLM Corpus: An End-to-End Data Engineering Recap',
            excerpt: '复盘一次完整的数据工程流水线，覆盖统一 Schema、清洗去重、脱敏、切分与可审计交付。',
            excerpt_en: 'An end-to-end recap of a practical data engineering pipeline: schema unification, cleaning, deduplication, desensitization, splitting, and auditable delivery.',
            date: '2026-03-14',
            url: '/pages/blog/moban_new_md.html?md=../../context/engineering_blog_post.md',
            category: 'tech',
            tags: ['数据工程', '大模型', '训练语料', 'JSONL'],
            tags_en: ['Data Engineering', 'LLM', 'Training Corpus', 'JSONL']
        },
        {
            id: 'dataset-description-20260314',
            title: '毕业设计原始数据 datasets 数据集统计与内容总结',
            title_en: 'Thesis Raw Datasets: Statistics and Content Summary',
            excerpt: '对原始数据目录进行了全量与抽样分析，给出规模、质量风险与清洗建模建议。',
            excerpt_en: 'A full-plus-sampled analysis of raw datasets, including scale, quality risks, and cleaning/modeling recommendations.',
            date: '2026-03-14',
            url: '/pages/blog/moban_new_md.html?md=../../context/datasetdescription.md',
            category: 'tech',
            tags: ['数据集', '数据分析', '数据清洗', '招聘数据'],
            tags_en: ['Dataset', 'Data Analysis', 'Data Cleaning', 'Recruitment Data']
        },
        {
            id: 'ai-llm-knowledge-product-tools-260308',
            title: '人工智能与大模型相关知识：一篇面向AI产品与工具应用的详解',
            title_en: 'AI and LLM Knowledge: A Practical Guide for AI Product and Tool Applications',
            excerpt: '围绕大模型基础、Prompt Engineering、RAG 与 EDA方法，梳理面向AI产品实践的核心知识。',
            excerpt_en: 'A practical overview of LLM basics, Prompt Engineering, RAG, and EDA for AI product workflows.',
            date: '2026-03-08',
            url: '/pages/blog/moban_new_md.html?md=../../context/A-Btext2o260308.md',
            category: 'tech',
            tags: ['人工智能', '大模型', 'Prompt', 'RAG', 'EDA'],
            tags_en: ['AI', 'LLM', 'Prompt', 'RAG', 'EDA']
        },
        {
            id: 'llms0003-training-check-prompt-engineering-deployment',
            title: '如何查看或确认模型训练完成，提示词工程与模型部署教程',
            title_en: 'How to Verify Training Completion, Prompt Engineering and Model Deployment',
            excerpt: '介绍如何确认模型训练完成，并结合提示词工程与部署流程提升落地效率。',
            excerpt_en: 'A practical guide to verifying model training completion, improving prompts, and deploying models.',
            date: '2026-03-07',
            url: '/pages/blog/moban_new_md.html?md=../../context/LLMs0003.md',
            category: 'tech',
            tags: ['大模型', '提示词工程', '模型部署'],
            tags_en: ['LLM', 'Prompt Engineering', 'Deployment']
        },
        {
            id: 'llms0002-qwen-pdf-csv-jd-deployment',
            title: '使用PDF、CSV简历和JD数据集投喂给Qwen模型的部署教程',
            title_en: 'Deploying Qwen with PDF/CSV Resume and JD Datasets',
            excerpt: '从环境准备到数据处理与AutoDL训练，完整说明Qwen模型的部署流程。',
            excerpt_en: 'From environment setup to data processing and AutoDL training, this covers a full Qwen deployment workflow.',
            date: '2026-03-07',
            url: '/pages/blog/moban_new_md.html?md=../../context/LLMs0002.md',
            category: 'tech',
            tags: ['Qwen', 'AutoDL', '数据处理'],
            tags_en: ['Qwen', 'AutoDL', 'Data Processing']
        },
        {
            id: 'llms0001-qwen-lora-autodl-finetuning',
            title: 'Qwen+LoRA在AutoDL部署教程，模型训练与微调',
            title_en: 'Qwen + LoRA on AutoDL: Training and Fine-tuning Guide',
            excerpt: '围绕Qwen与LoRA的训练和微调实践，给出可复现的部署步骤。',
            excerpt_en: 'A reproducible walkthrough for deploying, training, and fine-tuning Qwen with LoRA.',
            date: '2026-03-07',
            url: '/pages/blog/moban_new_md.html?md=../../context/LLMs0001.md',
            category: 'tech',
            tags: ['Qwen', 'LoRA', '微调'],
            tags_en: ['Qwen', 'LoRA', 'Fine-tuning']
        },
        {
            id: 'birthday-of-mao-zedong-christmas-of-chinese-people',
            title: '毛泽东的诞辰，中国人的圣诞',
            title_en: 'Birthday of Mao Zedong, Christmas of Chinese people',
            excerpt: '毛泽东的诞辰，中国人的圣诞',
            excerpt_en: 'Birthday of Mao Zedong, Christmas of Chinese people',
            date: '2025-12-30',
            url: '/pages/blog/life/20251230.html',
            category: 'idea',
            tags: ['领袖', '纪念', '转载'],
            tags_en: ['Leader', 'Memorial', 'Reprint']
        },
        {
            id: 'machine-learning-review-5',
            title: '机器学习复习5',
            title_en: 'Machine Learning Review 5',
            excerpt: '机器学习复习笔记5。',
            excerpt_en: 'Machine learning review notes5.',
            date: '2025-12-29',
            url: '/pages/blog/tech/20251229ML05.html',
            category: 'tech',
            tags: ['机器学习', '复习', '笔记'],
            tags_en: ['Machine Learning', 'Review', 'Notes']
        },
        {
            id: 'machine-learning-review-4',
            title: '机器学习复习4',
            title_en: 'Machine Learning Review 4',
            excerpt: '机器学习复习笔记4。',
            excerpt_en: 'Machine learning review notes4.',
            date: '2025-12-29',
            url: '/pages/blog/tech/20251229ML04.html',
            category: 'tech',
            tags: ['机器学习', '复习', '笔记'],
            tags_en: ['Machine Learning', 'Review', 'Notes']
        },
        {
            id: 'machine-learning-review-3',
            title: '机器学习复习3',
            title_en: 'Machine Learning Review 3',
            excerpt: '机器学习复习笔记3。',
            excerpt_en: 'Machine learning review notes3.',
            date: '2025-12-29',
            url: '/pages/blog/tech/20251229ML03.html',
            category: 'tech',
            tags: ['机器学习', '复习', '笔记'],
            tags_en: ['Machine Learning', 'Review', 'Notes']
        },
        {
            id: 'machine-learning-review-2',
            title: '机器学习复习2',
            title_en: 'Machine Learning Review 2',
            excerpt: '机器学习复习笔记2。',
            excerpt_en: 'Machine learning review notes2.',
            date: '2025-12-29',
            url: '/pages/blog/tech/20251229ML02.html',
            category: 'tech',
            tags: ['机器学习', '复习', '笔记'],
            tags_en: ['Machine Learning', 'Review', 'Notes']
        },
        {
            id: 'machine-learning-review-1',
            title: '机器学习复习1',
            title_en: 'Machine Learning Review 1',
            excerpt: '机器学习复习笔记1。',
            excerpt_en: 'Machine learning review notes1.',
            date: '2025-12-29',
            url: '/pages/blog/tech/20251229ML01.html',
            category: 'tech',
            tags: ['机器学习', '复习', '笔记'],
            tags_en: ['Machine Learning', 'Review', 'Notes']
        },
        {
            id: 'criticism-of-network-leftists',
            title: '关于网络左翼的批判',
            title_en: 'Criticism of Network Leftists',
            excerpt: '批判网络左翼的兴起与基本特征。',
            excerpt_en: 'Criticism of the rise and basic characteristics of network leftists.',
            date: '2025-12-24',
            url: '/pages/blog/life/20251224.html',
            category: 'idea',
            tags: ['网络左翼', '批判', '网络左翼'],
            tags_en: ['Network leftists', 'Criticism', 'Network leftists']
        },
        {
            id: 'our-past-and-future',
            title: '我们的来时路与未来',
            title_en: 'Our Past and Future',
            excerpt: '从历史、社会与家庭视角反思学习的目的与改造意义。',
            excerpt_en: 'Reflection on study and its meaning across education, society, and family.',
            date: '2025-12-22',
            url: '/pages/blog/life/20251222.html',
            category: 'idea',
            tags: ['思想', '历史', '未来之路'],
            tags_en: ['Idea', 'History', 'Future Path']
        },
        {
            id: 'oil',
            title: '橡胶制品增塑剂迁移导致出油现象',
            title_en: 'Oil spillage from rubber product additive migration',
            excerpt: '橡胶制品增塑剂迁移导致出油现象',
            excerpt_en: 'Oil spillage from rubber product additive migration',
            date: '2025-10-06',
            url: '/pages/blog/tech/oil.html',
            category: 'tech',
            tags: ['橡胶制品', '增塑剂', '迁移', '出油'],
            tags_en: ['Rubber Product', 'Additive', 'Migration', 'Oil Spillage']
        },
        {
            id: 'our-study-has-been-changed',
            title: '学习真的改造了吗？',
            title_en: 'Has learning really been transformed?',
            excerpt: '探讨学习改造的本质，从历史演变到现代教育，提出人格健全、身体健康、家庭温馨、学习主动四个核心建议。',
            excerpt_en: 'Exploring the essence of learning transformation, from historical evolution to modern education, proposing four core suggestions: sound personality, physical health, warm family, and active learning.',
            date: '2025-12-10',
            url: '/pages/blog/life/ourstufyhasbeenchanged.html',
            category: 'idea',
            tags: ['想法', '教育', '学习', '反思'],
            tags_en: ['Ideas', 'Education', 'Learning', 'Reflection']
        },
        {
            id: 'turning-point',
            title: '转折关头，你需要这些线索了解中国的未来五年',
            title_en: "At the turning point: signals for China's next five years",
            excerpt: '围绕四中全会公报梳理未来五年的关键线索与思路。',
            excerpt_en: 'Key signals from the plenum for China s next five years.',
            date: '2025-12-11',
            url: '/pages/blog/life/new-turning-point.html',
            category: 'idea',
            tags: ['思想', '时政', '趋势', '中国'],
            tags_en: ['Ideas', 'Policy', 'Trends', 'China']
        },
        {
            id: 'smarteducation',
            title: '大数据作为智慧教育的催化剂：数据驱动方法、应用与挑战的综合述评',
            title_en: 'Big data as a catalyst for smart education: A comprehensive review of data-driven approaches, applications, and challenges',
            excerpt: '大数据作为智慧教育的催化剂：数据驱动方法、应用与挑战的综合述评',
            excerpt_en: 'Big data as a catalyst for smart education: A comprehensive review of data-driven approaches, applications, and challenges',
            date: '2025-09-11',
            url: '/pages/blog/tech/smarteducation.html',
            category: 'tech',
            tags: ['智慧教育', '大数据', '数据挖掘', '数据分析'],
            tags_en: ['Smart Education', 'Big Data', 'Data Mining', 'Data Analysis']
        },
        {
            id: 'sharpcommentary',
            title: '一种令人担忧的现象：大学校园正在成为烟民的温床',
            title_en: 'A worrying phenomenon: university campuses are becoming hotbeds for smokers',
            excerpt: '一种令人担忧的现象：大学校园正在成为烟民的温床',
            excerpt_en: 'A worrying phenomenon: university campuses are becoming hotbeds for smokers',
            date: '2025-09-09',
            url: '/pages/blog/life/sharpcommentary.html',
            category: 'life',
            tags: ['大学', '烟民', '温床', '生活'],
            tags_en: ['University', 'Smoker', 'Hotbed', 'Life']
        },
        {
            id: 'persistencisvictory',
            title: '坚持就是胜利',
            title_en: 'Persistence is Victory',
            excerpt: '坚持就是胜利',
            excerpt_en: 'Persistence is Victory',
            date: '2025-09-08',
            url: '/pages/blog/life/Persistencisvictory.html',
            category: 'life',
            tags: ['考研', '坚持', '励志', '生活'],
            tags_en: ['Graduate Exam', 'Persistence', 'Motivation', 'Life']
        },
        {
            id: 'markdown-blog-template',
            title: 'Markdown博客模板系统',
            title_en: 'Markdown Blog Template System',
            excerpt: '全新的Markdown博客模板系统，支持完整的Markdown语法渲染、代码高亮、自动目录生成、响应式设计和主题切换。提供了强大的文章编写和展示功能，让博客创作更加便捷高效。',
            excerpt_en: 'A brand new Markdown blog template system that supports complete Markdown syntax rendering, code highlighting, automatic table of contents generation, responsive design, and theme switching. Provides powerful article writing and display features for more convenient and efficient blog creation.',
            date: '2025-09-08',
            url: '/pages/blog/moban_new_md.html?md=../../context/test_zh.md',
            category: 'tech',
            tags: ['Markdown', '博客模板', '代码高亮', '响应式设计', '主题切换'],
            tags_en: ['Markdown', 'Blog Template', 'Code Highlighting', 'Responsive Design', 'Theme Switching']
        },
        {
            id: 'cnn-paddle',
            title: '基于PaddlePaddle的卷积神经网络实现-十二猫分类',
            title_en: 'Convolutional Neural Network Implementation Based on PaddlePaddle - Cat Classification',
            excerpt: '介绍基于PaddlePaddle的卷积神经网络实现-十二猫分类',
            excerpt_en: 'Introduction to Convolutional Neural Network Implementation Based on PaddlePaddle - Cat Classification',
            date: '2025-05-30',
            url: '/pages/blog/tech/CNN-paddle.html',
            category: 'tech',
            tags: ['PaddlePaddle', '卷积神经网络', '猫咪分类'],
            tags_en: ['PaddlePaddle', 'Convolutional Neural Network', 'Cat Classification']
        },
        {
            id: 'studyrethink',
            title: '学习进度与心态的反思',
            title_en: 'Reflection on Learning Progress and Mindset',
            excerpt: '在学习的道路上，我们常常会陷入迷茫和困惑。本文将探讨学习进度与心态之间的关系，以及如何通过调整心态来促进学习效率。',
            excerpt_en: 'On the path of learning, we often get lost and confused. This article will explore the relationship between learning progress and mindset, and how to adjust mindset to promote learning efficiency.',
            date: '2025-05-25',
            url: '/pages/blog/life/studyrethink.html',
            category: 'life',
            tags: ['学习', '心态', '反思', '效率'],
            tags_en: ['Learning', 'Mindset', 'Reflection', 'Efficiency']
        },
        {
            id: 'svm',
            title: '支持向量机（SVM）算法详解',
            title_en: 'Support Vector Machine (SVM) Algorithm',
            excerpt: '支持向量机（SVM）是一种用于分类和回归分析的机器学习算法。本文将详细介绍SVM的原理、应用场景、算法实现以及优化方法。',
            excerpt_en: 'Support Vector Machine (SVM) is a machine learning algorithm for classification and regression analysis. This article will detail the principles, applications, algorithm implementation, and optimization methods of SVM.',
            date: '2025-04-14',
            url: '/pages/blog/tech/svm.html',
            category: 'tech',
            tags: ['支持向量机', '机器学习', '分类', '回归'],
            tags_en: ['Support Vector Machine', 'Machine Learning', 'Classification', 'Regression']
        },
        {
            id: 'machinelearningBostonshouseprices',
            title: '实验一：波士顿房价预测报告',
            title_en: 'Experiment 1: Boston House Price Prediction Report',
            excerpt: '本文介绍了波士顿房价预测的实验过程，包括数据预处理、特征选择、模型训练和评估等步骤。',
            excerpt_en: 'This article introduces the experimental process of Boston house price prediction, including data preprocessing, feature selection, model training, and evaluation steps.',
            date: '2025-04-12',
            url: '/pages/blog/tech/machinelearningBostonshouseprices.html',
            category: 'tech',
            tags: ['机器学习', '房价预测', '数据预处理', '特征选择', '模型训练', '评估'],
            tags_en: ['Machine Learning', 'House Price Prediction', 'Data Preprocessing', 'Feature Selection', 'Model Training', 'Evaluation']
        },
        {
            id:'cannot-rely-on-exam',
            title: '人生无法通过考研上岸',
            title_en: 'Life Cannot Be Saved Through Graduate School Exams',
            excerpt: '考研辅导机构不会告诉你，人生是片没有彼岸的汪洋。那些被装订成册的成功学案例，不过是资本浪潮暂时托起的浪花。真正的救赎或许始于承认：我们从来都不是溺水者，又何须执着于虚构的"岸"？',
            excerpt_en: 'Graduate exam coaching institutions won\'t tell you that life is an ocean without another shore. Those bound success study cases are merely waves temporarily lifted by capital tides. True redemption perhaps begins with acknowledging: we were never drowning, so why obsess over a fictional "shore"?',
            date: '2025-04-09',
            url: '/pages/blog/life/cannot-rely-on-exam.html',
            category: 'life',
            tags: ['考研', '随笔', '人生', '思考'],
            tags_en: ['Graduate Entrance Examination', 'Essay', 'Life', 'Thought']
        },
        {
            id: 'mingw-installation',
            title: 'Mingw安装教程',
            title_en: 'Mingw Installation Tutorial',
            excerpt: 'Mingw是一款常用的Windows下的C/C++编译器，本文将详细介绍Mingw的安装教程。',
            excerpt_en: 'Mingw is a commonly used C/C++ compiler in Windows. This article will detail the installation tutorial of Mingw.',
            date: '2025-04-07',
            url: '/pages/blog/tech/mingw-installation.html',
            category: 'tech',
            tags: ['Mingw', 'C/C++', '编译器', 'Windows'],
            tags_en: ['Mingw', 'C/C++', 'Compiler', 'Windows']
        },
        {
            id: 'blog-building',
            title: '从零开始构建博客：技术栈、架构设计与实现',
            title_en: 'Building a Blog from Scratch: Technical Stack, Architecture Design, and Implementation',
            excerpt: '本文将详细介绍这个博客的技术栈、架构设计、核心JavaScript功能实现以及部署方案。',
            excerpt_en: 'This article will detail the technical stack, architectural design, core JavaScript functionality implementation, and deployment solutions of this blog.',
            date: '2025-04-06',
            url: '/pages/blog/tech/blog-building.html',
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
            url: '/pages/blog/tech/outline-for-advanced-mathematicsⅡ.html',
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
            url: '/pages/blog/tech/c-api-algorithms.html',
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
            url: '/pages/blog/tech/data-structures.html',
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
            url: '/pages/blog/life/first-blog.html',
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
            url: '/pages/blog/tech/parallel-computing-and-gpu-programming-cud.html',
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
            url: '/pages/blog/tech/machine-learning.html',
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
            url: '/pages/blog/tech/outline-for-advanced-mathematicsⅡ.html',
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
            url: '/pages/blog/tech/recommendation-system.html',
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
            url: '/pages/blog/life/talk-about-meritocracy.html',
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