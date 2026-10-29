// === CONFIGURE YOUR REAL VOTE LINKS HERE ===
// Replace the url fields with your actual listing URLs from each site.
// Most sites accept ?username=PLAYER or similar — we append the username when possible.
const voteSites = [
  { id: 1, name: "Minecraft Servers", reward: 50, url: "https://minecraftservers.org/", color: "#3b82f6", double: true },
  { id: 2, name: "Minecraft Community", reward: 25, url: "https://minecraft-mp.com/", color: "#a855f7" },
  { id: 3, name: "BestMctServerList", reward: 25, url: "https://best-minecraft-servers.co/", color: "#a855f7" },
  { id: 4, name: "Minecraft Server List", reward: 25, url: "https://minecraft-server-list.com/", color: "#a855f7" },
  { id: 5, name: "Minecraft MP", reward: 25, url: "https://minecraft-mp.com/", color: "#a855f7" },
  { id: 6, name: "Minecraft Buzz", reward: 25, url: "https://minecraft.buzz/", color: "#a855f7" },
  { id: 7, name: "TopG", reward: 25, url: "https://topg.org/", color: "#a855f7" },
  { id: 8, name: "MinecraftServer-list", reward: 25, url: "https://minecraftserver-list.com/", color: "#a855f7" },
  { id: 9, name: "VoxelRank", reward: 25, url: "https://voxelrank.com/", color: "#a855f7" }
];

const toast = document.querySelector("#toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function getUsername() {
  return (document.querySelector("#voteUsername").value || "").trim();
}

function renderVoteLinks() {
  const grid = document.querySelector("#voteLinksGrid");
  grid.innerHTML = voteSites.map(site => `
    <article class="vote-link-card" style="--accent:${site.color}">
      ${site.double ? '<span class="double-badge">2X</span>' : ''}
      <div class="vote-reward-icon">✦</div>
      <div class="vote-reward-amount">+${site.reward}</div>
      <div class="vote-link-name">VOTE LINK #${site.id}</div>
      <div class="vote-link-site">${site.name}</div>
      <button class="vote-btn" data-url="${site.url}" data-id="${site.id}">Vote</button>
    </article>
  `).join("");
}

document.querySelector("#voteLinksGrid").addEventListener("click", e => {
  const btn = e.target.closest(".vote-btn");
  if (!btn) return;
  const username = getUsername();
  if (!username) {
    showToast("Please enter your Minecraft username first");
    document.querySelector("#voteUsername").focus();
    return;
  }
  if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
    showToast("Invalid username (3-16 letters, numbers, _)");
    return;
  }
  // Mark progress locally (demo). Real progress comes from the plugin / backend.
  const steps = document.querySelectorAll("#progressSteps span");
  const voted = document.querySelectorAll("#progressSteps span.done").length;
  if (voted < steps.length) {
    steps[voted].classList.add("done");
    document.querySelector("#votesToday").textContent = `${voted + 1}/9 TODAY`;
  }
  // Open the external vote site (user must complete the vote there)
  let url = btn.dataset.url;
  // Many lists accept username in query — adjust per site if needed
  if (!url.includes("?")) url += `?username=${encodeURIComponent(username)}`;
  else url += `&username=${encodeURIComponent(username)}`;
  window.open(url, "_blank", "noopener");
  showToast(`Opening vote site for ${username}…`);
});

// Simple countdown for weekly payout (demo)
function startTimer() {
  // 3 days from now
  const end = Date.now() + 3 * 24 * 60 * 60 * 1000;
  const el = document.querySelector("#payoutTimer");
  setInterval(() => {
    const diff = Math.max(0, end - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${d}d ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }, 1000);
}

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

document.querySelector("#year").textContent = new Date().getFullYear();
renderVoteLinks();
startTimer();
