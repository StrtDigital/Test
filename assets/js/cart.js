/* ==========================================================================
   VEYRA — Cart page: line items, quantity, promo codes, totals
   ========================================================================== */
(function () {
  "use strict";
  const UI = window.UI, S = window.Store;
  const { qs, qsa, esc, money } = UI;

  function renderItems() {
    const cart = S.getCart();
    const layout = qs("#cart-layout"), empty = qs("#cart-empty");
    if (!cart.length) { layout.style.display = "none"; empty.hidden = false; return; }
    layout.style.display = ""; empty.hidden = true;

    qs("#cart-items").innerHTML = cart.map((i) => `
      <div class="cart-item" data-key="${esc(i.key)}">
        <div class="cart-item__media"><a href="product.html?id=${i.id}"><img src="${i.img}" alt="${esc(i.name)}"></a></div>
        <div class="cart-item__meta">
          <a href="product.html?id=${i.id}"><strong>${esc(i.name)}</strong></a>
          <span class="opts">Colour: ${esc(i.color)} · Size: ${esc(i.size)}</span>
          ${i.salePrice ? `<span class="opts">${money(i.salePrice)} <s style="opacity:.6">${money(i.price)}</s></span>` : `<span class="opts">${money(i.price)}</span>`}
          <div class="qty" style="margin-top:.4rem">
            <button type="button" data-dec aria-label="Decrease">−</button>
            <input value="${i.qty}" data-qty inputmode="numeric" aria-label="Quantity for ${esc(i.name)}">
            <button type="button" data-inc aria-label="Increase">+</button>
          </div>
          <button class="cart-item__remove" data-remove aria-label="Remove ${esc(i.name)}">Remove</button>
        </div>
        <div class="cart-item__end"><strong>${money((i.salePrice ?? i.price) * i.qty)}</strong></div>
      </div>`).join("");

    qsa(".cart-item").forEach((row) => {
      const key = row.dataset.key;
      const item = cart.find((c) => c.key === key);
      row.querySelector("[data-inc]").addEventListener("click", () => { S.updateQty(key, item.qty + 1); render(); });
      row.querySelector("[data-dec]").addEventListener("click", () => { S.updateQty(key, item.qty - 1); render(); });
      row.querySelector("[data-qty]").addEventListener("change", (e) => { S.updateQty(key, parseInt(e.target.value, 10) || 1); render(); });
      row.querySelector("[data-remove]").addEventListener("click", () => { S.removeFromCart(key); UI.toast("Item removed"); render(); });
    });
  }

  function renderSummary() {
    const t = S.computeTotals();
    qs("#summary").innerHTML = `
      <h2 style="font-family:var(--font-display);font-size:1.4rem">Order Summary</h2>
      <div class="summary__row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
      ${t.discount ? `<div class="summary__row" style="color:var(--ok)"><span>Discount (${t.promoCode})</span><span>−${money(t.discount)}</span></div>` : ""}
      <div class="summary__row"><span>Shipping</span><span>${t.shipping ? money(t.shipping) : "Free"}</span></div>
      <div class="summary__row"><span>Estimated tax</span><span>${money(t.tax)}</span></div>
      ${!t.shipping || t.freeShip ? "" : `<p class="muted" style="font-size:.78rem">Add ${money(S.FREE_SHIP_THRESHOLD - t.subtotal)} more for free shipping.</p>`}
      <div class="summary__row summary__row--total"><span>Total</span><span>${money(t.total)}</span></div>

      <div style="margin-top:.5rem">
        <label class="field" style="margin-bottom:.5rem"><span style="font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-soft)">Promo code</span></label>
        <div class="promo-input">
          <input class="input" id="promo" placeholder="VEYRA10" value="${t.promoCode || ""}" aria-label="Promo code">
          <button class="btn btn--ghost btn--sm" id="apply-promo" type="button">Apply</button>
        </div>
        <p class="field-error" id="promo-msg" style="${t.promo ? "color:var(--ok)" : ""}">${t.promo ? t.promo.label + " applied" : ""}</p>
      </div>

      <a class="btn btn--accent btn--block btn--lg" href="checkout.html">Checkout</a>
      <p class="muted" style="font-size:.75rem;text-align:center">Try <strong>VEYRA10</strong>, <strong>WELCOME15</strong> or <strong>FREESHIP</strong></p>`;

    qs("#apply-promo").addEventListener("click", () => {
      const code = qs("#promo").value;
      const ok = S.applyPromo(code);
      const msg = qs("#promo-msg");
      if (ok) { render(); }
      else { msg.style.color = "var(--clay-deep)"; msg.textContent = "Invalid code. Try VEYRA10."; }
    });
  }

  function render() { renderItems(); if (S.getCart().length) renderSummary(); }
  render();
})();
