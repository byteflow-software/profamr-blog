/**
 * Main JavaScript File
 *
 * @package ProfAMR
 * @since 2.0.0
 */

(function() {
    'use strict';

    /**
     * Mobile Menu Toggle
     */
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navigation = document.querySelector('.main-navigation');

        if (!menuToggle || !navigation) {
            return;
        }

        menuToggle.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            navigation.classList.toggle('toggled');

            // Toggle icon
            const icon = this.querySelector('svg');
            if (navigation.classList.contains('toggled')) {
                icon.innerHTML = '<path d="M6 18L18 6M6 6l12 12"/>';
            } else {
                icon.innerHTML = '<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
                if (navigation.classList.contains('toggled')) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    navigation.classList.remove('toggled');
                }
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navigation.classList.contains('toggled')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                navigation.classList.remove('toggled');
                menuToggle.focus();
            }
        });
    }

    /**
     * Smooth Scroll for Anchor Links
     */
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip if it's just '#'
                if (href === '#') {
                    return;
                }

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Add class to header on scroll
     */
    function initStickyHeader() {
        const header = document.querySelector('.site-header');

        if (!header) {
            return;
        }

        let lastScroll = 0;

        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    }

    /**
     * Back to Top Button
     */
    function initBackToTop() {
        // Create button
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>';
        backToTop.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(backToTop);

        // Show/hide button
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        // Scroll to top
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .back-to-top {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 50px;
                height: 50px;
                background-color: var(--color-primary);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .back-to-top.visible {
                opacity: 1;
                visibility: visible;
            }
            .back-to-top:hover {
                background-color: var(--color-primary-dark);
                transform: translateY(-5px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Reading Progress Bar
     */
    function initReadingProgress() {
        // Only on single posts/pages
        if (!document.body.classList.contains('single') && !document.body.classList.contains('page')) {
            return;
        }

        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = (window.pageYOffset / documentHeight) * 100;

            progressBar.style.width = scrolled + '%';
        });

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .reading-progress {
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
                width: 0%;
                z-index: 9999;
                transition: width 0.2s ease;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Table of Contents Generator (for Wiki articles)
     */
    function initTableOfContents() {
        const content = document.querySelector('.wiki-content, .entry-content');

        if (!content) {
            return;
        }

        const headings = content.querySelectorAll('h2, h3');

        if (headings.length < 3) {
            return;
        }

        const toc = document.createElement('div');
        toc.className = 'table-of-contents';
        toc.innerHTML = '<h3>Table of Contents</h3><ul class="toc-list"></ul>';

        const tocList = toc.querySelector('.toc-list');

        headings.forEach((heading, index) => {
            // Add ID to heading if it doesn't have one
            if (!heading.id) {
                heading.id = 'heading-' + index;
            }

            const li = document.createElement('li');
            li.className = 'toc-item toc-' + heading.tagName.toLowerCase();

            const link = document.createElement('a');
            link.href = '#' + heading.id;
            link.textContent = heading.textContent;

            li.appendChild(link);
            tocList.appendChild(li);
        });

        // Insert TOC before first heading
        const firstHeading = content.querySelector('h2');
        if (firstHeading) {
            firstHeading.parentNode.insertBefore(toc, firstHeading);
        }

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .table-of-contents {
                background-color: var(--color-bg-alt);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: var(--spacing-lg);
                margin-bottom: var(--spacing-2xl);
            }
            .table-of-contents h3 {
                margin-top: 0;
                margin-bottom: var(--spacing-md);
                font-size: 1.25rem;
            }
            .toc-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .toc-item {
                margin-bottom: var(--spacing-sm);
            }
            .toc-item a {
                color: var(--color-text);
                text-decoration: none;
                transition: color var(--transition-fast);
            }
            .toc-item a:hover {
                color: var(--color-primary);
            }
            .toc-h3 {
                padding-left: var(--spacing-lg);
                font-size: 0.9em;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Code Block Copy Button
     */
    function initCodeCopyButtons() {
        const codeBlocks = document.querySelectorAll('pre code, .wp-block-code code');

        codeBlocks.forEach(codeBlock => {
            const pre = codeBlock.closest('pre') || codeBlock.parentElement;
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';

            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            const copyButton = document.createElement('button');
            copyButton.className = 'code-copy-btn';
            copyButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
            copyButton.title = 'Copy code';

            wrapper.appendChild(copyButton);

            copyButton.addEventListener('click', function() {
                const code = codeBlock.textContent;
                navigator.clipboard.writeText(code).then(() => {
                    copyButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
                    copyButton.classList.add('copied');

                    setTimeout(() => {
                        copyButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
                        copyButton.classList.remove('copied');
                    }, 2000);
                });
            });
        });

        // Add styles
        if (codeBlocks.length > 0) {
            const style = document.createElement('style');
            style.textContent = `
                .code-block-wrapper {
                    position: relative;
                }
                .code-copy-btn {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    padding: 0.5rem;
                    background-color: var(--color-bg);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity var(--transition-fast);
                }
                .code-copy-btn:hover {
                    opacity: 1;
                }
                .code-copy-btn.copied {
                    background-color: var(--color-secondary);
                    color: white;
                    border-color: var(--color-secondary);
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Initialize all functions when DOM is ready
     */
    function init() {
        initMobileMenu();
        initSmoothScroll();
        initStickyHeader();
        initBackToTop();
        initReadingProgress();
        initTableOfContents();
        initCodeCopyButtons();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

/**
 * Date/Time Display in Top Bar
 */
function initDateTime() {
    const dateTimeElement = document.getElementById('current-date-time');
    
    if (!dateTimeElement) {
        return;
    }

    function updateDateTime() {
        const now = new Date();
        const options = { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const dateTimeString = now.toLocaleDateString('pt-BR', options);
        dateTimeElement.textContent = dateTimeString;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// Add to init function
document.addEventListener('DOMContentLoaded', function() {
    initDateTime();
});

/**
 * Sidebar Process Guide Toggle
 */
function initSidebarToggle() {
    const toggles = document.querySelectorAll('.menu-item-toggle');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
            const submenu = this.nextElementSibling;
            if (submenu && submenu.classList.contains('sidebar-left-submenu')) {
                submenu.classList.toggle('active');
            }
        });
    });
}

// Update init
document.addEventListener('DOMContentLoaded', function() {
    initDateTime();
    initSidebarToggle();
});
