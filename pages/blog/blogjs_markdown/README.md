# Markdown博客模板使用说明

## 文件结构

```
pages/blog/blogjs_markdown/
├── markdown-renderer.js    # Markdown渲染器JS模块
├── markdown-styles.css     # Markdown专用样式
└── README.md              # 使用说明

pages/blog/
└── moban_new_md.html      # Markdown博客模板文件

context/
└── test.md                # 测试用Markdown文件
```

## 功能特性

### 核心功能
- ✅ 完整的Markdown语法支持
- ✅ 代码语法高亮（基于highlight.js）
- ✅ 自动生成文章目录
- ✅ 响应式设计
- ✅ 暗色/亮色主题切换
- ✅ 多语言支持（中英文）
- ✅ 图片懒加载
- ✅ 代码一键复制
- ✅ 平滑滚动定位
- ✅ 全屏阅读模式

### 样式特性
- 美观的代码块样式
- 优雅的引用块设计
- 响应式表格
- 自定义滚动条
- 加载动画效果

## 使用方法

### 1. 基本使用

直接访问模板文件，它会加载默认的测试文章：
```
http://your-domain/pages/blog/moban_new_md.html
```

### 2. 指定Markdown文件

通过URL参数指定要加载的Markdown文件：
```
http://your-domain/pages/blog/moban_new_md.html?md=../../context/your-article.md
```

或者使用`file`参数：
```
http://your-domain/pages/blog/moban_new_md.html?file=path/to/your/article.md
```

### 3. 自定义文章元数据

在模板文件中修改`PAGE_CONFIG`对象：

```javascript
const PAGE_CONFIG = {
    defaultMarkdownFile: '../../context/your-default.md',
    articleMeta: {
        title: '你的文章标题',
        title_en: 'Your Article Title',
        date: '2025-01-20',
        category: '技术',
        category_en: 'Technology',
        tags: ['标签1', '标签2'],
        tags_en: ['Tag1', 'Tag2']
    }
};
```

## 技术实现

### MarkdownRenderer类

主要方法：
- `renderMarkdown(markdownText, targetElement)` - 渲染Markdown内容
- `loadMarkdownFile(filePath)` - 加载Markdown文件
- `generateTOCHTML()` - 生成目录HTML
- `updateLanguage(lang)` - 更新语言设置

### 依赖库

- [marked.js](https://marked.js.org/) - Markdown解析
- [highlight.js](https://highlightjs.org/) - 代码语法高亮
- [Font Awesome](https://fontawesome.com/) - 图标支持

## 自定义样式

可以通过修改CSS变量来自定义主题：

```css
:root {
    --primary-color: #007AFF;
    --secondary-color: #5856D6;
    --text-color: #1D1D1F;
    --card-background: #FFFFFF;
    --shadow-color: rgba(0, 0, 0, 0.1);
}
```

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 注意事项

1. 确保Markdown文件路径正确
2. 图片路径应相对于HTML模板文件
3. 代码块需要指定语言以获得最佳高亮效果
4. 大文件可能需要较长加载时间

## 示例Markdown语法

```markdown
# 一级标题

## 二级标题

**粗体** 和 *斜体* 文本

`行内代码`

```javascript
// 代码块
console.log('Hello World');
```

> 引用块

- 列表项1
- 列表项2

| 表格 | 示例 |
|------|------|
| 单元格 | 内容 |

[链接](https://example.com)

![图片](path/to/image.jpg)
```

## 故障排除

### 常见问题

1. **文章加载失败**
   - 检查Markdown文件路径是否正确
   - 确认文件存在且可访问

2. **代码高亮不生效**
   - 确认highlight.js正确加载
   - 检查代码块是否指定了语言

3. **样式显示异常**
   - 检查CSS文件是否正确加载
   - 确认没有样式冲突

4. **目录不显示**
   - 确认Markdown文件包含标题（h1-h6）
   - 检查JavaScript是否正确执行

## 更新日志

### v1.0.1 (2025-01-20)
- 修复marked.js版本兼容性问题
- 添加备用CDN支持
- 优化错误处理机制
- 改进API兼容性

### v1.0.0 (2025-01-20)
- 初始版本发布
- 支持完整Markdown语法
- 实现代码高亮和目录生成
- 添加主题切换功能
