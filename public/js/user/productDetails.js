
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

      if (typeof window.IS_LOGGED_IN === 'undefined') {
        window.IS_LOGGED_IN = Boolean(document.querySelector('a[href="/logout"]'));
      }

      if (!window.__camverseSlowScrollBound) {
        window.__camverseSlowScrollBound = true;

        const hasScrollableParent = (startEl, deltaY) => {
          let el = startEl;
          while (el && el !== document.body) {
            const style = window.getComputedStyle(el);
            const canScrollY = /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight;
            if (canScrollY) {
              const canScrollUp = deltaY < 0 && el.scrollTop > 0;
              const canScrollDown = deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight;
              if (canScrollUp || canScrollDown) return true;
            }
            el = el.parentElement;
          }
          return false;
        };

        window.addEventListener(
          'wheel',
          (e) => {
            if (e.ctrlKey || e.metaKey) return;
            const targetTag = (e.target?.tagName || '').toLowerCase();
            if (['input', 'textarea', 'select'].includes(targetTag)) return;
            if (hasScrollableParent(e.target, e.deltaY)) return;

            e.preventDefault();
            window.scrollBy({
              top: e.deltaY * 0.3,
              left: e.deltaX * 0.3,
              behavior: 'auto'
            });
          },
          { passive: false }
        );
      }

      let loginRedirectInProgress = false;
      let loginRedirectTimeout = null;

      const clearLoginRedirectState = () => {
        loginRedirectInProgress = false;
        if (loginRedirectTimeout) {
          clearTimeout(loginRedirectTimeout);
          loginRedirectTimeout = null;
        }
        const banner = document.getElementById('login-redirect-banner');
        if (banner) banner.remove();
      };

      const ensureLoginBannerSpinnerStyle = () => {
        if (document.getElementById('login-banner-spinner-style')) return;
        const style = document.createElement('style');
        style.id = 'login-banner-spinner-style';
        style.textContent = `
          @keyframes loginBannerSpin {
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      };

      const showLoginRedirectBanner = (message) => {
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

        const navbar = document.getElementById('navbar') || document.querySelector('nav');
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
      };

      const hideLoginRedirectBanner = () => {
        const banner = document.getElementById('login-redirect-banner');
        if (!banner) return;
        banner.style.transform = 'translate(-50%, -140%)';
      };

      const triggerLoginRedirectPopup = () => {
        if (loginRedirectInProgress) return;
        loginRedirectInProgress = true;
        showLoginRedirectBanner('Please login first');
        setTimeout(() => hideLoginRedirectBanner(), 1200);
        loginRedirectTimeout = setTimeout(() => {
          clearLoginRedirectState();
          const returnTo = `${window.location.pathname}${window.location.search}`;
          window.location.href = `/login?error=Please%20login%20first&redirect=${encodeURIComponent(returnTo)}`;
        }, 2000);
      };

      document.addEventListener('submit', (e) => {
        if (window.IS_LOGGED_IN) return;
        const action = e.target?.getAttribute('action');
        if (action !== '/cart/add' && action !== '/wishlist/add') return;
        e.preventDefault();
        triggerLoginRedirectPopup();
      });

      window.addEventListener('pageshow', clearLoginRedirectState);
      window.addEventListener('pagehide', clearLoginRedirectState);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          clearLoginRedirectState();
        }
      });

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
