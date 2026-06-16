/* ==========================================================================
   VEYRA — Catalog: filtering, sorting, search, pagination, URL sync
   ========================================================================== */
(function () {
  "use strict";
  const D = window.VEYRA_DATA, UI = window.UI;
  const { qs, qsa, param, esc } = UI;
  const PER_PAGE = 8;

  // ---- State seeded from URL ----
  const state = {
    category: param("category") || "",
    subs: new Set(param("sub") ? [param("sub")] : []),
    colors: new Set(),
    sizes: new Set(),
    price: "",
    onsale: param("onsale") === "1",
    q: (param("q") || "").toLowerCase(),
    sort: param("sort") || "featured",
    page: 1
  };

  const catLabel = { women: "Women", men: "Men", accessories: "Accessories" };

  // ---- Build filter UI ----
  function buildFilters() {
    // Categories
    qs("#filter-category").innerHTML = D.categories.map((c) => `
      <li class="filter-option"><label class="filter-option" style="width:100%">
        <input type="radio" name="cat" value="${c.id}" ${state.category === c.id ? "checked" : ""}>
        <span>${c.label}</span></label></li>`).join("") +
      `<li class="filter-option"><label class="filter-option" style="width:100%">
        <input type="radio" name="cat" value="" ${!state.category ? "checked" : ""}><span>All</span></label></li>`;

    // Subcategories (depends on category)
    const subs = state.category ? (D.categories.find((c) => c.id === state.category)?.subs || [])
      : [...new Set(D.products.map((p) => p.subcategory))];
    qs("#filter-sub").innerHTML = subs.map((s) => `
      <li class="filter-option"><label class="filter-option" style="width:100%">
        <input type="checkbox" name="sub" value="${esc(s)}" ${state.subs.has(s) ? "checked" : ""}>
        <span>${esc(s)}</span></label></li>`).join("");

    // Colours
    const colorMap = {};
    D.products.forEach((p) => p.colors.forEach((c) => colorMap[c.name] = c.hex));
    qs("#filter-color").innerHTML = Object.entries(colorMap).map(([name, hex]) => `
      <li><label class="filter-option" title="${name}">
        <input type="checkbox" name="color" value="${esc(name)}" ${state.colors.has(name) ? "checked" : ""} style="display:none">
        <span class="color-dot" style="background:${hex};outline:${state.colors.has(name) ? "2px solid var(--ink);outline-offset:2px" : "none"}"></span>
      </label></li>`).join("");

    // Sizes
    const sizeSet = new Set();
    D.products.forEach((p) => p.sizes.forEach((s) => sizeSet.add(s.label)));
    const order = ["XS","S","M","L","XL","28","30","32","34","36","6","7","8","9","10","11","One Size"];
    const sizes = [...sizeSet].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    qs("#filter-size").innerHTML = sizes.map((s) => `
      <li><label class="size-btn" style="cursor:pointer" data-size="${esc(s)}" aria-pressed="${state.sizes.has(s)}">
        <input type="checkbox" name="size" value="${esc(s)}" ${state.sizes.has(s) ? "checked" : ""} style="display:none">${esc(s)}</label></li>`).join("");

    // Price + onsale reflect state
    const priceRadio = qs(`input[name="price"][value="${state.price}"]`);
    if (priceRadio) priceRadio.checked = true;
    qs("#filter-onsale").checked = state.onsale;
  }

  // ---- Filtering ----
  function inPrice(p) {
    if (!state.price) return true;
    const price = p.salePrice ?? p.price;
    const [lo, hi] = state.price.split("-").map(Number);
    return price >= lo && price <= hi;
  }
  function filtered() {
    return D.products.filter((p) => {
      if (state.category && p.category !== state.category) return false;
      if (state.subs.size && !state.subs.has(p.subcategory)) return false;
      if (state.colors.size && !p.colors.some((c) => state.colors.has(c.name))) return false;
      if (state.sizes.size && !p.sizes.some((s) => state.sizes.has(s.label))) return false;
      if (state.onsale && !p.salePrice) return false;
      if (!inPrice(p)) return false;
      if (state.q && !(p.name + " " + p.subcategory + " " + p.category + " " + p.description).toLowerCase().includes(state.q)) return false;
      return true;
    });
  }
  function sorted(list) {
    const l = [...list];
    switch (state.sort) {
      case "new": return l.sort((a, b) => b.createdAt - a.createdAt);
      case "popular": return l.sort((a, b) => b.reviewsCount - a.reviewsCount);
      case "price-asc": return l.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      case "price-desc": return l.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
      default: return l.sort((a, b) => (b.badge === "new" ? 1 : 0) - (a.badge === "new" ? 1 : 0) || b.rating - a.rating);
    }
  }

  // ---- Active filter chips ----
  function renderChips() {
    const chips = [];
    if (state.category) chips.push(["category", catLabel[state.category] || state.category]);
    state.subs.forEach((s) => chips.push(["sub:" + s, s]));
    state.colors.forEach((c) => chips.push(["color:" + c, c]));
    state.sizes.forEach((s) => chips.push(["size:" + s, "Size " + s]));
    if (state.price) chips.push(["price", qs(`input[name="price"][value="${state.price}"]`)?.nextElementSibling.textContent || "Price"]);
    if (state.onsale) chips.push(["onsale", "On sale"]);
    if (state.q) chips.push(["q", `“${state.q}”`]);
    const box = qs("#active-filters");
    box.innerHTML = chips.map(([key, label]) => `<span class="chip">${esc(label)}<button data-chip="${esc(key)}" aria-label="Remove ${esc(label)}">✕</button></span>`).join("");
    qsa("[data-chip]", box).forEach((b) => b.addEventListener("click", () => removeChip(b.dataset.chip)));
  }
  function removeChip(key) {
    if (key === "category") state.category = "";
    else if (key === "price") state.price = "";
    else if (key === "onsale") state.onsale = false;
    else if (key === "q") state.q = "";
    else if (key.startsWith("sub:")) state.subs.delete(key.slice(4));
    else if (key.startsWith("color:")) state.colors.delete(key.slice(6));
    else if (key.startsWith("size:")) state.sizes.delete(key.slice(5));
    state.page = 1; buildFilters(); wireFilters(); render();
  }

  // ---- Pagination ----
  function renderPagination(total) {
    const pages = Math.ceil(total / PER_PAGE);
    const nav = qs("#pagination");
    if (pages <= 1) { nav.innerHTML = ""; return; }
    let html = `<button ${state.page === 1 ? "disabled" : ""} data-page="${state.page - 1}" aria-label="Previous">‹</button>`;
    for (let i = 1; i <= pages; i++) html += `<button data-page="${i}" aria-current="${i === state.page}">${i}</button>`;
    html += `<button ${state.page === pages ? "disabled" : ""} data-page="${state.page + 1}" aria-label="Next">›</button>`;
    nav.innerHTML = html;
    qsa("button[data-page]", nav).forEach((b) => b.addEventListener("click", () => {
      if (b.disabled) return;
      state.page = +b.dataset.page; render();
      qs("#main").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  // ---- Title ----
  function updateHeader() {
    let title = "All Products", sub = "Considered pieces for every day.";
    if (state.q) { title = `Results for “${state.q}”`; sub = ""; }
    else if (state.onsale) { title = "Sale"; sub = "Selected pieces, reduced for a limited time."; }
    else if (state.sort === "new" && !state.category) { title = "New Arrivals"; sub = "The latest from the studio."; }
    else if (state.category) { title = catLabel[state.category]; sub = `Explore the ${title.toLowerCase()}'s collection.`; }
    qs("#catalog-title").textContent = title;
    qs("#catalog-sub").textContent = sub; qs("#catalog-sub").hidden = !sub;
    qs("#crumb").textContent = title;
    document.title = `${title} — VEYRA`;
  }

  // ---- URL sync (shareable) ----
  function syncURL() {
    const u = new URLSearchParams();
    if (state.category) u.set("category", state.category);
    if (state.q) u.set("q", state.q);
    if (state.onsale) u.set("onsale", "1");
    if (state.sort !== "featured") u.set("sort", state.sort);
    history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : ""));
  }

  // ---- Render ----
  function render() {
    const list = sorted(filtered());
    const total = list.length;
    qs("#result-count").textContent = `${total} item${total === 1 ? "" : "s"}`;
    const start = (state.page - 1) * PER_PAGE;
    const pageItems = list.slice(start, start + PER_PAGE);
    const empty = qs("#empty");
    if (!total) { qs("#results").innerHTML = ""; empty.hidden = false; }
    else { empty.hidden = true; UI.renderGrid(qs("#results"), pageItems); }
    renderPagination(total);
    renderChips();
    updateHeader();
    syncURL();
  }

  // ---- Wire inputs ----
  function wireFilters() {
    qsa('input[name="cat"]').forEach((r) => r.addEventListener("change", () => {
      state.category = r.value; state.subs.clear(); state.page = 1; buildFilters(); wireFilters(); render();
    }));
    qsa('input[name="sub"]').forEach((c) => c.addEventListener("change", () => {
      c.checked ? state.subs.add(c.value) : state.subs.delete(c.value); state.page = 1; render();
    }));
    qsa('input[name="color"]').forEach((c) => c.addEventListener("change", () => {
      c.checked ? state.colors.add(c.value) : state.colors.delete(c.value);
      const dot = c.nextElementSibling; if (dot) dot.style.outline = c.checked ? "2px solid var(--ink)" : "none"; dot && (dot.style.outlineOffset = "2px");
      state.page = 1; render();
    }));
    qsa('.size-btn input[name="size"]').forEach((c) => c.addEventListener("change", () => {
      c.checked ? state.sizes.add(c.value) : state.sizes.delete(c.value);
      c.closest(".size-btn").setAttribute("aria-pressed", c.checked); state.page = 1; render();
    }));
    qsa('input[name="price"]').forEach((r) => r.addEventListener("change", () => { state.price = r.value; state.page = 1; render(); }));
    qs("#filter-onsale").addEventListener("change", (e) => { state.onsale = e.target.checked; state.page = 1; render(); });
  }

  function clearAll() {
    Object.assign(state, { category: "", subs: new Set(), colors: new Set(), sizes: new Set(), price: "", onsale: false, q: "", page: 1 });
    buildFilters(); wireFilters(); render();
  }

  // ---- Mobile filter drawer ----
  function wireDrawer() {
    const filters = qs("#filters");
    qs("#open-filters").addEventListener("click", () => {
      filters.classList.add("open");
      const scrim = qs("#scrim"); if (scrim) scrim.classList.add("show");
      document.body.style.overflow = "hidden";
    });
  }

  // ---- Init ----
  qs("#sort").value = state.sort;
  qs("#sort").addEventListener("change", (e) => { state.sort = e.target.value; state.page = 1; render(); });
  qs("#clear-filters").addEventListener("click", clearAll);
  qs("#empty-clear").addEventListener("click", clearAll);
  buildFilters(); wireFilters(); wireDrawer(); render();
})();
