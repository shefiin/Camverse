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


const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const clearSearch = document.getElementById('clear-search');
let searchVisible = false;

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

document.addEventListener('click', (e) => {
    if(searchVisible && !searchBar.contains(e.target) && !searchToggle.contains(e.target)) {
        searchVisible = false;
        searchBar.classList.remove('w-[250px]', 'tablet:w-[500px]', 'opacity-100');
        searchBar.classList.add('w-0', 'opacity-0');
    }
})


searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() !== "") {
        clearSearch.classList.remove('hidden');
    } else {
        clearSearch.classList.add('hidden');
    }
});




document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.nextElementSibling.classList.toggle('hidden');
      });
});       




const sortButton = document.getElementById('sortButton');
const sortMenu = document.getElementById('sortMenu');

sortButton.addEventListener('click', () => {
    sortMenu.classList.toggle('hidden');
});


document.addEventListener('click', (e) => {
    if (!sortButton.contains(e.target) && !sortMenu.contains(e.target)) {
    sortMenu.classList.add('hidden');
    }
});


document.querySelectorAll('.wishlist-btn').forEach(button => {
  button.addEventListener('click', () => {
    const icon = button.querySelector('i');
    icon.classList.toggle('text-rose-500');
  });
});

const filterDrawer = document.getElementById('filterDrawer');
const filterBtn = document.getElementById('filterBtn');
const closeFilterBtn = document.getElementById('closeFilterBtn');

let isDrawerOpen = false;


filterBtn.addEventListener('click', () => {
  isDrawerOpen = true;
  if (window.innerWidth < 768) {
    filterDrawer.classList.remove('hidden');
  }
});


closeFilterBtn.addEventListener('click', () => {
  isDrawerOpen = false;
  filterDrawer.classList.add('hidden');
});


function handleResize() {
  const isDesktop = window.innerWidth >= 768;

  if (isDesktop) {
    
    filterDrawer.classList.add('hidden');
    isDrawerOpen = false;
  } else {
    
    if (isDrawerOpen) {
      filterDrawer.classList.remove('hidden');
    } else {
      filterDrawer.classList.add('hidden');
    }
  }
}


window.addEventListener('DOMContentLoaded', handleResize);
window.addEventListener('resize', handleResize);



const brandBtn = document.getElementById('brandBtn');
const categoryBtn = document.getElementById('categoryBtn');
const priceBtn = document.getElementById('priceBtn');


brandBtn.addEventListener('click', () => {
  document.getElementById('brandContent').classList.toggle('hidden');
  document.getElementById('categoryContent').classList.add('hidden');
  document.getElementById('priceContent').classList.add('hidden');
});

categoryBtn.addEventListener('click', () => {
  document.getElementById('categoryContent').classList.toggle('hidden');
  document.getElementById('brandContent').classList.add('hidden');
  document.getElementById('priceContent').classList.add('hidden');
  
});

priceBtn.addEventListener('click', () => {
  document.getElementById('priceContent').classList.toggle('hidden');
  document.getElementById('brandContent').classList.add('hidden');
  document.getElementById('categoryContent').classList.add('hidden');
});