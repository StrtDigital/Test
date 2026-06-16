/* ==========================================================================
   VEYRA — Account dashboard: tabs, orders, addresses, wishlist, settings
   ========================================================================== */
(function () {
  "use strict";
  const D = window.VEYRA_DATA, UI = window.UI, S = window.Store;
  const { qs, qsa, esc, money } = UI;

  const user = S.getUser();
  if (!user) { qs("#signed-out").hidden = false; qs("#signed-in").hidden = true; return; }
  qs("#signed-out").hidden = true; qs("#signed-in").hidden = false;

  qs("#greeting").textContent = `Hello, ${user.name.split(" ")[0]}`;

  // ---- Tabs ----
  qsa("#account-nav button").forEach((b) => b.addEventListener("click", () => {
    qsa("#account-nav button").forEach((x) => x.classList.toggle("active", x === b));
    qsa(".account-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === b.dataset.tab));
  }));

  // ---- Orders (real placed orders + sample history) ----
  function getOrders() {
    let placed = [];
    try { placed = JSON.parse(localStorage.getItem("veyra.orders") || "[]"); } catch {}
    const sample = [
      { id: "VY-840271", date: "2026-05-02", total: 327.00, items: 3, status: "Delivered" },
      { id: "VY-815663", date: "2026-03-18", total: 96.00, items: 1, status: "Delivered" }
    ];
    return [...placed, ...sample];
  }
  function statusClass(s) { return s === "Delivered" ? "delivered" : s === "Processing" ? "transit" : "transit"; }

  const orders = getOrders();
  qs("#orders-list").innerHTML = orders.map((o) => `
    <div class="order-row">
      <div><strong>${o.id}</strong><br><span class="muted" style="font-size:.82rem">${o.date} · ${o.items} item${o.items === 1 ? "" : "s"}</span></div>
      <div style="display:flex;align-items:center;gap:1rem">
        <span class="status-pill ${statusClass(o.status)}">${o.status}</span>
        <strong>${money(o.total)}</strong>
        <a class="link-underline" href="#" onclick="return false">Details</a>
      </div>
    </div>`).join("");

  // Overview: recent order
  const recent = orders[0];
  qs("#recent-order").innerHTML = recent
    ? `<strong>${recent.id}</strong> · <span class="status-pill ${statusClass(recent.status)}">${recent.status}</span><br><span class="muted" style="font-size:.85rem">${recent.date} · ${money(recent.total)}</span>`
    : `<p class="muted">No orders yet.</p>`;

  // ---- Wishlist snapshot + panel ----
  function renderWishlist() {
    const ids = S.getWishlist();
    const list = D.products.filter((p) => ids.includes(p.id));
    qs("#wish-snapshot").textContent = list.length ? `${list.length} item${list.length === 1 ? "" : "s"} saved` : "Nothing saved yet.";
    const grid = qs("#account-wishlist"), empty = qs("#account-wishlist-empty");
    if (!list.length) { grid.innerHTML = ""; empty.hidden = false; }
    else { empty.hidden = true; UI.renderGrid(grid, list.slice(0, 4)); }
  }
  S.on("wish", renderWishlist);
  renderWishlist();

  // ---- Addresses ----
  qs("#addresses").innerHTML = `
    <div class="feature-tile"><span class="badge badge--soft">Default</span><p style="margin-top:.6rem">${esc(user.name)}<br>14 Studio Lane<br>Brooklyn, NY 11201<br>United States</p>
      <div class="cluster" style="margin-top:.8rem"><button class="link-underline">Edit</button></div></div>
    <div class="feature-tile"><span class="badge badge--soft">Work</span><p style="margin-top:.6rem">${esc(user.name)}<br>2 Market Street, Fl 4<br>New York, NY 10005<br>United States</p>
      <div class="cluster" style="margin-top:.8rem"><button class="link-underline">Edit</button></div></div>`;
  qs("#add-address").addEventListener("click", () => UI.toast("Address form coming soon."));

  // ---- Settings ----
  qs("#s-name").value = user.name; qs("#s-email").value = user.email;
  qs("#settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    S.login(qs("#s-email").value || user.email, qs("#s-name").value || user.name);
    UI.toast("Changes saved");
    qs("#greeting").textContent = `Hello, ${(qs("#s-name").value || user.name).split(" ")[0]}`;
  });

  // ---- Sign out ----
  qs("#signout").addEventListener("click", () => { S.logout(); UI.toast("Signed out"); setTimeout(() => location.reload(), 500); });
})();
