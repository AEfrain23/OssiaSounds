document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------- NAVBAR FUNCTIONALITY --------------------------------------------------

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


    // ----------------------------------------------- CONTACT FORM FUNCTIONALITY -----------------------------------------------
    // Only runs on the contact page, where this element actually exists.

    const confirmationWindow = document.querySelector(".confirmation-container");
    if (confirmationWindow) {
        const confirmationVisibility = confirmationWindow.getAttribute("style");
        if (confirmationVisibility === "visibility: visible;") {
            setTimeout(function () {
                window.location = "http://www.ossiasounds.com";
            }, 5000);
        }
    }


    // -------------------------------------------------- CART / BASKET FUNCTIONALITY --------------------------------------------------

    document.querySelectorAll('.tshirts-hoodies .card').forEach(card => {
        const basketButton = card.querySelector('.basket-button');
        if (!basketButton) return;

        const itemClass = Array.from(card.classList).find(cls => cls.startsWith('item-'));
        if (!itemClass) return;

        const cartItem = document.querySelector(`.cart-options .${itemClass}`);
        if (!cartItem) return;

        basketButton.addEventListener('click', () => {
            const quantityElement = cartItem.querySelector('.quantity');
            const count = Number(quantityElement.textContent) + 1;
            setQuantity(cartItem, count);
        });
    });

    document.querySelectorAll('.cart-options .cart-item').forEach(cartItem => {
        const addButton = cartItem.querySelector('.add-button');
        const subtractButton = cartItem.querySelector('.subtract-button');
        const quantityElement = cartItem.querySelector('.quantity');

        addButton.addEventListener('click', () => {
            const count = Number(quantityElement.textContent) + 1;
            setQuantity(cartItem, count);
        });

        subtractButton.addEventListener('click', () => {
            let count = Number(quantityElement.textContent) - 1;
            if (count < 0) count = 0;
            setQuantity(cartItem, count);
        });
    });

    function setQuantity(cartItem, count) {
        const quantityElement = cartItem.querySelector('.quantity');
        const itemPriceElement = cartItem.querySelector('.item-price');
        const pricePerItem = Number(cartItem.dataset.price);

        quantityElement.textContent = count;
        itemPriceElement.textContent = (pricePerItem * count).toFixed(2);

        cartItem.setAttribute('data-visible', count > 0 ? 'true' : 'false');

        updateBasketMessage();
        updateCartTotal();
        updateCartBadge();
    }

    function updateBasketMessage() {
        const basketMessage = document.querySelector('.basket-message');
        const visibleItems = document.querySelectorAll('.cart-item[data-visible="true"]');
        basketMessage.style.display = visibleItems.length === 0 ? 'block' : 'none';
    }

    function updateCartTotal() {
        let total = 0;
        document.querySelectorAll('.cart-options .cart-item').forEach(cartItem => {
            const quantity = Number(cartItem.querySelector('.quantity').textContent);
            const pricePerItem = Number(cartItem.dataset.price);
            total += quantity * pricePerItem;
        });
        document.querySelector('.card-three span:last-child').textContent = `£${total.toFixed(2)}`;
    }

    function updateCartBadge() {
        let totalCount = 0;
        document.querySelectorAll('.cart-options .cart-item').forEach(cartItem => {
            totalCount += Number(cartItem.querySelector('.quantity').textContent);
        });
        const badge = document.querySelector('.cart-count');
        if (badge) {
            badge.textContent = totalCount;
            badge.style.display = totalCount > 0 ? 'flex' : 'none';
        }
    }


    // -------------------------------------------------- STRIPE CHECKOUT --------------------------------------------------

    const checkoutButton = document.querySelector(".checkout-button");

    checkoutButton.addEventListener("click", () => {
        const items = [];

        document.querySelectorAll('.cart-options .cart-item').forEach(cartItem => {
            const quantity = Number(cartItem.querySelector('.quantity').textContent);
            const id = cartItem.dataset.id;
            if (quantity > 0 && id) {
                items.push({ id, quantity });
            }
        });

        if (items.length === 0) {
            alert("Your basket is empty.");
            return;
        }

        fetch("/create-checkout-session", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items })
        }).then(res => {
            if (res.ok) return res.json();
            return res.json().then(json => Promise.reject(json));
        }).then(({ url }) => {
            window.location = url;
        }).catch(e => {
            console.error(e.error);
        });
    });

});