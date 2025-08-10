const ADMIN_CODE = "2011";

document.getElementById("admin-login").onclick = function() {
  const pass = document.getElementById("admin-pass").value;
  if (pass === ADMIN_CODE) {
    document.getElementById("admin-auth").style.display = "none";
    document.getElementById("admin-content").style.display = "block";
    showSales();
    showStock();
  } else {
    alert("Code incorrect !");
  }
};

function showSales() {
  let orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const salesDiv = document.getElementById('sales');
  if(orders.length === 0) {
    salesDiv.innerHTML = "<p>Aucune vente enregistrée.</p>";
  } else {
    salesDiv.innerHTML = `<b>Nombre de ventes :</b> ${orders.length}`;
    orders.reverse().forEach(o => {
      salesDiv.innerHTML += `
        <div class="sale">
          <b>${o.name}</b> (${o.email})<br>
          ${o.address}<br>
          <small>${new Date(o.date).toLocaleString()}</small>
          <ul>${o.cart.map(i=>`<li>Produit #${i.id} x${i.qty}</li>`).join('')}</ul>
        </div>
        <hr>
      `;
    });
  }
}

function showStock() {
  Promise.all([
    fetch('assets/products.json').then(r=>r.json()),
    Promise.resolve(JSON.parse(localStorage.getItem("added_products")||"[]"))
  ]).then(([products, added])=>{
    products = products.concat(added);
    let stockData = JSON.parse(localStorage.getItem("product_stock") || "{}");
    products.forEach(p => {
      if(stockData[p.id] !== undefined) p.stock = stockData[p.id];
    });
    const stockDiv = document.getElementById("stock");
    stockDiv.innerHTML = products.map(
      p => `<div>${p.name} – <b>${p.stock}</b> en stock</div>`
    ).join('');
  });
}

// Ajout d’un produit via le formulaire admin
document.getElementById("add-product-form").onsubmit = function(e) {
  e.preventDefault();
  const f = this;
  let added = JSON.parse(localStorage.getItem("added_products") || "[]");
  // Générer un nouvel ID unique (id max + 1)
  let allIds = added.map(p=>p.id);
  fetch("assets/products.json")
    .then(r=>r.json())
    .then(products=>{
      allIds = allIds.concat(products.map(p=>p.id));
      const nextId = Math.max(...allIds,0)+1;
      const prod = {
        id: nextId,
        name: f.name.value,
        price: parseFloat(f.price.value),
        stock: parseInt(f.stock.value),
        image: f.image.value,
        description: f.description.value
      };
      added.push(prod);
      localStorage.setItem("added_products", JSON.stringify(added));
      document.getElementById("add-product-msg").textContent = "Produit ajouté !";
      f.reset();
      showStock();
    });
};