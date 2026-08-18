/* =========================================================
   BLOG MOTTO PARTICLES
   blog.html 页脚上方的粒子格言装饰：
   “山海寻梦，不觉其远；前路迢迢，阔步而行。”
   - 纯文本采样生成粒子（无图片依赖）
   - 中英文切换：监听 sitewide-language-change + body.en/zh
   - 日夜间切换：监听 body.dark-mode（MutationObserver）
   仅用于 pages/blog.html，不影响其他页面
========================================================= */
(function () {
    /* 两个小分句错开分布 */
    var MOTTO = {
        zh: ["山海寻梦，不觉其远", "前路迢迢，阔步而行"],
        en: ["Chasing dreams past mountains and seas,", "the road is long, stride on boldly."]
    };

    var FONT_FAMILY = {
        zh: '"ZCOOL KuaiLe", "Noto Serif SC", "Songti SC", serif',
        en: '"Chewy", Georgia, "Times New Roman", serif'
    };

    /* 与 moban_new_md.html 粒子样板同系的日夜配色 */
    var MOTTO_THEMES = {
        day:   { particle: [118, 108, 99],  glow: [238, 204, 145] },
        night: { particle: [172, 208, 238], glow: [80, 175, 255] }
    };

    function lerp(a, b, t) { return a + (b - a) * t; }

    function lerpColor(a, b, t) {
        return [
            Math.round(lerp(a[0], b[0], t)),
            Math.round(lerp(a[1], b[1], t)),
            Math.round(lerp(a[2], b[2], t))
        ];
    }

    function rgba(c, alpha) {
        return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + alpha + ")";
    }

    function rand(min, max) { return min + Math.random() * (max - min); }

    function BlogMottoParticles(section, canvas) {
        this.section = section;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        /* DPR 限制，避免高 DPI 设备开销放大 */
        this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        /* 主题：0 = 日间，1 = 夜间，渐变过渡 */
        this.targetTheme = document.body.classList.contains("dark-mode") ? 1 : 0;
        this.themeProgress = this.targetTheme;

        /* 语言 */
        this.lang = document.body.classList.contains("en") ? "en" : "zh";

        /* 鼠标只做局部柔性扰动，不吸附 */
        this.pointer = { x: -9999, y: -9999, active: false, radius: 110 };

        this.particles = [];
        this.visible = false;
        this.rafId = null;

        this.resize();
        this.bindEvents();
        this.observeEnvironment();
    }

    BlogMottoParticles.prototype.resize = function () {
        this.width = this.section.clientWidth || window.innerWidth;
        this.height = this.section.clientHeight || 280;

        this.canvas.width = Math.floor(this.width * this.dpr);
        this.canvas.height = Math.floor(this.height * this.dpr);
        this.canvas.style.width = this.width + "px";
        this.canvas.style.height = this.height + "px";
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.pointer.radius = this.width < 600 ? 80 : 110;

        this.buildTextParticles();
    };

    /* 把两个小分句渲染到离屏画布并采样为粒子目标点 */
    BlogMottoParticles.prototype.buildTextParticles = function () {
        var w = this.width;
        var h = this.height;
        if (w < 10 || h < 10) { return; }

        var lines = MOTTO[this.lang] || MOTTO.zh;
        var fontFamily = FONT_FAMILY[this.lang] || FONT_FAMILY.zh;

        var off = document.createElement("canvas");
        off.width = Math.floor(w);
        off.height = Math.floor(h);
        var offCtx = off.getContext("2d");

        /* 按最长行收缩字号，保证整体落在宽度 86% 以内 */
        var maxWidth = w * 0.86;
        var fs = Math.min(h * 0.30, this.lang === "zh" ? w * 0.058 : w * 0.034);
        var measure = function (size) {
            offCtx.font = size + 'px ' + fontFamily;
            return Math.max(
                offCtx.measureText(lines[0]).width,
                offCtx.measureText(lines[1]).width
            );
        };
        while (fs > 14 && measure(fs) > maxWidth) { fs *= 0.96; }

        /* 错开分布：第一句偏左、第二句偏右；空间不足时自动收敛到居中 */
        var lineWidth = measure(fs);
        var stagger = Math.max(0, Math.min(w * 0.09, (w - lineWidth) / 2 * 0.9));
        if (w < 640) { stagger = Math.min(stagger, w * 0.05); }

        offCtx.font = fs + 'px ' + fontFamily;
        offCtx.textAlign = "center";
        offCtx.textBaseline = "middle";
        offCtx.fillStyle = "#ffffff";
        offCtx.fillText(lines[0], w / 2 - stagger, h * 0.36);
        offCtx.fillText(lines[1], w / 2 + stagger, h * 0.70);

        var imageData = offCtx.getImageData(0, 0, off.width, off.height);
        var data = imageData.data;

        /* 采样间距随字号缩放，保证密度稳定 */
        var step = Math.max(2, Math.round(fs / 20));
        var points = [];
        for (var y = 0; y < off.height; y += step) {
            for (var x = 0; x < off.width; x += step) {
                if (data[(y * off.width + x) * 4 + 3] > 110) {
                    points.push({ tx: x, ty: y });
                }
            }
        }

        /* 粒子总数上限，超出时均匀抽样 */
        var MAX_PARTICLES = w < 600 ? 1300 : 2600;
        if (points.length > MAX_PARTICLES) {
            var stride = points.length / MAX_PARTICLES;
            var reduced = [];
            for (var i = 0; i < points.length; i += stride) {
                reduced.push(points[Math.floor(i)]);
            }
            points = reduced;
        }

        if (points.length === 0) { return; }

        var cx = w / 2;
        var cy = h / 2;
        var old = this.particles;
        var next = [];

        for (var j = 0; j < points.length; j++) {
            var target = points[j];
            if (old[j]) {
                /* 语言/尺寸变化：旧粒子直接飞向下一个目标点 */
                old[j].tx = target.tx;
                old[j].ty = target.ty;
                next.push(old[j]);
            } else {
                /* 首次或数量增加：从四周随机位置汇聚成形 */
                var angle = Math.random() * Math.PI * 2;
                var distance = rand(60, Math.max(w, h) * 0.7);
                next.push({
                    x: cx + Math.cos(angle) * distance,
                    y: cy + Math.sin(angle) * distance,
                    tx: target.tx,
                    ty: target.ty,
                    vx: rand(-0.2, 0.2),
                    vy: rand(-0.2, 0.2),
                    radius: rand(0.6, 1.6),
                    seed: Math.random() * 100,
                    index: j
                });
            }
        }
        this.particles = next;
    };

    BlogMottoParticles.prototype.bindEvents = function () {
        var self = this;

        var resizeTimer = null;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () { self.resize(); }, 160);
        });

        this.canvas.addEventListener("pointermove", function (e) {
            var rect = self.canvas.getBoundingClientRect();
            self.pointer.x = e.clientX - rect.left;
            self.pointer.y = e.clientY - rect.top;
            self.pointer.active = true;
        });

        this.canvas.addEventListener("pointerleave", function () {
            self.pointer.active = false;
        });

        this.canvas.addEventListener("pointerdown", function (e) {
            var rect = self.canvas.getBoundingClientRect();
            var px = e.clientX - rect.left;
            var py = e.clientY - rect.top;
            /* 一次性爆发，而不是持续吸附 */
            for (var i = 0; i < self.particles.length; i++) {
                var p = self.particles[i];
                var dx = p.x - px;
                var dy = p.y - py;
                var distance = Math.hypot(dx, dy);
                var radius = 150;
                if (distance < radius && distance > 1) {
                    var force = 1 - distance / radius;
                    p.vx += dx / distance * force * 3.5;
                    p.vy += dy / distance * force * 3.5;
                }
            }
        });

        /* 只在进入视口时运行动画 */
        if ("IntersectionObserver" in window) {
            var io = new IntersectionObserver(function (entries) {
                self.visible = entries[0].isIntersecting;
                self.syncLoop();
            }, { threshold: 0.02 });
            io.observe(this.section);
        } else {
            this.visible = true;
        }

        document.addEventListener("visibilitychange", function () {
            self.syncLoop();
        });

        /* 启动兜底：IntersectionObserver 首次回调前/不支持时也能运转 */
        this.syncLoop();
    };

    /* 与站点既有 theme / language 机制打通 */
    BlogMottoParticles.prototype.observeEnvironment = function () {
        var self = this;

        /* 日夜间：body.dark-mode 由 js/theme.js 维护，无事件，用观察器监听 */
        if ("MutationObserver" in window) {
            var mo = new MutationObserver(function () {
                self.targetTheme = document.body.classList.contains("dark-mode") ? 1 : 0;
            });
            mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
        }

        /* 中英文：js/language.js 会派发 sitewide-language-change */
        window.addEventListener("sitewide-language-change", function (e) {
            var lang = e.detail && e.detail.lang === "en" ? "en" : "zh";
            if (lang !== self.lang) {
                self.lang = lang;
                self.buildTextParticles();
            }
        });

        /* 等 Web 字体就绪后重采样一次，避免回退字体成形 */
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                self.buildTextParticles();
            });
        }
    };

    BlogMottoParticles.prototype.syncLoop = function () {
        var shouldRun = this.visible && !document.hidden;
        if (shouldRun && this.rafId === null) {
            var self = this;
            var loop = function () {
                self.update();
                self.draw();
                self.rafId = requestAnimationFrame(loop);
            };
            this.rafId = requestAnimationFrame(loop);
        } else if (!shouldRun && this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    };

    BlogMottoParticles.prototype.update = function () {
        var time = performance.now() * 0.0004;

        for (var i = 0; i < this.particles.length; i++) {
            var p = this.particles[i];

            /* 1. 目标吸引力：每个粒子永远有回家的方向 */
            p.vx += (p.tx - p.x) * 0.0065;
            p.vy += (p.ty - p.y) * 0.0065;

            /* 2. 轻微的生命感 */
            p.vx += Math.sin(time + p.seed) * 0.002;
            p.vy += Math.cos(time * 1.13 + p.seed) * 0.002;

            /* 3. 鼠标局部柔性排斥（不吸附，避免堆积崩坏） */
            if (this.pointer.active) {
                var dx = p.x - this.pointer.x;
                var dy = p.y - this.pointer.y;
                var distance = Math.hypot(dx, dy);
                if (distance < this.pointer.radius) {
                    var safe = Math.max(distance, 1);
                    var force = 1 - distance / this.pointer.radius;
                    var repel = force * force * 0.8;
                    p.vx += dx / safe * repel;
                    p.vy += dy / safe * repel;
                    /* 少量切向力，流体般的旋转 */
                    p.vx += -dy / safe * force * 0.16;
                    p.vy += dx / safe * force * 0.16;
                }
            }

            /* 4. 限速 + 阻尼 + 移动 */
            var speed = Math.hypot(p.vx, p.vy);
            var maxSpeed = 3.6;
            if (speed > maxSpeed) {
                p.vx = p.vx / speed * maxSpeed;
                p.vy = p.vy / speed * maxSpeed;
            }
            p.vx *= 0.92;
            p.vy *= 0.92;
            p.x += p.vx;
            p.y += p.vy;
        }
    };

    BlogMottoParticles.prototype.draw = function () {
        /* 主题颜色渐变过渡 */
        this.themeProgress += (this.targetTheme - this.themeProgress) * 0.05;

        var color = lerpColor(
            MOTTO_THEMES.day.particle,
            MOTTO_THEMES.night.particle,
            this.themeProgress
        );

        this.ctx.clearRect(0, 0, this.width, this.height);

        for (var i = 0; i < this.particles.length; i++) {
            var p = this.particles[i];

            /* 克制的基础透明度，鼠标附近增强 */
            var alpha = 0.38 + this.themeProgress * 0.14;
            if (this.pointer.active) {
                var dx = p.x - this.pointer.x;
                var dy = p.y - this.pointer.y;
                var distance = Math.hypot(dx, dy);
                if (distance < this.pointer.radius) {
                    alpha += (1 - distance / this.pointer.radius) * 0.25;
                }
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = rgba(color, alpha);
            this.ctx.fill();

            /* 夜间少量辉光点缀 */
            if (this.themeProgress > 0.5 && p.radius > 1.1 && p.index % 17 === 0) {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius * 2.6, 0, Math.PI * 2);
                this.ctx.fillStyle = rgba(MOTTO_THEMES.night.glow, 0.04 * this.themeProgress);
                this.ctx.fill();
            }
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        var section = document.getElementById("blogMottoParticles");
        var canvas = document.getElementById("blogMottoCanvas");
        if (!section || !canvas) { return; }
        try {
            window.__blogMotto = new BlogMottoParticles(section, canvas);
        } catch (e) {
            console.warn("粒子格言初始化失败:", e);
        }
    });
})();
