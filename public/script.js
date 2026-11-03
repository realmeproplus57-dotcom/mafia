
"use strict";

// =====================================
// MADRAZO FAMILY - STORE
// =====================================

// PRODUCTS
const PRODUCTS = {
    cocaine: {
        name: "Cocaine",
        price: 600
    },
    meth: {
        name: "Meth",
        price: 600
    }
};

const MAX_QUANTITY = 1000;

// RENDER SERVER
const API_URL = "https://mafia-pswe.onrender.com";

// =====================================
// ELEMENTS
// =====================================

const pages = {
    welcome: document.getElementById("welcomePage"),
    products: document.getElementById("productsPage"),
    summary: document.getElementById("summaryPage"),
    confirm: document.getElementById("confirmPage")
};

const enterStoreBtn = document.getElementById("enterStoreBtn");
const musicToggle = document.getElementById("musicToggle");
const backgroundMusic = document.getElementById("backgroundMusic");

const backToWelcomeBtn = document.getElementById("backToWelcomeBtn");
const continueToSummaryBtn = document.getElementById("continueToSummaryBtn");
const backToProductsBtn = document.getElementById("backToProductsBtn");
const continueToConfirmBtn = document.getElementById("continueToConfirmBtn");
const backToSummaryBtn = document.getElementById("backToSummaryBtn");

const selectedItemsCount = document.getElementById("selectedItemsCount");
const productsTotal = document.getElementById("productsTotal");

const summaryProducts = document.getElementById("summaryProducts");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTotal = document.getElementById("summaryTotal");

const finalItemsCount = document.getElementById("finalItemsCount");
const finalTotal = document.getElementById("finalTotal");

const orderForm = document.getElementById("orderForm");
const submitOrderBtn = document.getElementById("submitOrderBtn");
const orderMessage = document.getElementById("orderMessage");

// =====================================
// CART
// =====================================

const cart = {
    cocaine: 0,
    meth: 0
};

// =====================================
// HELPERS
// =====================================

function formatPrice(amount) {
    return new Intl.NumberFormat("en-US").format(amount) + "$";
}

function getTotalItems() {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
}

function getSubtotal() {
    return Object.entries(cart).reduce((total, [id, quantity]) => {
        return total + PRODUCTS[id].price * quantity;
    }, 0);
}

function getOrderDetails() {
    return Object.entries(cart)
        .filter(([id, quantity]) => quantity > 0)
        .map(([id, quantity]) => ({
            id: id,
            quantity: quantity
        }));
}

function showPage(pageName) {
    Object.values(pages).forEach(page => {
        if (page) page.classList.remove("active");
    });

    if (pages[pageName]) {
        pages[pageName].classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =====================================
// MUSIC
// =====================================

let musicStarted = false;

async function startMusic() {
    try {
        backgroundMusic.volume = 0.35;
        await backgroundMusic.play();

        musicStarted = true;
        updateMusicButton();
    } catch (error) {
        console.log("Music error:", error);
    }
}

function updateMusicButton() {
    if (!musicToggle || !backgroundMusic) return;

    musicToggle.hidden = false;

    musicToggle.textContent = backgroundMusic.paused
        ? "▶ تشغيل الموسيقى"
        : "🔊 إيقاف الموسيقى";
}

enterStoreBtn.addEventListener("click", async () => {
    showPage("products");

    if (!musicStarted || backgroundMusic.paused) {
        await startMusic();
    }
});

musicToggle.addEventListener("click", async () => {
    if (backgroundMusic.paused) {
        await startMusic();
    } else {
        backgroundMusic.pause();
        updateMusicButton();
    }
});

// =====================================
// QUANTITY
// =====================================

function setQuantity(productId, value) {
    if (!PRODUCTS[productId]) return;

    let quantity = Number.parseInt(value, 10);

    if (!Number.isFinite(quantity) || quantity < 0) {
        quantity = 0;
    }

    quantity = Math.min(quantity, MAX_QUANTITY);

    cart[productId] = quantity;

    const input = document.querySelector(
        `.quantity-input[data-product="${productId}"]`
    );

    if (input) {
        input.value = quantity;
    }

    updateStore();
}

// INCREASE AND DECREASE

document.querySelectorAll(".quantity-btn").forEach(button => {
    button.addEventListener("click", () => {
        const id = button.dataset.product;
        const action = button.dataset.action;

        if (!PRODUCTS[id]) return;

        let quantity = cart[id];

        if (action === "increase") quantity++;
        if (action === "decrease") quantity--;

        setQuantity(id, quantity);
    });
});

// MANUAL INPUT

document.querySelectorAll(".quantity-input").forEach(input => {
    input.addEventListener("input", () => {
        const id = input.dataset.product;

        if (input.value === "") {
            cart[id] = 0;
            updateStore();
            return;
        }

        setQuantity(id, input.value);
    });

    input.addEventListener("blur", () => {
        setQuantity(input.dataset.product, input.value);
    });
});

// BUY BUTTONS

document.querySelectorAll(".buy-product-btn").forEach(button => {
    button.addEventListener("click", () => {
        const id = button.dataset.product;

        if (!PRODUCTS[id]) return;

        if (cart[id] < 1) {
            alert("حدد الكمية أولاً.");
            return;
        }

        renderSummary();
        showPage("summary");
    });
});

// =====================================
// UPDATE STORE
// =====================================

function updateStore() {
    Object.keys(PRODUCTS).forEach(id => {
        const subtotalElement = document.getElementById(id + "Subtotal");

        if (subtotalElement) {
            subtotalElement.textContent = formatPrice(
                PRODUCTS[id].price * cart[id]
            );
        }
    });

    selectedItemsCount.textContent = getTotalItems();
    productsTotal.textContent = formatPrice(getSubtotal());

    updateFinalTotals();
}

// =====================================
// SUMMARY
// =====================================

function renderSummary() {
    summaryProducts.replaceChildren();

    const selectedProducts = getOrderDetails();

    if (selectedProducts.length === 0) {
        const message = document.createElement("p");
        message.textContent = "لم تختر أي منتجات بعد.";
        summaryProducts.appendChild(message);
    }

    selectedProducts.forEach(item => {
        const product = PRODUCTS[item.id];

        const card = document.createElement("article");
        card.className = "summary-product";

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = product.name;

        const quantity = document.createElement("p");
        quantity.textContent = "الكمية: " + item.quantity;

        const price = document.createElement("p");
        price.textContent = "سعر الوحدة: " + formatPrice(product.price);

        details.append(title, quantity, price);

        const subtotal = document.createElement("strong");
        subtotal.className = "summary-product-price";
        subtotal.textContent = formatPrice(product.price * item.quantity);

        card.append(details, subtotal);
        summaryProducts.appendChild(card);
    });

    summarySubtotal.textContent = formatPrice(getSubtotal());
    summaryTotal.textContent = formatPrice(getSubtotal());

    updateFinalTotals();
}

// =====================================
// FINAL TOTAL
// =====================================

function updateFinalTotals() {
    finalItemsCount.textContent = getTotalItems();
    finalTotal.textContent = formatPrice(getSubtotal());
}

// =====================================
// NAVIGATION
// =====================================

backToWelcomeBtn.addEventListener("click", () => {
    showPage("welcome");
});

continueToSummaryBtn.addEventListener("click", () => {
    if (getTotalItems() === 0) {
        alert("اختر منتجاً واحداً على الأقل.");
        return;
    }

    renderSummary();
    showPage("summary");
});

backToProductsBtn.addEventListener("click", () => {
    showPage("products");
});

continueToConfirmBtn.addEventListener("click", () => {
    if (getTotalItems() === 0) {
        alert("لا يوجد أي منتج في الطلب.");
        return;
    }

    renderSummary();
    showPage("confirm");
});

backToSummaryBtn.addEventListener("click", () => {
    renderSummary();
    showPage("summary");
});

// =====================================
// SEND ORDER TO DISCORD
// =====================================

orderForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (getTotalItems() === 0) {
        alert("اختر المنتجات أولاً.");
        showPage("products");
        return;
    }

    const gangName = document.getElementById("gangName").value.trim();
    const radioNumber = document.getElementById("radioNumber").value.trim();
    const deliveryLocation = document.getElementById("deliveryLocation").value.trim();

    if (!gangName) {
        alert("اكتب اسم العصابة.");
        return;
    }

    const order = {
        gangName,
        radioNumber,
        deliveryLocation,
        products: getOrderDetails()
    };

    submitOrderBtn.disabled = true;
    submitOrderBtn.textContent = "جارٍ إرسال الطلب...";

    orderMessage.textContent = "";

    try {
        const response = await fetch(API_URL + "/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "فشل إرسال الطلب.");
        }

        orderMessage.textContent = "تم إرسال الطلب بنجاح!";
        orderMessage.className = "order-message success";

        submitOrderBtn.textContent = "تم إرسال الطلب ✓";

        alert("تم إرسال طلبك بنجاح!");

    } catch (error) {
        console.error("Order error:", error);

        orderMessage.textContent = error.message;
        orderMessage.className = "order-message error";

        submitOrderBtn.disabled = false;
        submitOrderBtn.textContent = "إعادة إرسال الطلب";
    }
});

// =====================================
// START
// =====================================

updateStore();
