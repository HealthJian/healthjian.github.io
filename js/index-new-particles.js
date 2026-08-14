        /* =====================================================
           Utilities
        ====================================================== */

        const clamp = (value, min, max) =>
            Math.max(min, Math.min(max, value));


        const lerp = (a, b, t) =>
            a + (b - a) * t;


        function lerpColor(colorA, colorB, t) {

            return [

                Math.round(
                    lerp(
                        colorA[0],
                        colorB[0],
                        t
                    )
                ),

                Math.round(
                    lerp(
                        colorA[1],
                        colorB[1],
                        t
                    )
                ),

                Math.round(
                    lerp(
                        colorA[2],
                        colorB[2],
                        t
                    )
                )

            ];
        }


        function rgba(
            color,
            alpha = 1
        ) {

            return `rgba(
                ${color[0]},
                ${color[1]},
                ${color[2]},
                ${alpha}
            )`;
        }


        function smoothStep(t) {

            t = clamp(t, 0, 1);

            return t * t * (3 - 2 * t);
        }


        /* =====================================================
           Themes
        ====================================================== */

        const THEMES = {

            day: {

                bg: [245, 240, 230],

                warmGlow: [255, 223, 170],

                centerGlow: [210, 220, 228],

                particle: [175, 154, 122],

                line: [155, 137, 110],

                trail: [196, 163, 120]
            },


            night: {

                bg: [5, 19, 40],

                warmGlow: [35, 83, 125],

                centerGlow: [70, 120, 170],

                particle: [155, 210, 255],

                line: [90, 165, 235],

                trail: [100, 195, 255]
            }

        };


        /* =====================================================
           Particle System
        ====================================================== */

        class ParticleSystem {

            constructor(canvas) {

                this.canvas = canvas;

                this.ctx =
                    canvas.getContext(
                        "2d",
                        {
                            alpha: false,
                            desynchronized: true
                        }
                    );


                this.running = true;

                this.lastTime =
                    performance.now();

                this.time = 0;

                this.animationId = null;


                this.width = 0;
                this.height = 0;
                this.dpr = 1;


                this.particles = [];

                this.particleCount = 130;

                this.maxParticles = 145;

                this.minParticles = 45;


                this.connectionRadius = 140;

                this.connectionRadiusSq =
                    this.connectionRadius *
                    this.connectionRadius;


                this.gridSize =
                    this.connectionRadius;

                this.grid = new Map();


                /* Mouse */

                this.mouse = {

                    x: -9999,
                    y: -9999,

                    targetX: -9999,
                    targetY: -9999,

                    active: false,

                    radius: 155,

                    radiusSq:
                        155 * 155,

                    lastX: -9999,
                    lastY: -9999,

                    speed: 0
                };


                /* Trail */

                this.mouseTrail = [];

                this.maxTrailLength = 18;


                /* Theme */

                this.themeProgress = 0;

                this.targetThemeProgress = 0;


                /* FPS */

                this.fps = 60;

                this.frameCounter = 0;

                this.fpsTimer =
                    performance.now();


                this.reducedMotion =
                    window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches;


                this.initDeviceConfig();

                this.resize();

                this.initParticles();

                this.bindEvents();

                this.animate();
            }


            /* =================================================
               Device
            ================================================= */

            initDeviceConfig() {

                const width =
                    window.innerWidth;


                if (width < 600) {

                    this.particleCount = 48;

                    this.maxParticles = 60;

                    this.minParticles = 32;

                    this.mouse.radius = 90;

                    this.connectionRadius = 85;
                }

                else if (width < 1100) {

                    this.particleCount = 90;

                    this.maxParticles = 105;

                    this.minParticles = 55;

                    this.mouse.radius = 120;

                    this.connectionRadius = 110;
                }

                else {

                    this.particleCount = 130;

                    this.maxParticles = 145;

                    this.minParticles = 75;

                    this.mouse.radius = 155;

                    this.connectionRadius = 140;
                }


                this.mouse.radiusSq =
                    this.mouse.radius *
                    this.mouse.radius;


                this.connectionRadiusSq =
                    this.connectionRadius *
                    this.connectionRadius;


                this.gridSize =
                    this.connectionRadius;
            }


            /* =================================================
               Resize
            ================================================= */

            resize() {

                this.width =
                    window.innerWidth;

                this.height =
                    window.innerHeight;


                this.dpr =
                    Math.min(
                        window.devicePixelRatio || 1,
                        2
                    );


                this.canvas.width =
                    Math.floor(
                        this.width *
                        this.dpr
                    );


                this.canvas.height =
                    Math.floor(
                        this.height *
                        this.dpr
                    );


                this.canvas.style.width =
                    this.width + "px";

                this.canvas.style.height =
                    this.height + "px";


                this.ctx.setTransform(
                    this.dpr,
                    0,
                    0,
                    this.dpr,
                    0,
                    0
                );
            }


            /* =================================================
               Particle Factory
            ================================================= */

            createParticle() {

                const speed =
                    0.18 +
                    Math.random() * 0.35;


                const angle =
                    Math.random() *
                    Math.PI *
                    2;


                return {

                    x:
                        Math.random() *
                        this.width,

                    y:
                        Math.random() *
                        this.height,

                    vx:
                        Math.cos(angle) *
                        speed,

                    vy:
                        Math.sin(angle) *
                        speed,

                    baseSpeed: speed,

                    baseAngle: angle,

                    radius:
                        0.55 +
                        Math.random() * 1.15,

                    glow:
                        Math.random() < 0.10,

                    glowStrength:
                        0.6 +
                        Math.random() * 0.6,

                    phase:
                        Math.random() *
                        Math.PI *
                        2
                };
            }


            initParticles() {

                this.particles = [];


                for (
                    let i = 0;
                    i < this.particleCount;
                    i++
                ) {

                    this.particles.push(
                        this.createParticle()
                    );
                }
            }


            syncParticleCount() {

                while (
                    this.particles.length <
                    this.particleCount
                ) {

                    this.particles.push(
                        this.createParticle()
                    );
                }


                if (
                    this.particles.length >
                    this.particleCount
                ) {

                    this.particles.length =
                        this.particleCount;
                }
            }


            /* =================================================
               Events
            ================================================= */

            bindEvents() {

                let resizeTimer;


                window.addEventListener(
                    "resize",
                    () => {

                        clearTimeout(resizeTimer);


                        resizeTimer =
                            setTimeout(
                                () => {

                                    this.initDeviceConfig();

                                    this.resize();

                                    this.syncParticleCount();

                                },
                                120
                            );
                    },
                    {
                        passive: true
                    }
                );


                window.addEventListener(
                    "pointermove",
                    event => {

                        this.mouse.targetX =
                            event.clientX;

                        this.mouse.targetY =
                            event.clientY;

                        this.mouse.active = true;
                    },
                    {
                        passive: true
                    }
                );


                window.addEventListener(
                    "pointerdown",
                    event => {

                        this.mouse.targetX =
                            event.clientX;

                        this.mouse.targetY =
                            event.clientY;

                        this.mouse.active = true;
                    },
                    {
                        passive: true
                    }
                );


                window.addEventListener(
                    "pointerleave",
                    () => {

                        this.mouse.active = false;
                    },
                    {
                        passive: true
                    }
                );


                document.addEventListener(
                    "visibilitychange",
                    () => {

                        if (document.hidden) {

                            this.running = false;

                            cancelAnimationFrame(
                                this.animationId
                            );
                        }

                        else {

                            if (!this.running) {

                                this.running = true;

                                this.lastTime =
                                    performance.now();

                                this.animate();
                            }
                        }
                    }
                );
            }


            /* =================================================
               Theme
            ================================================= */

            setTheme(theme) {

                this.targetThemeProgress =
                    theme === "night"
                        ? 1
                        : 0;
            }


            /* =================================================
               Grid
            ================================================= */

            buildSpatialGrid() {

                this.grid.clear();


                for (
                    let i = 0;
                    i < this.particles.length;
                    i++
                ) {

                    const p =
                        this.particles[i];


                    const gx =
                        Math.floor(
                            p.x /
                            this.gridSize
                        );

                    const gy =
                        Math.floor(
                            p.y /
                            this.gridSize
                        );


                    const key =
                        gx + "," + gy;


                    if (
                        !this.grid.has(key)
                    ) {

                        this.grid.set(
                            key,
                            []
                        );
                    }


                    this.grid
                        .get(key)
                        .push(i);
                }
            }


            /* =================================================
               Mouse
            ================================================= */

            updateMouse(deltaScale) {

                this.mouse.x +=
                    (
                        this.mouse.targetX -
                        this.mouse.x
                    ) *
                    0.12 *
                    deltaScale;


                this.mouse.y +=
                    (
                        this.mouse.targetY -
                        this.mouse.y
                    ) *
                    0.12 *
                    deltaScale;


                const dx =
                    this.mouse.x -
                    this.mouse.lastX;

                const dy =
                    this.mouse.y -
                    this.mouse.lastY;


                if (
                    this.mouse.lastX > -9000
                ) {

                    this.mouse.speed =
                        Math.min(
                            Math.sqrt(
                                dx * dx +
                                dy * dy
                            ),
                            35
                        );
                }


                this.mouse.lastX =
                    this.mouse.x;

                this.mouse.lastY =
                    this.mouse.y;


                if (this.mouse.active) {

                    this.mouseTrail.push({

                        x: this.mouse.x,

                        y: this.mouse.y,

                        life: 1
                    });


                    if (
                        this.mouseTrail.length >
                        this.maxTrailLength
                    ) {

                        this.mouseTrail.shift();
                    }
                }


                for (
                    let i =
                        this.mouseTrail.length - 1;
                    i >= 0;
                    i--
                ) {

                    this.mouseTrail[i].life -=
                        0.025 *
                        deltaScale;


                    if (
                        this.mouseTrail[i].life <= 0
                    ) {

                        this.mouseTrail.splice(
                            i,
                            1
                        );
                    }
                }
            }


            /* =================================================
               Update
            ================================================= */

            updateParticles(deltaScale) {

                if (this.reducedMotion) {
                    return;
                }


                this.updateMouse(deltaScale);


                this.time +=
                    0.012 *
                    deltaScale;


                for (
                    let i = 0;
                    i < this.particles.length;
                    i++
                ) {

                    const p =
                        this.particles[i];


                    /* Flow Field */

                    const flowAngle =

                        Math.sin(
                            p.y * 0.0035 +
                            this.time +
                            p.phase
                        ) *
                        0.7

                        +

                        Math.cos(
                            p.x * 0.0025 -
                            this.time * 0.7
                        ) *
                        0.5;


                    p.vx +=
                        Math.cos(flowAngle) *
                        0.008 *
                        deltaScale;


                    p.vy +=
                        Math.sin(flowAngle) *
                        0.008 *
                        deltaScale;


                    /* Natural recovery */

                    const naturalX =
                        Math.cos(
                            p.baseAngle
                        ) *
                        p.baseSpeed;


                    const naturalY =
                        Math.sin(
                            p.baseAngle
                        ) *
                        p.baseSpeed;


                    p.vx +=
                        (
                            naturalX -
                            p.vx
                        ) *
                        0.006 *
                        deltaScale;


                    p.vy +=
                        (
                            naturalY -
                            p.vy
                        ) *
                        0.006 *
                        deltaScale;


                    /* Mouse field */

                    if (this.mouse.active) {

                        const dx =
                            this.mouse.x -
                            p.x;

                        const dy =
                            this.mouse.y -
                            p.y;


                        const distSq =
                            dx * dx +
                            dy * dy;


                        if (
                            distSq <
                            this.mouse.radiusSq &&
                            distSq > 1
                        ) {

                            const dist =
                                Math.sqrt(
                                    distSq
                                );


                            let force =
                                1 -
                                dist /
                                this.mouse.radius;


                            force =
                                smoothStep(force);


                            const nx =
                                dx / dist;

                            const ny =
                                dy / dist;


                            const pull =
                                0.16 *
                                force *
                                deltaScale;


                            const orbit =
                                0.10 *
                                force *
                                deltaScale;


                            const speedBoost =
                                1 +
                                this.mouse.speed *
                                0.018;


                            p.vx +=

                                nx *
                                pull *
                                speedBoost

                                +

                                -ny *
                                orbit;


                            p.vy +=

                                ny *
                                pull *
                                speedBoost

                                +

                                nx *
                                orbit;
                        }
                    }


                    /* Speed limit */

                    const speedSq =
                        p.vx * p.vx +
                        p.vy * p.vy;


                    const maxSpeed =
                        1.4;


                    if (
                        speedSq >
                        maxSpeed * maxSpeed
                    ) {

                        const scale =
                            maxSpeed /
                            Math.sqrt(speedSq);

                        p.vx *= scale;
                        p.vy *= scale;
                    }


                    p.x +=
                        p.vx *
                        deltaScale;

                    p.y +=
                        p.vy *
                        deltaScale;


                    /* Soft wrap */

                    const padding = 30;


                    if (p.x < -padding) {
                        p.x =
                            this.width + padding;
                    }

                    else if (
                        p.x >
                        this.width + padding
                    ) {
                        p.x = -padding;
                    }


                    if (p.y < -padding) {
                        p.y =
                            this.height + padding;
                    }

                    else if (
                        p.y >
                        this.height + padding
                    ) {
                        p.y = -padding;
                    }
                }
            }


            /* =================================================
               Background
            ================================================= */

            drawBackground(progress) {

                const ctx = this.ctx;


                const bg =
                    lerpColor(
                        THEMES.day.bg,
                        THEMES.night.bg,
                        progress
                    );


                ctx.fillStyle =
                    rgba(bg, 1);


                ctx.fillRect(
                    0,
                    0,
                    this.width,
                    this.height
                );


                /* Warm Glow */

                const warm =
                    lerpColor(
                        THEMES.day.warmGlow,
                        THEMES.night.warmGlow,
                        progress
                    );


                const warmGradient =
                    ctx.createRadialGradient(

                        this.width * 0.12,
                        this.height * 0.40,
                        0,

                        this.width * 0.12,
                        this.height * 0.40,

                        Math.max(
                            this.width,
                            this.height
                        ) * 0.72
                    );


                const warmAlpha =
                    lerp(
                        0.38,
                        0.12,
                        progress
                    );


                warmGradient.addColorStop(
                    0,
                    rgba(
                        warm,
                        warmAlpha
                    )
                );

                warmGradient.addColorStop(
                    0.45,
                    rgba(
                        warm,
                        warmAlpha * 0.30
                    )
                );

                warmGradient.addColorStop(
                    1,
                    rgba(warm, 0)
                );


                ctx.fillStyle =
                    warmGradient;


                ctx.fillRect(
                    0,
                    0,
                    this.width,
                    this.height
                );


                /* Center Aurora */

                const center =
                    lerpColor(
                        THEMES.day.centerGlow,
                        THEMES.night.centerGlow,
                        progress
                    );


                const centerGradient =
                    ctx.createRadialGradient(

                        this.width *
                        lerp(
                            0.44,
                            0.55,
                            progress
                        ),

                        this.height *
                        lerp(
                            0.46,
                            0.42,
                            progress
                        ),

                        0,

                        this.width *
                        lerp(
                            0.44,
                            0.55,
                            progress
                        ),

                        this.height *
                        lerp(
                            0.46,
                            0.42,
                            progress
                        ),

                        Math.max(
                            this.width,
                            this.height
                        ) *
                        0.62
                    );


                const centerAlpha =
                    lerp(
                        0.24,
                        0.28,
                        progress
                    );


                centerGradient.addColorStop(
                    0,
                    rgba(
                        center,
                        centerAlpha
                    )
                );

                centerGradient.addColorStop(
                    0.45,
                    rgba(
                        center,
                        centerAlpha * 0.32
                    )
                );

                centerGradient.addColorStop(
                    1,
                    rgba(center, 0)
                );


                ctx.fillStyle =
                    centerGradient;


                ctx.fillRect(
                    0,
                    0,
                    this.width,
                    this.height
                );


                /* Night depth */

                if (progress > 0.01) {

                    const gradient =
                        ctx.createLinearGradient(

                            this.width * 0.45,
                            0,

                            this.width,
                            0
                        );


                    gradient.addColorStop(
                        0,
                        "rgba(0,0,0,0)"
                    );


                    gradient.addColorStop(
                        1,
                        `rgba(
                            0,
                            10,
                            30,
                            ${0.42 * progress}
                        )`
                    );


                    ctx.fillStyle =
                        gradient;


                    ctx.fillRect(
                        0,
                        0,
                        this.width,
                        this.height
                    );
                }
            }


            /* =================================================
               Trail
            ================================================= */

            drawTrail(color, progress) {

                if (
                    this.mouseTrail.length < 2
                ) {
                    return;
                }


                const ctx =
                    this.ctx;


                ctx.save();

                ctx.lineCap = "round";


                for (
                    let i = 1;
                    i < this.mouseTrail.length;
                    i++
                ) {

                    const a =
                        this.mouseTrail[i - 1];

                    const b =
                        this.mouseTrail[i];


                    ctx.beginPath();

                    ctx.moveTo(a.x, a.y);

                    ctx.lineTo(b.x, b.y);


                    ctx.strokeStyle =
                        rgba(
                            color,
                            b.life *
                            (
                                0.025 +
                                progress * 0.035
                            )
                        );


                    ctx.lineWidth =
                        0.7 +
                        b.life * 0.7;


                    ctx.stroke();
                }


                ctx.restore();
            }


            /* =================================================
               Connections
            ================================================= */

            drawConnections(color, progress) {

                const ctx =
                    this.ctx;


                for (
                    let i = 0;
                    i < this.particles.length;
                    i++
                ) {

                    const p1 =
                        this.particles[i];


                    const gx =
                        Math.floor(
                            p1.x /
                            this.gridSize
                        );

                    const gy =
                        Math.floor(
                            p1.y /
                            this.gridSize
                        );


                    for (
                        let ox = -1;
                        ox <= 1;
                        ox++
                    ) {

                        for (
                            let oy = -1;
                            oy <= 1;
                            oy++
                        ) {

                            const bucket =
                                this.grid.get(
                                    (gx + ox) +
                                    "," +
                                    (gy + oy)
                                );


                            if (!bucket) {
                                continue;
                            }


                            for (
                                let n = 0;
                                n < bucket.length;
                                n++
                            ) {

                                const j =
                                    bucket[n];


                                if (j <= i) {
                                    continue;
                                }


                                const p2 =
                                    this.particles[j];


                                const dx =
                                    p2.x -
                                    p1.x;

                                const dy =
                                    p2.y -
                                    p1.y;


                                const distSq =
                                    dx * dx +
                                    dy * dy;


                                if (
                                    distSq >
                                    this.connectionRadiusSq
                                ) {
                                    continue;
                                }


                                const dist =
                                    Math.sqrt(
                                        distSq
                                    );


                                let alpha =
                                    1 -
                                    dist /
                                    this.connectionRadius;


                                alpha *= alpha;


                                if (
                                    this.mouse.active
                                ) {

                                    const mx =
                                        this.mouse.x -
                                        p1.x;

                                    const my =
                                        this.mouse.y -
                                        p1.y;


                                    if (
                                        mx * mx +
                                        my * my <
                                        this.mouse.radiusSq
                                    ) {

                                        alpha *= 1.45;
                                    }
                                }


                                const maxAlpha =
                                    lerp(
                                        0.075,
                                        0.20,
                                        progress
                                    );


                                const finalAlpha =
                                    Math.min(
                                        alpha *
                                        maxAlpha,
                                        0.28
                                    );


                                if (
                                    finalAlpha < 0.005
                                ) {
                                    continue;
                                }


                                ctx.beginPath();

                                ctx.moveTo(
                                    p1.x,
                                    p1.y
                                );

                                ctx.lineTo(
                                    p2.x,
                                    p2.y
                                );


                                ctx.strokeStyle =
                                    rgba(
                                        color,
                                        finalAlpha
                                    );


                                ctx.lineWidth = 0.65;

                                ctx.stroke();
                            }
                        }
                    }
                }
            }


            /* =================================================
               Particles
            ================================================= */

            drawParticles(color, progress) {

                const ctx =
                    this.ctx;


                ctx.fillStyle =
                    rgba(
                        color,
                        lerp(
                            0.38,
                            0.72,
                            progress
                        )
                    );


                for (
                    let i = 0;
                    i < this.particles.length;
                    i++
                ) {

                    const p =
                        this.particles[i];


                    const pulse =
                        1 +
                        Math.sin(
                            this.time +
                            p.phase
                        ) *
                        0.08;


                    ctx.beginPath();

                    ctx.arc(
                        p.x,
                        p.y,
                        p.radius * pulse,
                        0,
                        Math.PI * 2
                    );

                    ctx.fill();
                }


                /* Glow */

                if (progress > 0.05) {

                    ctx.save();

                    ctx.shadowColor =
                        rgba(
                            color,
                            0.7
                        );


                    ctx.shadowBlur =
                        7 +
                        progress * 8;


                    ctx.fillStyle =
                        `rgba(
                            235,
                            248,
                            255,
                            ${0.35 + progress * 0.4}
                        )`;


                    for (
                        const p of this.particles
                    ) {

                        if (!p.glow) {
                            continue;
                        }


                        ctx.beginPath();

                        ctx.arc(
                            p.x,
                            p.y,
                            p.radius *
                            0.9 *
                            p.glowStrength,
                            0,
                            Math.PI * 2
                        );

                        ctx.fill();
                    }


                    ctx.restore();
                }
            }


            /* =================================================
               Draw
            ================================================= */

            draw() {

                this.themeProgress +=
                    (
                        this.targetThemeProgress -
                        this.themeProgress
                    ) *
                    0.035;


                if (
                    Math.abs(
                        this.targetThemeProgress -
                        this.themeProgress
                    ) <
                    0.001
                ) {

                    this.themeProgress =
                        this.targetThemeProgress;
                }


                const progress =
                    smoothStep(
                        this.themeProgress
                    );


                const particleColor =
                    lerpColor(
                        THEMES.day.particle,
                        THEMES.night.particle,
                        progress
                    );


                const lineColor =
                    lerpColor(
                        THEMES.day.line,
                        THEMES.night.line,
                        progress
                    );


                const trailColor =
                    lerpColor(
                        THEMES.day.trail,
                        THEMES.night.trail,
                        progress
                    );


                this.drawBackground(
                    progress
                );


                this.buildSpatialGrid();


                this.drawTrail(
                    trailColor,
                    progress
                );


                this.drawConnections(
                    lineColor,
                    progress
                );


                this.drawParticles(
                    particleColor,
                    progress
                );
            }


            /* =================================================
               FPS
            ================================================= */

            monitorFPS(now) {

                this.frameCounter++;


                if (
                    now -
                    this.fpsTimer <
                    1000
                ) {
                    return;
                }


                this.fps =
                    this.frameCounter *
                    1000 /
                    (
                        now -
                        this.fpsTimer
                    );


                if (
                    this.fps < 38 &&
                    this.particleCount >
                    this.minParticles
                ) {

                    this.particleCount =
                        Math.max(
                            this.minParticles,
                            this.particleCount - 8
                        );

                    this.syncParticleCount();
                }


                else if (
                    this.fps > 57 &&
                    this.particleCount <
                    this.maxParticles
                ) {

                    this.particleCount =
                        Math.min(
                            this.maxParticles,
                            this.particleCount + 4
                        );

                    this.syncParticleCount();
                }


                this.frameCounter = 0;

                this.fpsTimer = now;
            }


            /* =================================================
               Animation
            ================================================= */

            animate(now = performance.now()) {

                if (!this.running) {
                    return;
                }


                const delta =
                    Math.min(
                        now -
                        this.lastTime,
                        50
                    );


                const deltaScale =
                    delta /
                    16.6667;


                this.lastTime = now;


                this.updateParticles(
                    deltaScale
                );


                this.draw();


                this.monitorFPS(now);


                this.animationId =
                    requestAnimationFrame(
                        time =>
                            this.animate(time)
                    );
            }
        }


        /* =====================================================
           index_new.html 集成逻辑
           主题（日/夜）、语言（中/EN）、底部提示
           —— 与全站既有 dark-mode / data-en/data-zh 体系打通
        ====================================================== */

        window.addEventListener(
            "DOMContentLoaded",
            () => {

                /* Particle */

                const canvas =
                    document.getElementById(
                        "particle-canvas"
                    );

                if (!canvas) {
                    return;
                }

                const system =
                    new ParticleSystem(canvas);


                /* =================================================
                   Theme：分段开关 ⇄ 全站 dark-mode / light-mode
                ================================================= */

                const themeOptions =
                    document.querySelectorAll(
                        ".theme-option"
                    );


                function applyTheme(theme, persist) {

                    const isNight =
                        theme === "night";

                    // 全站旧体系使用的类名
                    document.body.classList.toggle(
                        "dark-mode",
                        isNight
                    );

                    document.body.classList.toggle(
                        "light-mode",
                        !isNight
                    );

                    // 新导航毛玻璃配色变量
                    document.body.classList.toggle(
                        "dark-ui",
                        isNight
                    );

                    themeOptions.forEach(
                        item =>
                            item.classList.toggle(
                                "active",
                                (
                                    item.dataset.theme ===
                                    "night"
                                ) === isNight
                            )
                    );

                    system.setTheme(
                        isNight ? "night" : "day"
                    );

                    if (persist) {
                        localStorage.setItem(
                            "theme",
                            isNight
                                ? "dark-mode"
                                : "light-mode"
                        );
                    }
                }


                themeOptions.forEach(
                    option => {

                        option.addEventListener(
                            "click",
                            () => {
                                applyTheme(
                                    option.dataset.theme,
                                    true
                                );
                            }
                        );
                    }
                );


                /*
                    初始主题：
                    优先用户保存的偏好，
                    否则按时间判断（6:00-18:00 日间）
                */

                const savedTheme =
                    localStorage.getItem("theme");

                const currentHour =
                    new Date().getHours();

                const initialTheme =
                    savedTheme
                        ? (
                            savedTheme === "dark-mode"
                                ? "night"
                                : "day"
                        )
                        : (
                            (
                                currentHour >= 6 &&
                                currentHour <= 18
                            )
                                ? "day"
                                : "night"
                        );

                applyTheme(initialTheme, false);


                /* =================================================
                   Language：分段开关 ⇄ 全站 data-en / data-zh
                ================================================= */

                const languageOptions =
                    document.querySelectorAll(
                        ".language-option"
                    );


                function syncLanguageOptions(lang) {

                    languageOptions.forEach(
                        item =>
                            item.classList.toggle(
                                "active",
                                item.dataset.lang === lang
                            )
                    );
                }


                languageOptions.forEach(
                    option => {

                        option.addEventListener(
                            "click",
                            () => {

                                const newLang =
                                    option.dataset.lang;

                                const currentLang =
                                    document.body.classList
                                        .contains("en")
                                        ? "en"
                                        : "zh";

                                if (
                                    newLang === currentLang
                                ) {
                                    return;
                                }


                                document.body.classList
                                    .remove(currentLang);

                                document.body.classList
                                    .add(newLang);

                                document.documentElement
                                    .setAttribute(
                                        "lang",
                                        newLang
                                    );

                                syncLanguageOptions(
                                    newLang
                                );


                                /*
                                    引言文本与字体
                                    （沿用旧 language.js 的逻辑）
                                */

                                const quoteEl =
                                    document.querySelector(
                                        ".quote-text"
                                    );

                                if (quoteEl) {

                                    quoteEl.textContent =
                                        newLang === "en"
                                            ? "Think less, and happiness will chase after you!"
                                            : "只要想的少 快乐追着跑！";

                                    if (
                                        typeof applyQuoteFont ===
                                        "function"
                                    ) {
                                        applyQuoteFont();
                                    }
                                }


                                /*
                                    更新所有
                                    data-en / data-zh 元素
                                */

                                if (
                                    typeof updateAllLanguageElements ===
                                    "function"
                                ) {
                                    updateAllLanguageElements(
                                        newLang
                                    );
                                }


                                /*
                                    最新文章卡片的
                                    “阅读更多”链接带箭头图标，
                                    textContent 覆盖后需补回
                                */

                                document
                                    .querySelectorAll(
                                        ".latest-article-card .latest-article-link"
                                    )
                                    .forEach(link => {

                                        const text =
                                            link.getAttribute(
                                                "data-" +
                                                newLang
                                            ) ||
                                            link.textContent;

                                        link.innerHTML =
                                            text +
                                            ' <i class="fas fa-arrow-right"></i>';
                                    });


                                localStorage.setItem(
                                    "language",
                                    newLang
                                );

                                window.dispatchEvent(
                                    new CustomEvent(
                                        "sitewide-language-change",
                                        {
                                            detail: {
                                                lang: newLang
                                            }
                                        }
                                    )
                                );


                                /*
                                    问候语打字机重放
                                    （替代旧 #lang-toggle
                                    上挂载的重放逻辑）
                                */

                                const greetingEl =
                                    document.querySelector(
                                        ".greeting"
                                    );

                                if (
                                    greetingEl &&
                                    typeof getGreeting ===
                                        "function" &&
                                    typeof typeWriter ===
                                        "function"
                                ) {

                                    const greetings =
                                        getGreeting();

                                    greetingEl.setAttribute(
                                        "data-zh",
                                        greetings.zh
                                    );

                                    greetingEl.setAttribute(
                                        "data-en",
                                        greetings.en
                                    );

                                    typeWriter(
                                        greetingEl,
                                        newLang === "en"
                                            ? greetings.en
                                            : greetings.zh,
                                        100
                                    );
                                }
                            }
                        );
                    }
                );


                /*
                    language.js 已根据保存的偏好
                    设置好 body 语言类，
                    这里同步分段按钮的选中态
                */

                syncLanguageOptions(
                    document.body.classList.contains("en")
                        ? "en"
                        : "zh"
                );


                /* =================================================
                   Hint：滚动后淡出，回到顶部再显示
                ================================================= */

                const hint =
                    document.querySelector(".hint");

                if (hint) {

                    const syncHint = () => {

                        hint.classList.toggle(
                            "is-hidden",
                            window.pageYOffset > 60
                        );
                    };

                    window.addEventListener(
                        "scroll",
                        syncHint,
                        { passive: true }
                    );

                    syncHint();
                }
            }
        );
