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
const cartMenuClose = document.querySelector(".cart-close");

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
cartMenuClose.addEventListener("click", () => {
    cartMenu.setAttribute("data-visible", false);
    cartToggle.setAttribute("aria-expanded", false);
});



// STRIPE FUNCTIONALITY:

const checkoutButton = document.querySelector(".checkout-button")

checkoutButton.addEventListener("click", () => {
    fetch("/create-checkout-session", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: [
                { id: 1, quantity: 3 },
                { id: 2, quantity: 1 },
            ]
        })
    }).then(res => {
        if (res.ok) return res.json()
        return res.json().then(json => Promise.reject(json))
    }).then(({ url }) => {
        window.location = url;
    }).catch(e => {
        console.error(e.error);
    })
})


