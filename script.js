const products = [
  {id:"astral-plus", name:"Astral+", category:"Ranks", price:9.99, icon:"⛏", description:"The only AstralSMP rank, with exclusive server perks."},
  {id:"amethyst-key", name:"Amethyst Key", category:"Crate Keys", price:3.12, color:"#a855f7", iconImg:"assets/amethyst-key.png", popular:true, description:"Amethyst crate key."},
  {id:"gold-key", name:"Gold Key", category:"Crate Keys", price:2.49, color:"#eab308", iconImg:"assets/gold-key.png", description:"Gold crate key."},
  {id:"crimson-key", name:"Crimson Key", category:"Crate Keys", price:1.87, color:"#ef4444", iconImg:"assets/crimson-key.png", description:"Crimson crate key."},
  {id:"prime-key", name:"Prime Key", category:"Crate Keys", price:1.87, color:"#3b82f6", iconImg:"assets/prime-key.png", description:"Prime crate key."},
  {id:"common-key", name:"Common Key", category:"Crate Keys", price:0.62, color:"#22c55e", iconImg:"assets/common-key.png", description:"Common crate key."}
];
const cart = [];
const grid = document.querySelector("#productGrid");
const toast = document.querySelector("#toast");
let toastTimer;
let activeCategory = "All";

function money(value) {
  return new Intl.NumberFormat("en-US", {style:"currency", currency:"USD"}).format(value);
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function renderProducts() {
  if (!grid) return;
  const visible = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);
  grid.innerHTML = visible.map(p => {
    const iconHtml = p.iconImg
      ? `<img class="product-key-img" src="${p.iconImg}" alt="${p.name}" loading="lazy">`
      : `<div class="product-icon" aria-hidden="true">${p.icon}</div>`;
    const popularBadge = p.popular ? `<span class="popular-badge">MOST POPULAR</span>` : "";
    return `<article class="product-card ${p.iconImg ? "key-card" : "rank-product-card"}" style="--item-color:${p.color || "#37bff9"}">
      ${popularBadge}
      ${iconHtml}
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="product-bottom">
        <span class="product-price">${money(p.price)}</span>
        <button class="add-button" data-add="${p.id}">Add +</button>
      </div>
    </article>`;
  }).join("");
}

function renderCart() {
  const countEl = document.querySelector("#cartCount");
  const totalEl = document.querySelector("#cartTotal");
  if (countEl) countEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalEl) totalEl.textContent = money(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const container = document.querySelector("#cartItems");
  if (!container) return;
  if (!cart.length) {
    container.innerHTML = '<p class="empty-cart">Your cart is empty for now.</p>';
    return;
  }
  container.innerHTML = cart.map(item =>
    `<div class="cart-line"><div><strong>${item.name} × ${item.quantity}</strong><small>${money(item.price)} each</small></div><div><strong>${money(item.price * item.quantity)}</strong><br><button class="remove-item" data-remove="${item.id}">Remove</button></div></div>`
  ).join("");
}

if (grid) {
  grid.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (!button) return;
    const product = products.find(p => p.id === button.dataset.add);
    if (!product) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({...product, quantity:1});
    renderCart();
    showToast(`${product.name} added to cart`);
  });
}

const cartItems = document.querySelector("#cartItems");
if (cartItems) {
  cartItems.addEventListener("click", event => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const index = cart.findIndex(item => item.id === button.dataset.remove);
    if (index >= 0) cart.splice(index, 1);
    renderCart();
  });
}

const cartButton = document.querySelector("#cartButton");
if (cartButton) cartButton.addEventListener("click", () => document.querySelector("#cartDialog")?.showModal());
const closeCart = document.querySelector("#closeCart");
if (closeCart) closeCart.addEventListener("click", () => document.querySelector("#cartDialog")?.close());
const checkoutButton = document.querySelector("#checkoutButton");
if (checkoutButton) checkoutButton.addEventListener("click", () => showToast("Demo only — connect Tebex or your checkout provider first."));

document.querySelectorAll(".copy-ip").forEach(button => {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy || "AstralSMP.eu");
      showToast("AstralSMP.eu copied to clipboard");
    } catch {
      showToast("Server IP: AstralSMP.eu");
    }
  });
});

document.querySelectorAll("[data-category]").forEach(link => {
  link.addEventListener("click", () => {
    activeCategory = link.dataset.category;
    renderProducts();
  });
});

const currencyButton = document.querySelector("#currencyButton");
if (currencyButton) currencyButton.addEventListener("click", () => showToast("Prices are currently shown in USD ($)."));

const menuToggle = document.querySelector("#menuToggle");
if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const nav = document.querySelector("#nav");
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}

document.querySelectorAll("#nav a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelector("#nav")?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const yearEl = document.querySelector("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

renderProducts();
renderCart();
