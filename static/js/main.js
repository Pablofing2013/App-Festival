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
        <div>
          <button class="btn btn-sm btn-danger me-1" onclick="modificarCantidad(${index}, -1)">-</button>
          <button class="btn btn-sm btn-success me-2" onclick="modificarCantidad(${index}, 1)">+</button>
          ${item.nombre} - $${item.precio}
        </div>
        <div>
          <button class="btn btn-sm btn-warning me-1" onclick="editarItem('${item.nombre}', ${item.precio})">✏️</button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarItem('${item.nombre}')">🗑️</button>
        </div>
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

function eliminarItem(nombre) {
  if (!confirm(`¿Eliminar "${nombre}"?`)) return;
  fetch('/items/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'ok') {
      carrito = {};
      fetchItems();
      renderFactura();
      calcularFactura();
    } else {
      alert('Error al eliminar ítem');
    }
  });
}

function editarItem(nombre, precio) {
  const nuevo_nombre = prompt('Nuevo nombre:', nombre);
  const nuevo_precio = parseFloat(prompt('Nuevo precio:', precio));
  if (!nuevo_nombre || isNaN(nuevo_precio) || nuevo_precio <= 0) {
    alert('Datos inválidos');
    return;
  }

  fetch('/items/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre_original: nombre,
      nuevo_nombre,
      nuevo_precio
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'ok') {
      carrito = {};
      fetchItems();
      renderFactura();
      calcularFactura();
    } else {
      alert('Error al editar ítem');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchItems();
  document.getElementById('pagado').addEventListener('input', calcularFactura);
});
