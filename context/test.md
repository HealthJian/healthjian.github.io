# Markdown博客模板测试文章

欢迎来到全新的Markdown博客系统！这是一篇测试文章，用于展示我们的Markdown渲染功能和样式效果。

## 功能特性

本博客模板支持以下功能：

- ✅ **完整的Markdown语法支持**
- ✅ **代码语法高亮**
- ✅ **自动生成目录**
- ✅ **响应式设计**
- ✅ **暗色/亮色主题切换**
- ✅ **多语言支持**
- ✅ **图片懒加载**
- ✅ **代码一键复制**

## 文本样式展示

### 基础文本格式

这是一段普通文本。你可以使用 **粗体文字** 来强调重要内容，也可以使用 *斜体文字* 来表示特殊含义。

如果需要标记某些内容，可以使用 `行内代码` 来突出显示关键词或代码片段。

### 引用块

> 这是一个引用块的示例。引用块通常用于引用他人的话语或者强调某些重要观点。
> 
> 引用块可以包含多个段落，并且会有特殊的样式来区分普通文本。

### 列表

#### 无序列表

- 第一项内容
- 第二项内容
  - 嵌套项目 1
  - 嵌套项目 2
    - 更深层次的嵌套
- 第三项内容

#### 有序列表

1. 首先完成项目规划
2. 然后进行技术选型
   1. 前端框架选择
   2. 后端技术栈
   3. 数据库设计
3. 最后开始编码实现

## 代码展示

### JavaScript 代码示例

```javascript
// Markdown渲染器示例
class MarkdownRenderer {
    constructor() {
        this.tocItems = [];
        this.currentLang = 'zh';
    }
    
    async renderMarkdown(markdownText, targetElement) {
        try {
            const htmlContent = marked(markdownText);
            targetElement.innerHTML = htmlContent;
            
            // 重新初始化代码高亮
            if (typeof hljs !== 'undefined') {
                targetElement.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
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
}
```

### Python 代码示例

```python
# 数据处理示例
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

def preprocess_data(data):
    """
    数据预处理函数
    """
    # 处理缺失值
    data = data.fillna(data.mean())
    
    # 特征缩放
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    
    # 分离特征和目标变量
    X = data.drop('target', axis=1)
    y = data['target']
    
    # 标准化特征
    X_scaled = scaler.fit_transform(X)
    
    # 划分训练集和测试集
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )
    
    return X_train, X_test, y_train, y_test

# 使用示例
if __name__ == "__main__":
    # 加载数据
    data = pd.read_csv('data.csv')
    
    # 预处理
    X_train, X_test, y_train, y_test = preprocess_data(data)
    
    print(f"训练集大小: {X_train.shape}")
    print(f"测试集大小: {X_test.shape}")
```

### CSS 样式示例

```css
/* 响应式设计示例 */
.markdown-content {
    line-height: 1.8;
    color: var(--text-color);
    font-family: 'SF Pro Display', sans-serif;
    max-width: 100%;
    word-wrap: break-word;
    animation: fadeInUp 0.6s ease-out;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
    margin: 2rem 0 1rem 0;
    font-weight: 600;
    line-height: 1.3;
    color: var(--text-color);
    position: relative;
}

/* 暗色模式适配 */
body.dark-mode .markdown-content code {
    background-color: rgba(255, 255, 255, 0.1);
    color: #ff7b7b;
    border-color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
    .markdown-content h1 {
        font-size: 2rem;
    }
    
    .markdown-content h2 {
        font-size: 1.6rem;
    }
}
```

## 表格展示

| 功能特性 | 支持状态 | 优先级 | 备注 |
|---------|---------|--------|------|
| Markdown解析 | ✅ 已完成 | 高 | 基于marked.js |
| 语法高亮 | ✅ 已完成 | 高 | 使用highlight.js |
| 响应式设计 | ✅ 已完成 | 高 | 支持移动端 |
| 暗色主题 | ✅ 已完成 | 中 | 自动切换 |
| 目录生成 | ✅ 已完成 | 中 | 自动滚动定位 |
| 图片优化 | 🔄 进行中 | 低 | 懒加载实现 |

## 数学公式

虽然当前版本还不支持LaTeX数学公式，但我们计划在未来版本中添加这个功能。

## 链接和图片

### 外部链接

- [GitHub项目地址](https://github.com/CaiNiaojian)
- [Markdown官方文档](https://daringfireball.net/projects/markdown/)
- [highlight.js官网](https://highlightjs.org/)

### 图片展示

![示例图片](../images/hero-master.avif)

*图片说明：这是一张示例图片，展示了图片在Markdown中的渲染效果。*

## 分隔线

---

## 技术实现细节

### 架构设计

本博客模板采用以下技术架构：

1. **前端渲染**：纯静态HTML + JavaScript
2. **Markdown解析**：marked.js库
3. **语法高亮**：highlight.js库
4. **样式系统**：CSS变量 + 响应式设计
5. **主题切换**：CSS类切换机制

### 核心功能模块

#### 1. MarkdownRenderer类

负责Markdown文本的解析和渲染，包括：
- 文本转HTML
- 目录生成
- 代码高亮
- 图片懒加载

#### 2. 主题系统

支持亮色和暗色两种主题：
- CSS变量统一管理颜色
- JavaScript动态切换主题类
- 代码高亮主题自动适配

#### 3. 响应式设计

- 移动端优先设计
- 弹性布局
- 适配不同屏幕尺寸

## 使用指南

### 基本使用

1. 将Markdown文件放在适当的目录下
2. 在URL中指定文件路径：`moban_new_md.html?md=path/to/your/file.md`
3. 页面会自动加载并渲染Markdown内容

### 自定义配置

可以在页面的`PAGE_CONFIG`对象中配置：

```javascript
const PAGE_CONFIG = {
    defaultMarkdownFile: '../../context/test.md',
    articleMeta: {
        title: '自定义标题',
        title_en: 'Custom Title',
        date: '2025-01-20',
        category: '技术',
        tags: ['Markdown', '博客']
    }
};
```

## 后续计划

- [ ] 添加LaTeX数学公式支持
- [ ] 实现文章搜索功能
- [ ] 添加评论系统
- [ ] 支持文章标签分类
- [ ] 优化SEO元数据
- [ ] 添加社交分享功能

## 结语

这个Markdown博客模板提供了完整的博客文章展示功能，具有良好的用户体验和现代化的设计风格。它不仅支持标准的Markdown语法，还提供了许多增强功能，如代码高亮、主题切换、响应式设计等。

希望这个模板能够帮助你创建出色的技术博客！如果你有任何建议或发现了问题，欢迎提出反馈。

---

*最后更新时间：2025年9月08日*  
*作者：HealthJian*  
*版本：v1.0.0*
