
    document.addEventListener('DOMContentLoaded', () => {


      tailwind.config = {
          theme: {
          extend: {
              screens: {
              'tablet': '800px',
              'xs400': '400px',
              'xs500': '500px',
              's600': '600px',
              's700': '700px',
              'md800': '800px',
              'md900': '900px',
              'lg1000': '1000px',
              'lg1100' : '1100px',
              'xl1200': '1200px',
              'xl1300': '1300px',
              'xxl1400': '1400px',
              'xxl1500': '1500px',
              'xxxl1600': '1600px'
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


      document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              btn.nextElementSibling.classList.toggle('hidden');
            });
      });     

      
      const thumbContainer = document.getElementById('thumbnails');
      document.getElementById('thumbUp').addEventListener('click', () => {
        thumbContainer.scrollBy({ top: -80, behavior: 'smooth' });
      });
      document.getElementById('thumbDown').addEventListener('click', () => {
        thumbContainer.scrollBy({ top: 80, behavior: 'smooth' });
      });

      
      const menuToggle = document.getElementById('menu-toggle');
      
      menuToggle.addEventListener('click', () => {
        menu.classList.toggle('hidden');
      });

      const brandLink = document.getElementById('brand-link');
      const brandsSubmenu = document.getElementById('brands-submenu');
      brandLink.addEventListener('click', e => {
        e.preventDefault();
        brandsSubmenu.classList.toggle('hidden');
      });

      const categoryLink = document.getElementById('category-link');
      const categoriesSubmenu = document.getElementById('categories-submenu');
      categoryLink.addEventListener('click', e => {
        e.preventDefault();
        categoriesSubmenu.classList.toggle('hidden');
      });

      
      const loginClick = document.getElementById('login-click');
      const loginDropdown = document.getElementById('login-dropdown');
      loginClick.addEventListener('click', e => {
        e.preventDefault();
        loginDropdown.classList.toggle('hidden');
      });

      
           
      const clearSearch = document.getElementById('clear-search');
      const searchInput = document.getElementById('search-input');

    });


    const desktopThumbs = document.querySelectorAll('#thumbnails-desktop img');

    desktopThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        mainImage.src = thumb.src;

        // remove border from all desktop thumbnails
        desktopThumbs.forEach(t => t.classList.remove('border-teal-500'));
        desktopThumbs.forEach(t => t.classList.add('border-transparent'));

        // add border to clicked thumbnail
        thumb.classList.remove('border-transparent');
        thumb.classList.add('border-teal-500');
      });
    });

    // ---------- Mobile Thumbnails ----------
    const mobileThumbs = document.querySelectorAll('#thumbnails-mobile img');

    mobileThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        mainImage.src = thumb.src;

        // remove border from all mobile thumbnails
        mobileThumbs.forEach(t => t.classList.remove('border-black'));
        mobileThumbs.forEach(t => t.classList.add('border-transparent'));

        // add border to clicked thumbnail
        thumb.classList.remove('border-transparent');
        thumb.classList.add('border-black');
      });
    });

    const mainImage = document.getElementById("mainImage");
    const zoomBox = document.getElementById("zoomBox");

    const zoomLevel = 2; // increase for more zoom

    mainImage.addEventListener("mouseenter", () => {
      zoomBox.style.display = "block";
      zoomBox.style.backgroundImage = `url(${mainImage.src})`;
      zoomBox.style.backgroundSize = `${mainImage.width * zoomLevel}px ${mainImage.height * zoomLevel}px`;
    });

    mainImage.addEventListener("mousemove", (e) => {
      const rect = mainImage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const bgX = -((x * zoomLevel) - zoomBox.clientWidth / 2);
      const bgY = -((y * zoomLevel) - zoomBox.clientHeight / 2);

      zoomBox.style.backgroundPosition = `${bgX}px ${bgY}px`;
    });

    mainImage.addEventListener("mouseleave", () => {
      zoomBox.style.display = "none";
    });



    mediumZoom('#mainImage', {
      margin: 20,
      background: '#000',
      scrollOffset: 40
    });
