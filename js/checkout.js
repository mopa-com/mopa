document.getElementById('checkout-form').addEventListener('submit', function(e) {
  e.preventDefault();
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if(cart.length === 0) {
    alert("Votre panier est vide.");
    return;
  }
  // Gestion du stock
  fetch('assets/products.json')
    .then(r => r.json())
    .then(products => {
      let stockData = JSON.parse(localStorage.getItem("product_stock") || "{}");
      let ok = true;
      cart.forEach(item => {
        const prod = products.find(p=>p.id === item.id);
        let stock = stockData[prod.id] !== undefined ? stockData[prod.id] : prod.stock;
        if(stock < item.qty) ok = false;
      });
      if(!ok) {
        alert("Stock insuffisant pour un ou plusieurs produits.");
        return;
      }
      // Décrémentation du stock
      cart.forEach(item => {
        const prod = products.find(p=>p.id === item.id);
        let stock = stockData[prod.id] !== undefined ? stockData[prod.id] : prod.stock;
        stock -= item.qty;
        stockData[prod.id] = stock;
      });
      localStorage.setItem("product_stock", JSON.stringify(stockData));
      // Enregistrer la commande
      const order = {
        name: this.name.value,
        email: this.email.value,
        address: this.address.value,
        cart,
        date: new Date().toISOString()
      };
      let orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      localStorage.removeItem('cart');
      document.getElementById('checkout-form').style.display = 'none';
      document.getElementById('confirmation').style.display = 'block';
      document.getElementById('confirmation').innerHTML = "<h2>Merci pour votre commande !</h2>";
    });
});