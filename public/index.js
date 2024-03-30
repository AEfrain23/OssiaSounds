const navbarMenu = document.querySelector(".menu-options");
const navbarToggle = document.querySelector(".mobile-navbar-toggle");

navbarToggle.addEventListener("click", () => {
    const visibility = navbarMenu.getAttribute("data-visible");
    if (visibility === "false") {
        navbarMenu.setAttribute("data-visible", true);
        navbarToggle.setAttribute("aria-expanded", true);
    } else if (visibility === "true") {
        navbarMenu.setAttribute("data-visible", false);
        navbarToggle.setAttribute("aria-expanded", false);
    }
});


const cartMenu = document.querySelector(".cart-options");
const cartToggle = document.querySelector(".mobile-cart-toggle");

cartToggle.addEventListener("click", () => {
    const visibility = cartMenu.getAttribute("data-visible");
    if (visibility === "false") {
        cartMenu.setAttribute("data-visible", true);
        cartToggle.setAttribute("aria-expanded", true);
    } else if (visibility === "true") {
        cartMenu.setAttribute("data-visible", false);
        cartToggle.setAttribute("aria-expanded", false);
    }
});