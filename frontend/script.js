// Niva Aura Resin Art - Master Client Application Script (Luxury Studio + Buy Now & Login Edition)

const DEFAULT_PRODUCTS = [
    {
        id: "p1",
        name: "Ocean Wave Resin Wall Clock",
        category: "Wall Clocks",
        price: 3499,
        rating: 4.9,
        reviewsCount: 28,
        badge: "Best Seller",
        description: "Handcrafted 14-inch circular wall clock featuring multi-layer deep ocean resin waves with gold Roman numerals and high-torque silent sweep mechanism.",
        specs: [
            "Material: Premium Epoxy Resin & MDF",
            "Diameter: 14 Inches (35 cm)",
            "Movement: Silent Quartz Sweep",
            "Finish: Crystal Clear Mirror Gloss",
            "Accents: Hand-applied 24K Gold Foil"
        ],
        images: [
            "images/resin_wall_clock.png",
            "images/resin-bg.jpg"
        ]
    },
    {
        id: "p2",
        name: "Pressed Botanical Resin Coasters Set",
        category: "Coasters",
        price: 1299,
        rating: 4.8,
        reviewsCount: 19,
        badge: "Handcrafted",
        description: "Set of 4 hexagonal crystal-clear resin coasters containing real preserved wildflowers, gold leaf edges, and non-slip protective backing.",
        specs: [
            "Includes: Set of 4 Coasters + Wooden Holder",
            "Heat Resistance: Up to 90°C",
            "Features: Anti-scratch silicone feet",
            "Safe: Non-toxic Food Grade Resin"
        ],
        images: [
            "images/resin_coasters.png",
            "images/resin-bg.jpg"
        ]
    },
    {
        id: "p3",
        name: "Emerald & Gold Leaf Resin Wash Basin",
        category: "Wash Basins",
        price: 14999,
        rating: 5.0,
        reviewsCount: 14,
        badge: "Luxury Edition",
        description: "Luxury designer countertop wash basin cast from deep emerald green liquid resin with floating gold flakes and scratch-resistant glaze.",
        specs: [
            "Dimensions: 16 x 16 x 5.5 inches",
            "Finish: Stain & UV Scratch Resistant",
            "Drainage: Standard Pop-up Drain Compatible",
            "Warranty: 5 Years Surface Coating"
        ],
        images: [
            "images/resin_wash_basin.png",
            "images/resin-bg.jpg"
        ]
    },
    {
        id: "p4",
        name: "Custom Initial Floral Resin Keychain",
        category: "Keychains",
        price: 399,
        rating: 4.9,
        reviewsCount: 45,
        badge: "Popular Gift",
        description: "Personalized alphabet letter keychain filled with blush pink dried flower petals, gold glitter dust, and heavy-duty gold alloy ring.",
        specs: [
            "Height: 4 cm (Letter height)",
            "Hardware: Gold Plated Keyring + Clip",
            "Customization: Any A-Z Initial Available",
            "Durability: Non-yellowing Crystal Resin"
        ],
        images: [
            "images/resin_keychain.png",
            "images/resin-bg.jpg"
        ]
    },
    {
        id: "p5",
        name: "Gold Foil & Sapphire Desk Nameplate",
        category: "Nameplates",
        price: 2199,
        rating: 4.9,
        reviewsCount: 22,
        badge: "Custom Made",
        description: "Premium executive desk nameplate with deep sapphire resin waves, custom laser-etched gold acrylic lettering, and solid mahogany base.",
        specs: [
            "Dimensions: 10 x 3 x 2.5 inches",
            "Base: Solid Teak / Mahogany Wood",
            "Text: Custom 3D Acrylic Engraving",
            "Finish: High Polish Gloss Resin"
        ],
        images: [
            "images/resin_nameplate.png",
            "images/resin-bg.jpg"
        ]
    },
    {
        id: "p6",
        name: "Celestial Turquoise Geode Resin Art",
        category: "Custom Gifts",
        price: 4999,
        rating: 5.0,
        reviewsCount: 31,
        badge: "Featured Art",
        description: "3D textured geode wall art piece featuring real quartz crystals, turquoise metallic resin poured layers, and polished gold metallic veining.",
        specs: [
            "Size: 18 x 24 Inches Canvas",
            "Materials: Quartz Crystals, Glitter & Resin",
            "Hanging: Pre-installed Heavy-Duty Hooks",
            "Authenticity: Hand-signed by Artist"
        ],
        images: [
            "images/resin_wall_clock.png",
            "images/resin-bg.jpg"
        ]
    }
];

let activeModalProduct = null;
let activeModalImageIndex = 0;
let cachedAllProducts = [];

// Login validation check helper
function isUserAuthenticated() {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    return !!(email || token || userLoggedIn === "true");
}

// Get combined product list (Default + Custom Admin Products + Server Products)
function getCombinedProducts() {
    let customProducts = JSON.parse(localStorage.getItem("custom_products")) || [];
    let adminProducts = JSON.parse(localStorage.getItem("admin_products")) || [];
    
    const normalizedCustom = [...customProducts, ...adminProducts].map((cp, index) => ({
        id: cp.id || cp._id || ("custom_" + index + "_" + Date.now()),
        name: cp.name,
        category: cp.category || "Resin Art",
        price: Number(cp.price) || 999,
        rating: cp.rating || 5.0,
        reviewsCount: cp.reviewsCount || 10,
        badge: cp.badge || "New Arrival",
        description: cp.description || "Handcrafted bespoke epoxy resin creation by Niva Aura Resin Studio.",
        specs: cp.specs || ["Material: Premium Epoxy Resin", "Finish: High Gloss Crystal Clear"],
        images: (cp.images && cp.images.length > 0) ? cp.images : ["images/resin_wall_clock.png"]
    }));

    const combined = [...normalizedCustom, ...DEFAULT_PRODUCTS];
    const uniqueMap = new Map();
    combined.forEach(item => {
        if (!uniqueMap.has(item.name)) {
            uniqueMap.set(item.name, item);
        }
    });

    return Array.from(uniqueMap.values());
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    loadUserProfile();
    loadProducts();
    loadReviews();
    setupKeyboardListeners();

    window.addEventListener("storage", function (e) {
        if (e.key === "custom_products" || e.key === "admin_products" || e.key === "cart" || e.key === "email") {
            loadProducts();
            updateCartCount();
            loadUserProfile();
        }
    });
});

// Render Product Grid with "⚡ Buy Now" and "🛒 Add to Cart"
function renderProducts(productsList) {
    const container = document.getElementById("products");
    if (!container) return;

    if (!productsList || productsList.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #7F8C8D;">
                <h3>No resin products match your criteria</h3>
                <p>Try clearing filters or search term</p>
            </div>
        `;
        return;
    }

    let html = "";
    productsList.forEach(product => {
        const primaryImg = (product.images && product.images.length > 0) ? product.images[0] : 'images/no-image.png';
        const ratingVal = product.rating || 5;
        const stars = "★".repeat(Math.floor(ratingVal)) + "☆".repeat(5 - Math.floor(ratingVal));

        html += `
        <div class="product-card">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image-box" onclick="openImageModal('${product.id}')">
                <img src="${primaryImg}" alt="${product.name}" loading="lazy">
                <div class="quick-view-overlay">
                    <button class="btn-quick-view" onclick="event.stopPropagation(); openImageModal('${product.id}')">
                        🔍 Quick View & Photos
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category || 'Resin Art'}</div>
                <h3 class="product-title" onclick="openImageModal('${product.id}')" style="cursor:pointer;">${product.name}</h3>
                <div class="product-rating">
                    ${stars} <span>(${ratingVal})</span>
                </div>
                <div class="product-bottom">
                    <div class="product-price">&#8377;${Number(product.price).toLocaleString('en-IN')}</div>
                    <div class="card-actions">
                        <button class="btn-icon" title="Add to Wishlist" onclick="addToWishlist('${product.name}', '${primaryImg}', ${product.price})">
                            ❤️
                        </button>
                        <button class="btn-add-cart" onclick="quickAddToCart('${product.id}')">
                            🛒 Add
                        </button>
                        <button class="btn-buy-now" onclick="handleBuyNow('${product.id}')">
                            ⚡ Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

// Fetch products from server + merge LocalStorage Admin Uploads
async function loadProducts() {
    let allProducts = getCombinedProducts();

    try {
        const response = await fetch("http://localhost:5000/products");
        if (response.ok) {
            const apiProducts = await response.json();
            if (apiProducts && apiProducts.length > 0) {
                const apiNormalized = apiProducts.map(p => ({
                    id: p._id || p.id,
                    name: p.name,
                    category: p.category || "Resin Art",
                    price: Number(p.price) || 999,
                    rating: p.rating || 5.0,
                    badge: "Admin Pick",
                    description: p.description || "Handcrafted resin piece created in studio.",
                    specs: ["Premium Grade Epoxy", "Handcrafted in Studio"],
                    images: (p.images && p.images.length > 0) ? p.images : ["images/resin_wall_clock.png"]
                }));
                
                const combinedMap = new Map();
                [...allProducts, ...apiNormalized].forEach(item => combinedMap.set(item.name, item));
                allProducts = Array.from(combinedMap.values());
            }
        }
    } catch (e) {}

    cachedAllProducts = allProducts;
    renderProducts(allProducts);
}

// Filter and Search
function filterProducts() {
    const searchVal = (document.getElementById("searchInput")?.value || "").toLowerCase();
    const activePill = document.querySelector(".pill-btn.active");
    const categoryVal = activePill ? activePill.dataset.category : "All";

    const filtered = cachedAllProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchVal) ||
                              (product.category && product.category.toLowerCase().includes(searchVal)) ||
                              (product.description && product.description.toLowerCase().includes(searchVal));
        const matchesCategory = (!categoryVal || categoryVal === "All" || product.category === categoryVal);
        return matchesSearch && matchesCategory;
    });

    renderProducts(filtered);
}

function selectCategory(categoryName, element) {
    document.querySelectorAll(".pill-btn").forEach(btn => btn.classList.remove("active"));
    if (element) element.classList.add("active");
    filterProducts();
}

function searchProducts() {
    filterProducts();
}

// Interactive Lightbox Modal Logic
function openImageModal(productId) {
    const all = cachedAllProducts.length > 0 ? cachedAllProducts : getCombinedProducts();
    const product = all.find(p => String(p.id) === String(productId) || p.name === productId) || all[0];
    if (!product) return;

    activeModalProduct = product;
    activeModalImageIndex = 0;

    const modal = document.getElementById("imageModal");
    if (!modal) return;

    document.getElementById("modalBadge").innerText = product.badge || "Resin Artwork";
    document.getElementById("modalTitle").innerText = product.name;
    document.getElementById("modalPrice").innerHTML = `&#8377;${Number(product.price).toLocaleString('en-IN')}`;
    document.getElementById("modalDesc").innerText = product.description || "Handcrafted resin piece.";
    
    const mainImg = document.getElementById("modalMainImage");
    mainImg.src = (product.images && product.images.length > 0) ? product.images[0] : "images/no-image.png";
    mainImg.alt = product.name;

    const specsList = document.getElementById("modalSpecsList");
    if (specsList) {
        specsList.innerHTML = (product.specs || ["Material: Premium Epoxy Resin"]).map(spec => `<li>${spec}</li>`).join("");
    }

    const thumbsContainer = document.getElementById("modalThumbnails");
    if (thumbsContainer) {
        thumbsContainer.innerHTML = (product.images || [mainImg.src]).map((img, idx) => `
            <img src="${img}" class="lightbox-thumb ${idx === 0 ? 'active' : ''}" onclick="switchModalImage(${idx})" alt="Thumbnail ${idx + 1}">
        `).join("");
    }

    const qtyInput = document.getElementById("modalQtyInput");
    if (qtyInput) qtyInput.value = 1;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function switchModalImage(index) {
    if (!activeModalProduct || !activeModalProduct.images[index]) return;
    activeModalImageIndex = index;
    const mainImg = document.getElementById("modalMainImage");
    mainImg.src = activeModalProduct.images[index];

    document.querySelectorAll(".lightbox-thumb").forEach((thumb, idx) => {
        if (idx === index) thumb.classList.add("active");
        else thumb.classList.remove("active");
    });
}

function closeImageModal() {
    const modal = document.getElementById("imageModal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
    }
}

function setupKeyboardListeners() {
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeImageModal();
    });
}

function changeModalQty(delta) {
    const input = document.getElementById("modalQtyInput");
    if (!input) return;
    let current = parseInt(input.value) || 1;
    current += delta;
    if (current < 1) current = 1;
    input.value = current;
}

// Buy Now Action handler
function handleBuyNow(productId) {
    if (!isUserAuthenticated()) {
        alert("Please Sign Up or Login first to purchase this resin artwork.");
        window.location.href = "login.html";
        return;
    }

    const all = cachedAllProducts.length > 0 ? cachedAllProducts : getCombinedProducts();
    const product = all.find(p => String(p.id) === String(productId) || p.name === productId);
    if (!product) return;

    addToCartItem({
        id: product.id,
        product: product.name,
        price: product.price,
        image: (product.images && product.images[0]) ? product.images[0] : "images/no-image.png",
        quantity: 1
    });

    localStorage.setItem("selectedProduct", product.name);
    window.location.href = "checkout.html";
}

function addModalProductToCart() {
    if (!isUserAuthenticated()) {
        alert("Please Login or Sign Up first to add items to your cart.");
        window.location.href = "login.html";
        return;
    }

    if (!activeModalProduct) return;
    const qty = parseInt(document.getElementById("modalQtyInput")?.value || 1);
    
    addToCartItem({
        id: activeModalProduct.id,
        product: activeModalProduct.name,
        price: activeModalProduct.price,
        image: activeModalProduct.images[0],
        quantity: qty
    });

    closeImageModal();
}

function buyModalProductNow() {
    if (!isUserAuthenticated()) {
        alert("Please Login or Sign Up first to buy this item.");
        window.location.href = "login.html";
        return;
    }

    if (!activeModalProduct) return;
    handleBuyNow(activeModalProduct.id);
}

function quickAddToCart(productId) {
    if (!isUserAuthenticated()) {
        alert("Please Login or Sign Up first to add items to your cart.");
        window.location.href = "login.html";
        return;
    }

    const all = cachedAllProducts.length > 0 ? cachedAllProducts : getCombinedProducts();
    const product = all.find(p => String(p.id) === String(productId));
    if (!product) return;

    addToCartItem({
        id: product.id,
        product: product.name,
        price: product.price,
        image: (product.images && product.images[0]) ? product.images[0] : "images/no-image.png",
        quantity: 1
    });
}

function addToCartItem(item) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex(c => c.product === item.product);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += item.quantity;
    } else {
        cart.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showToast(`Added "${item.product}" to cart! 🛍️`);
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    let countElement = document.getElementById("cartCount");
    if (countElement) {
        countElement.innerText = totalItems;
    }
}

function goToCart() {
    window.location.href = "checkout.html";
}

function addToWishlist(name, image, price) {
    if (!isUserAuthenticated()) {
        alert("Please Login or Sign Up first to save items to your wishlist.");
        window.location.href = "login.html";
        return;
    }

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    if (!wishlist.some(w => w.name === name)) {
        wishlist.push({ name, image, price });
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        showToast("Added to Wishlist ❤️");
    } else {
        showToast("Already in your Wishlist! ❤️");
    }
}

function loadUserProfile() {
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("name");
    const profile = document.getElementById("userProfile");
    const navLoginBtns = document.querySelectorAll("#navLoginBtn, .nav-login-btn");

    if (isUserAuthenticated() && email) {
        const displayName = name || email.split("@")[0];
        const firstLetter = displayName.charAt(0).toUpperCase();

        if (profile) {
            profile.innerHTML = `
                <a href="account.html" class="user-login-badge" title="Account Details (${email})">
                    <div style="width:26px; height:26px; border-radius:50%; background:var(--deep-teal); color:var(--primary-gold); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px;">
                        ${firstLetter}
                    </div>
                    <span>👤 ${displayName}</span>
                </a>
            `;
        }
        navLoginBtns.forEach(btn => {
            btn.href = "account.html";
            btn.innerHTML = "👤 Account";
        });
    } else {
        if (profile) {
            profile.innerHTML = `
                <a href="login.html" class="user-login-btn">
                    🔑 Login / Sign Up
                </a>
            `;
        }
        navLoginBtns.forEach(btn => {
            btn.href = "login.html";
            btn.innerHTML = "🔑 Login";
        });
    }
}

function loadReviews() {
    const reviewsContainer = document.getElementById("reviews");
    if (!reviewsContainer) return;

    const sampleReviews = [
        { user: "Priya Sharma", rating: 5, review: "The Ocean Wave resin clock looks breathtaking on our living room wall! Incredible craft quality." },
        { user: "Rohan Mehta", rating: 5, review: "Preserved floral coasters arrived safely packaged. The 24K gold foil trim gives them such a regal look!" },
        { user: "Ananya Patel", rating: 5, review: "Custom emerald wash basin transformed our master bathroom vanity completely. Super easy to clean too." }
    ];

    let html = "";
    sampleReviews.forEach(item => {
        const stars = "★".repeat(item.rating);
        html += `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${item.user}</span>
                    <span class="review-rating">${stars}</span>
                </div>
                <p style="color: #4A5568; font-size: 14px; margin: 0;">"${item.review}"</p>
            </div>
        `;
    });

    reviewsContainer.innerHTML = html;
}

function showToast(message) {
    let toast = document.getElementById("customToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "customToast";
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #0A3C4A;
            color: #D4AF37;
            padding: 14px 24px;
            border-radius: 25px;
            font-weight: 700;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 9999;
            transition: all 0.3s ease;
            transform: translateY(100px);
            opacity: 0;
        `;
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
    setTimeout(() => {
        toast.style.transform = "translateY(100px)";
        toast.style.opacity = "0";
    }, 3000);
}