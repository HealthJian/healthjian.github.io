# 个人图集照片维护说明

这个目录放独立主题页，照片内容统一由 `../../../js/personalgallery-data.js` 管理，页面会通过 `../../../js/personalgallery-render.js` 自动识别当前主题并渲染。

## 主题与分类值

新增照片时，`category` 只能填下面这些值：

| 页面 | category |
| --- | --- |
| `city-street.html` 城市街拍 | `city-street` |
| `natural-scenery.html` 自然风光 | `natural-scenery` |
| `street-life.html` 人间烟火 | `street-life` |
| `my-sharing.html` 我的分享 | `my-sharing` |
| `milestones.html` 大事记 | `milestones` |

## 新增一张普通照片

打开 `../../../js/personalgallery-data.js`，在 `photos` 数组里新增一项：

```js
{
  id: "city-night-bridge-20260615",
  category: "city-street",
  title: "桥下夜色",
  subtitle: "灯光、车流和桥墩的阴影",
  image: "images/gallery/city/night-bridge.avif",
  alt: "桥下夜色街拍照片",
  layout: "large",
  date: "2026-06-15",
  location: "城市高架桥",
  tags: ["夜色", "桥", "街拍"],
  order: 60
}
```

保存后打开对应主题页，脚本会根据 `category` 自动把照片放进对应页面。

## 图片路径怎么写

推荐把图片放在 `images/gallery/主题名/` 下面，例如：

```text
images/gallery/city/night-bridge.avif
images/gallery/nature/lake-cloud.avif
images/gallery/life/noodle-shop.avif
```

在数据里写从网站根目录开始的相对路径即可：

```js
image: "images/gallery/city/night-bridge.avif"
```

现在还没有真实图片时，可以继续写：

```js
image: "images/catcat.avif"
```

## layout 可选值

普通图集页支持这些版式：

| layout | 效果 |
| --- | --- |
| `large` | 大图，适合主视觉 |
| `medium` | 中图 |
| `small` | 小图 |
| `wide` | 横向宽图 |
| `tall` | 竖向高图 |

`my-sharing` 页面会自动渲染成分享卡片，`milestones` 页面会自动渲染成时间轴，所以这两个主题可以不写 `layout`。

## 人间烟火的轻微倾斜

`street-life` 页面支持 `tilt` 字段，用来做照片拼贴感：

```js
tilt: "-1.5deg"
```

不想倾斜可以不写。

## 大事记怎么写

大事记同样写在 `photos` 数组中，只是 `category` 填 `milestones`：

```js
{
  id: "milestone-first-trip-20260615",
  category: "milestones",
  title: "第一次主题旅行记录",
  subtitle: "把旅行、照片和当时的想法整理成一个节点。",
  image: "images/gallery/milestones/first-trip.avif",
  alt: "第一次主题旅行记录照片",
  date: "2026",
  tags: ["旅行", "记录"],
  order: 40
}
```

`date` 会显示在时间轴左侧，可以写年份，也可以写具体日期。

## 字段说明

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 唯一标识，不要重复，建议英文小写加日期 |
| `category` | 是 | 决定照片出现在哪个主题页 |
| `title` | 是 | 照片标题 |
| `subtitle` | 否 | 照片说明，会显示在标题下面 |
| `image` | 是 | 图片路径 |
| `alt` | 否 | 图片替代文本，建议写 |
| `layout` | 否 | 普通图集页的图片大小 |
| `date` | 否 | 日期或年份 |
| `location` | 否 | 地点 |
| `tags` | 否 | 标签数组 |
| `order` | 否 | 排序数字，越小越靠前 |
| `visible` | 否 | 写 `false` 可以临时隐藏 |

## 临时隐藏照片

不想删除但暂时不展示：

```js
visible: false
```

## 注意

- 改数据后刷新页面即可看到变化。
- 新增真实图片时，先确认图片文件已经放进仓库。
- `id` 不要重复。
- `category` 拼错时，照片不会显示在任何主题页。
