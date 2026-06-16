/* ==========================================================================
   VEYRA — Client-side store (localStorage). Cart, wishlist, auth, newsletter.
   Exposes window.Store with a tiny pub/sub so the UI can react to changes.
   ========================================================================== */
(function () {
  "use strict";
  const KEYS = { cart: "veyra.cart", wish: "veyra.wishlist", user: "veyra.user", promo: "veyra.promo" };
  const listeners = {};

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function emit(evt) { (listeners[evt] || []).forEach((fn) => fn(Store)); }
  function on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); return fn; }

  const Store = {
    on,
    /* ---- Cart --------------------------------------------------------- */
    getCart() { return read(KEYS.cart, []); },
    cartCount() { return this.getCart().reduce((n, i) => n + i.qty, 0); },
    cartSubtotal() {
      return this.getCart().reduce((sum, i) => sum + (i.salePrice ?? i.price) * i.qty, 0);
    },
    addToCart(item) {
      const cart = this.getCart();
      const key = `${item.id}|${item.size}|${item.color}`;
      const existing = cart.find((c) => c.key === key);
      if (existing) existing.qty += item.qty || 1;
      else cart.push({ ...item, key, qty: item.qty || 1 });
      write(KEYS.cart, cart);
      emit("cart");
      return existing ? existing.qty : item.qty || 1;
    },
    updateQty(key, qty) {
      const cart = this.getCart();
      const it = cart.find((c) => c.key === key);
      if (!it) return;
      it.qty = Math.max(1, qty);
      write(KEYS.cart, cart); emit("cart");
    },
    removeFromCart(key) {
      write(KEYS.cart, this.getCart().filter((c) => c.key !== key));
      emit("cart");
    },
    clearCart() { write(KEYS.cart, []); emit("cart"); },

    /* ---- Promo -------------------------------------------------------- */
    promoCodes: { VEYRA10: { label: "10% off", type: "pct", value: 0.10 }, WELCOME15: { label: "15% off", type: "pct", value: 0.15 }, FREESHIP: { label: "Free shipping", type: "ship", value: 0 } },
    getPromo() { return read(KEYS.promo, null); },
    applyPromo(code) {
      const c = (code || "").trim().toUpperCase();
      if (this.promoCodes[c]) { write(KEYS.promo, c); emit("cart"); return this.promoCodes[c]; }
      return null;
    },
    clearPromo() { localStorage.removeItem(KEYS.promo); emit("cart"); },

    /* ---- Wishlist ----------------------------------------------------- */
    getWishlist() { return read(KEYS.wish, []); },
    isWished(id) { return this.getWishlist().includes(id); },
    toggleWish(id) {
      const w = this.getWishlist();
      const idx = w.indexOf(id);
      if (idx >= 0) w.splice(idx, 1); else w.push(id);
      write(KEYS.wish, w); emit("wish");
      return idx < 0;
    },
    wishCount() { return this.getWishlist().length; },

    /* ---- Totals (shared by cart + checkout) --------------------------- */
    SHIPPING_FLAT: 12,
    FREE_SHIP_THRESHOLD: 150,
    TAX_RATE: 0.08,
    computeTotals() {
      const subtotal = this.cartSubtotal();
      const promoCode = this.getPromo();
      const promo = promoCode ? this.promoCodes[promoCode] : null;
      let discount = 0, freeShip = false;
      if (promo) {
        if (promo.type === "pct") discount = subtotal * promo.value;
        if (promo.type === "ship") freeShip = true;
      }
      const afterDiscount = subtotal - discount;
      const shipping = (subtotal === 0) ? 0 : (freeShip || subtotal >= this.FREE_SHIP_THRESHOLD ? 0 : this.SHIPPING_FLAT);
      const tax = afterDiscount * this.TAX_RATE;
      const total = afterDiscount + shipping + tax;
      return { subtotal, discount, shipping, tax, total, promoCode, promo, freeShip };
    },

    /* ---- Auth (mock) -------------------------------------------------- */
    getUser() { return read(KEYS.user, null); },
    login(email, name) { write(KEYS.user, { email, name: name || email.split("@")[0], since: "2026" }); emit("auth"); },
    logout() { localStorage.removeItem(KEYS.user); emit("auth"); }
  };

  window.Store = Store;
})();
