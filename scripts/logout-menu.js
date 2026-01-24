document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('logoutMenu');
    const toggle = document.getElementById('logoutToggle');
    const panel = document.getElementById('logoutMenuPanel');
    const logoutButton = document.getElementById('logoutBtn');
    const closeButton = document.getElementById('logoutClose');

    if (!menu || !toggle || !panel || !logoutButton) {
        return;
    }

    logoutButton.addEventListener('click', () => {
        if (typeof logout === 'function') {
            logout();
        }
        closeMenu(menu, toggle);
    });

    if (closeButton) {
        closeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            closeMenu(menu, toggle);
        });
    }

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
        toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    document.addEventListener('click', (event) => {
        if (!menu.contains(event.target)) {
            closeMenu(menu, toggle);
        }
    });

    window.addEventListener('resize', () => closeMenu(menu, toggle));
});

function closeMenu(menu, toggle) {
    if (!menu || !toggle) {
        return;
    }
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
}
