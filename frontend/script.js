function showMessage(){
    alert("Welcome to Niva Aura Resin Art");
}
let currentProduct="";
let currentPrice=0;

function openPopup(name,price){

    currentProduct=name;
    currentPrice=price;

    document.getElementById("productName").innerText=name;

    document.getElementById("popup").style.display="block";
}

function closePopup(){

    document.getElementById("popup").style.display="none";
}
function addToCart(){

    // Check if user is logged in
    const email = localStorage.getItem("email");

    if(!email){

        alert("Please Login or Sign Up first.");

        window.location.href = "login.html";
        return;
    }

    let qty = document.getElementById("qty").value;

    let item = {
        product: currentProduct,
        price: currentPrice,
        quantity: parseInt(qty)
    };

    let cart =
    JSON.parse(localStorage.getItem("cart")) || [];

    cart.push(item);

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    alert("Product Added To Cart");

    closePopup();

    updateCartCount();

    // Open cart automatically
    window.location.href = "cart.html";
}
function updateCartCount(){

    let cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    let countElement =
        document.getElementById("cartCount");

    if(countElement){
        countElement.innerHTML = cart.length;
    }
}

function goToCart(){
    window.location.href = "cart.html";
}
function searchProducts(){

    let input =
    document.getElementById("searchInput")
    .value.toLowerCase();

    let products =
    document.querySelectorAll(".product");

    products.forEach(product => {

        let text =
        product.innerText.toLowerCase();

        if(text.includes(input)){

            product.style.display =
            "block";

        }else{

            product.style.display =
            "none";
        }

    });
}
async function loadProducts(){

    const response =
    await fetch(
    "https://niva-aura-resin-art.onrender.com/products"
    );

    const products =
    await response.json();

    let html = "";

    products.forEach(product => {

        html += `
        <div class="product">

            <div class="image-gallery">

    <img
    id="main-${product._id}"
    class="main-image"
    src="${product.images && product.images.length > 0
? product.images[0]
: 'images/no-image.png'}">

    <div class="thumbnail-row">

        ${
            (product.images || []).map(image => `
            <img
            class="thumbnail"
            src="${image}"
            onclick="changeImage('main-${product._id}','${image}')">
        `).join("")
        }

    </div>

</div>



            <h3>${product.name}</h3>

            <p>₹${product.price}</p>

            <button onclick="openPopup('${product.name}',${product.price})">
                Add To Cart
            </button>

        </div>
        `;
    });

    document.getElementById("products")
    .innerHTML = html;
}
function changeImage(mainId, image){

    document.getElementById(mainId).src = image;

}

function checkLoginStatus(){

    let token = localStorage.getItem("token");

    let accountSection =
    document.getElementById("accountSection");

    if(!accountSection) return;

    if(token){

        accountSection.innerHTML = `
        <a href="account.html"
        style="
        text-decoration:none;
        font-size:18px;
        font-weight:bold;
        color:#000;">
        👤 My Account
        </a>
        `;

    }else{

        accountSection.innerHTML = `
        <a href="login.html"
        style="
        text-decoration:none;
        font-size:18px;
        font-weight:bold;
        color:#000;">
        Login
        </a>
        `;
    }
}
function loadUserProfile(){

    let email =
    localStorage.getItem("email");

    let profile =
    document.getElementById("userProfile");

    if(!profile) return;

    if(email){

        let firstLetter =
        email.charAt(0).toUpperCase();

        profile.innerHTML = `
        <div class="profile-circle"
        onclick="window.location.href='account.html'">
            ${firstLetter}
        </div>
        `;

    }else{

        profile.innerHTML = `
        <a href="login.html">
            Login
        </a>
        `;
    }
}
async function submitReview(){

    const user =
    localStorage.getItem("name");

    const rating =
    document.getElementById("rating").value;

    const review =
    document.getElementById("review").value;

    const response =
    await fetch(
    "https://niva-aura-resin-art.onrender.com/review",
    {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            product:"Niva Aura",
            user,
            rating,
            review
        })
    });

    const data =
    await response.json();

    alert(data.message);

    loadReviews();
}

async function loadReviews(){

    const response =
    await fetch(
    "https://niva-aura-resin-art.onrender.com/reviews/Niva Aura"
    );

    const reviews =
    await response.json();

    let html = "";

    reviews.forEach(item => {

        html += `
        <div class="product">

            <h3>${item.user}</h3>

            <p>⭐ ${item.rating}/5</p>

            <p>${item.review}</p>

        </div>
        `;
    });

    document.getElementById(
    "reviews"
    ).innerHTML = html;
}


window.onload = function(){

    updateCartCount();
    loadProducts();
    loadUserProfile();
    loadReviews();

}

function addToWishlist(name,image,price){

    let wishlist =
    JSON.parse(
    localStorage.getItem("wishlist")
    ) || [];

    wishlist.push({
        name:name,
        image:image,
        price:price
    });

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    alert("Added To Wishlist ❤️");
}

function checkLogin(productName) {

    const email = localStorage.getItem("email");

    if (!email) {

        alert("Please Sign Up or Login first to purchase this item.");

        window.location.href = "login.html";

        return;
    }

    localStorage.setItem("selectedProduct", productName);

    window.location.href = "payment.html";
}