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
    let item1Quantity = document.querySelector(`.item-1 .quantity`)
    let item2Quantity = document.querySelector(`.item-2 .quantity`)
    let item3Quantity = document.querySelector(`.item-3 .quantity`)
    fetch("/create-checkout-session", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: [
                { id: "664f132b1d4f0327efc1fd0e", quantity: item1Quantity.innerHTML },
                { id: "664f132b1d4f0327efc1fd0f", quantity: item2Quantity.innerHTML },
                { id: "664f132b1d4f0327efc1fd10", quantity: item3Quantity.innerHTML },
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
});



// Update visibility of basket message
function updateBasketMessage() {
    const basketMessage = document.querySelector('.basket-message');
    const cardTwo = document.querySelector('.card-two');
    const validItems = Array.from(cardTwo.querySelectorAll('.cart-item')).filter(cartItem => cartItem.dataset.visible === 'true');

    if (validItems.length === 0) {
        basketMessage.style.display = 'block'; // Show the message
    } else {
        basketMessage.style.display = 'none'; // Hide the message
    }
}

// ITEM FUNCTIONALITY and VISIBILITY
document.querySelectorAll('.cart-item').forEach(cartItem => {
    const addButton = cartItem.querySelector('.add-button');
    const subtractButton = cartItem.querySelector('.subtract-button');
    const quantityElement = cartItem.querySelector('.quantity');

    addButton.addEventListener('click', () => {
        let count = Number(quantityElement.innerHTML);
        const addition = count + 1;
        quantityElement.innerHTML = addition;
        updateVisibility(cartItem, addition);
        updateBasketMessage(); // Update basket message after changing quantity
    });

    subtractButton.addEventListener('click', () => {
        let count = Number(quantityElement.innerHTML);
        const subtraction = count - 1;
        const newQuantity = subtraction < 0 ? 0 : subtraction;
        quantityElement.innerHTML = newQuantity;
        updateVisibility(cartItem, newQuantity);
        updateBasketMessage(); // Update basket message after changing quantity
    });
});

function updateVisibility(cartItem, quantity) {
    if (quantity === 0) {
        cartItem.setAttribute('data-visible', 'false');
    } else {
        cartItem.setAttribute('data-visible', 'true');
    }
}

// Call updateBasketMessage initially to set the initial state of the message
updateBasketMessage();



// ADDING TO CART FROM MERCH PAGE
// Item 1
const addItem1 = document.querySelector(".tshirts-hoodies .item-1 .basket-button")
const cartItem1 = document.querySelector(".cart-options .item-1 .quantity")
const item1Visibility = document.querySelector(".cart-options .item-1")
addItem1.addEventListener("click", () => {
    console.log("Item 1 added");
    let count = Number(cartItem1.innerHTML);
    const addition = count + 1;
    cartItem1.innerHTML = addition;
    updateVisibility(item1Visibility, addition);
    updateBasketMessage(); // Update basket message after changing quantity
})

// Item 2
const addItem2 = document.querySelector(".tshirts-hoodies .item-2 .basket-button")
const cartItem2 = document.querySelector(".cart-options .item-2 .quantity")
const item2Visibility = document.querySelector(".cart-options .item-2")
addItem2.addEventListener("click", () => {
    console.log("Item 2 added");
    let count = Number(cartItem2.innerHTML);
    const addition = count + 1;
    cartItem2.innerHTML = addition;
    updateVisibility(item2Visibility, addition);
    updateBasketMessage(); // Update basket message after changing quantity
})

// Item 2
const addItem3 = document.querySelector(".tshirts-hoodies .item-3 .basket-button")
const cartItem3 = document.querySelector(".cart-options .item-3 .quantity")
const item3Visibility = document.querySelector(".cart-options .item-3")
addItem3.addEventListener("click", () => {
    console.log("Item 3 added");
    let count = Number(cartItem3.innerHTML);
    const addition = count + 1;
    cartItem3.innerHTML = addition;
    updateVisibility(item3Visibility, addition);
    updateBasketMessage(); // Update basket message after changing quantity
})

