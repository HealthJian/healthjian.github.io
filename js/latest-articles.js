// 首页最新文章模块：复用 blog.js 中 getBlogPosts() 数据并渲染前三篇
(function () {
    function getCurrentLang() {
        return document.body.classList.contains("en") ? "en" : "zh";
    }

    function sortByDateDesc(posts) {
        return posts
            .slice()
            .sort(function (a, b) {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
    }

    function createArticleCard(post, lang) {
        var card = document.createElement("article");
        card.className = "latest-article-card";
        card.setAttribute("tabindex", "0");

        var titleZh = post.title || "";
        var titleEn = post.title_en || titleZh;
        var excerptZh = post.excerpt || "";
        var excerptEn = post.excerpt_en || excerptZh;

        card.innerHTML = [
            '<div class="latest-article-main">',
            '  <div class="latest-article-date">' + (post.date || "") + "</div>",
            '  <h3 class="latest-article-title" data-zh="' + escapeHtml(titleZh) + '" data-en="' + escapeHtml(titleEn) + '"></h3>',
            '  <p class="latest-article-excerpt" data-zh="' + escapeHtml(excerptZh) + '" data-en="' + escapeHtml(excerptEn) + '"></p>',
            '  <a class="latest-article-link" href="' + (post.url || "#") + '" data-zh="阅读更多" data-en="Read More"></a>',
            "</div>"
        ].join("");

        updateCardLanguage(card, lang);
        return card;
    }

    function updateCardLanguage(card, lang) {
        var titleEl = card.querySelector(".latest-article-title");
        var excerptEl = card.querySelector(".latest-article-excerpt");
        var linkEl = card.querySelector(".latest-article-link");

        if (titleEl) {
            titleEl.textContent = titleEl.getAttribute("data-" + lang) || "";
        }
        if (excerptEl) {
            excerptEl.textContent = excerptEl.getAttribute("data-" + lang) || "";
        }
        if (linkEl) {
            linkEl.innerHTML = (linkEl.getAttribute("data-" + lang) || "") + ' <i class="fas fa-arrow-right"></i>';
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function renderLatestArticles() {
        var container = document.getElementById("latest-articles-grid");
        if (!container) {
            return;
        }

        if (typeof getBlogPosts !== "function") {
            container.innerHTML = "";
            return;
        }

        var posts = sortByDateDesc(getBlogPosts()).slice(0, 3);
        var currentLang = getCurrentLang();

        container.innerHTML = "";
        posts.forEach(function (post) {
            container.appendChild(createArticleCard(post, currentLang));
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        renderLatestArticles();

        // 与现有语言切换逻辑兼容：切换按钮点击后同步更新动态卡片文本
        var langToggle = document.getElementById("lang-toggle");
        if (langToggle) {
            langToggle.addEventListener("click", function () {
                var lang = getCurrentLang();
                document.querySelectorAll(".latest-article-card").forEach(function (card) {
                    updateCardLanguage(card, lang);
                });
            });
        }
    });
})();
