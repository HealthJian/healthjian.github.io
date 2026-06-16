(function () {
  const PAGE_TO_CATEGORY = {
    "city-street.html": "city-street",
    "natural-scenery.html": "natural-scenery",
    "street-life.html": "street-life",
    "my-sharing.html": "my-sharing",
    "milestones.html": "milestones"
  };

  const CLASS_TO_CATEGORY = {
    "city-street": "city-street",
    "natural-scenery": "natural-scenery",
    "street-life": "street-life",
    "my-sharing": "my-sharing",
    milestones: "milestones"
  };

  document.addEventListener("DOMContentLoaded", initPersonalGallery);

  function initPersonalGallery() {
    const data = window.PERSONAL_GALLERY_DATA;
    if (!data || !Array.isArray(data.photos)) {
      console.warn("[personalgallery] PERSONAL_GALLERY_DATA is not loaded.");
      return;
    }

    const category = getCurrentCategory();
    if (!category) return;

    const photos = data.photos
      .filter((photo) => photo.category === category && photo.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (photos.length === 0) return;

    updateHeroImage(photos[0]);

    if (category === "milestones") {
      renderTimeline(photos);
      return;
    }

    if (category === "my-sharing") {
      renderShareBoard(photos);
      return;
    }

    renderPhotoGrid(photos);
  }

  function getCurrentCategory() {
    const body = document.body;
    if (body && body.dataset.galleryCategory) {
      return body.dataset.galleryCategory;
    }

    if (body) {
      for (const className of body.classList) {
        if (CLASS_TO_CATEGORY[className]) return CLASS_TO_CATEGORY[className];
      }
    }

    const filename = (window.location.pathname.split("/").pop() || "").toLowerCase();
    return PAGE_TO_CATEGORY[filename] || "";
  }

  function updateHeroImage(photo) {
    const hero = document.querySelector(".theme-hero");
    if (!hero || !photo || !photo.image) return;
    hero.style.backgroundImage = `linear-gradient(110deg, var(--hero-overlay-start, rgba(12, 18, 24, 0.72)), var(--hero-overlay-end, rgba(12, 18, 24, 0.18))), url("${resolveAssetPath(photo.image)}")`;
  }

  function renderPhotoGrid(photos) {
    const grid = document.querySelector(".photo-grid");
    if (!grid) return;

    grid.innerHTML = "";
    photos.forEach((photo) => {
      const figure = document.createElement("figure");
      figure.className = `photo-item ${sanitizeClass(photo.layout || "small")}`;
      if (photo.tilt) figure.style.setProperty("--tilt", photo.tilt);

      const img = document.createElement("img");
      img.src = resolveAssetPath(photo.image);
      img.alt = photo.alt || photo.title || "图集照片";
      img.loading = "lazy";

      const caption = createPhotoCaption(photo);
      figure.appendChild(img);
      figure.appendChild(caption);
      grid.appendChild(figure);
    });
  }

  function renderShareBoard(photos) {
    const board = document.querySelector(".share-board");
    if (!board) return;

    board.innerHTML = "";
    photos.forEach((photo) => {
      const article = document.createElement("article");
      article.className = "share-card";

      const content = document.createElement("div");

      const img = document.createElement("img");
      img.src = resolveAssetPath(photo.image);
      img.alt = photo.alt || photo.title || "分享照片";
      img.loading = "lazy";

      const title = document.createElement("h2");
      title.textContent = photo.title || "未命名";

      const summary = document.createElement("p");
      summary.textContent = photo.subtitle || photo.description || "";

      content.appendChild(img);
      content.appendChild(title);
      content.appendChild(summary);
      article.appendChild(content);
      board.appendChild(article);
    });
  }

  function renderTimeline(photos) {
    const timeline = document.querySelector(".timeline");
    if (!timeline) return;

    timeline.innerHTML = "";
    photos.forEach((photo) => {
      const article = document.createElement("article");
      article.className = "timeline-item";

      const date = document.createElement("div");
      date.className = "timeline-date";
      date.textContent = photo.date || "";

      const panel = document.createElement("div");
      panel.className = "timeline-panel";

      const img = document.createElement("img");
      img.src = resolveAssetPath(photo.image);
      img.alt = photo.alt || photo.title || "大事记照片";
      img.loading = "lazy";

      const text = document.createElement("div");
      const title = document.createElement("h2");
      title.textContent = photo.title || "未命名节点";
      const summary = document.createElement("p");
      summary.textContent = photo.subtitle || photo.description || "";

      text.appendChild(title);
      text.appendChild(summary);
      panel.appendChild(img);
      panel.appendChild(text);
      article.appendChild(date);
      article.appendChild(panel);
      timeline.appendChild(article);
    });
  }

  function createPhotoCaption(photo) {
    const caption = document.createElement("figcaption");
    caption.className = "photo-caption";

    const title = document.createElement("strong");
    title.textContent = photo.title || "未命名";

    const subtitle = document.createElement("span");
    subtitle.textContent = photo.subtitle || buildMetaText(photo);

    caption.appendChild(title);
    caption.appendChild(subtitle);
    return caption;
  }

  function buildMetaText(photo) {
    return [photo.date, photo.location, Array.isArray(photo.tags) ? photo.tags.join(" / ") : ""]
      .filter(Boolean)
      .join(" · ");
  }

  function resolveAssetPath(path) {
    if (!path) return "";
    if (/^(https?:|data:|blob:|mailto:|#)/.test(path)) return path;
    if (path.startsWith("../") || path.startsWith("./")) return path;

    const cleanPath = path.replace(/^\/+/, "");
    const pathname = window.location.pathname.replace(/\\/g, "/");

    if (pathname.includes("/pages/project/personalgallery/")) {
      return `../../../${cleanPath}`;
    }

    if (pathname.includes("/pages/project/")) {
      return `../../${cleanPath}`;
    }

    if (pathname.includes("/pages/")) {
      return `../${cleanPath}`;
    }

    return cleanPath;
  }

  function sanitizeClass(value) {
    const allowed = new Set(["large", "medium", "small", "tall", "wide"]);
    return allowed.has(value) ? value : "small";
  }
})();
