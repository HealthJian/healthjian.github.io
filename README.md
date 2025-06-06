# 个人博客网站[点击访问](https://healthjian.github.io)


# 🚀 个人博客网站

✨ 这是我的个人博客网站，采用HTML、CSS和JavaScript开发，网站设计注重用户体验和功能性。
✨ This is my personal blog website developed using HTML, CSS and JavaScript, with a focus on user experience and functionality.

## 📝 内容展示

🔍 这个网站不仅展示我的技术博客文章，还包含个人项目展示和技术心得分享。目前已有多篇技术博客，包括C语言API应用、数据结构基础知识等，同时展示了基于C++的宝可梦游戏等个人项目。未来还将更新机器学习、CUDA编程、高等数学等多个领域的内容。
🔍 This website not only showcases my technical blog posts, but also includes personal project demonstrations and technical insights sharing. Currently featuring multiple technical blogs on C language API applications, data structure fundamentals, and personal projects like a C++-based Pokémon game. Future updates will include content on machine learning, CUDA programming, advanced mathematics, and more.


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
<div align="center">
  <img src="./images/new_about_background.avif" width="40%" alt="背景图片">
</div>

# Issues 😀
## 1.首次打开网站时不显示文字的问题。这确实是一个不正常的情况。
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

## 2. 访问博客切入about页面后背景板和插图加载时间过长
2025-3-22
- addressing
- DNS加速？

## 3. 重大错误！❌位于blog的文章已经无法正常访问！
2025-3-22
- 疑似url错误、或者是地址错误！
- 等待检查
- 严重的路径问题，导致无法正确跳转到博客文章页面。让我分析一下这个错误：
错误信息显示 "Cannot GET /pages/pages/blog/tech/c-api-algorithms.html"，这表明URL中出现了重复的 "pages/" 路径。系统试图访问 "/pages/pages/..." 而不是正确的 "/pages/..."。
- 在 getBlogPosts 函数中，文章 URL 的路径是 "pages/blog/tech/c-api-algorithms.html"，但实际上，当用户在 /pages/blog.html 页面点击这个链接时，浏览器会将这个路径解释为 /pages/pages/blog/tech/c-api-algorithms.html，这就导致了404错误。

### 解决方案：
- 修改了getBlogPosts函数，确保文章URL的路径是正确的。
- 差点改崩。。。😶

## 4. 加入了网站图标
2025-3-22
- 添加了网站图标，提升了网站的专业性和可辨识度
- 确保了在所有设备和浏览器中都能正确显示图标

## 5. 优化了博客页面的加载性能
2025-4-01
- 添加了资源预加载指令，使关键样式和字体优先加载
- 增加了字体加载失败时的后备方案
- 确保网站即使在字体加载失败时也能保持良好的可读性

## 6. 跳转接口有一些错误
## 7.pages\blog\noval\one\chapter33.html是错误的！！
## 8.pages\project\project.html里面的夜间模式有bug
## 9. 给theme.js加一个时间逻辑

使用径向渐变(`bg-gradient-radial`)创建发光效果
根据主题动态调整渐变颜色和透明度
通过`motion.div`和`variants`控制发光动画
使用CSS 3D变换(`rotateX`)实现菜单项的翻转效果
通过`transformStyle: "preserve-3d"`和`transformOrigin`控制3D空间中的旋转方式
使用`perspective`属性增强3D效果的深度感
每个菜单项有独特的渐变发光效果
使用`scale`和`opacity`动画创建发光扩散效果
通过`pointer-events-none`确保发光效果不影响交互
全局应用平滑过渡效果，特别是主题切换时
使用贝塞尔曲线(`cubic-bezier`)实现自然的动画缓动
为多个CSS属性同时应用过渡效果
根据当前主题动态调整UI元素样式
在暗色模式下增强发光效果的可见度
主题切换时应用平滑过渡
**3D变换技术**：通过CSS 3D变换创建立体感和深度
**精心设计的渐变**：每个菜单项有独特的颜色和渐变效果
**动态发光效果**：悬停时的发光效果增强视觉反馈
**平滑过渡**：所有动画和状态变化都有精心调整的过渡效果
**响应式设计**：适应不同主题和屏幕尺寸

---
<div align="center">
  <p>千里之行，始于足下 👣</p>
  <p>始终保持学习的热情与创作的动力</p>
  <p>保持初心，不忘初心，砥砺前行</p>
  <p>CaiNiaojian&HealthJian</p>
</div>