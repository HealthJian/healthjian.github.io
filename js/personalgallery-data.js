// 个人图集数据源：只维护这里，主题页会自动按 category 渲染
window.PERSONAL_GALLERY_DATA = {
  categories: {
    "city-street": {
      title: "城市街拍",
      page: "pages/project/personalgallery/city-street.html"
    },
    "natural-scenery": {
      title: "自然风光",
      page: "pages/project/personalgallery/natural-scenery.html"
    },
    "street-life": {
      title: "人间烟火",
      page: "pages/project/personalgallery/street-life.html"
    },
    "my-sharing": {
      title: "我的分享",
      page: "pages/project/personalgallery/my-sharing.html"
    },
    milestones: {
      title: "大事记",
      page: "pages/project/personalgallery/milestones.html"
    }
  },

  photos: [
    {
      id: "city-light-corner",
      category: "city-street",
      title: "街口灯影",
      subtitle: "夜晚 / 反光 / 匆忙的行人",
      image: "images/catcat.avif",
      alt: "城市街拍照片",
      layout: "large",
      date: "2026-06-15",
      location: "城市街角",
      tags: ["夜色", "街拍", "反光"],
      order: 10
    },
    {
      id: "city-window-reflection",
      category: "city-street",
      title: "窗内与窗外",
      subtitle: "玻璃 / 霓虹 / 层叠空间",
      image: "images/catcat.avif",
      alt: "城市街拍照片",
      layout: "medium",
      date: "2026-06-15",
      location: "街边橱窗",
      tags: ["霓虹", "玻璃"],
      order: 20
    },
    {
      id: "city-slow-second",
      category: "city-street",
      title: "慢半拍",
      subtitle: "人群之间的停顿",
      image: "images/catcat.avif",
      alt: "城市街拍照片",
      layout: "small",
      date: "2026-06-15",
      tags: ["行人", "瞬间"],
      order: 30
    },
    {
      id: "city-after-rain",
      category: "city-street",
      title: "雨后路面",
      subtitle: "水迹把灯光拉长",
      image: "images/catcat.avif",
      alt: "城市街拍照片",
      layout: "small",
      date: "2026-06-15",
      tags: ["雨后", "灯光"],
      order: 40
    },
    {
      id: "city-before-turning",
      category: "city-street",
      title: "转身之前",
      subtitle: "短暂、松动、真实",
      image: "images/catcat.avif",
      alt: "城市街拍照片",
      layout: "small",
      date: "2026-06-15",
      tags: ["抓拍", "真实"],
      order: 50
    },

    {
      id: "nature-mountain-sky",
      category: "natural-scenery",
      title: "山与天空",
      subtitle: "辽阔、安静、层次",
      image: "images/catcat.avif",
      alt: "自然风光照片",
      layout: "wide",
      date: "2026-06-15",
      tags: ["山川", "天空"],
      order: 10
    },
    {
      id: "nature-cloud-direction",
      category: "natural-scenery",
      title: "云的走向",
      subtitle: "把天空并入山脉",
      image: "images/catcat.avif",
      alt: "自然风光照片",
      layout: "tall",
      date: "2026-06-15",
      tags: ["云", "远山"],
      order: 20
    },
    {
      id: "nature-lake-space",
      category: "natural-scenery",
      title: "湖面留白",
      subtitle: "水光与远处的线",
      image: "images/catcat.avif",
      alt: "自然风光照片",
      layout: "medium",
      date: "2026-06-15",
      tags: ["湖面", "留白"],
      order: 30
    },
    {
      id: "nature-wind",
      category: "natural-scenery",
      title: "风吹过",
      subtitle: "自然里最轻的动作",
      image: "images/catcat.avif",
      alt: "自然风光照片",
      layout: "medium",
      date: "2026-06-15",
      tags: ["风", "季节"],
      order: 40
    },
    {
      id: "nature-far-mountain-letter",
      category: "natural-scenery",
      title: "远山像一封信",
      subtitle: "慢慢读，不急着抵达",
      image: "images/catcat.avif",
      alt: "自然风光照片",
      layout: "large",
      date: "2026-06-15",
      tags: ["远山", "旅行"],
      order: 50
    },

    {
      id: "life-before-dinner",
      category: "street-life",
      title: "饭点之前",
      subtitle: "热气、声音和等待",
      image: "images/catcat.avif",
      alt: "人间烟火照片",
      layout: "medium",
      tilt: "-1.5deg",
      date: "2026-06-15",
      tags: ["餐桌", "日常"],
      order: 10
    },
    {
      id: "life-alley-light",
      category: "street-life",
      title: "小巷灯光",
      subtitle: "傍晚之后，生活继续",
      image: "images/catcat.avif",
      alt: "人间烟火照片",
      layout: "medium",
      tilt: "1deg",
      date: "2026-06-15",
      tags: ["小巷", "灯光"],
      order: 20
    },
    {
      id: "life-stall",
      category: "street-life",
      title: "摊位边",
      subtitle: "短暂的停留",
      image: "images/catcat.avif",
      alt: "人间烟火照片",
      layout: "small",
      tilt: "1.5deg",
      date: "2026-06-15",
      tags: ["市集", "摊位"],
      order: 30
    },
    {
      id: "life-window",
      category: "street-life",
      title: "窗边",
      subtitle: "有人在认真生活",
      image: "images/catcat.avif",
      alt: "人间烟火照片",
      layout: "small",
      tilt: "-1deg",
      date: "2026-06-15",
      tags: ["窗边", "生活"],
      order: 40
    },
    {
      id: "life-way-home",
      category: "street-life",
      title: "回家的路",
      subtitle: "普通，所以珍贵",
      image: "images/catcat.avif",
      alt: "人间烟火照片",
      layout: "small",
      tilt: "0.8deg",
      date: "2026-06-15",
      tags: ["回家", "日常"],
      order: 50
    },

    {
      id: "share-recent-frame",
      category: "my-sharing",
      title: "最近喜欢的画面",
      subtitle: "记录那些不一定归类清楚，但很想留下来的瞬间。",
      image: "images/catcat.avif",
      alt: "我的分享照片",
      date: "2026-06-15",
      tags: ["收藏", "片段"],
      order: 10
    },
    {
      id: "share-inspiration",
      category: "my-sharing",
      title: "拍摄灵感",
      subtitle: "光线、构图、色彩和情绪，都可以成为下一次出门拍照的理由。",
      image: "images/catcat.avif",
      alt: "我的分享照片",
      date: "2026-06-15",
      tags: ["灵感", "构图"],
      order: 20
    },
    {
      id: "share-life-fragment",
      category: "my-sharing",
      title: "生活片段",
      subtitle: "不完整也没关系，碎片本来就是生活的一种形状。",
      image: "images/catcat.avif",
      alt: "我的分享照片",
      date: "2026-06-15",
      tags: ["生活", "碎片"],
      order: 30
    },
    {
      id: "share-worth-looking-back",
      category: "my-sharing",
      title: "值得回看",
      subtitle: "给未来的自己留一个小小的入口，回头时还能找到当时的心情。",
      image: "images/catcat.avif",
      alt: "我的分享照片",
      date: "2026-06-15",
      tags: ["回看", "心情"],
      order: 40
    },

    {
      id: "milestone-gallery-rebuild",
      category: "milestones",
      title: "图集主题化重构",
      subtitle: "从单一图集页拆分为多个独立主题，让每个主题都有自己的页面、视觉性格和内容节奏。",
      image: "images/catcat.avif",
      alt: "大事记照片",
      date: "2026",
      tags: ["站点", "图集"],
      order: 10
    },
    {
      id: "milestone-site-growth",
      category: "milestones",
      title: "个人站点持续扩展",
      subtitle: "博客、项目、图集和个人记录逐步形成系统，站点从展示页面变成长期维护的个人空间。",
      image: "images/catcat.avif",
      alt: "大事记照片",
      date: "2025",
      tags: ["个人站", "记录"],
      order: 20
    },
    {
      id: "milestone-next-stories",
      category: "milestones",
      title: "新的故事继续进入",
      subtitle: "当新的照片、地点和时间被放进来，这条时间轴会逐渐变成更完整的个人档案。",
      image: "images/catcat.avif",
      alt: "大事记照片",
      date: "未来",
      tags: ["故事", "档案"],
      order: 30
    }
  ]
};
