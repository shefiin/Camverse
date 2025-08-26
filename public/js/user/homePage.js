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

toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
});


document.getElementById('brand-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('brands-submenu').classList.toggle('hidden');
});

document.getElementById('category-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('categories-submenu').classList.toggle('hidden');
});


const loginBtn = document.getElementById('login-click');
const dropdown = document.getElementById('login-dropdown');

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
searchInput.addEventListener('input', toggleClearButton);

// Also show clear button if page loads with a value
window.addEventListener('DOMContentLoaded', toggleClearButton);

// Clear input when clicking the X
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  toggleClearButton();


});




document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.nextElementSibling.classList.toggle('hidden');
      });
});        