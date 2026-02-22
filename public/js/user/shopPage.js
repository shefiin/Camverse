
if (window.tailwind) {
  tailwind.config = {
    theme: {
      extend: {
        screens: {
          'tablet': '800px',
          'xs': '610px',
          'sm2': '800px',
          'md2': '1201px',
          'lg2': '1321px',
        }
      }
    },
  };
}

if (typeof window.IS_LOGGED_IN === "undefined") {
  window.IS_LOGGED_IN = Boolean(document.querySelector('a[href="/logout"]'));
}

const toggleBtn = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

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


const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const clearSearch = document.getElementById('clear-search');
let searchVisible = false;

if (searchToggle && searchBar) {
  searchToggle.addEventListener('click', () => {
      searchVisible = !searchVisible;
      if (searchVisible) {
          searchBar.classList.remove('w-0', 'opacity-0');
          searchBar.classList.add('w-[250px]', 'tablet:w-[500px]', 'opacity-100');
      } else {
          searchBar.classList.remove('w-[250px]', 'tablet:w-[500px]', 'opacity-100');
          searchBar.classList.add('w-0', 'opacity-0');
      }
  });
}

document.addEventListener('click', (e) => {
    if(searchVisible && searchBar && searchToggle && !searchBar.contains(e.target) && !searchToggle.contains(e.target)) {
        searchVisible = false;
        searchBar.classList.remove('w-[250px]', 'tablet:w-[500px]', 'opacity-100');
        searchBar.classList.add('w-0', 'opacity-0');
    }
})


if (searchInput && clearSearch) {
  searchInput.addEventListener('input', () => {
      if (searchInput.value.trim() !== "") {
          clearSearch.classList.remove('hidden');
      } else {
          clearSearch.classList.add('hidden');
      }
  });
}




document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.nextElementSibling.classList.toggle('hidden');
      });
});       

const sortButton = document.getElementById('sortButton');
const sortMenu = document.getElementById('sortMenu');

if (sortButton && sortMenu) {
  sortButton.addEventListener('click', (e) => {
    e.preventDefault();
    sortMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!sortButton.contains(e.target) && !sortMenu.contains(e.target)) {
      sortMenu.classList.add('hidden');
    }
  });

  sortMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      sortMenu.classList.add('hidden');
    });
  });
}


function showWishlistToast(message) {
  let toast = document.getElementById('wishlist-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'wishlist-toast';
    toast.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-3 shadow-lg opacity-0 translate-y-10 transition-all duration-500 z-[9999]';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.remove('opacity-0', 'translate-y-10');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-10');
  }, 2000);
}

let loginRedirectInProgress = false;
let loginRedirectTimeout = null;
function clearLoginRedirectState() {
  loginRedirectInProgress = false;
  if (loginRedirectTimeout) {
    clearTimeout(loginRedirectTimeout);
    loginRedirectTimeout = null;
  }
  const banner = document.getElementById('login-redirect-banner');
  if (banner) {
    banner.remove();
  }
}

function ensureLoginBannerSpinnerStyle() {
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

function showLoginRedirectBanner(message) {
  ensureLoginBannerSpinnerStyle();
  let banner = document.getElementById('login-redirect-banner');

  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'login-redirect-banner';
    banner.className = 'fixed left-1/2 bg-black text-white px-5 py-3 shadow-md z-[9999]';
    banner.style.transform = 'translate(-50%, -140%)';
    banner.style.transition = 'transform 280ms ease';
    document.body.appendChild(banner);
  }

  const navbar = document.getElementById('navbar');
  const navbarHeight = navbar ? navbar.offsetHeight : 64;
  banner.style.top = `${navbarHeight + 8}px`;

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

function hideLoginRedirectBanner() {
  const banner = document.getElementById('login-redirect-banner');
  if (!banner) return;
  banner.style.transform = 'translate(-50%, -140%)';
}

function triggerLoginRedirectPopup() {
  if (loginRedirectInProgress) return;
  loginRedirectInProgress = true;
  showLoginRedirectBanner('Please login first');
  setTimeout(() => {
    hideLoginRedirectBanner();
  }, 1200);
  loginRedirectTimeout = setTimeout(() => {
    clearLoginRedirectState();
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/login?error=Please%20login%20first&redirect=${encodeURIComponent(returnTo)}`;
  }, 2000);
}

async function toggleWishlist(button) {
  const productId = button.dataset.productId;
  const isInWishlist = button.classList.contains('text-rose-500');

  if (!productId) return;

  if (!window.IS_LOGGED_IN) {
    triggerLoginRedirectPopup();
    return;
  }

  const endpoint = isInWishlist ? `/wishlist/remove/${productId}` : '/wishlist/add';
  const method = isInWishlist ? 'PATCH' : 'POST';
  const payload = { productId, redirectTo: `${window.location.pathname}${window.location.search}` };

  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (response.redirected && response.url) {
        window.location.href = response.url;
        return;
      }
      showWishlistToast('Please login to use wishlist');
      return;
    }

    const result = await response.json();

    if (!response.ok || !result.success) {
      showWishlistToast('Could not update wishlist');
      return;
    }

    if (result.inWishlist) {
      button.classList.add('text-rose-500');
      button.classList.remove('text-gray-200', 'hover:text-gray-300');
      showWishlistToast(result.status === 'exists' ? 'Already in wishlist' : 'Added to wishlist');
    } else {
      button.classList.remove('text-rose-500');
      button.classList.add('text-gray-200', 'hover:text-gray-300');
      showWishlistToast('Removed from wishlist');
    }
  } catch (error) {
    console.error('Wishlist toggle failed:', error);
    showWishlistToast('Could not update wishlist');
  }
}

document.querySelectorAll('.wishlist-btn').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(button);
  });
});

window.addEventListener('pageshow', () => {
  clearLoginRedirectState();
});

window.addEventListener('pagehide', () => {
  clearLoginRedirectState();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    clearLoginRedirectState();
  }
});

document.addEventListener('click', (e) => {
  if (window.IS_LOGGED_IN) return;
  const cartLink = e.target.closest('a[href="/cart"]');
  if (!cartLink) return;
  e.preventDefault();
  triggerLoginRedirectPopup();
});

const filterDrawer = document.getElementById('filterDrawer');
const filterBtn = document.getElementById('filterBtn');
const closeFilterBtn = document.getElementById('closeFilterBtn');
const sortDrawer = document.getElementById('sortDrawer');
const sortBtn = document.getElementById('sortBtn');
const closeSortBtn = document.getElementById('closeSortBtn');
const applySortBtn = document.getElementById('applySortBtn');
const clearSortBtn = document.getElementById('clearSortBtn');
const clearFilterBtn = document.getElementById('clearFilterBtn');
const mobileFilterForm = document.getElementById('mobileFilterForm');

let isDrawerOpen = false;
let isSortDrawerOpen = false;


if (filterBtn && filterDrawer) {
  filterBtn.addEventListener('click', () => {
    isDrawerOpen = true;
    isSortDrawerOpen = false;
    sortDrawer?.classList.add('hidden');
    if (window.innerWidth < 768) {
      filterDrawer.classList.remove('hidden');
      document.getElementById('brandContent')?.classList.remove('hidden');
      document.getElementById('categoryContent')?.classList.add('hidden');
      document.getElementById('priceContent')?.classList.add('hidden');
    }
  });
}

if (sortBtn && sortDrawer) {
  sortBtn.addEventListener('click', () => {
    isSortDrawerOpen = true;
    isDrawerOpen = false;
    filterDrawer?.classList.add('hidden');
    if (window.innerWidth < 768) {
      sortDrawer.classList.remove('hidden');
    }
  });
}

if (closeFilterBtn && filterDrawer) {
  closeFilterBtn.addEventListener('click', () => {
    isDrawerOpen = false;
    filterDrawer.classList.add('hidden');
  });
}

if (closeSortBtn && sortDrawer) {
  closeSortBtn.addEventListener('click', () => {
    isSortDrawerOpen = false;
    sortDrawer.classList.add('hidden');
  });
}

if (applySortBtn) {
  applySortBtn.addEventListener('click', () => {
    const selected = document.querySelector('input[name="mobileSort"]:checked');
    const params = new URLSearchParams(window.location.search);
    params.delete('page');
    if (selected && selected.value) {
      params.set('sort', selected.value);
    } else {
      params.delete('sort');
    }
    const query = params.toString();
    window.location.href = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  });
}

if (clearSortBtn) {
  clearSortBtn.addEventListener('click', () => {
    const relevance = document.querySelector('input[name="mobileSort"][value=""]');
    if (relevance) relevance.checked = true;
  });
}

if (clearFilterBtn && mobileFilterForm) {
  clearFilterBtn.addEventListener('click', () => {
    mobileFilterForm.querySelectorAll('input[type="checkbox"]').forEach((el) => {
      el.checked = false;
    });
  });
}


function handleResize() {
  const isDesktop = window.innerWidth >= 768;
  if (!filterDrawer && !sortDrawer) return;

  if (isDesktop) {
    filterDrawer?.classList.add('hidden');
    sortDrawer?.classList.add('hidden');
    isDrawerOpen = false;
    isSortDrawerOpen = false;
  } else {
    if (isDrawerOpen) {
      filterDrawer?.classList.remove('hidden');
    } else {
      filterDrawer?.classList.add('hidden');
    }

    if (isSortDrawerOpen) {
      sortDrawer?.classList.remove('hidden');
    } else {
      sortDrawer?.classList.add('hidden');
    }
  }
}


window.addEventListener('DOMContentLoaded', handleResize);
window.addEventListener('resize', handleResize);



const brandBtn = document.getElementById('brandBtn');
const categoryBtn = document.getElementById('categoryBtn');
const priceBtn = document.getElementById('priceBtn');


if (brandBtn) {
  brandBtn.addEventListener('click', () => {
    document.getElementById('brandContent').classList.remove('hidden');
    document.getElementById('categoryContent').classList.add('hidden');
    document.getElementById('priceContent').classList.add('hidden');
  });
}

if (categoryBtn) {
  categoryBtn.addEventListener('click', () => {
    document.getElementById('brandContent').classList.add('hidden');
    document.getElementById('categoryContent').classList.remove('hidden');
    document.getElementById('priceContent').classList.add('hidden');
  });
}

if (priceBtn) {
  priceBtn.addEventListener('click', () => {
    document.getElementById('brandContent').classList.add('hidden');
    document.getElementById('categoryContent').classList.add('hidden');
    document.getElementById('priceContent').classList.remove('hidden');
  });
}
