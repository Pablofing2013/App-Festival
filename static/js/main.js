let items = [];
let carrito = {};

function fetchItems() {
  fetch('/items')
    .then(res => res.json())
    .then(data => {
      items = data;
      renderItems();
    });
}

function renderItems() {
  const panel = document.getElementById('item-panel');
  panel.innerHTML = '';
  items.forEach((item, index) => {
    panel.innerHTML += `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <button class="btn btn-sm btn-danger" onclick="modificarCantidad(${index}, -1)">-</button>
        <span>${item.nombre} - $${item.precio}</span>
        <button class="btn btn-sm btn-success" onclick="modificarCantidad(${index}, 1)">+</button>
      </div>
    `;
  });
}

function modificarCantidad(index, delta) {
  const nombre = items[index].nombre;
  carrito[nombre] = (carrito[nombre] || 0) + delta;
  if (carrito[nombre] <= 0) delete carrito[nombre];
  renderFactura();
  calcularFactura();
}

function renderFactura() {
  const panel = document.getElementById('factura-panel');
  panel.innerHTML = '';
  let total = 0;
  for (let nombre in carrito) {
    const item = items.find(i => i.nombre === nombre);
    const cantidad = carrito[nombre];
    const subtotal = cantidad * item.precio;
    total += subtotal;
    panel.innerHTML += `<div>${nombre} x${cantidad} = $${subtotal}</div>`;
  }
  panel.innerHTML += `<div><strong>Total: $${total}</strong></div>`;
}

function calcularFactura() {
  const pagado = parseFloat(document.getElementById('pagado').value) || 0;
  const facturaItems = Object.entries(carrito).map(([nombre, cantidad]) => {
    const item = items.find(i => i.nombre === nombre);
    return { nombre, cantidad, precio: item.precio };
  });

  fetch('/facturar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: facturaItems, pagado })
  })
  .then(res => res.json())
  .then(data => {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = `
      <div><strong>Total:</strong> $${data.total}</div>
      <div><strong>Vuelto:</strong> $${data.vuelto}</div>
    `;
    resultado.style.color = data.vuelto < 0 ? 'red' : 'black';
  });
}

function agregarItem() {
  const nombre = document.getElementById('nuevo-nombre').value.trim();
  const precio = parseFloat(document.getElementById('nuevo-precio').value);

  if (!nombre || isNaN(precio) || precio <= 0) {
    alert('Nombre y precio válidos son requeridos');
    return;
  }

  fetch('/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, precio })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'ok') {
      carrito = {};
      fetchItems();
      document.getElementById('nuevo-nombre').value = '';
      document.getElementById('nuevo-precio').value = '';
      renderFactura();
      calcularFactura();
    } else {
      alert('Error al agregar ítem');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchItems();
  document.getElementById('pagado').addEventListener('input', calcularFactura);
});
