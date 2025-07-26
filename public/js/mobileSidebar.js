document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    function toggleSidebar() {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    hamburger.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
  });


