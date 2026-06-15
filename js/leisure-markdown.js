(function () {
    function ensureLightbox() {
        var existing = document.querySelector('.leisure-lightbox');
        if (existing) return existing;

        var overlay = document.createElement('div');
        overlay.className = 'leisure-lightbox';
        overlay.innerHTML = [
            '<button type="button" aria-label="Close image preview">&times;</button>',
            '<figure>',
            '<img alt="">',
            '<figcaption></figcaption>',
            '</figure>'
        ].join('');

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay || event.target.tagName === 'BUTTON') {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && overlay.classList.contains('active')) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        document.body.appendChild(overlay);
        return overlay;
    }

    window.setupLeisureMarkdownEnhancements = function (container) {
        if (!container) return;

        container.querySelectorAll('img').forEach(function (img) {
            if (img.dataset.leisureEnhanced === 'true') return;
            img.dataset.leisureEnhanced = 'true';
            img.classList.add('leisure-zoomable');

            img.addEventListener('click', function () {
                var overlay = ensureLightbox();
                var preview = overlay.querySelector('img');
                var caption = overlay.querySelector('figcaption');
                var figureCaption = img.closest('.md-figure')?.querySelector('.md-caption');
                preview.src = img.currentSrc || img.src;
                preview.alt = img.alt || '';
                caption.textContent = figureCaption ? figureCaption.textContent.trim() : (img.title || img.alt || '');
                caption.style.display = caption.textContent ? 'block' : 'none';
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
    };
})();
