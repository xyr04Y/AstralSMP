/* ========== CONFIG – edit these ========== */
// Your Minecraft server public IP or domain (must reach the plugin HTTP port)
const VOTE_API_BASE = "http://YOUR_SERVER_IP:8193";
// Must match plugins/AstralVote/config.yml → secret
const VOTE_API_SECRET = "change-me-to-a-long-random-string";

// Replace each url with your REAL listing link
const voteSites = [
  { id: "1", name: "Minecraft Servers", reward: 50, url: "https://minecraftservers.org/", color: "#3b82f6", double: true },
  { id: "2", name: "Minecraft Community", reward: 25, url: "https://minecraft-mp.com/", color: "#a855f7" },
  { id: "3", name: "BestMctServerList", reward: 25, url: "https://best-minecraft-servers.co/", color: "#a855f7" },
  { id: "4", name: "Minecraft Server List", reward: 25, url: "https://minecraft-server-list.com/", color: "#a855f7" },
  { id: "5", name: "Minecraft MP", reward: 25, url: "https://minecraft-mp.com/", color: "#a855f7" },
  { id: "6", name: "Minecraft Buzz", reward: 25, url: "https://minecraft.buzz/", color: "#a855f7" },
  { id: "7", name: "TopG", reward: 25, url: "https://topg.org/", color: "#a855f7" },
  { id: "8", name: "MinecraftServer-list", reward: 25, url: "https://minecraftserver-list.com/", color: "#a855f7" },
  { id: "9", name: "VoxelRank", reward: 25, url: "https://voxelrank.com/", color: "#a855f7" }
];
/* ========================================= */

const toast = document.querySelector("#toast");
let toastTimer;
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function getUsername() {
  return (document.querySelector("#voteUsername").value || "").trim();
}

function isValidName(name) {
  return /^[a-zA-Z0-9_]{3,16}$/.test(name);
}

function renderVoteLinks(claimedSites) {
  const claimed = new Set(claimedSites || []);
  const grid = document.querySelector("#voteLinksGrid");
  grid.innerHTML = voteSites.map(site => {
    const done = claimed.has(site.id);
    return `
    <article class="vote-link-card ${done ? "claimed" : ""}" style="--accent:${site.color}">
      ${site.double ? '<span class="double-badge">2X</span>' : ""}
      ${done ? '<span class="claimed-badge">CLAIMED</span>' : ""}
      <div class="vote-reward-icon"><img src="assets/shards-small.png" alt="Shards"></div>
      <div class="vote-reward-amount">+${site.reward}</div>
      <div class="vote-link-name">VOTE LINK #${site.id}</div>
      <div class="vote-link-site">${site.name}</div>
      <button class="vote-btn" data-url="${site.url}" data-id="${site.id}" ${done ? "disabled" : ""}>
        ${done ? "Claimed" : "Vote"}
      </button>
      ${done ? "" : `<button class="claim-btn" data-id="${site.id}">I voted – Claim</button>`}
    </article>`;
  }).join("");
}

function updateProgress(todayCount) {
  const steps = document.querySelectorAll("#progressSteps span");
  steps.forEach((el, i) => {
    el.classList.toggle("done", i < todayCount);
  });
  const el = document.querySelector("#votesToday");
  if (el) el.textContent = `${todayCount}/9 TODAY`;
}

async function fetchStatus(username) {
  try {
    const res = await fetch(`${VOTE_API_BASE}/vote/status?player=${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error("status " + res.status);
    return await res.json();
  } catch (e) {
    console.warn("Vote API status failed", e);
    return null;
  }
}

async function claimVote(username, siteId) {
  const res = await fetch(`${VOTE_API_BASE}/vote/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: VOTE_API_SECRET, player: username, site: siteId })
  });
  return await res.json();
}

async function loadLeaderboard() {
  const list = document.querySelector("#topVotersList");
  try {
    const res = await fetch(`${VOTE_API_BASE}/vote/leaderboard`);
    const data = await res.json();
    if (!data.ok || !data.leaders || !data.leaders.length) {
      list.innerHTML = `<li><span class="rank">–</span><span class="name">No votes yet</span><span class="votes">0 votes</span></li>`;
      return;
    }
    list.innerHTML = data.leaders.map((l, i) =>
      `<li><span class="rank">${i + 1}</span><span class="name">${escapeHtml(l.name)}</span><span class="votes">${l.votes} votes</span></li>`
    ).join("");
  } catch {
    list.innerHTML = `<li><span class="rank">–</span><span class="name">Connect AstralVote plugin to show leaders</span><span class="votes"></span></li>`;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function refreshForUser() {
  const username = getUsername();
  if (!isValidName(username)) {
    renderVoteLinks([]);
    updateProgress(0);
    return;
  }
  const status = await fetchStatus(username);
  if (status && status.ok) {
    renderVoteLinks(status.sites || []);
    updateProgress(status.today || 0);
  } else {
    renderVoteLinks([]);
    updateProgress(0);
  }
}

document.querySelector("#voteLinksGrid").addEventListener("click", async e => {
  const voteBtn = e.target.closest(".vote-btn");
  const claimBtn = e.target.closest(".claim-btn");

  if (voteBtn) {
    const username = getUsername();
    if (!isValidName(username)) {
      showToast("Enter your Minecraft username first");
      document.querySelector("#voteUsername").focus();
      return;
    }
    let url = voteBtn.dataset.url;
    if (!url.includes("?")) url += `?username=${encodeURIComponent(username)}`;
    else url += `&username=${encodeURIComponent(username)}`;
    window.open(url, "_blank", "noopener");
    showToast("Vote on the site, then click “I voted – Claim”");
    return;
  }

  if (claimBtn) {
    const username = getUsername();
    if (!isValidName(username)) {
      showToast("Enter your Minecraft username first");
      return;
    }
    const siteId = claimBtn.dataset.id;
    claimBtn.disabled = true;
    claimBtn.textContent = "Claiming…";
    try {
      const result = await claimVote(username, siteId);
      if (result.ok) {
        showToast(`Reward claimed for ${username}!`);
        updateProgress(result.today || 0);
        await refreshForUser();
        await loadLeaderboard();
        if (result.bonus) showToast("Daily bonus unlocked!");
      } else if (result.error === "already_claimed") {
        showToast("Already claimed this site today");
        await refreshForUser();
      } else {
        showToast(result.error || "Claim failed – is the plugin online?");
        claimBtn.disabled = false;
        claimBtn.textContent = "I voted – Claim";
      }
    } catch (err) {
      showToast("Cannot reach server API. Check VOTE_API_BASE in vote.js");
      claimBtn.disabled = false;
      claimBtn.textContent = "I voted – Claim";
    }
  }
});

let debounce;
document.querySelector("#voteUsername").addEventListener("input", () => {
  clearTimeout(debounce);
  debounce = setTimeout(refreshForUser, 400);
});

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

// Timer demo
(function startTimer() {
  const end = Date.now() + 3 * 24 * 60 * 60 * 1000;
  const el = document.querySelector("#payoutTimer");
  if (!el) return;
  setInterval(() => {
    const diff = Math.max(0, end - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, 1000);
})();

renderVoteLinks([]);
loadLeaderboard();
