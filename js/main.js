let allProducts = [];

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = "toast";
  toast.textContent = msg;
  document.getElementById("toast-zone").appendChild(toast);
  setTimeout(()=>toast.remove(), 2100);
}

// Charger produits JSON + localStorage
Promise.all([
  fetch('assets/products.json').then(r=>r.json()),
  Promise.resolve(JSON.parse(localStorage.getItem('added_products')||"[]"))
]).then(([products, added])=>{
  products = products.concat(added);
  // Récupérer les stocks locaux si besoin
  let stockData = JSON.parse(localStorage.getItem("product_stock") || "{}");
  products.forEach(p => {
    if(stockData[p.id] !== undefined) p.stock = stockData[p.id];
  });
  allProducts = products;
  renderProducts(products);
  updateCartCount();
});

// Affiche la grille filtrée
function renderProducts(products) {
  const grid = document.getElementById('products');
  grid.innerHTML = "";
  if (products.length === 0) {
    grid.innerHTML = "<p>Aucun produit ne correspond à votre recherche.</p>";
    return;
  }
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    let stockClass = '';
    let stockLabel = '';
    if (p.stock <= 0) {
      stockClass = 'out';
      stockLabel = 'Épuisé';
    } else if (p.stock <= 3) {
      stockClass = 'low';
      stockLabel = `Bientôt épuisé (${p.stock})`;
    } else {
      stockLabel = `${p.stock} en stock`;
    }
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h2>${p.name}</h2>
      <p>${p.description}</p>
      <div><b>${p.price.toFixed(2)} €</b></div>
      <div class="stock-badge ${stockClass}">${stockLabel}</div>
      <button class="btn" data-id="${p.id}" ${p.stock<=0?'disabled':''}>Ajouter au panier</button>
    `;
    grid.appendChild(card);
  });
}

// Recherche & Filtres
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const priceFilter = document.getElementById('price-filter');

  function filterProducts() {
    let filtered = allProducts.slice();
    // Recherche
    const q = searchInput.value.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    // Catégorie
    const cat = categoryFilter.value;
    if (cat) filtered = filtered.filter(p => p.category === cat);
    // Prix
    const prix = priceFilter.value;
    if (prix === "1") filtered = filtered.filter(p => p.price < 20);
    else if (prix === "2") filtered = filtered.filter(p => p.price >= 20 && p.price <= 40);
    else if (prix === "3") filtered = filtered.filter(p => p.price > 40);
    renderProducts(filtered);
  }

  searchInput && searchInput.addEventListener('input', filterProducts);
  categoryFilter && categoryFilter.addEventListener('change', filterProducts);
  priceFilter && priceFilter.addEventListener('change', filterProducts);

  // Gestion des boutons Ajouter au panier
  document.getElementById('products').addEventListener('click', e => {
    if(e.target.classList.contains('btn')) {
      addToCart(Number(e.target.dataset.id), allProducts);
      filterProducts(); // pour désactiver le bouton si stock épuisé
    }
  });
});

function addToCart(id, productsArr) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const idx = cart.findIndex(item => item.id === id);
  const products = productsArr || [];
  const prod = products.find(p=>p.id===id);
  let stockData = JSON.parse(localStorage.getItem("product_stock") || "{}");
  const currentStock = stockData[id] !== undefined ? stockData[id] : prod ? prod.stock : 0;
  let cartQty = idx>-1 ? cart[idx].qty : 0;
  if (cartQty + 1 > currentStock) {
    showToast("Stock insuffisant !");
    return;
  }
  if(idx > -1) { cart[idx].qty += 1; }
  else { cart.push({id, qty: 1}); }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showToast("Produit ajouté au panier !");
}

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  document.getElementById('cart-count').textContent = cart.reduce((t, i) => t+i.qty, 0);
  let floatBadge = document.getElementById('cart-count-float');
  if (floatBadge) floatBadge.textContent = cart.reduce((t, i) => t+i.qty, 0);
}
updateCartCount();