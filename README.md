# 个人博客网站[点击访问](https://healthjian.github.io)


# 🚀 个人博客网站

✨ 这是我的个人博客网站，采用HTML、CSS和JavaScript开发，网站设计注重用户体验和功能性。
✨ This is my personal blog website developed using HTML, CSS and JavaScript, with a focus on user experience and functionality.

## 📝 内容展示

🔍 这个网站不仅展示我的技术博客文章，还包含个人项目展示和技术心得分享。
🔍 This website not only showcases my technical blog posts, but also includes personal project demonstrations and technical insights sharing.


## 💻 技术栈

前端技术栈：
- ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat&logo=html5&logoColor=white) HTML5 语义化标签
- ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat&logo=css3) CSS3 + Flexbox/Grid 布局
- ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) ES6+ 特性
- ![Responsive](https://img.shields.io/badge/-Responsive-5C2D91?style=flat) 响应式设计

🛠️ 整个网站采用现代化的前端技术栈，确保良好的性能和可维护性。
🛠️ The entire website uses a modern front-end tech stack to ensure good performance and maintainability.

## 特点 / Features
- 📱 响应式设计，完美适配桌面端和移动端各种屏幕尺寸
- 📱 Responsive design that perfectly adapts to various screen sizes on desktop and mobile devices
- 🌓 日/夜间模式切换，根据系统设置自动切换，也可手动调节
- 🌓 Day/night mode switching that automatically follows system settings or can be manually adjusted
- 🌏 中/英文切换功能，支持国际化，方便不同语言用户访问
- 🌏 Chinese/English language switching with internationalization support for users of different languages
- 🍎 苹果风格UI设计，简约优雅的视觉体验
- 🍎 Apple-style UI design offering a minimalist and elegant visual experience
- 📂 文章分类管理，便于内容浏览和检索
- 📂 Article category management for easy content browsing and retrieval
- 💻 代码高亮显示，支持多种编程语言
- 💻 Code highlighting with support for multiple programming languages
- 💬 评论系统集成，方便与读者互动交流
- 💬 Integrated comment system for easy interaction with readers
- 🔍 搜索功能，快速定位感兴趣的内容
- 🔍 Search functionality for quickly locating content of interest
- 📢 社交媒体分享按钮，一键分享到各大平台
- 📢 Social media sharing buttons for one-click sharing to major platforms
- ⚡ 页面加载优化，确保访问速度流畅
- ⚡ Page load optimization ensuring smooth browsing speed

## 文件结构
- `/css` - 样式文件
- `/js` - JavaScript文件
- `/images` - 图片资源
- `/pages` - 子页面

## 🌐 浏览器兼容性 / Browser Compatibility

![Chrome](https://img.shields.io/badge/-Chrome-4285F4?style=flat&logo=google-chrome&logoColor=white)
![Firefox](https://img.shields.io/badge/-Firefox-FF7139?style=flat&logo=firefox&logoColor=white) 
![Safari](https://img.shields.io/badge/-Safari-000000?style=flat&logo=safari&logoColor=white)
![Edge](https://img.shields.io/badge/-Edge-0078D7?style=flat&logo=microsoft-edge&logoColor=white)
![Opera](https://img.shields.io/badge/-Opera-FF1B2D?style=flat&logo=opera&logoColor=white)
![image](./images/new_about_background.avif)

# Issues 😀
## 1.首次打开网站时不显示文字的问题。这确实是一个不正常的情况，我需要检查一下。
- 根据我的分析，我发现问题所在。网站中的"数字花园"部分（div 的 class 为 digital-garden）包含两个语言版本：英文版通过 data-en 属性存储，中文版通过 data-zh 属性存储。这些内容在页面首次加载时不会自动显示，只有在点击语言切换按钮后，相应的语言文本才会通过 JavaScript 渲染出来。
- 问题在于：language.js 中的代码只在用户手动切换语言后或者有保存的语言偏好时才会更新页面上的内容。这导致了首次访问网站时，不会自动显示任何语言内容，直到用户点击语言切换按钮。

### 遇到的问题，主要做了以下修改：
- 修改 language.js：
添加了默认语言处理逻辑，确保即使没有保存的语言偏好，页面首次加载时也会显示中文内容
这解决了关键问题：首次访问网站时不显示文字的问题
- 优化 index.html 头部：
添加了资源预加载指令，使关键样式和字体优先加载
增加了字体加载失败时的后备方案
确保网站即使在字体加载失败时也能保持良好的可读性
- 增强 main.js：
添加了字体加载检测机制
确保在DOM加载完成后立即显示内容，不等待字体完全加载
添加了适当的样式类，以便在不同加载状态下应用不同的样式
- 添加相关 CSS 样式：
确保内容在加载过程中可见
添加字体加载成功和失败时的样式处理
提供图标加载失败时的替代方案
### 这些修改共同确保了：
- 首次访问网站时，文字内容会立即显示（不需要切换语言）
- 字体加载问题不会影响内容的显示
- 网站在各种网络条件下都能保持良好的用户体验

<div align="center">
  <p>千里之行，始于足下 👣</p>
  <p>始终保持学习的热情与创作的动力</p>
</div>