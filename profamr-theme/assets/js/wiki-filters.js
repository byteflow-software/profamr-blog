/**
 * Wiki Filters JavaScript
 *
 * @package Prof_AMR_News
 * @since 2.0.0
 */

(function() {
    'use strict';

    /**
     * Category Filter
     */
    function initCategoryFilter() {
        const categorySelect = document.getElementById('wiki-category-filter');

        if (!categorySelect) {
            return;
        }

        categorySelect.addEventListener('change', function() {
            const selectedValue = this.value;
            if (selectedValue) {
                window.location.href = selectedValue;
            } else {
                // Return to wiki archive
                const wikiArchiveUrl = this.closest('form') ?
                    this.closest('form').action :
                    window.location.origin + '/wiki/';
                window.location.href = wikiArchiveUrl;
            }
        });
    }

    /**
     * Sort Filter
     */
    function initSortFilter() {
        const sortSelect = document.getElementById('wiki-sort-filter');

        if (!sortSelect) {
            return;
        }

        sortSelect.addEventListener('change', function() {
            const selectedSort = this.value;
            const url = new URL(window.location.href);

            // Parse sort value
            const [orderby, order] = selectedSort.split('-');

            url.searchParams.set('orderby', orderby);
            url.searchParams.set('order', order);

            window.location.href = url.toString();
        });
    }

    /**
     * View Toggle (Grid/List)
     */
    function initViewToggle() {
        const viewButtons = document.querySelectorAll('.view-toggle-btn');
        const articlesGrid = document.querySelector('.wiki-articles-grid');

        if (!viewButtons.length || !articlesGrid) {
            return;
        }

        // Load saved view preference
        const savedView = localStorage.getItem('wiki-view-preference') || 'grid';
        articlesGrid.setAttribute('data-view', savedView);

        viewButtons.forEach(btn => {
            if (btn.dataset.view === savedView) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Handle view toggle
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const view = this.dataset.view;

                // Update active state
                viewButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Update grid
                articlesGrid.setAttribute('data-view', view);

                // Save preference
                localStorage.setItem('wiki-view-preference', view);
            });
        });
    }

    /**
     * Apply Sort on Page Load
     */
    function applySortOnLoad() {
        const sortSelect = document.getElementById('wiki-sort-filter');

        if (!sortSelect) {
            return;
        }

        const url = new URL(window.location.href);
        const orderby = url.searchParams.get('orderby');
        const order = url.searchParams.get('order');

        if (orderby && order) {
            const sortValue = `${orderby}-${order}`;
            sortSelect.value = sortValue;
        }
    }

    /**
     * Initialize all functions
     */
    function init() {
        initCategoryFilter();
        initSortFilter();
        initViewToggle();
        applySortOnLoad();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
