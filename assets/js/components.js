/* ==========================================================================
   VEYRA — Shared UI: header, footer, mini-cart, search, product cards,
   toasts, reveal-on-scroll, and small helpers. Injected into every page.
   ========================================================================== */
(function () {
  "use strict";
  const D = window.VEYRA_DATA;
  const S = window.Store;

  /* ---- Helpers -------------------------------------------------------- */
  const money = (n) => "$" + Number(n).toFixed(2);
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const param = (k) => new URLSearchParams(location.search).get(k);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICON = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 15.5 12 20 12 20z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 13 4 4L19 7"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 6h12v9H2zM14 9h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13z"/><path d="M5 19c3-4 6-6 9-7"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12a8 8 0 0 1 13-6l3 3M20 12a8 8 0 0 1-13 6l-3-3"/><path d="M20 4v5h-5M4 20v-5h5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1" fill="currentColor" stroke="none"/></svg>',
    tk: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.5 2.5 2 4 4.5 4.3v3C19 10.2 17.4 9.7 16 8.8V15a6 6 0 1 1-6-6c.4 0 .7 0 1 .1v3.2A3 3 0 1 0 13 15V3z"/></svg>',
    pin2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 19c-4 1-4-3-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.9 2.6 5.9 2.9 5.9 2.9a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.5 9.3c0 4.6 2.7 5.7 5.5 6-.4.4-.5.9-.5 1.6V21"/></svg>'
  };

  /* ---- Scrim (shared) ------------------------------------------------- */
  function ensureScrim() {
    let s = qs("#scrim");
    if (!s) { s = document.createElement("div"); s.id = "scrim"; s.className = "scrim"; document.body.appendChild(s); }
    return s;
  }

  /* ---- Header --------------------------------------------------------- */
  function navHref(cat) { return `shop.html?category=${cat}`; }

  function renderHeader() {
    const mount = qs("#site-header");
    if (!mount) return;
    const page = (location.pathname.split("/").pop() || "index.html");
    const isShop = page === "shop.html";
    const cur = (cat) => (isShop && param("category") === cat) ? 'aria-current="page"' : "";
    mount.innerHTML = `
    <div class="topbar"><div class="container">
      Complimentary shipping over $150 · 30-day returns · <a href="shop.html">Shop new arrivals →</a>
    </div></div>
    <header class="site-header" id="header-el">
      <div class="container">
        <nav class="nav" aria-label="Primary">
          <a class="brand" href="index.html" aria-label="VEYRA home">VEYRA<sup>®</sup></a>
          <div class="nav-links">
            <a href="${navHref("women")}" ${cur("women")}>Women</a>
            <a href="${navHref("men")}" ${cur("men")}>Men</a>
            <a href="${navHref("accessories")}" ${cur("accessories")}>Accessories</a>
            <a href="shop.html?sort=new">New In</a>
            <a href="shop.html?onsale=1">Sale</a>
          </div>
          <div class="nav-actions">
            <button class="icon-btn" id="open-search" aria-label="Search">${ICON.search}</button>
            <a class="icon-btn desktop-only" href="account.html" aria-label="Account">${ICON.user}</a>
            <a class="icon-btn" href="wishlist.html" aria-label="Wishlist">${ICON.heart}<span class="count-badge" id="wish-count"></span></a>
            <button class="icon-btn" id="open-cart" aria-label="Cart">${ICON.bag}<span class="count-badge" id="cart-count"></span></button>
            <button class="icon-btn menu-toggle" id="open-menu" aria-label="Menu">${ICON.menu}</button>
          </div>
        </nav>
      </div>
    </header>`;

    // Mobile nav
    const mnav = document.createElement("aside");
    mnav.className = "mobile-nav"; mnav.id = "mobile-nav"; mnav.setAttribute("aria-label", "Mobile menu");
    mnav.innerHTML = `
      <button class="icon-btn" id="close-menu" aria-label="Close menu" style="align-self:flex-end">${ICON.close}</button>
      <a href="${navHref("women")}">Women</a>
      <a href="${navHref("men")}">Men</a>
      <a href="${navHref("accessories")}">Accessories</a>
      <a href="shop.html?sort=new">New In</a>
      <a href="shop.html?onsale=1">Sale</a>
      <div style="margin-top:auto;display:grid;gap:.5rem">
        <a class="btn btn--ghost" href="account.html">Account</a>
        <a class="link-underline" href="contact.html">Contact us</a>
      </div>`;
    document.body.appendChild(mnav);

    // Search overlay
    const search = document.createElement("div");
    search.className = "search-overlay"; search.id = "search-overlay";
    search.innerHTML = `
      <div class="search-inner">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <span class="eyebrow">Search</span>
          <button class="icon-btn" id="close-search" aria-label="Close search">${ICON.close}</button>
        </div>
        <form id="search-form" role="search">
          <input type="search" id="search-input" placeholder="Search for coats, knits, bags…" autocomplete="off" aria-label="Search products">
        </form>
        <div class="search-suggestions" id="search-suggestions"></div>
      </div>`;
    document.body.appendChild(search);

    buildCartDrawer();
    wireHeader();
    refreshBadges();
  }

  function wireHeader() {
    const scrim = ensureScrim();
    const headerEl = qs("#header-el");
    // sticky shadow
    const onScroll = () => headerEl && headerEl.classList.toggle("is-stuck", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    const open = (el) => { el.classList.add("open"); scrim.classList.add("show"); document.body.style.overflow = "hidden"; };
    const closeAll = () => {
      qsa(".mobile-nav, .filters, #cart-drawer").forEach((e) => e.classList.remove("open"));
      qs("#search-overlay") && qs("#search-overlay").classList.remove("open");
      scrim.classList.remove("show"); document.body.style.overflow = "";
    };
    scrim.addEventListener("click", closeAll);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

    qs("#open-menu") && qs("#open-menu").addEventListener("click", () => open(qs("#mobile-nav")));
    qs("#close-menu") && qs("#close-menu").addEventListener("click", closeAll);
    qs("#open-cart").addEventListener("click", () => { renderCartDrawer(); open(qs("#cart-drawer")); });
    qsa("#cart-drawer .drawer-close, #cart-drawer [data-close]").forEach((b) => b.addEventListener("click", closeAll));

    // Search
    const so = qs("#search-overlay");
    qs("#open-search").addEventListener("click", () => { so.classList.add("open"); document.body.style.overflow = "hidden"; setTimeout(() => qs("#search-input").focus(), 60); renderSuggestions(""); });
    qs("#close-search").addEventListener("click", closeAll);
    qs("#search-form").addEventListener("submit", (e) => { e.preventDefault(); const v = qs("#search-input").value.trim(); if (v) location.href = `shop.html?q=${encodeURIComponent(v)}`; });
    qs("#search-input").addEventListener("input", (e) => renderSuggestions(e.target.value));

    window.__veyraCloseOverlays = closeAll;
  }

  function renderSuggestions(q) {
    const box = qs("#search-suggestions"); if (!box) return;
    const term = q.trim().toLowerCase();
    let list;
    if (!term) {
      box.innerHTML = `<span class="eyebrow" style="color:var(--text-soft)">Popular</span>` +
        ["Wool Coat", "Hoodie", "Denim", "Leather Tote", "Knitwear"].map((t) => `<button data-q="${t}">${t}</button>`).join("");
    } else {
      list = D.products.filter((p) => (p.name + " " + p.subcategory + " " + p.category).toLowerCase().includes(term)).slice(0, 6);
      box.innerHTML = list.length
        ? list.map((p) => `<button data-go="product.html?id=${p.id}"><strong style="color:var(--ink)">${esc(p.name)}</strong> · <span>${esc(p.subcategory)}</span></button>`).join("")
        : `<p class="muted">No matches for “${esc(q)}”. Try a category instead.</p>`;
    }
    qsa("[data-q]", box).forEach((b) => b.addEventListener("click", () => location.href = `shop.html?q=${encodeURIComponent(b.dataset.q)}`));
    qsa("[data-go]", box).forEach((b) => b.addEventListener("click", () => location.href = b.dataset.go));
  }

  /* ---- Mini cart drawer ---------------------------------------------- */
  function buildCartDrawer() {
    const d = document.createElement("aside");
    d.id = "cart-drawer"; d.className = "mobile-nav"; // reuse drawer transform styles
    d.style.cssText = "width:min(92vw,420px);padding:0;display:flex;flex-direction:column;gap:0";
    d.setAttribute("aria-label", "Shopping cart");
    d.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:1.3rem 1.5rem;border-bottom:1px solid var(--line)">
        <strong style="font-family:var(--font-display);font-size:1.3rem">Your Bag</strong>
        <button class="icon-btn drawer-close" aria-label="Close cart">${ICON.close}</button>
      </div>
      <div id="cart-drawer-body" style="flex:1;overflow-y:auto;padding:1.2rem 1.5rem"></div>
      <div id="cart-drawer-foot" style="padding:1.2rem 1.5rem;border-top:1px solid var(--line)"></div>`;
    document.body.appendChild(d);
  }

  function renderCartDrawer() {
    const body = qs("#cart-drawer-body"), foot = qs("#cart-drawer-foot");
    const cart = S.getCart();
    if (!cart.length) {
      body.innerHTML = `<div class="empty-state"><p>Your bag is empty.</p><a class="btn btn--ghost btn--sm" style="margin-top:1rem" href="shop.html">Start shopping</a></div>`;
      foot.innerHTML = ""; return;
    }
    body.innerHTML = cart.map((i) => `
      <div class="cart-item" style="grid-template-columns:72px 1fr auto;padding:.8rem 0">
        <div class="cart-item__media"><img src="${i.img}" alt="${esc(i.name)}"></div>
        <div class="cart-item__meta">
          <strong style="font-size:.9rem">${esc(i.name)}</strong>
          <span class="opts">${esc(i.color)} · ${esc(i.size)} · Qty ${i.qty}</span>
          <button class="cart-item__remove" data-remove="${i.key}">Remove</button>
        </div>
        <div class="cart-item__end"><strong>${money((i.salePrice ?? i.price) * i.qty)}</strong></div>
      </div>`).join("");
    foot.innerHTML = `
      <div class="summary__row" style="margin-bottom:.8rem"><span>Subtotal</span><strong>${money(S.cartSubtotal())}</strong></div>
      <div style="display:grid;gap:.5rem">
        <a class="btn btn--block" href="cart.html">View bag</a>
        <a class="btn btn--accent btn--block" href="checkout.html">Checkout</a>
      </div>`;
    qsa("[data-remove]", body).forEach((b) => b.addEventListener("click", () => { S.removeFromCart(b.dataset.remove); renderCartDrawer(); }));
  }

  /* ---- Footer --------------------------------------------------------- */
  function renderFooter() {
    const mount = qs("#site-footer"); if (!mount) return;
    mount.outerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="brand" href="index.html">VEYRA<sup style="color:var(--gold)">®</sup></a>
            <p style="margin-top:1rem;max-width:34ch">Considered clothing for the modern wardrobe. Designed in studio, made to last.</p>
            <div class="socials" style="margin-top:1.3rem">
              <a href="#" aria-label="Instagram">${ICON.ig}</a>
              <a href="#" aria-label="TikTok">${ICON.tk}</a>
              <a href="#" aria-label="Pinterest">${ICON.pin2}</a>
            </div>
          </div>
          <div>
            <h4>Shop</h4>
            <ul class="footer-links">
              <li><a href="${navHref("women")}">Women</a></li>
              <li><a href="${navHref("men")}">Men</a></li>
              <li><a href="${navHref("accessories")}">Accessories</a></li>
              <li><a href="shop.html?sort=new">New In</a></li>
              <li><a href="shop.html?onsale=1">Sale</a></li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul class="footer-links">
              <li><a href="contact.html">Contact</a></li>
              <li><a href="contact.html#shipping">Shipping & Returns</a></li>
              <li><a href="contact.html#faq">FAQ</a></li>
              <li><a href="account.html">Track Order</a></li>
              <li><a href="contact.html#size">Size Guide</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul class="footer-links">
              <li><a href="#">Our Story</a></li>
              <li><a href="#">Sustainability</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Stores</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} VEYRA Studio. All rights reserved.</span>
          <div class="pay-badges"><span>VISA</span><span>MASTERCARD</span><span>AMEX</span><span>PAYPAL</span><span>APPLE PAY</span></div>
          <span><a class="link-underline" href="#">Privacy</a> · <a class="link-underline" href="#">Terms</a></span>
        </div>
      </div>
    </footer>`;
  }

  /* ---- Product card --------------------------------------------------- */
  function priceHtml(p) {
    if (p.salePrice) return `<span class="card__price"><span class="sale">${money(p.salePrice)}</span><span class="was">${money(p.price)}</span></span>`;
    return `<span class="card__price">${money(p.price)}</span>`;
  }
  function stars(rating) {
    const full = Math.round(rating);
    return `<span class="stars" aria-label="${rating} out of 5">${"★".repeat(full)}${"☆".repeat(5 - full)}</span>`;
  }
  function badgeHtml(p) {
    if (p.badge === "sale") return `<span class="badge badge--sale">Sale</span>`;
    if (p.badge === "new") return `<span class="badge badge--new">New</span>`;
    return "";
  }
  function productCard(p, idx = 0) {
    const cover = p.gallery[0].src;
    const wished = S.isWished(p.id) ? "is-active" : "";
    return `
    <article class="card" data-reveal data-id="${p.id}">
      <div class="card__media">
        <a href="product.html?id=${p.id}" aria-label="${esc(p.name)}"><img src="${cover}" alt="${esc(p.name)} in ${esc(p.colors[0].name)}" loading="lazy"></a>
        <div class="card__badges">${badgeHtml(p)}</div>
        <button class="card__wish ${wished}" data-wish="${p.id}" aria-label="Add ${esc(p.name)} to wishlist" aria-pressed="${!!wished}">${ICON.heart}</button>
        <div class="card__quick"><button class="btn btn--light btn--block btn--sm" data-quick="${p.id}">Quick add</button></div>
      </div>
      <div class="card__body">
        <a href="product.html?id=${p.id}">
          <span class="card__cat">${esc(p.subcategory)}</span>
          <h3 class="card__title">${esc(p.name)}</h3>
        </a>
        ${priceHtml(p)}
        <div class="swatches" aria-hidden="true">${p.colors.slice(0,4).map((c) => `<span class="swatch" style="background:${c.hex}" title="${c.name}"></span>`).join("")}</div>
        <div class="stars" style="margin-top:.15rem">${stars(p.rating)} <span class="muted" style="font-size:.72rem;margin-left:.25rem">(${p.reviewsCount})</span></div>
      </div>
    </article>`;
  }

  function renderGrid(container, list) {
    container.innerHTML = list.map((p, i) => productCard(p, i)).join("");
    wireCards(container);
    observeReveal(container);
  }

  function wireCards(scope = document) {
    qsa("[data-wish]", scope).forEach((b) => {
      if (b.__wired) return; b.__wired = true;
      b.addEventListener("click", (e) => {
        e.preventDefault();
        const on = S.toggleWish(b.dataset.wish);
        b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on);
        toast(on ? "Added to wishlist" : "Removed from wishlist", on ? { href: "wishlist.html", label: "View" } : null);
      });
    });
    qsa("[data-quick]", scope).forEach((b) => {
      if (b.__wired) return; b.__wired = true;
      b.addEventListener("click", (e) => {
        e.preventDefault();
        const p = D.products.find((x) => x.id === b.dataset.quick);
        const size = p.sizes.find((s) => s.inStock) || p.sizes[0];
        S.addToCart({ id: p.id, name: p.name, price: p.price, salePrice: p.salePrice, color: p.colors[0].name, size: size.label, img: p.gallery[0].src });
        toast(`${p.name} added to bag`, { href: "cart.html", label: "View bag" });
        refreshBadges();
      });
    });
  }

  /* ---- Badges --------------------------------------------------------- */
  function refreshBadges() {
    const c = qs("#cart-count"), w = qs("#wish-count");
    if (c) { const n = S.cartCount(); c.textContent = n; c.dataset.count = n; }
    if (w) { const n = S.wishCount(); w.textContent = n; w.dataset.count = n; }
  }
  S.on("cart", refreshBadges); S.on("wish", refreshBadges);

  /* ---- Toast ---------------------------------------------------------- */
  function toast(msg, action) {
    let wrap = qs(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    const t = document.createElement("div"); t.className = "toast";
    t.innerHTML = `${ICON.check}<span>${esc(msg)}</span>${action ? `<a href="${action.href}">${esc(action.label)} →</a>` : ""}`;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 3200);
  }

  /* ---- Reveal on scroll ---------------------------------------------- */
  let io;
  function observeReveal(scope = document) {
    if (!("IntersectionObserver" in window)) { qsa("[data-reveal]", scope).forEach((e) => e.classList.add("in")); return; }
    io = io || new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    qsa("[data-reveal]", scope).forEach((e) => io.observe(e));
  }

  /* ---- Newsletter (footer + dedicated) -------------------------------- */
  function wireNewsletter(scope = document) {
    qsa("form[data-newsletter]", scope).forEach((f) => {
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = f.querySelector("input");
        const msg = f.parentElement.querySelector(".form-msg") || f.nextElementSibling;
        if (input.checkValidity()) { if (msg) msg.textContent = "Thanks — check your inbox for 10% off."; input.value = ""; }
        else { input.reportValidity(); }
      });
    });
  }

  /* ---- Boot ----------------------------------------------------------- */
  function init() {
    renderHeader();
    renderFooter();
    observeReveal();
    wireNewsletter();
    setTimeout(refreshBadges, 0);
  }

  // Expose a small API for page scripts
  window.UI = { money, qs, qsa, param, esc, ICON, stars, productCard, renderGrid, wireCards, refreshBadges, toast, observeReveal, renderCartDrawer, badgeHtml, priceHtml };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
