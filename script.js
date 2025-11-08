/* Script utama: katalog, pencarian navbar, keranjang (localStorage), checkout simulasi, modal detail */
const katalog = [
  {
    id: "dslr",
    jenis: "DSLR",
    contoh: "Canon EOS 90D / Nikon D5600",
    gambar:
      "https://images.unsplash.com/photo-1519183071298-a2962be54a10?auto=format&fit=crop&w=800&q=60",
    deskripsi: "Refleks digital...",
    harga: 7500000,
  },
  {
    id: "mirrorless",
    jenis: "Mirrorless",
    contoh: "Sony a6400 / Fujifilm X-T30",
    gambar:
      "https://images.unsplash.com/photo-1519181245277-cffeb31da2b2?auto=format&fit=crop&w=800&q=60",
    deskripsi: "Tanpa cermin...",
    harga: 10000000,
  },
  {
    id: "compact",
    jenis: "Compact / Point-and-Shoot",
    contoh: "Sony RX100 / Canon PowerShot",
    gambar:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=60",
    deskripsi: "Kamera saku...",
    harga: 5000000,
  },
  {
    id: "action",
    jenis: "Action Camera",
    contoh: "GoPro HERO / DJI Action",
    gambar:
      "https://images.unsplash.com/photo-1592853929274-1f3ae2d7ea9f?auto=format&fit=crop&w=800&q=60",
    deskripsi: "Kamera kecil tahan banting...",
    harga: 6000000,
  },
  {
    id: "bridge",
    jenis: "Bridge",
    contoh: "Sony RX10 / Canon SX series",
    gambar:
      "https://images.unsplash.com/photo-1517059224940-d4af9eec41e8?auto=format&fit=crop&w=800&q=60",
    deskripsi: "Jembatan antara compact dan DSLR...",
    harga: 4500000,
  },
  {
    id: "mediumformat",
    jenis: "Medium Format",
    contoh: "Fujifilm GFX / Hasselblad X1D",
    gambar:
      "https://images.unsplash.com/photo-1504203700689-4bb9d13a0b1c?auto=format&fit=crop&w=800&q=60",
    deskripsi: "Sensor besar...",
    harga: 30000000,
  },
  {
    id: "rangefinder",
    jenis: "Rangefinder / Classic",
    contoh: "Leica M series",
    gambar:
      "https://images.unsplash.com/photo-1501601960684-0c46b0d3f5c9?auto=format&fit=crop&w=800&q=60",
    deskripsi: "Gaya klasik...",
    harga: 24000000,
  },
];

// ---------- Auth (existing) ----------
const validUsername = "kamera";
const validPassword = "123";
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const greeting = document.getElementById("greeting");

if (loginForm) {
  if (localStorage.getItem("loggedIn") === "true") {
    window.location.href = "index.html";
  }
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");
    if (username === validUsername && password === validPassword) {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("username", username);
      window.location.href = "index.html";
    } else {
      errorMsg.textContent = "Username atau password salah!";
    }
  });
}

if (!loginForm) {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
  } else {
    const user = localStorage.getItem("username") || "";
    if (greeting) greeting.textContent = user ? `Halo, ${user}` : "";
    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("username");
        window.location.href = "login.html";
      });
    }
  }
}

// ---------- Cart (localStorage) ----------
const CART_KEY = "katalog_cart_v1";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCountUI();
}

function addToCart(itemId, qty = 1) {
  const product = katalog.find((p) => p.id === itemId);
  if (!product) return;
  const cart = getCart();
  const found = cart.find((c) => c.id === itemId);
  if (found) found.qty += qty;
  else
    cart.push({
      id: itemId,
      qty: qty,
      price: product.harga,
      nama: product.jenis,
    });
  saveCart(cart);
}

function removeFromCart(itemId) {
  let cart = getCart();
  cart = cart.filter((c) => c.id !== itemId);
  saveCart(cart);
}

function updateQty(itemId, qty) {
  const cart = getCart();
  const it = cart.find((c) => c.id === itemId);
  if (!it) return;
  it.qty = Math.max(0, qty);
  if (it.qty === 0) removeFromCart(itemId);
  else saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartCountUI();
}

function updateCartCountUI() {
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById("cartCount");
  const el2 = document.getElementById("cartCountCheckout");
  if (el) el.textContent = count;
  if (el2) el2.textContent = count;
}

// ---------- Rendering katalog & UI ----------
const catalogEl = document.getElementById("catalog");
const filterType = document.getElementById("filterType");
const modal = document.getElementById("detailModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const comparisonWrapper = document.getElementById("comparisonTableWrapper");
const recommendationList = document.getElementById("recommendationList");
const navSearch = document.getElementById("navSearch");

// populate filter
(function populateFilter() {
  const types = [...new Set(katalog.map((k) => k.jenis))];
  types.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    filterType.appendChild(opt);
  });
})();

function rupiah(n) {
  return "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function renderCatalog(list) {
  if (!catalogEl) return;
  catalogEl.innerHTML = "";
  list.forEach((k) => {
    const card = document.createElement("article");
    card.className = "kamera-card";
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${k.gambar}" alt="${k.jenis} - ${k.contoh}" />
      <h3>${k.jenis}</h3>
      <p class="contoh">${k.contoh}</p>
      <p class="harga-terkini">Harga: <strong>${rupiah(k.harga)}</strong></p>
      <div class="card-actions">
        <button class="detailBtn" data-id="${k.id}">Lihat Detail</button>
        <button class="addCartBtn" data-id="${
          k.id
        }">Tambah ke Keranjang</button>
      </div>
    `;
    card
      .querySelector(".detailBtn")
      .addEventListener("click", () => openDetail(k.id));
    card.querySelector(".addCartBtn").addEventListener("click", () => {
      addToCart(k.id, 1);
      alert(`${k.jenis} ditambahkan ke keranjang`);
    });
    catalogEl.appendChild(card);
  });
}

// detail modal
function openDetail(id) {
  const k = katalog.find((x) => x.id === id);
  if (!k) return;
  modalBody.innerHTML = `
    <h2 id="modalTitle">${k.jenis} — ${k.contoh}</h2>
    <div class="modal-grid">
      <div class="modal-left">
        <img src="${k.gambar}" alt="${k.jenis}" />
        <p>${k.deskripsi}</p>
      </div>
      <div class="modal-right">
        <p><strong>Harga estimasi:</strong> ${rupiah(k.harga)}</p>
        <p><strong>Rekomendasi:</strong> ${k.jenis}</p>
        <div style="margin-top:12px">
          <button id="modalAddCart">Tambah ke Keranjang</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("modalAddCart").addEventListener("click", () => {
    addToCart(k.id, 1);
    alert(k.jenis + " ditambahkan ke keranjang");
  });
  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
  closeModal.focus();
}

if (closeModal) closeModal.addEventListener("click", closeDetail);
if (modal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeDetail();
  });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDetail();
});

function closeDetail() {
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modalBody.innerHTML = "";
}

function renderComparisonTable() {
  if (!comparisonWrapper) return;
  const headers = [
    "Jenis",
    "Fokus Utama",
    "Kelebihan",
    "Kekurangan",
    "Harga Perkiraan",
  ];
  const table = document.createElement("table");
  table.className = "comparison-table";
  let thead =
    "<thead><tr>" +
    headers.map((h) => `<th>${h}</th>`).join("") +
    "</tr></thead>";
  let tbody =
    "<tbody>" +
    katalog
      .map(
        (k) => `
    <tr>
      <td class="left"><strong>${k.jenis}</strong><div class="small">${
          k.contoh
        }</div></td>
      <td>${k.deskripsi}</td>
      <td>-</td>
      <td>-</td>
      <td>${rupiah(k.harga)}</td>
    </tr>
  `
      )
      .join("") +
    "</tbody>";
  table.innerHTML = thead + tbody;
  comparisonWrapper.innerHTML = "";
  comparisonWrapper.appendChild(table);
}

function renderRecommendations() {
  if (!recommendationList) return;
  const picks = katalog.filter((k) =>
    ["Compact / Point-and-Shoot", "Mirrorless", "DSLR", "Bridge"].includes(
      k.jenis
    )
  );
  recommendationList.innerHTML = picks
    .map(
      (k) => `
    <div class="rec-card">
      <img src="${k.gambar}" alt="${k.jenis}" />
      <div>
        <h3>${k.jenis}</h3>
        <p class="small">Perkiraan harga: <strong>${rupiah(
          k.harga
        )}</strong></p>
        <button onclick="openDetail('${k.id}')">Lihat Detail</button>
      </div>
    </div>
  `
    )
    .join("");
}

// search & filter
const searchInput = navSearch || document.getElementById("search");
function applyFilters() {
  const q = (searchInput?.value || "").toLowerCase();
  const t = filterType?.value || "";
  const filtered = katalog.filter((k) => {
    const hay = (k.jenis + " " + k.contoh + " " + k.deskripsi).toLowerCase();
    const matchesQ = hay.includes(q);
    const matchesT = t ? k.jenis === t : true;
    return matchesQ && matchesT;
  });
  renderCatalog(filtered);
}
if (filterType) filterType.addEventListener("change", applyFilters);
if (searchInput) searchInput.addEventListener("input", applyFilters);

// initial render (only on index)
renderCatalog(katalog);
renderComparisonTable();
renderRecommendations();
updateCartCountUI();

// ---------- Checkout page logic (runs when on checkout.html) ----------
const cartItemsEl = document.getElementById("cartItems");
const cartSummaryEl = document.getElementById("cartSummary");
const checkoutForm = document.getElementById("checkoutForm");
const emptyNotice = document.getElementById("emptyNotice");

function renderCartPage() {
  const cart = getCart();
  if (!cartItemsEl) return;
  if (cart.length === 0) {
    cartItemsEl.innerHTML = "";
    cartSummaryEl.innerHTML = "";
    if (emptyNotice) emptyNotice.style.display = "block";
    return;
  }
  if (emptyNotice) emptyNotice.style.display = "none";
  const rows = cart
    .map((item) => {
      const prod = katalog.find((p) => p.id === item.id) || {};
      const subtotal = item.qty * (item.price || prod.harga || 0);
      return `
      <div class="cart-row" data-id="${item.id}">
        <img src="${prod.gambar}" alt="${prod.jenis}" />
        <div class="cart-info">
          <strong>${prod.jenis}</strong>
          <div class="small">${prod.contoh || ""}</div>
          <div>Harga: ${rupiah(item.price || prod.harga)}</div>
          <div>Subtotal: ${rupiah(subtotal)}</div>
          <div class="cart-controls">
            <label>Jumlah <input type="number" class="qtyInput" value="${
              item.qty
            }" min="0" /></label>
            <button class="removeBtn">Hapus</button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
  cartItemsEl.innerHTML = rows;
  const total = cart.reduce(
    (s, i) =>
      s + i.qty * (i.price || katalog.find((p) => p.id === i.id)?.harga || 0),
    0
  );
  cartSummaryEl.innerHTML = `<h3>Total: ${rupiah(
    total
  )}</h3><p class="small">Jumlah item: ${cart.reduce(
    (s, i) => s + i.qty,
    0
  )}</p>`;

  // attach handlers
  document.querySelectorAll(".removeBtn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const id = e.target.closest(".cart-row").dataset.id;
      removeFromCart(id);
      renderCartPage();
    })
  );
  document.querySelectorAll(".qtyInput").forEach((inp) =>
    inp.addEventListener("change", (e) => {
      const id = e.target.closest(".cart-row").dataset.id;
      updateQty(id, parseInt(e.target.value || "0", 10));
      renderCartPage();
    })
  );
}

if (cartItemsEl) renderCartPage();
if (checkoutForm) {
  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // Simple simulate processing
    const name = document.getElementById("custName").value.trim();
    const addr = document.getElementById("custAddress").value.trim();
    const method = document.getElementById("payMethod").value;
    if (!name || !addr) {
      alert("Mohon isi nama dan alamat");
      return;
    }
    const cart = getCart();
    if (cart.length === 0) {
      alert("Keranjang kosong");
      return;
    }
    // Create a mock order id
    const orderId = "ORD" + Date.now().toString().slice(-6);
    // Clear cart and show confirmation
    clearCart();
    alert(
      `Pembayaran berhasil (simulasi). Nomor pesanan: ${orderId}\nMetode: ${method}`
    );
    window.location.href = "index.html";
  });
}

// ensure cart UI count updates when storage changes in other tabs
window.addEventListener("storage", () => updateCartCountUI());
