/* =============================================================
   script.js — Ositos & Co.
   Flujo completo: Catálogo -> Personalización -> Carrito -> Pago
   ============================================================= */

let carrito = [];
let osoActivo = { nombre: "Happy Hugs Teddy", emoji: "🧸", precioBase: 28.00 };

// --- 1. BUSCADOR ---
const searchForm = document.getElementById("search-form");
if (searchForm) {
  searchForm.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const inputBusqueda = searchForm.querySelector("input[type='search']");
    const textoBuscado = inputBusqueda.value.trim();
    if (textoBuscado === "") return alert("⚠️ Escribe algo antes de buscar.");
    alert(`🔍 Buscando: "${textoBuscado}"`);
    inputBusqueda.value = "";
  });
}

// --- 2. CALCULADORA VISUAL ---
const seccionPersonaliza = document.getElementById("personaliza");
const opcionesExtra = [
  { id: "opt-relleno",   label: "Relleno extra suave",   precio: 8.00,  icono: "🧶" },
  { id: "opt-sonido",    label: "Sonido grabado",        precio: 15.00, icono: "🎵" },
  { id: "opt-camiseta",  label: "Camiseta con nombre",   precio: 12.00, icono: "👕" },
];

if (seccionPersonaliza) {
  const calculadoraHTML = `
    <div class="calculadora-wrapper" id="calculadora">
      <h3 class="calc-titulo">🧮 Configurando: <span id="oso-activo-nombre" style="color:#0056b3;">${osoActivo.nombre}</span></h3>
      <p class="calc-desc">Precio base: <strong id="oso-activo-precio">$${osoActivo.precioBase.toFixed(2)}</strong></p>
      <ul class="calc-opciones" id="calc-opciones">
        ${opcionesExtra.map(op => `
          <li class="calc-item">
            <label class="calc-label" for="${op.id}">
              <input type="checkbox" id="${op.id}" class="calc-checkbox" data-precio="${op.precio}" data-nombre="${op.label}" />
              <span class="calc-check-icon"></span>
              <span class="calc-texto">${op.icono} ${op.label}</span>
              <span class="calc-precio-extra">+ $${op.precio.toFixed(2)}</span>
            </label>
          </li>
        `).join("")}
      </ul>
      <div class="calc-resultado" id="calc-resultado">
        Total estimado: <strong id="calc-total">$${osoActivo.precioBase.toFixed(2)}</strong>
      </div>
    </div>
  `;

  const textoPersonaliza = seccionPersonaliza.querySelector(".personaliza-text");
  const botonConfirmar = textoPersonaliza.querySelector(".btn-confirm");
  if (botonConfirmar) botonConfirmar.insertAdjacentHTML("beforebegin", calculadoraHTML);

  const listaOpciones = document.getElementById("calc-opciones");
  const displayTotal  = document.getElementById("calc-total");

  function recalcularTotal() {
    const checkboxes = listaOpciones.querySelectorAll(".calc-checkbox:checked");
    let sumaExtras = 0;
    checkboxes.forEach(cb => sumaExtras += Number(cb.dataset.precio));
    const totalFinal = osoActivo.precioBase + sumaExtras;
    displayTotal.textContent = "$" + totalFinal.toFixed(2);
  }

  if (listaOpciones) {
    listaOpciones.addEventListener("change", function(e) {
      if (e.target.classList.contains("calc-checkbox")) recalcularTotal();
    });
  }
}

// --- 3. SELECCIONAR OSO DESDE EL CATÁLOGO ---
const cardsGrid = document.querySelector(".cards-grid");
if (cardsGrid) {
  cardsGrid.addEventListener("click", function (evento) {
    const botonAnadir = evento.target.closest(".btn-add");
    if (!botonAnadir) return;

    const tarjeta = botonAnadir.closest(".product-card");
    osoActivo.nombre = tarjeta.querySelector(".card-title").textContent;
    osoActivo.emoji = tarjeta.querySelector(".card-img").textContent;
    osoActivo.precioBase = parseFloat(tarjeta.querySelector(".card-price").textContent.replace('$', ''));

    document.querySelector(".large-img").textContent = osoActivo.emoji;
    document.getElementById("oso-activo-nombre").textContent = osoActivo.nombre;
    document.getElementById("oso-activo-precio").textContent = "$" + osoActivo.precioBase.toFixed(2);

    document.querySelectorAll(".calc-checkbox").forEach(cb => cb.checked = false);
    document.getElementById("calc-total").textContent = "$" + osoActivo.precioBase.toFixed(2);
    seccionPersonaliza.scrollIntoView({ behavior: 'smooth' });
  });
}

// --- 4. AÑADIR AL CARRITO ---
const btnConfirmar = document.querySelector(".btn-confirm");
if (btnConfirmar) {
  btnConfirmar.addEventListener("click", function() {
    const checkboxesMarcados = document.querySelectorAll(".calc-checkbox:checked");
    let extrasElegidos = [];
    let costoExtras = 0;

    checkboxesMarcados.forEach(cb => {
      extrasElegidos.push(cb.dataset.nombre);
      costoExtras += Number(cb.dataset.precio);
    });

    carrito.push({
      nombre: osoActivo.nombre, emoji: osoActivo.emoji,
      extras: extrasElegidos, total: (osoActivo.precioBase + costoExtras)
    });

    actualizarCarrito();
    if (!document.getElementById("cart-sidebar").classList.contains("active")) toggleCart();
    
    document.querySelectorAll(".calc-checkbox").forEach(cb => cb.checked = false);
    document.getElementById("calc-total").textContent = "$" + osoActivo.precioBase.toFixed(2);
  });
}

// --- 5. VENTANITA DEL CARRITO ---
const btnOpenCart = document.getElementById("open-cart");
const btnCloseCart = document.getElementById("close-cart");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotalPrice = document.getElementById("cart-total-price");

function toggleCart() {
  cartSidebar.classList.toggle("active");
  cartOverlay.classList.toggle("active");
}

if (btnOpenCart) btnOpenCart.addEventListener("click", toggleCart);
if (btnCloseCart) btnCloseCart.addEventListener("click", toggleCart);
if (cartOverlay) cartOverlay.addEventListener("click", toggleCart);

function actualizarCarrito() {
  cartCount.textContent = carrito.length;
  cartItemsContainer.innerHTML = "";

  if (carrito.length === 0) {
    cartItemsContainer.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
    cartTotalPrice.textContent = "$0.00";
    return;
  }

  let totalCompra = 0;
  carrito.forEach((item) => {
    totalCompra += item.total;
    const textoExtras = item.extras.length > 0 ? item.extras.join(', ') : 'Sin extras adicionales';
    const div = document.createElement("div");
    div.className = "cart-item";
    div.style = "flex-direction: column; align-items: flex-start;";
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <span>${item.emoji} <strong>${item.nombre}</strong></span>
        <span style="color: #0056b3;">$${item.total.toFixed(2)}</span>
      </div>
      <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">
        <i class="fa-solid fa-plus"></i> ${textoExtras}
      </div>
    `;
    cartItemsContainer.appendChild(div);
  });
  cartTotalPrice.textContent = "$" + totalCompra.toFixed(2);
}

// --- 6. VACIAR CARRITO AL PAGAR ---
const btnCheckout = document.getElementById("checkout-btn");
if (btnCheckout) {
  btnCheckout.addEventListener("click", function() {
    if (carrito.length === 0) {
      alert("⚠️ Tu carrito está vacío. ¡Añade algunos ositos primero!");
      return;
    }
    
    alert("✅ ¡Gracias por tu compra!\nTu pedido de Ositos ha sido procesado con éxito.");
    
    carrito = []; // Vacía la memoria del carrito
    actualizarCarrito(); // Borra los ositos de la ventanita visualmente
    toggleCart(); // Cierra la ventanita sola
  });
}