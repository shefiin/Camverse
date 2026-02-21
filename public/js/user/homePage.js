tailwind.config = {
    theme: {
    extend: {
        screens: {
        'tablet': '950px'  
        }
    }
    }
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
