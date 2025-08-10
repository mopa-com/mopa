function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = "toast";
  toast.textContent = msg;
  document.getElementById("toast-zone").appendChild(toast);
  setTimeout(()=>toast.remove(), 2100);
}

Promise.all([
  fetch('assets/products.json').then(r=>r.json()),
  Promise.resolve(JSON.parse(localStorage.getItem('added_products')||"[]"))
]).then(([products, added])=>{
  products = products.concat(added);
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const itemsDiv = document.getElementById('cart-items');
  if(cart.length === 0) {
    itemsDiv.innerHTML = "<p>Votre panier est vide.</p>";
    document.getElementById('cart-total').textContent = '';
    return;
  }
  let stockData = JSON.parse(localStorage.getItem("product_stock") || "{}");
  let total = 0;
  itemsDiv.innerHTML = '';
  cart.forEach((item, idx) => {
    const prod = products.find(p=>p.id === item.id);
    let currStock = stockData[prod.id] !== undefined ? stockData[prod.id] : prod.stock;
    let out = item.qty > currStock;
    total += prod.price * item.qty;
    itemsDiv.innerHTML += `
      <div class="product-card">
        <img src="${prod.image}" alt="${prod.name}">
        <h2>${prod.name}</h2>
        <div>Prix unitaire : <b>${prod.price.toFixed(2)} €</b></div>
        <div>Quantité : ${item.qty}</div>
        <div>Sous-total : <b>${(prod.price*item.qty).toFixed(2)} €</b></div>
        <div class="stock-badge ${out?'out':''}">${out?'Stock épuisé':'Stock ok'}</div>
        <button class="btn" data-idx="${idx}">Retirer</button>
      </div>
    `;
  });
  document.getElementById('cart-total').textContent = `Total : ${total.toFixed(2)} €`;

  // Suppression d’un article
  itemsDiv.addEventListener('click', e => {
    if(e.target.classList.contains('btn')) {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      cart.splice(Number(e.target.dataset.idx), 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      showToast("Produit retiré du panier !");
      location.reload();
    }
  });
  updateCartCount();
});

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let count = cart.reduce((t, i) => t+i.qty, 0);
  let floatBadge = document.getElementById('cart-count-float');
  if (floatBadge) floatBadge.textContent = count;
}
updateCartCount();