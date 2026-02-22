if (typeof window.IS_LOGGED_IN === "undefined") {
  window.IS_LOGGED_IN = Boolean(document.querySelector('a[href="/logout"]'));
}

let cartLoginRedirectInProgress = false;
let cartLoginRedirectTimeout = null;

function clearCartLoginRedirectState() {
  cartLoginRedirectInProgress = false;
  if (cartLoginRedirectTimeout) {
    clearTimeout(cartLoginRedirectTimeout);
    cartLoginRedirectTimeout = null;
  }
  const banner = document.getElementById("login-redirect-banner");
  if (banner) {
    banner.remove();
  }
}

function ensureCartLoginBannerSpinnerStyle() {
  if (document.getElementById("login-banner-spinner-style")) return;
  const style = document.createElement("style");
  style.id = "login-banner-spinner-style";
  style.textContent = `
    @keyframes loginBannerSpin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

function showCartLoginRedirectBanner(message) {
  ensureCartLoginBannerSpinnerStyle();
  let banner = document.getElementById("login-redirect-banner");

  if (!banner) {
    banner = document.createElement("div");
    banner.id = "login-redirect-banner";
    banner.className = "fixed left-1/2 bg-black text-white px-5 py-3 shadow-md z-[9999]";
    banner.style.transform = "translate(-50%, -140%)";
    banner.style.transition = "transform 280ms ease";
    document.body.appendChild(banner);
  }

  const navbar = document.getElementById("navbar");
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

  banner.style.transform = "translate(-50%, 0)";
}

function hideCartLoginRedirectBanner() {
  const banner = document.getElementById("login-redirect-banner");
  if (!banner) return;
  banner.style.transform = "translate(-50%, -140%)";
}

function handleCartLoginRedirect() {
  if (cartLoginRedirectInProgress) return;
  cartLoginRedirectInProgress = true;
  showCartLoginRedirectBanner("Please login first");
  setTimeout(() => {
    hideCartLoginRedirectBanner();
  }, 1200);
  cartLoginRedirectTimeout = setTimeout(() => {
    clearCartLoginRedirectState();
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/login?error=Please%20login%20first&redirect=${encodeURIComponent(returnTo)}`;
  }, 2000);
}

document.addEventListener("submit", (e) => {
  if (window.IS_LOGGED_IN) return;
  const form = e.target.closest('form[action="/wishlist/add"]');
  if (!form) return;
  e.preventDefault();
  handleCartLoginRedirect();
});

document.addEventListener("click", (e) => {
  if (window.IS_LOGGED_IN) return;
  const checkoutLink = e.target.closest('a[href="/checkout"]');
  if (!checkoutLink) return;
  e.preventDefault();
  handleCartLoginRedirect();
});

window.addEventListener("pageshow", clearCartLoginRedirectState);
window.addEventListener("pagehide", clearCartLoginRedirectState);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    clearCartLoginRedirectState();
  }
});
