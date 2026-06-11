// 博客分类标签与颜色元数据
window.BLOG_CATEGORY_META = {
    all: {
        zh: '全部',
        en: 'All',
        badgeClass: 'blog-cat-all'
    },
    tech: {
        zh: '技术',
        en: 'Technology',
        badgeClass: 'blog-cat-tech'
    },
    interview: {
        zh: '面试',
        en: 'Interview',
        badgeClass: 'blog-cat-interview'
    },
    life: {
        zh: '生活',
        en: 'Life',
        badgeClass: 'blog-cat-life'
    },
    thoughts: {
        zh: '随想',
        en: 'Thoughts',
        badgeClass: 'blog-cat-thoughts'
    },
    idea: {
        zh: '思想',
        en: 'Ideas',
        badgeClass: 'blog-cat-idea'
    },
    excerpt: {
        zh: '摘抄',
        en: 'Excerpt',
        badgeClass: 'blog-cat-excerpt'
    },
    paper: {
        zh: '论文',
        en: 'Paper',
        badgeClass: 'blog-cat-paper'
    }
};

function getBlogCategoryMeta(category) {
    return window.BLOG_CATEGORY_META?.[category] || {
        zh: category,
        en: category,
        badgeClass: 'blog-cat-default'
    };
}
