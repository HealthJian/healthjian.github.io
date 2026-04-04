# HealthJian 个人博客（GitHub Pages）

**在线站点：** [https://healthjian.github.io](https://healthjian.github.io)

静态前端个人站点：技术博客、项目展示、生活与随笔、更新日志等。仓库为纯 HTML / CSS / JavaScript，无构建步骤，适合托管于 **GitHub Pages** 或任意静态文件服务器。

---

## 1. 项目概述

| 项目 | 说明 |
|------|------|
| 类型 | 静态网站（多页面 + 少量模块化 JS） |
| 主要语言 | HTML5、CSS3、ES6+ JavaScript |
| 部署 | 默认分支 `main` 根目录或 `/docs` 发布（当前为仓库根目录） |
| 内容形态 | 独立 HTML 文章、`context/*.md` + 通用 Markdown 阅读壳、小说章节页等 |

设计目标：可读性良好的排版、明暗主题、中英文界面切换，以及可维护的文章注册方式（集中在一处数据源）。

---

## 2. 功能概览

- **布局与主题**：响应式布局；日/夜主题（`theme.js` + `dark-mode.css`）。
- **语言**：导航与带 `data-zh` / `data-en` 的文案由 `language.js` 切换；Markdown 阅读页支持与 `*_zh.md` / `*_en.md` 配对加载（见下文）。
- **博客列表**：`pages/blog.html` 使用 Tailwind 风格卡片；文章元数据来自 `js/blog.js` 中的 `getBlogPosts()`；支持分类筛选、即时搜索、分页（每页 8 篇，旧版列表逻辑仍保留在 `blog.js` 中）。
- **首页最新文章**：`js/latest-articles.js` 读取 `getBlogPosts()` 按日期排序后展示前 3 篇。
- **Markdown 阅读器**：`pages/blog/moban_new_md.html` + `blogjs_markdown/markdown-renderer.js`；支持目录（含 h2/h3 折叠）、代码高亮（highlight.js）、KaTeX、侧栏抽屉、打印/分享/全屏等。
- **更新日志**：`pages/changelog.html`；首页博客动态可与时间线同步（见 `js/changelog.js`）。
- **其他页面**：关于、链接、项目、书架、画廊等（各页独立 HTML + 对应 CSS/JS）。

**说明**：文章页评论区等为界面占位，提交逻辑未接后端；搜索以博客列表数据与前端过滤为主。

---

## 3. 技术栈

- **结构与样式**：语义化 HTML；CSS 变量、Flexbox/Grid；部分页面使用 Tailwind CDN（如 `blog.html`）。
- **脚本**：原生 JavaScript（无打包）；图标主要为 Font Awesome 6。
- **Markdown 管线**：marked、highlight.js、KaTeX（详见 `moban_new_md.html` 引用）。
- **托管**：GitHub Pages（路径与大小写需与仓库一致）。

---

## 4. 仓库目录结构（开发必读）

```
healthjian.github.io/
├── index.html                 # 首页
├── README.md                  # 本说明（仓库门面）
├── context/                   # Markdown 正文（由 moban_new_md 按 URL 加载）
│   ├── *_zh.md / *_en.md      # 推荐：中英成对命名，供导航栏语言切换
│   └── …                      # 单文件 *.md 仍可单独使用
├── css/                       # 全站与子模块样式
├── js/
│   ├── blog.js                # 博客文章数组 getBlogPosts()、搜索与分页
│   ├── language.js            # 中英文 + localStorage；派发 sitewide-language-change
│   ├── theme.js               # 明暗主题
│   ├── latest-articles.js     # 首页最新文章
│   ├── changelog.js           # 更新日志页 / 首页时间线同步
│   └── …
├── images/                    # 图片与静态资源
├── pages/
│   ├── blog.html              # 博客总览（textblog UI）
│   ├── changelog.html         # 更新日志
│   ├── about.html、links.html 等
│   └── blog/
│       ├── moban_new_md.html  # Markdown 通用模板（?md= 相对路径）
│       ├── moban.html         # 传统静态文章壳（非动态 md）
│       ├── blogjs_markdown/   # markdown-renderer.js、markdown-styles.css、模块说明 README
│       ├── tech/、life/、noval/ …  # 独立 HTML 文章与小说
│       └── …
└── test-blog-list.html        # 调试用文章列表
```

---

## 5. Markdown 博客子系统（开发文档）

### 5.1 阅读入口

- 模板页：`pages/blog/moban_new_md.html`
- 指定文章：查询参数 `md` 或 `file`，路径相对于该 HTML 所在目录，例如：

```text
/pages/blog/moban_new_md.html?md=../../context/your_article_zh.md
```

### 5.2 中英成对约定

- 若 URL 指向 `xxx_zh.md`，切换到英文时加载同前缀的 `xxx_en.md`；指向 `xxx_en.md` 时同理回到 `xxx_zh.md`。
- 若 URL 为单文件 `xxx.md`：中文侧可自动尝试 `xxx_zh.md`（存在则优先）；英文侧可自动尝试 `xxx_en.md`，不存在则回退原文件。
- 语言切换时 `language.js` 会派发 `sitewide-language-change`，模板页据此重新 `fetch` 并渲染。

### 5.3 核心模块

| 文件 | 职责 |
|------|------|
| `blogjs_markdown/markdown-renderer.js` | `MarkdownRenderer`：marked 配置、TOC 生成（h2/h3 分组折叠结构）、代码块、图片路径解析、数学公式预处理与 KaTeX |
| `blogjs_markdown/markdown-styles.css` | 渲染后正文样式 |
| `css/blog-post.css` | 文章页布局、侧栏、目录滚动条、抽屉、操作按钮等 |
| `pages/blog/blogjs_markdown/README.md` | 模块级使用说明（与仓库根 README 互补） |

### 5.4 在博客列表中注册文章

在 `js/blog.js` 的 `getBlogPosts()` 返回数组中增加对象字段，例如：

```javascript
{
  id: 'unique-id',
  title: '中文标题',
  title_en: 'English title',
  excerpt: '中文摘要',
  excerpt_en: 'English excerpt',
  date: 'YYYY-MM-DD',
  url: '/pages/blog/moban_new_md.html?md=../../context/your_zh.md',
  category: 'tech',  // 与 blog.html 筛选按钮 data-category 一致，如 tech、interview、life …
  tags: ['标签'],
  tags_en: ['Tags']
}
```

`pages/blog.html` 内 `categoryLabel` 需与 `category` 键一致（若新增分类，需同时加按钮与文案映射）。

---

## 6. 本地预览

1. 克隆仓库到本地。
2. 使用任意静态服务器打开根目录（避免 `file://` 下 `fetch` 跨域失败），例如：

```bash
# Python 3
python -m http.server 8080

# Node (npx)
npx serve .
```

3. 浏览器访问 `http://localhost:8080`（端口以实际为准）。

---

## 7. 部署（GitHub Pages）

1. 将仓库推送到 GitHub。
2. **Settings → Pages**：Source 选择分支与目录（通常为 `/ (root)`）。
3. 等待构建完成后使用 `https://<user>.github.io/<repo>/` 访问；本仓库用户名为 `healthjian` 时域名为 `https://healthjian.github.io`。

注意：资源路径区分大小写；新增页面后检查导航链接是否以站点根路径 `/` 开头（推荐）或正确的相对路径。

---

## 8. 浏览器支持

建议使用最新版本的 Chrome、Firefox、Safari、Edge。部分 API（如 `navigator.share`、全屏）在不支持时会降级为复制链接等行为。

---

## 9. 维护者与许可

- 维护：**CaiNiaojian / HealthJian**
- 仓库内容用于个人学习与展示；转载或复用代码请注明出处。

---

## 10. 相关链接

- 站点首页：[https://healthjian.github.io](https://healthjian.github.io)
- Markdown 模块说明：`pages/blog/blogjs_markdown/README.md`
- 更新日志页面：`pages/changelog.html`
