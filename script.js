const products = [
  {id:"astral-plus", name:"Astral+", category:"Ranks", price:9.99, icon:"⛏", description:"The only AstralSMP rank, with exclusive server perks."},
  {id:"amethyst-key", name:"ᴀᴍᴇᴛʜʏsᴛ ᴋᴇʏ", category:"Crate Keys", price:2.99, color:"#6f3baf", icon:"✦", description:"Amethyst crate key."},
  {id:"gold-key", name:"ɢᴏʟᴅ ᴋᴇʏ", category:"Crate Keys", price:2.99, color:"#e6bb00", icon:"✦", description:"Gold crate key."},
  {id:"crimson-key", name:"ᴄʀɪᴍsᴏɴ ᴋᴇʏ", category:"Crate Keys", price:2.99, color:"#c62119", icon:"✦", description:"Crimson crate key."},
  {id:"prime-key", name:"ᴘʀɪᴍᴇ ᴋᴇʏ", category:"Crate Keys", price:2.99, color:"#2388d6", icon:"✦", description:"Prime crate key."},
  {id:"common-key", name:"ᴄᴏᴍᴍᴏɴ ᴋᴇʏ", category:"Crate Keys", price:1.49, color:"#249a1a", icon:"✦", description:"Common crate key."}
];
const cart = [];
const grid = document.querySelector("#productGrid");
const toast = document.querySelector("#toast");
let toastTimer;
let activeCategory = "All";
function money(value) { return new Intl.NumberFormat("en-IE", {style:"currency", currency:"EUR"}).format(value); }
function showToast(message) { toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2300); }
function renderProducts() {
  const visible = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);
  grid.innerHTML = visible.map(p => `<article class="product-card ${p.color ? "key-card" : "rank-product-card"}" style="--item-color:${p.color || "#37bff9"}"><div class="product-icon" aria-hidden="true">${p.icon}</div><h3>${p.name}</h3><p>${p.description}</p><div class="product-bottom"><span class="product-price">${money(p.price)}</span><button class="add-button" data-add="${p.id}">Add +</button></div></article>`).join("");
}
function renderCart() {
  document.querySelector("#cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector("#cartTotal").textContent = money(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const container = document.querySelector("#cartItems");
  if (!cart.length) { container.innerHTML = '<p class="empty-cart">Your cart is empty for now.</p>'; return; }
  container.innerHTML = cart.map(item => `<div class="cart-line"><div><strong>${item.name} × ${item.quantity}</strong><small>${money(item.price)} each</small></div><div><strong>${money(item.price * item.quantity)}</strong><br><button class="remove-item" data-remove="${item.id}">Remove</button></div></div>`).join("");
}
grid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]"); if (!button) return;
  const product = products.find(p => p.id === button.dataset.add); if (!product) return;
  const existing = cart.find(item => item.id === product.id); if (existing) existing.quantity++; else cart.push({...product, quantity:1});
  renderCart(); showToast(`${product.name} added to cart`);
});
document.querySelector("#cartItems").addEventListener("click", event => { const button = event.target.closest("[data-remove]"); if (!button) return; const index = cart.findIndex(item => item.id === button.dataset.remove); if (index >= 0) cart.splice(index, 1); renderCart(); });
document.querySelector("#cartButton").addEventListener("click", () => document.querySelector("#cartDialog").showModal());
document.querySelector("#closeCart").addEventListener("click", () => document.querySelector("#cartDialog").close());
document.querySelector("#checkoutButton").addEventListener("click", () => showToast("Demo only — connect Tebex or your checkout provider first."));
document.querySelectorAll(".copy-ip").forEach(button => button.addEventListener("click", async () => { try { await navigator.clipboard.writeText(button.dataset.copy || "AstralSMP.eu"); showToast("AstralSMP.eu copied to clipboard"); } catch { showToast("Server IP: AstralSMP.eu"); } }));
document.querySelectorAll("[data-category]").forEach(link => link.addEventListener("click", () => { activeCategory = link.dataset.category; renderProducts(); }));
document.querySelector("#currencyButton").addEventListener("click", () => showToast("Prices are currently shown in EUR (€)."));
const menuToggle = document.querySelector("#menuToggle");
menuToggle.addEventListener("click", () => { const nav = document.querySelector("#nav"); const open = nav.classList.toggle("open"); menuToggle.setAttribute("aria-expanded", String(open)); });
document.querySelectorAll("#nav a").forEach(link => link.addEventListener("click", () => { document.querySelector("#nav").classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); }));
document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts(); renderCart();
