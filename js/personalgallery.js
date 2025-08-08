/**
 * 个人画廊 - 光影折叠的诗篇 JavaScript
 * 实现门户效果、风箱式交互、Lightbox图片浏览器等功能
 */

class PersonalGallery {
    constructor() {
        this.currentLanguage = 'zh';
        this.currentTheme = 'light';
        this.isPortalActive = true;
        this.activePanel = null;
        this.lightboxActive = false;
        this.currentGallery = null;
        this.currentImageIndex = 0;
        
        // 图集数据结构 - 包含图片、标题、元数据和随笔内容
        this.galleryData = {
            urban: {
                title: { zh: '都市夜景', en: 'Urban Nights' },
                metadata: { zh: '拍摄日期：2024-12-15 | 分类：城市摄影', en: 'Date: 2024-12-15 | Category: Urban Photography' },
                prose: {
                    zh: `夜幕降临，城市开始展现它最迷人的一面。霓虹灯如同星河般闪烁，将黑暗撕裂成无数光影的碎片。我站在天台上，感受着这座城市的脉搏，每一盏灯都诉说着一个故事。

高楼大厦如同钢铁巨人般耸立，它们的窗户闪烁着温暖的光芒，那是千万个家庭的温馨时刻。车流在街道上汇成光的河流，红色的尾灯和白色的前灯编织着城市的血管。

这就是现代文明的诗篇，用光与影书写，用钢筋混凝土构筑。在这喧嚣与宁静交织的夜晚，我找到了属于都市的独特美学——冷峻中带着温暖，繁忙中透着诗意。

每一次快门的按下，都是对这座城市的深情告白。因为我知道，在这些光影背后，是无数个平凡而伟大的生命，他们共同编织着这座城市的梦想。`,
                    en: `As night falls, the city begins to reveal its most enchanting side. Neon lights flicker like a galaxy, tearing the darkness into countless fragments of light and shadow. Standing on the rooftop, I feel the pulse of this city, where every light tells a story.

Skyscrapers stand like steel giants, their windows glowing with warm light - moments of warmth from millions of families. Traffic flows form rivers of light on the streets, red taillights and white headlights weaving the city's veins.

This is the poetry of modern civilization, written with light and shadow, constructed with steel and concrete. In this night where noise and tranquility interweave, I found the unique aesthetics of the urban - warmth within coldness, poetry within busyness.

Each click of the shutter is a passionate confession to this city. Because I know that behind these lights and shadows are countless ordinary yet great lives, together weaving the dreams of this city.`
                },
                images: [
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/hero1.jpg', alt: '都市夜景1' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/hero2.jpg', alt: '都市夜景2' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/hero3.jpg', alt: '都市夜景3' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/hero4.jpg', alt: '都市夜景4' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/hero5.jpg', alt: '都市夜景5' }
                ]
            },
            mountain: {
                title: { zh: '山川之诗', en: 'Mountain\'s Poem' },
                metadata: { zh: '拍摄日期：2024-11-20 | 分类：自然风光', en: 'Date: 2024-11-20 | Category: Nature Photography' },
                prose: {
                    zh: `山川是大地的诗行，每一座峰峦都是自然写下的华章。清晨的第一缕阳光穿透云层，为群山披上金色的纱衣。我背着相机，踏着露水，追寻着光与影在山间的舞蹈。

云海翻腾，如同天地间的画卷徐徐展开。远山如黛，近峰如屏，层次分明的轮廓在晨光中显得格外清晰。微风拂过，带来山间特有的清香，那是泥土、青草和花朵的混合气息。

站在山巅，俯瞰脚下的万里河山，心中涌起的是对自然的敬畏和感动。这些亘古不变的山峦见证了多少岁月的变迁，它们静默地矗立着，用自己的方式诠释着永恒的美。

在这里，时间仿佛静止了。只有快门声在山谷中轻柔地回响，记录下这份来自大自然的馈赠。每一张照片都是与山川的对话，每一次呼吸都是与天地的交融。`,
                    en: `Mountains are the poetry of the earth, each peak a verse written by nature. The first ray of morning light pierces through the clouds, draping the mountains in golden veils. With my camera on my back, stepping through dewdrops, I chase the dance of light and shadow among the peaks.

Sea of clouds rolls like a scroll slowly unfolding between heaven and earth. Distant mountains like ink wash, nearby peaks like screens, their layered silhouettes particularly clear in the morning light. A gentle breeze carries the unique fragrance of the mountains - a blend of earth, grass, and flowers.

Standing at the summit, overlooking the vast landscape below, my heart fills with awe and emotion for nature. These eternal mountains have witnessed countless changes through the ages, standing silently, interpreting eternal beauty in their own way.

Here, time seems to stand still. Only the gentle echo of the shutter in the valley, recording this gift from nature. Each photograph is a dialogue with the mountains, each breath a communion with heaven and earth.`
                },
                images: [
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/mountains.avif', alt: '山川之诗1' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/lake.avif', alt: '山川之诗2' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/river-greenmountain.avif', alt: '山川之诗3' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/countryside.avif', alt: '山川之诗4' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/colorfulcountryside.avif', alt: '山川之诗5' }
                ]
            },
            azure: {
                title: { zh: '蔚蓝天际', en: 'Azure Sky' },
                metadata: { zh: '拍摄日期：2024-10-05 | 分类：天空摄影', en: 'Date: 2024-10-05 | Category: Sky Photography' },
                prose: {
                    zh: `天空是世界上最大的画布，每一天都在上面绘制着不同的杰作。蔚蓝如洗的苍穹下，白云如棉絮般轻柔地飘浮，它们变幻着形状，诉说着风的故事。

我喜欢仰望天空的时刻，那种无边无际的感觉让人心胸开阔。阳光透过云层洒下来，形成一道道金色的光柱，仿佛是天堂通往人间的阶梯。云朵的阴影在大地上游走，为单调的景色增添了动态的美感。

黄昏时分，天空更是美得令人窒息。橙红色的晚霞如火焰般燃烧，将整个天际染成一片绚烂。这时的云彩不再是白色，而是被夕阳染成了玫瑰金，如同天使的羽翼般轻盈美丽。

每一次举起相机拍摄天空，都是在捕捉时间的片段。因为天空的美是瞬息万变的，错过了这一刻，也许就再也不会有相同的景象。这就是天空摄影的魅力所在——永远充满惊喜，永远值得期待。`,
                    en: `The sky is the world's largest canvas, painting different masterpieces every day. Under the azure dome, white clouds float as softly as cotton, changing shapes and telling the stories of the wind.

I love those moments of gazing up at the sky, that boundless feeling opens up the heart. Sunlight filters through the clouds, forming golden pillars of light, like ladders from heaven to earth. The shadows of clouds wander across the land, adding dynamic beauty to monotonous scenery.

At dusk, the sky becomes breathtakingly beautiful. Orange-red sunset glows burn like flames, dyeing the entire horizon in brilliance. The clouds are no longer white but painted rose-gold by the setting sun, light and beautiful like angel's wings.

Each time I raise my camera to photograph the sky, I'm capturing fragments of time. Because the beauty of the sky is ever-changing - miss this moment, and perhaps the same scene will never appear again. This is the charm of sky photography - always full of surprises, always worth anticipating.`
                },
                images: [
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/bluesky.avif', alt: '蔚蓝天际1' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/sky-star.avif', alt: '蔚蓝天际2' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/vast-universe.avif', alt: '蔚蓝天际3' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/astronomy.avif', alt: '蔚蓝天际4' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/comfortable.avif', alt: '蔚蓝天际5' }
                ]
            },
            street: {
                title: { zh: '人间烟火', en: 'Street Life' },
                metadata: { zh: '拍摄日期：2024-09-12 | 分类：纪实摄影', en: 'Date: 2024-09-12 | Category: Documentary Photography' },
                prose: {
                    zh: `人间烟火是最温暖的光，它不在高楼大厦的霓虹里，而在街头巷尾的平凡生活中。清晨的包子铺里热气腾腾，老板娘熟练地包着包子，脸上带着朴实的笑容。这就是生活的真谛——简单而美好。

我走过熙熙攘攘的菜市场，听着小贩们的叫卖声，看着人们为了生活忙碌的身影。一位老爷爷推着三轮车卖糖葫芦，孩子们围着他转，眼中闪烁着纯真的光芒。这些平凡的瞬间，却是最珍贵的人间风景。

黄昏时分，小巷里亮起了温暖的灯光。一家小面馆里，食客们围坐在桌旁，享受着热腾腾的面条。老板在灶台前忙碌着，偶尔和熟客聊上几句，那种人与人之间的温情，是城市里最美的画面。

这就是我要记录的人间烟火——不是什么惊天动地的大事，而是这些看似平凡却充满温情的生活片段。因为正是这些细微的美好，构成了我们生活的全部意义。`,
                    en: `The warmth of human life is the most comforting light, not found in the neon of skyscrapers, but in the ordinary life of streets and alleys. In the morning steamed bun shop, steam rises while the proprietress skillfully wraps buns with a simple smile on her face. This is the essence of life - simple and beautiful.

I walk through the bustling market, listening to vendors' calls, watching people busy with their lives. An old man pushes a cart selling candied hawthorns, children gather around him, their eyes sparkling with innocent light. These ordinary moments are the most precious human scenery.

At dusk, warm lights illuminate the small alleys. In a little noodle shop, diners sit around tables enjoying steaming noodles. The owner bustles at the stove, occasionally chatting with regular customers - this warmth between people is the most beautiful scene in the city.

This is the human warmth I want to record - not earth-shattering events, but these seemingly ordinary yet heartwarming life fragments. Because it's these subtle beauties that constitute the entire meaning of our lives.`
                },
                images: [
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/renjianyanhuo.jpg', alt: '人间烟火1' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/my-country.avif', alt: '人间烟火2' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/quiet-road.avif', alt: '人间烟火3' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/yellow-road.avif', alt: '人间烟火4' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/yejing.jpg', alt: '人间烟火5' }
                ]
            },
            cyber: {
                title: { zh: '我的光影', en: 'My Light & Shadow' },
                metadata: { zh: '拍摄日期：2024-08-28 | 分类：个人创作', en: 'Date: 2024-08-28 | Category: Personal Creation' },
                prose: {
                    zh: `这是我的光影世界，一个属于我个人的创作空间。在这里，我不受任何规则的束缚，可以自由地表达内心的想法和感受。每一张照片都是我情感的延伸，每一个瞬间都承载着我的思考。

有时候，我会沉浸在一个人的世界里，享受那种宁静的美好。一杯咖啡，一本书，窗外的阳光斜斜地洒在桌面上，这样的时光简单却珍贵。我用镜头记录下这些私人的瞬间，它们构成了我生活的底色。

我喜欢捕捉光影的变化，喜欢观察事物在不同光线下的不同表情。一朵花在晨光中的娇艳，一片叶子在夕阳下的金黄，一只猫咪在窗台上的慵懒——这些都是我镜头下的主角。

这个系列没有特定的主题，它就像我的视觉日记一样，记录着我眼中的世界。也许有一天，当我回头看这些照片时，会想起那些美好的时光，想起那个曾经用心观察世界的自己。`,
                    en: `This is my world of light and shadow, a personal creative space that belongs to me. Here, I'm not bound by any rules and can freely express my inner thoughts and feelings. Each photograph is an extension of my emotions, each moment carries my contemplation.

Sometimes, I immerse myself in a world of solitude, enjoying that peaceful beauty. A cup of coffee, a book, sunlight slanting through the window onto the table - such moments are simple yet precious. I record these private moments with my lens, they form the undertone of my life.

I love capturing the changes of light and shadow, observing how things express differently under various lighting. A flower's beauty in morning light, a leaf's golden hue in sunset, a cat's laziness on the windowsill - these are all protagonists under my lens.

This series has no specific theme, it's like my visual diary, recording the world through my eyes. Perhaps one day, when I look back at these photos, I'll remember those beautiful times, remember the self who once observed the world with such care.`
                },
                images: [
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/cat.avif', alt: '我的光影1' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/cat1.avif', alt: '我的光影2' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/sleepgirlandcat.avif', alt: '我的光影3' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/new-cat-background.avif', alt: '我的光影4' },
                    { src: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/sexwoman.avif', alt: '我的光影5' }
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.bindEvents();
        this.initPortalState();
        this.updateLanguage();
        this.updateTheme();
    }
    
    bindEvents() {
        // 门户按钮事件
        const portalButton = document.getElementById('portalButton');
        if (portalButton) {
            portalButton.addEventListener('click', () => this.activateGallery());
        }
        
        // 语言切换
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }
        
        // 主题切换
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // 面板悬停事件
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.addEventListener('mouseenter', () => this.activatePanel(panel));
            panel.addEventListener('mouseleave', () => this.deactivatePanel(panel));
        });
        
        // 进入图集按钮事件
        const enterGalleryBtns = document.querySelectorAll('.enter-gallery-btn');
        enterGalleryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const galleryType = btn.getAttribute('data-gallery');
                this.openSplitViewModal(galleryType);
            });
        });
        
        // Split-View Modal事件
        this.bindSplitViewEvents();
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 窗口大小调整事件
        window.addEventListener('resize', () => this.handleResize());
    }
    
    bindSplitViewEvents() {
        const splitViewModal = document.getElementById('splitViewModal');
        const splitViewClose = document.getElementById('splitViewClose');
        const splitViewPrev = document.getElementById('splitViewPrev');
        const splitViewNext = document.getElementById('splitViewNext');
        const splitViewOverlay = document.querySelector('.split-view-overlay');
        
        if (splitViewClose) {
            splitViewClose.addEventListener('click', () => this.closeSplitViewModal());
        }
        
        if (splitViewPrev) {
            splitViewPrev.addEventListener('click', () => this.previousImage());
        }
        
        if (splitViewNext) {
            splitViewNext.addEventListener('click', () => this.nextImage());
        }
        
        if (splitViewOverlay) {
            splitViewOverlay.addEventListener('click', () => this.closeSplitViewModal());
        }
        
        // 阻止modal内容点击时关闭
        const splitViewContainer = document.querySelector('.split-view-container');
        if (splitViewContainer) {
            splitViewContainer.addEventListener('click', (e) => e.stopPropagation());
        }
        
        // 动态页脚功能
        this.initDynamicFooter();
    }
    
    initPortalState() {
        const galleryContainer = document.getElementById('galleryContainer');
        if (galleryContainer) {
            galleryContainer.classList.add('portal-state');
        }
    }
    
    activateGallery() {
        const portalOverlay = document.getElementById('portalOverlay');
        const galleryContainer = document.getElementById('galleryContainer');
        
        if (portalOverlay && galleryContainer) {
            // 淡出门户
            portalOverlay.classList.add('fade-out');
            
            setTimeout(() => {
                portalOverlay.style.display = 'none';
                this.isPortalActive = false;
                
                // 切换背景图片并显示面板标题
                this.switchToGalleryMode();
                
                // 显示画廊容器
                galleryContainer.classList.add('visible');
                
            }, 700);
        }
    }
    
    switchToGalleryMode() {
        const galleryContainer = document.getElementById('galleryContainer');
        const panels = document.querySelectorAll('.panel');
        
        if (galleryContainer) {
            galleryContainer.classList.remove('portal-state');
        }
        
        // 延迟显示标题，创造"解锁"效果
        setTimeout(() => {
            panels.forEach((panel, index) => {
                const title = panel.querySelector('.panel-title');
                if (title) {
                    setTimeout(() => {
                        title.classList.add('show');
                    }, index * 200);
                }
            });
        }, 500);
    }
    
    activatePanel(panel) {
        if (this.isPortalActive) return;
        
        // 移除其他面板的激活状态
        document.querySelectorAll('.panel').forEach(p => {
            if (p !== panel) {
                p.classList.remove('active');
            }
        });
        
        // 激活当前面板
        panel.classList.add('active');
        this.activePanel = panel;
        
        // 添加背景模糊效果给其他面板
        this.addBlurEffect(panel);
    }
    
    deactivatePanel(panel) {
        if (this.isPortalActive) return;
        
        // 延迟移除激活状态，避免鼠标快速移动时的闪烁
        setTimeout(() => {
            if (this.activePanel === panel) {
                panel.classList.remove('active');
                this.activePanel = null;
                this.removeBlurEffect();
            }
        }, 100);
    }
    
    addBlurEffect(activePanel) {
        document.querySelectorAll('.panel').forEach(panel => {
            if (panel !== activePanel) {
                panel.classList.add('blur-background');
            }
        });
    }
    
    removeBlurEffect() {
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('blur-background');
        });
    }
    
    openSplitViewModal(galleryType) {
        this.currentGallery = galleryType;
        this.currentImageIndex = 0;
        this.lightboxActive = true;
        
        const splitViewModal = document.getElementById('splitViewModal');
        if (splitViewModal) {
            splitViewModal.classList.add('active');
            document.body.classList.add('no-scroll');
            
            this.loadSplitViewContent();
            this.updateSplitViewImage();
        }
    }
    
    closeSplitViewModal() {
        const splitViewModal = document.getElementById('splitViewModal');
        if (splitViewModal) {
            splitViewModal.classList.remove('active');
            document.body.classList.remove('no-scroll');
            this.lightboxActive = false;
            this.currentGallery = null;
        }
    }
    
    loadSplitViewContent() {
        if (!this.currentGallery || !this.galleryData[this.currentGallery]) return;
        
        const galleryData = this.galleryData[this.currentGallery];
        
        // 更新标题
        const titleElement = document.getElementById('splitViewTitle');
        if (titleElement) {
            titleElement.textContent = galleryData.title[this.currentLanguage];
        }
        
        // 更新元数据
        const metadataElement = document.getElementById('splitViewMetadata');
        if (metadataElement) {
            metadataElement.textContent = galleryData.metadata[this.currentLanguage];
        }
        
        // 更新随笔内容
        const proseElement = document.getElementById('splitViewProse');
        if (proseElement) {
            proseElement.textContent = galleryData.prose[this.currentLanguage];
        }
        
        // 更新图片计数
        const totalImageNumElement = document.getElementById('totalImageNum');
        if (totalImageNumElement) {
            totalImageNumElement.textContent = galleryData.images.length;
        }
    }
    
    updateSplitViewImage() {
        if (!this.currentGallery || !this.galleryData[this.currentGallery]) return;
        
        const mainImage = document.getElementById('splitViewMainImage');
        const images = this.galleryData[this.currentGallery].images;
        
        if (mainImage && images[this.currentImageIndex]) {
            const currentImage = images[this.currentImageIndex];
            
            // 智能图片加载：优先CDN，失败时回退到本地
            this.loadImageWithFallback(mainImage, currentImage.src, currentImage.alt);
            
            // 更新图片计数显示
            const currentImageNumElement = document.getElementById('currentImageNum');
            if (currentImageNumElement) {
                currentImageNumElement.textContent = this.currentImageIndex + 1;
            }
        }
    }
    
    // 智能图片加载方法：CDN优先，本地回退
    loadImageWithFallback(imgElement, cdnSrc, alt) {
        // 从CDN路径生成本地路径
        const filename = cdnSrc.split('/').pop();
        const localSrc = `../../images/${filename}`;
        
        // 首先尝试CDN
        const testImg = new Image();
        testImg.onload = () => {
            imgElement.src = cdnSrc;
            imgElement.alt = alt;
            console.log(`✅ Modal CDN图片加载成功: ${filename}`);
        };
        testImg.onerror = () => {
            // CDN失败，使用本地图片
            imgElement.src = localSrc;
            imgElement.alt = alt;
            console.warn(`⚠️ Modal CDN失败，使用本地图片: ${filename}`);
        };
        testImg.src = cdnSrc;
    }
    
    previousImage() {
        if (!this.currentGallery || !this.galleryData[this.currentGallery]) return;
        
        const images = this.galleryData[this.currentGallery].images;
        this.currentImageIndex = (this.currentImageIndex - 1 + images.length) % images.length;
        this.updateSplitViewImage();
    }
    
    nextImage() {
        if (!this.currentGallery || !this.galleryData[this.currentGallery]) return;
        
        const images = this.galleryData[this.currentGallery].images;
        this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
        this.updateSplitViewImage();
    }
    
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
        document.body.setAttribute('data-lang', this.currentLanguage);
        this.updateLanguage();
        
        // 如果Split-View Modal处于活动状态，更新其内容
        if (this.lightboxActive && this.currentGallery) {
            this.loadSplitViewContent();
        }
    }
    
    updateLanguage() {
        const elements = document.querySelectorAll('[data-zh][data-en]');
        elements.forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });
        
        // 保存语言设置
        localStorage.setItem('gallery-language', this.currentLanguage);
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.updateTheme();
    }
    
    updateTheme() {
        document.body.className = document.body.className.replace(/light-mode|dark-mode/g, '');
        document.body.classList.add(`${this.currentTheme}-mode`);
        
        // 保存主题设置到localStorage
        localStorage.setItem('gallery-theme', this.currentTheme);
    }
    
    handleKeyDown(e) {
        if (!this.lightboxActive) return;
        
        switch (e.key) {
            case 'Escape':
                this.closeSplitViewModal();
                break;
            case 'ArrowLeft':
                this.previousImage();
                break;
            case 'ArrowRight':
                this.nextImage();
                break;
        }
    }
    
    // 初始化动态页脚功能
    initDynamicFooter() {
        const footer = document.querySelector('.main-footer');
        if (!footer) return;
        
        let footerTimeout;
        
        // 鼠标移动事件监听
        document.addEventListener('mousemove', (e) => {
            const windowHeight = window.innerHeight;
            const mouseY = e.clientY;
            
            // 当鼠标靠近底部时显示页脚
            if (mouseY > windowHeight - 100) {
                footer.classList.add('show');
                
                // 清除隐藏定时器
                if (footerTimeout) {
                    clearTimeout(footerTimeout);
                }
            } else {
                // 延迟隐藏页脚
                footerTimeout = setTimeout(() => {
                    footer.classList.remove('show');
                }, 1000);
            }
        });
        
        // 页脚悬停时保持显示
        footer.addEventListener('mouseenter', () => {
            if (footerTimeout) {
                clearTimeout(footerTimeout);
            }
            footer.classList.add('show');
        });
        
        footer.addEventListener('mouseleave', () => {
            footerTimeout = setTimeout(() => {
                footer.classList.remove('show');
            }, 500);
        });
    }
    
    handleResize() {
        // 在窗口大小变化时进行必要的调整
        if (this.lightboxActive) {
            this.updateSplitViewImage();
        }
    }
    
    // 从localStorage加载保存的设置
    loadSettings() {
        const savedTheme = localStorage.getItem('gallery-theme');
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
            this.currentTheme = savedTheme;
        }
        
        const savedLanguage = localStorage.getItem('gallery-language');
        if (savedLanguage && ['zh', 'en'].includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
        }
    }
    
    // 保存设置到localStorage
    saveSettings() {
        localStorage.setItem('gallery-theme', this.currentTheme);
        localStorage.setItem('gallery-language', this.currentLanguage);
    }
}

// 页面加载完成后初始化画廊
document.addEventListener('DOMContentLoaded', () => {
    const gallery = new PersonalGallery();
    
    // 添加一些额外的交互效果
    addInteractiveEffects();
});

// 添加额外的交互效果
function addInteractiveEffects() {
    // 鼠标跟踪效果
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // 为门户背景添加细微的视差效果
        const portalOverlay = document.getElementById('portalOverlay');
        if (portalOverlay && portalOverlay.style.display !== 'none') {
            const moveX = (mouseX - window.innerWidth / 2) * 0.01;
            const moveY = (mouseY - window.innerHeight / 2) * 0.01;
            portalOverlay.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });
    
    // 添加页面可见性检测，优化性能
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面不可见时暂停动画
            document.body.classList.add('paused');
        } else {
            // 页面可见时恢复动画
            document.body.classList.remove('paused');
        }
    });
    
    // 预加载图片
    preloadImages();
}

// 智能图片预加载函数 - CDN优先，本地回退
function preloadImages() {
    const imageConfigs = [
        {
            cdn: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/quiet-road.avif',
            local: '../../images/quiet-road.avif',
            panel: 'urban'
        },
        {
            cdn: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/mountains.avif',
            local: '../../images/mountains.avif',
            panel: 'mountain'
        },
        {
            cdn: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/sky-star.avif',
            local: '../../images/sky-star.avif',
            panel: 'azure'
        },
        {
            cdn: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/countryside.avif',
            local: '../../images/countryside.avif',
            panel: 'street'
        },
        {
            cdn: 'https://gcore.jsdelivr.net/gh/healthjian/healthjian.github.io@main/images/personal.avif',
            local: '../../images/personal.avif',
            panel: 'cyber'
        }
    ];
    
    imageConfigs.forEach(config => {
        // 首先尝试加载CDN图片
        const cdnImg = new Image();
        cdnImg.onload = () => {
            console.log(`✅ CDN图片加载成功: ${config.panel}`);
        };
        cdnImg.onerror = () => {
            console.warn(`⚠️ CDN图片加载失败，尝试本地图片: ${config.panel}`);
            // CDN失败时，强制使用本地图片
            const panel = document.querySelector(`.panel[data-panel="${config.panel}"]`);
            if (panel) {
                panel.style.backgroundImage = `url('${config.local}')`;
            }
            
            // 预加载本地图片
            const localImg = new Image();
            localImg.onload = () => {
                console.log(`✅ 本地图片加载成功: ${config.panel}`);
            };
            localImg.onerror = () => {
                console.error(`❌ 本地图片也加载失败: ${config.panel}`);
            };
            localImg.src = config.local;
        };
        cdnImg.src = config.cdn;
    });
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalGallery;
}