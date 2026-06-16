/* ==========================================================================
   VEYRA — Product detail: gallery, variants, sizes, qty, reviews, related
   ========================================================================== */
(function () {
  "use strict";
  const D = window.VEYRA_DATA, UI = window.UI, S = window.Store;
  const { qs, qsa, param, esc, money, ICON } = UI;

  const product = D.products.find((p) => p.id === param("id")) || D.products[0];

  // selection state
  const sel = { color: product.colors[0].name, size: null, qty: 1, img: product.gallery[0].src };

  // ---- Breadcrumbs ----
  qs("#breadcrumbs").innerHTML = `
    <a href="index.html">Home</a><span>/</span>
    <a href="shop.html?category=${product.category}">${product.category[0].toUpperCase() + product.category.slice(1)}</a><span>/</span>
    <span>${esc(product.name)}</span>`;
  document.title = `${product.name} — VEYRA`;

  // ---- Build PDP ----
  function buildPDP() {
    const priceBlock = product.salePrice
      ? `<span>${money(product.salePrice)}</span><span class="was">${money(product.price)}</span><span class="badge badge--sale">Save ${Math.round((1 - product.salePrice / product.price) * 100)}%</span>`
      : `<span>${money(product.price)}</span>`;

    qs("#pdp").innerHTML = `
      <div class="gallery">
        <div class="gallery__main"><img id="main-img" src="${sel.img}" alt="${esc(product.name)} in ${esc(sel.color)}"></div>
        <div class="gallery__thumbs" id="thumbs"></div>
      </div>
      <div class="pdp__info">
        <span class="card__cat">${esc(product.subcategory)}</span>
        <h1 style="font-size:var(--fs-2xl)">${esc(product.name)}</h1>
        <div class="cluster" style="gap:.6rem">
          ${UI.stars(product.rating)}
          <a href="#reviews-section" class="muted" style="font-size:.85rem">${product.rating.toFixed(1)} · ${product.reviewsCount} reviews</a>
        </div>
        <div class="pdp__price">${priceBlock}</div>
        <p class="muted">${esc(product.description)}</p>

        <div class="option-row">
          <div class="option-row__head"><span>Colour</span><span class="muted" id="color-label">${esc(sel.color)}</span></div>
          <div class="color-row" id="colors"></div>
        </div>

        <div class="option-row">
          <div class="option-row__head"><span>Size</span><a href="contact.html#size" class="link-underline" style="font-weight:500">Size guide</a></div>
          <div class="size-grid" id="sizes"></div>
          <p class="field-error" id="size-error"></p>
        </div>

        <div class="cluster" style="gap:.8rem;margin-top:.3rem">
          <div class="qty">
            <button type="button" id="qty-minus" aria-label="Decrease quantity">−</button>
            <input id="qty" value="1" inputmode="numeric" aria-label="Quantity">
            <button type="button" id="qty-plus" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn btn--accent" style="flex:1" id="add-cart">Add to bag · ${money(product.salePrice ?? product.price)}</button>
          <button class="icon-btn" id="wish-btn" aria-label="Add to wishlist" style="border:1px solid var(--line);width:48px;height:48px">${ICON.heart}</button>
        </div>

        <div class="usp__item" style="margin-top:.5rem">${ICON.truck}<div><strong>Free shipping over $150</strong><span>Estimated delivery 2–4 business days</span></div></div>

        <div class="accordion">
          <details open><summary>Details & fit</summary><p>${esc(product.description)} Model is 1.78m and wears a size M.</p></details>
          <details><summary>Materials & care</summary><ul>${product.materials.map((m) => `<li>• ${esc(m)}</li>`).join("")}</ul></details>
          <details><summary>Shipping & returns</summary><p>Complimentary shipping on orders over $150. Free 30-day returns on unworn items with tags attached.</p></details>
        </div>
      </div>`;

    renderThumbs(); renderColors(); renderSizes(); wirePDP();
  }

  function renderThumbs() {
    qs("#thumbs").innerHTML = product.gallery.map((g, i) => `
      <button data-thumb="${i}" aria-current="${g.src === sel.img}" aria-label="View ${esc(g.color)}">
        <img src="${g.src}" alt="${esc(product.name)} ${esc(g.color)}"></button>`).join("");
    qsa("#thumbs button").forEach((b) => b.addEventListener("click", () => {
      const g = product.gallery[+b.dataset.thumb];
      setImage(g.src); setColor(g.color);
    }));
  }
  function renderColors() {
    qs("#colors").innerHTML = product.colors.map((c) => `
      <button class="color-pick" data-color="${esc(c.name)}" style="background:${c.hex}" aria-pressed="${c.name === sel.color}" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join("");
    qsa("#colors button").forEach((b) => b.addEventListener("click", () => {
      setColor(b.dataset.color);
      const g = product.gallery.find((x) => x.color === b.dataset.color);
      if (g) setImage(g.src);
    }));
  }
  function renderSizes() {
    qs("#sizes").innerHTML = product.sizes.map((s) => `
      <button class="size-btn" data-size="${esc(s.label)}" aria-pressed="${s.label === sel.size}" ${s.inStock ? "" : "disabled title='Sold out'"}>${esc(s.label)}</button>`).join("");
    qsa("#sizes button:not([disabled])").forEach((b) => b.addEventListener("click", () => {
      sel.size = b.dataset.size;
      qsa("#sizes button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      qs("#size-error").textContent = "";
    }));
  }
  function setImage(src) { sel.img = src; qs("#main-img").src = src; qsa("#thumbs button").forEach((b) => b.setAttribute("aria-current", product.gallery[+b.dataset.thumb].src === src)); }
  function setColor(name) { sel.color = name; qs("#color-label").textContent = name; qsa("#colors button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.color === name)); }

  function wirePDP() {
    const qtyInput = qs("#qty");
    const setQty = (n) => { sel.qty = Math.max(1, Math.min(10, n || 1)); qtyInput.value = sel.qty; };
    qs("#qty-minus").addEventListener("click", () => setQty(sel.qty - 1));
    qs("#qty-plus").addEventListener("click", () => setQty(sel.qty + 1));
    qtyInput.addEventListener("change", () => setQty(parseInt(qtyInput.value, 10)));

    qs("#add-cart").addEventListener("click", () => {
      if (!sel.size) { qs("#size-error").textContent = "Please select a size."; qs("#sizes").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      S.addToCart({ id: product.id, name: product.name, price: product.price, salePrice: product.salePrice, color: sel.color, size: sel.size, img: sel.img, qty: sel.qty });
      UI.toast(`${product.name} added to bag`, { href: "cart.html", label: "View bag" });
    });

    const wb = qs("#wish-btn");
    const sync = () => { const on = S.isWished(product.id); wb.querySelector("svg").style.fill = on ? "var(--clay)" : "none"; wb.querySelector("svg").style.stroke = on ? "var(--clay)" : "currentColor"; };
    wb.querySelector("svg").style.stroke = "currentColor"; wb.querySelector("svg").setAttribute("fill", "none");
    wb.addEventListener("click", () => { const on = S.toggleWish(product.id); sync(); UI.toast(on ? "Added to wishlist" : "Removed from wishlist", on ? { href: "wishlist.html", label: "View" } : null); });
    sync();
  }

  // ---- Reviews ----
  function buildReviews() {
    const reviews = product.reviews;
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => counts[r.rating - 1]++);
    const total = reviews.length;
    qs("#reviews-title").textContent = `Reviews (${total})`;
    qs("#rating-summary").innerHTML = `
      <div style="text-align:center">
        <div class="big">${product.rating.toFixed(1)}</div>
        ${UI.stars(product.rating)}
        <p class="muted" style="font-size:.8rem;margin-top:.3rem">${product.reviewsCount} ratings</p>
      </div>
      <div class="rating-bars">
        ${[5,4,3,2,1].map((star) => {
          const pct = total ? Math.round((counts[star - 1] / total) * 100) : 0;
          return `<div class="rating-bar"><span>${star}★</span><div class="track"><div class="fill" style="width:${pct}%"></div></div><span>${counts[star-1]}</span></div>`;
        }).join("")}
      </div>
      <div style="align-self:center"><button class="btn btn--ghost btn--sm" id="write-review">Write a review</button></div>`;

    qs("#reviews-list").innerHTML = reviews.map((r) => `
      <article class="review">
        <div class="review__head">
          <div><span class="review__author">${esc(r.author)}</span> ${UI.stars(r.rating)}</div>
          <span class="muted" style="font-size:.78rem">${r.date}</span>
        </div>
        <strong>${esc(r.title)}</strong>
        <p class="muted" style="margin-top:.3rem">${esc(r.body)}</p>
      </article>`).join("");

    qs("#write-review").addEventListener("click", () => UI.toast("Thanks! Review form coming soon."));
  }

  // ---- Related ----
  function buildRelated() {
    const related = D.products.filter((p) => p.id !== product.id && (p.category === product.category || p.subcategory === product.subcategory)).slice(0, 4);
    UI.renderGrid(qs("#related"), related.length ? related : D.products.slice(0, 4));
  }

  buildPDP(); buildReviews(); buildRelated();
  window.scrollTo(0, 0);
})();
