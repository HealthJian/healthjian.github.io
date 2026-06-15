(function () {
    function getLang() {
        return document.body.classList.contains('en') ? 'en' : 'zh';
    }

    function getTravelBlogPosts() {
        return Array.isArray(window.TRAVELBLOG_POSTS_DATA) ? window.TRAVELBLOG_POSTS_DATA.slice() : [];
    }

    function uniqueCategories(posts) {
        var map = new Map();
        posts.forEach(function (post) {
            if (!map.has(post.category)) {
                map.set(post.category, {
                    key: post.category,
                    zh: post.category_zh || post.category,
                    en: post.category_en || post.category
                });
            }
        });
        return Array.from(map.values());
    }

    function getText(post, key) {
        var lang = getLang();
        if (lang === 'en') return post[key + '_en'] || post[key] || '';
        return post[key] || post[key + '_zh'] || '';
    }

    function renderFilters(posts) {
        var wrap = document.getElementById('travelblog-filters');
        if (!wrap) return;
        var lang = getLang();
        var current = wrap.querySelector('.active')?.dataset.category || 'all';
        var html = '<button type="button" class="topic-filter' + (current === 'all' ? ' active' : '') + '" data-category="all">' + (lang === 'en' ? 'All' : '全部') + '</button>';
        uniqueCategories(posts).forEach(function (cat) {
            html += '<button type="button" class="topic-filter' + (current === cat.key ? ' active' : '') + '" data-category="' + cat.key + '">' + (lang === 'en' ? cat.en : cat.zh) + '</button>';
        });
        wrap.innerHTML = html;
        wrap.querySelectorAll('button').forEach(function (button) {
            button.addEventListener('click', function () {
                wrap.querySelectorAll('button').forEach(function (item) { item.classList.remove('active'); });
                button.classList.add('active');
                renderTravelBlog();
            });
        });
    }

    function renderCards(posts) {
        var grid = document.getElementById('travelblog-grid');
        if (!grid) return;
        var lang = getLang();
        if (!posts.length) {
            grid.innerHTML = '<div class="empty-topic">' + (lang === 'en' ? 'No travel notes found.' : '暂无匹配的旅行见闻。') + '</div>';
            return;
        }

        grid.innerHTML = posts.map(function (post) {
            var tags = lang === 'en' ? (post.tags_en || post.tags || []) : (post.tags || []);
            var category = lang === 'en' ? (post.category_en || post.category) : (post.category_zh || post.category);
            return [
                '<article class="topic-card">',
                '<a class="topic-card-cover" href="' + post.url + '"><img src="' + post.cover + '" alt="' + getText(post, 'title') + '"></a>',
                '<div class="topic-card-body">',
                '<div class="topic-card-meta"><span>' + post.date + '</span><span class="topic-pill">' + category + '</span><span>' + (post.readingTime || '') + '</span></div>',
                '<h3>' + getText(post, 'title') + '</h3>',
                '<p>' + getText(post, 'excerpt') + '</p>',
                '<div class="topic-tags">' + tags.map(function (tag) { return '<span class="topic-tag">' + tag + '</span>'; }).join('') + '</div>',
                '<a class="topic-read" href="' + post.url + '">' + (lang === 'en' ? 'Read notes' : '阅读见闻') + '</a>',
                '</div>',
                '</article>'
            ].join('');
        }).join('');
    }

    function updateStats(posts) {
        var count = document.getElementById('travelblog-count');
        if (count) count.textContent = posts.length;
    }

    function renderTravelBlog() {
        var posts = getTravelBlogPosts().sort(function (a, b) {
            return Date.parse(b.date) - Date.parse(a.date);
        });
        renderFilters(posts);

        var active = document.querySelector('#travelblog-filters .active')?.dataset.category || 'all';
        var term = (document.getElementById('travelblog-search')?.value || '').trim().toLowerCase();
        var filtered = posts.filter(function (post) {
            var categoryMatch = active === 'all' || post.category === active;
            var haystack = [
                post.title, post.title_en, post.excerpt, post.excerpt_en,
                (post.tags || []).join(' '), (post.tags_en || []).join(' ')
            ].join(' ').toLowerCase();
            return categoryMatch && (!term || haystack.indexOf(term) >= 0);
        });

        updateStats(posts);
        renderCards(filtered);
    }

    window.getTravelBlogPosts = getTravelBlogPosts;
    window.renderTravelBlog = renderTravelBlog;

    document.addEventListener('DOMContentLoaded', function () {
        var search = document.getElementById('travelblog-search');
        if (search) search.addEventListener('input', renderTravelBlog);
        renderTravelBlog();
    });

    window.addEventListener('sitewide-language-change', renderTravelBlog);
})();
