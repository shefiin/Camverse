tailwind.config = {
    theme: {
    extend: {
        screens: {
        'tablet': '950px'  
        }
    }
    }
}

if (typeof window.IS_LOGGED_IN === 'undefined') {
  window.IS_LOGGED_IN = Boolean(document.querySelector('a[href="/logout"]'));
}

const toggleBtn = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');
const navbar = document.getElementById('navbar');

if (navbar) {
  const scrollLightAtRaw = navbar.dataset.scrollLightAt;
  const scrollLightAt = scrollLightAtRaw ? Number(scrollLightAtRaw) : NaN;

  if (Number.isFinite(scrollLightAt)) {
    const applyNavbarScrollTheme = () => {
      if (window.scrollY >= scrollLightAt) {
        navbar.classList.add('scrolled-light');
      } else {
        navbar.classList.remove('scrolled-light');
      }
    };

    window.addEventListener('scroll', applyNavbarScrollTheme, { passive: true });
    applyNavbarScrollTheme();
  }
}

if (toggleBtn && menu) {
  toggleBtn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
  });
}


const brandLink = document.getElementById('brand-link');
const brandsSubmenu = document.getElementById('brands-submenu');
if (brandLink && brandsSubmenu) {
  brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      brandsSubmenu.classList.toggle('hidden');
  });
}

const categoryLink = document.getElementById('category-link');
const categoriesSubmenu = document.getElementById('categories-submenu');
if (categoryLink && categoriesSubmenu) {
  categoryLink.addEventListener('click', (e) => {
      e.preventDefault();
      categoriesSubmenu.classList.toggle('hidden');
  });
}


const loginBtn = document.getElementById('login-click');
const dropdown = document.getElementById('login-dropdown');

if (loginBtn && dropdown) {
  loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
      const isClickInside = loginBtn.contains(e.target) || dropdown.contains(e.target);
      if (!isClickInside) {
          dropdown.classList.add('hidden');
      }
  });
}


const searchInput = document.getElementById('search-input');
const clearSearch = document.getElementById('clear-search');

function toggleClearButton() {
  if (searchInput.value.trim() !== '') {
    clearSearch.classList.remove('hidden');
  } else {
    clearSearch.classList.add('hidden');
  }
}

// Show/hide clear button on input
if (searchInput && clearSearch) {
  searchInput.addEventListener('input', toggleClearButton);

  // Also show clear button if page loads with a value
  window.addEventListener('DOMContentLoaded', toggleClearButton);

  // Clear input when clicking the X
  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    toggleClearButton();
  });
}




document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.nextElementSibling.classList.toggle('hidden');
      });
});

let navLoginRedirectInProgress = false;
let navLoginRedirectTimeout = null;

function clearNavLoginRedirectState() {
  navLoginRedirectInProgress = false;
  if (navLoginRedirectTimeout) {
    clearTimeout(navLoginRedirectTimeout);
    navLoginRedirectTimeout = null;
  }
  const banner = document.getElementById('login-redirect-banner');
  if (banner) {
    banner.remove();
  }
}

function ensureNavLoginBannerSpinnerStyle() {
  if (document.getElementById('login-banner-spinner-style')) return;
  const style = document.createElement('style');
  style.id = 'login-banner-spinner-style';
  style.textContent = `
    @keyframes loginBannerSpin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

function showNavLoginRedirectBanner(message) {
  ensureNavLoginBannerSpinnerStyle();
  let banner = document.getElementById('login-redirect-banner');

  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'login-redirect-banner';
    banner.className = 'fixed left-1/2 bg-black text-white px-5 py-3 shadow-md z-[9999]';
    banner.style.transform = 'translate(-50%, -140%)';
    banner.style.transition = 'transform 280ms ease';
    document.body.appendChild(banner);
  }

  const nav = document.getElementById('navbar');
  const navHeight = nav ? nav.offsetHeight : 64;
  banner.style.top = `${navHeight + 8}px`;

  banner.innerHTML = `
    <div class="flex items-center gap-2">
      <span
        style="
          display:inline-block;
          width:16px;
          height:16px;
          border-radius:999px;
          border:2px solid rgba(255,255,255,0.35);
          border-top-color:#fff;
          animation: loginBannerSpin 0.8s linear infinite;
        "
      ></span>
      <span>${message}</span>
    </div>
  `;

  banner.style.transform = 'translate(-50%, 0)';
}

function hideNavLoginRedirectBanner() {
  const banner = document.getElementById('login-redirect-banner');
  if (!banner) return;
  banner.style.transform = 'translate(-50%, -140%)';
}

function handleGuestCartClick(e) {
  if (window.IS_LOGGED_IN) return;
  const cartLink = e.target.closest('a[href="/cart"]');
  if (!cartLink) return;
  e.preventDefault();
  if (navLoginRedirectInProgress) return;

  navLoginRedirectInProgress = true;
  showNavLoginRedirectBanner('Please login first');
  setTimeout(() => hideNavLoginRedirectBanner(), 1200);
  navLoginRedirectTimeout = setTimeout(() => {
    clearNavLoginRedirectState();
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/login?error=Please%20login%20first&redirect=${encodeURIComponent(returnTo)}`;
  }, 2000);
}

document.addEventListener('click', handleGuestCartClick);
window.addEventListener('pageshow', clearNavLoginRedirectState);
window.addEventListener('pagehide', clearNavLoginRedirectState);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    clearNavLoginRedirectState();
  }
});
