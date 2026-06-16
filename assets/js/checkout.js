/* ==========================================================================
   VEYRA — Checkout: validation, live summary, mock order placement
   ========================================================================== */
(function () {
  "use strict";
  const UI = window.UI, S = window.Store;
  const { qs, qsa, esc, money, ICON } = UI;

  // Redirect feel: if empty cart, show prompt instead of form
  if (!S.getCart().length) {
    qs("#checkout-root").innerHTML = `
      <div class="empty-state">
        <h1 style="font-family:var(--font-display);font-size:1.8rem">Your bag is empty</h1>
        <p>Add some pieces before checking out.</p>
        <a class="btn btn--accent" style="margin-top:1.2rem" href="shop.html">Shop now</a>
      </div>`;
    return;
  }

  let express = false;

  function renderSummary() {
    const t = S.computeTotals();
    const cart = S.getCart();
    const shipCost = express ? 18 : t.shipping;
    const total = t.subtotal - t.discount + shipCost + t.tax;
    qs("#checkout-summary").innerHTML = `
      <h2 style="font-family:var(--font-display);font-size:1.3rem">Order Summary</h2>
      <div style="max-height:280px;overflow-y:auto;display:grid;gap:.7rem;margin-block:.5rem">
        ${cart.map((i) => `
          <div style="display:flex;gap:.7rem;align-items:center">
            <div style="width:48px;aspect-ratio:3/4;border-radius:4px;overflow:hidden;flex:none;background:var(--paper-2)"><img src="${i.img}" alt="" style="width:100%;height:100%;object-fit:cover"></div>
            <div style="flex:1;font-size:.82rem"><strong>${esc(i.name)}</strong><br><span class="muted">${esc(i.color)} · ${esc(i.size)} · ×${i.qty}</span></div>
            <span style="font-size:.85rem">${money((i.salePrice ?? i.price) * i.qty)}</span>
          </div>`).join("")}
      </div>
      <div class="summary__row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
      ${t.discount ? `<div class="summary__row" style="color:var(--ok)"><span>Discount (${t.promoCode})</span><span>−${money(t.discount)}</span></div>` : ""}
      <div class="summary__row"><span>Shipping</span><span>${shipCost ? money(shipCost) : "Free"}</span></div>
      <div class="summary__row"><span>Tax</span><span>${money(t.tax)}</span></div>
      <div class="summary__row summary__row--total"><span>Total</span><span>${money(total)}</span></div>`;
  }

  // Toggle express shipping
  qsa('input[name="ship"]').forEach((r) => r.addEventListener("change", () => { express = r.value === "express"; renderSummary(); }));
  // Toggle card fields
  qsa('input[name="pay"]').forEach((r) => r.addEventListener("change", () => {
    qs("#card-fields").style.display = (qs('input[name="pay"]:checked').value === "card") ? "" : "none";
  }));

  // ---- Validation ----
  function setError(field, msg) {
    const err = field.parentElement.querySelector(".field-error");
    field.classList.toggle("input--invalid", !!msg);
    if (err) err.textContent = msg || "";
    return !msg;
  }
  function validate() {
    let ok = true;
    const required = ["email", "fname", "lname", "addr", "city", "zip"];
    required.forEach((id) => {
      const f = qs("#" + id);
      if (!f.value.trim()) ok = setError(f, "Required") && ok;
      else if (id === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)) ok = setError(f, "Enter a valid email") && ok;
      else setError(f, "");
    });
    if (qs('input[name="pay"]:checked').value === "card") {
      const card = qs("#card"), exp = qs("#exp"), cvc = qs("#cvc");
      if (card.value.replace(/\s/g, "").length < 13) ok = setError(card, "Enter a valid card number") && ok; else setError(card, "");
      if (!/^\d{2}\s*\/\s*\d{2}$/.test(exp.value)) ok = setError(exp, "MM / YY") && ok; else setError(exp, "");
      if (!/^\d{3,4}$/.test(cvc.value)) ok = setError(cvc, "3–4 digits") && ok; else setError(cvc, "");
    }
    return ok;
  }

  // Light input formatting
  qs("#card").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  });
  qs("#exp").addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + " / " + v.slice(2);
    e.target.value = v;
  });

  qs("#checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      const firstErr = qs(".input--invalid");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" }), firstErr.focus();
      return;
    }
    const email = qs("#email").value;
    const orderNum = "VY-" + Math.floor(100000 + Math.random() * 899999);
    // persist a mock order for the account page
    try {
      const orders = JSON.parse(localStorage.getItem("veyra.orders") || "[]");
      orders.unshift({ id: orderNum, date: new Date().toISOString().slice(0, 10), total: S.computeTotals().total, items: S.cartCount(), status: "Processing" });
      localStorage.setItem("veyra.orders", JSON.stringify(orders));
    } catch {}
    S.clearCart(); S.clearPromo();
    qs("#checkout-root").hidden = true;
    const success = qs("#order-success");
    success.hidden = false;
    qs("#success-check").innerHTML = ICON.check;
    qs("#success-email").textContent = email;
    qs("#order-num").textContent = orderNum;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  renderSummary();
})();
