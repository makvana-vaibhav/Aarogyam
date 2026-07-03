const iconPaths = {
  "arrow-right": '<path d="M5 12h14"></path><path d="m13 5 7 7-7 7"></path>',
  check: '<path d="m20 6-11 11-5-5"></path>',
  "shield-check": '<path d="M12 21s7-4.35 7-10V6l-7-3-7 3v5c0 5.65 7 10 7 10Z"></path><path d="m9 12 2 2 4-4"></path>',
  "qr-code": '<rect x="3" y="3" width="5" height="5" rx="1"></rect><rect x="16" y="3" width="5" height="5" rx="1"></rect><rect x="3" y="16" width="5" height="5" rx="1"></rect><path d="M13 4h1v1"></path><path d="M13 9h6"></path><path d="M13 13h1v1"></path><path d="M13 18h6"></path><path d="M18 13h1v1"></path><path d="M18 18h1v1"></path>',
  "file-text": '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"></path><path d="M14 2v5h5"></path><path d="M9 13h6"></path><path d="M9 17h6"></path><path d="M9 9h2"></path>',
  pill: '<path d="M10.5 20.5 3.5 13.5a5.5 5.5 0 0 1 0-7.8l2.2-2.2a5.5 5.5 0 0 1 7.8 0l7 7a5.5 5.5 0 0 1 0 7.8l-2.2 2.2a5.5 5.5 0 0 1-7.8 0Z"></path><path d="M8 8l8 8"></path>',
  clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
  cloud: '<path d="M18 16.5a4.5 4.5 0 0 0-.8-8.93A7 7 0 0 0 4.5 10.5a4.5 4.5 0 0 0 1.5 8.7h12.5"></path>',
  "id-card": '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M7 8h6"></path><path d="M7 12h10"></path><path d="M7 16h4"></path>',
  "user-plus": '<path d="M15 19a6 6 0 0 0-12 0"></path><circle cx="9" cy="8" r="4"></circle><path d="M19 8v6"></path><path d="M16 11h6"></path>',
  stethoscope: '<path d="M6 3v6a6 6 0 0 0 12 0V3"></path><path d="M6 9a6 6 0 0 0 12 0"></path><path d="M12 15v3a4 4 0 0 0 4 4"></path><path d="M16 22a2 2 0 1 0 0-4"></path>',
  globe: '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a15 15 0 0 1 0 18"></path><path d="M12 3a15 15 0 0 0 0 18"></path>',
  lock: '<rect x="4" y="11" width="16" height="9" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path>',
  star: '<path d="m12 2 2.9 5.9 6.5.9-4.7 4.5 1.1 6.4L12 16.6 6.2 19.7l1.1-6.4L2.6 8.8l6.5-.9L12 2Z"></path>',
  sparkles: '<path d="M12 2l1.4 5.1L18.5 8.5l-5.1 1.4L12 15l-1.4-5.1L5.5 8.5l5.1-1.4L12 2Z"></path><path d="M19 13l.8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8L19 13Z"></path>',
  play: '<path d="M8 5v14l12-7-12-7Z"></path>',
  menu: '<path d="M4 7h16"></path><path d="M4 12h16"></path><path d="M4 17h16"></path>',
  x: '<path d="M18 6 6 18"></path><path d="M6 6l12 12"></path>',
  "chevron-down": '<path d="m6 9 6 6 6-6"></path>',
};

function createIcon(name) {
  const markup = iconPaths[name];
  if (!markup) {
    return '';
  }

  return `<svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${markup}</svg>`;
}

function hydrateIcons() {
  document.querySelectorAll('[data-icon]').forEach((node) => {
    const name = node.getAttribute('data-icon');
    node.innerHTML = createIcon(name);
  });
}

function setupHeader() {
  const header = document.querySelector('[data-header]');
  const onScroll = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function setupMobileMenu() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (!toggle || !menu) {
    return;
  }

  const setOpen = (isOpen) => {
    toggle.setAttribute('aria-expanded', String(isOpen));
    menu.hidden = !isOpen;
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('click', (event) => {
    if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) {
      setOpen(false);
    }
  });
}

function setupFaq() {
  const faq = document.querySelector('[data-faq]');
  if (!faq) {
    return;
  }

  const items = Array.from(faq.querySelectorAll('.faq-item'));

  const setOpenItem = (itemToOpen) => {
    items.forEach((item) => {
      const button = item.querySelector('.faq-button');
      const isOpen = item === itemToOpen;
      item.classList.toggle('is-open', isOpen);
      button?.setAttribute('aria-expanded', String(isOpen));
    });
  };

  items.forEach((item) => {
    const button = item.querySelector('.faq-button');
    button?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      setOpenItem(isOpen ? null : item);
    });
  });

  const initiallyOpen = items.find((item) => item.classList.contains('is-open')) || items[0] || null;
  if (initiallyOpen) {
    setOpenItem(initiallyOpen);
  }
}

function setupYear() {
  const year = document.querySelector('[data-year]');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  hydrateIcons();
  setupHeader();
  setupMobileMenu();
  setupFaq();
  setupYear();
});