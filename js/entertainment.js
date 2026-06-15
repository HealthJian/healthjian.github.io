(function () {
    function getVisibleCount(selector) {
        return Array.from(document.querySelectorAll(selector)).filter(function (item) {
            return item.style.display !== 'none';
        }).length;
    }

    function syncEntertainmentCounts() {
        var fictionCount = document.getElementById('fiction-count');
        if (fictionCount) {
            fictionCount.textContent = getVisibleCount('#fiction-grid .book-card-enhanced');
        }

        var galleryCount = document.getElementById('gallery-count');
        if (galleryCount) {
            galleryCount.textContent = getVisibleCount('#gallery-list .gallery-row');
        }
    }

    function setupSimpleSearch(inputId, itemSelector) {
        var input = document.getElementById(inputId);
        if (!input) return;

        var applySearch = function () {
            var term = input.value.trim().toLowerCase();
            document.querySelectorAll(itemSelector).forEach(function (item) {
                var haystack = [
                    item.dataset.search || '',
                    item.textContent || ''
                ].join(' ').toLowerCase();
                item.style.display = !term || haystack.indexOf(term) >= 0 ? '' : 'none';
            });
            syncEntertainmentCounts();
        };

        input.addEventListener('input', applySearch);
        applySearch();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupSimpleSearch('fiction-search', '#fiction-grid .book-card-enhanced');
        setupSimpleSearch('gallery-search', '#gallery-list .gallery-row');
        syncEntertainmentCounts();
    });

    window.addEventListener('sitewide-language-change', syncEntertainmentCounts);
})();
