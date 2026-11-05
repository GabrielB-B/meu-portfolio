(() => {
    'use strict';

    const header = document.querySelector('[data-header]');
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const navigation = document.querySelector('[data-nav]');
    const brand = document.querySelector('.brand');
    const navLinks = [...document.querySelectorAll('[data-nav] a')];
    const sections = [...document.querySelectorAll('main section[id]')];
    const revealItems = [...document.querySelectorAll('[data-reveal]')];
    const pageContent = [document.querySelector('.skip-link'), document.querySelector('main'), document.querySelector('footer')].filter(Boolean);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const projectMediaButtons = [...document.querySelectorAll('[data-project-media]')];
    const imageViewer = document.querySelector('[data-image-viewer]');
    const imageViewerImage = document.querySelector('[data-image-viewer-image]');
    const imageViewerCaption = document.querySelector('[data-image-viewer-caption]');
    const imageViewerOpen = document.querySelector('[data-image-viewer-open]');
    const imageViewerClose = document.querySelector('[data-image-viewer-close]');

    const setHeaderState = () => {
        header?.classList.toggle('is-scrolled', window.scrollY > 24);
    };

    const closeMenu = ({ restoreFocus = false } = {}) => {
        if (!menuToggle || !navigation) return;

        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        navigation.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        pageContent.forEach((element) => { element.inert = false; });

        if (restoreFocus) menuToggle.focus();
    };

    const openMenu = () => {
        if (!menuToggle || !navigation) return;

        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Fechar menu');
        navigation.classList.add('is-open');
        document.body.classList.add('menu-open');
        pageContent.forEach((element) => { element.inert = true; });
        requestAnimationFrame(() => navigation.querySelector('a')?.focus());
    };

    menuToggle?.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) closeMenu();
        else openMenu();
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => closeMenu());
    });
    brand?.addEventListener('click', () => closeMenu());

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
            closeMenu({ restoreFocus: true });
        }

        if (event.key === 'Tab' && document.body.classList.contains('menu-open')) {
            const focusableMenuItems = [brand, menuToggle, ...navLinks].filter(Boolean);
            const firstItem = focusableMenuItems[0];
            const lastItem = focusableMenuItems.at(-1);

            if (event.shiftKey && document.activeElement === firstItem) {
                event.preventDefault();
                lastItem.focus();
            } else if (!event.shiftKey && document.activeElement === lastItem) {
                event.preventDefault();
                firstItem.focus();
            }
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeMenu();
    });

    const revealContent = () => {
        if (reduceMotion.matches || !('IntersectionObserver' in window)) {
            revealItems.forEach((item) => item.classList.add('is-visible'));
            return;
        }

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        revealItems.forEach((item) => revealObserver.observe(item));
    };

    const trackActiveSection = () => {
        if (!('IntersectionObserver' in window)) return;

        const sectionObserver = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visible) return;

            navLinks.forEach((link) => {
                const isCurrent = link.getAttribute('href') === `#${visible.target.id}`;
                if (isCurrent) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
        }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.01, 0.25] });

        sections.forEach((section) => sectionObserver.observe(section));
    };

    const openImageViewer = (trigger) => {
        if (!imageViewer || !imageViewerImage || !imageViewerCaption || !imageViewerOpen) return;

        const source = trigger.dataset.imageSrc;
        const description = trigger.dataset.imageAlt || 'Imagem ampliada do projeto';
        if (!source) return;

        imageViewerImage.src = source;
        imageViewerImage.alt = description;
        imageViewerImage.classList.remove('is-zoomed');
        imageViewerCaption.textContent = description;
        imageViewerOpen.href = source;
        document.body.classList.add('viewer-open');
        imageViewer.showModal();
        requestAnimationFrame(() => imageViewerClose?.focus());
    };

    projectMediaButtons.forEach((button) => {
        button.addEventListener('click', () => openImageViewer(button));
    });

    imageViewerClose?.addEventListener('click', () => imageViewer?.close());

    imageViewer?.addEventListener('click', (event) => {
        if (event.target === imageViewer) imageViewer.close();
    });

    imageViewer?.addEventListener('close', () => {
        document.body.classList.remove('viewer-open');
        imageViewerImage?.classList.remove('is-zoomed');
    });

    imageViewerImage?.addEventListener('click', () => {
        imageViewerImage.classList.toggle('is-zoomed');
    });

    const currentYear = document.querySelector('#current-year');
    if (currentYear) currentYear.textContent = String(new Date().getFullYear());

    setHeaderState();
    revealContent();
    trackActiveSection();

    window.addEventListener('scroll', setHeaderState, { passive: true });
})();
