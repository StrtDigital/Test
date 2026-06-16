/* ==========================================================================
   VEYRA — Wishlist page
   ========================================================================== */
(function () {
  "use strict";
  const D = window.VEYRA_DATA, UI = window.UI, S = window.Store;
  const { qs } = UI;

  function render() {
    const ids = S.getWishlist();
    const list = D.products.filter((p) => ids.includes(p.id));
    const grid = qs("#wishlist-grid"), empty = qs("#wishlist-empty");
    qs("#wish-sub").textContent = list.length ? `${list.length} saved item${list.length === 1 ? "" : "s"}` : "";
    if (!list.length) { grid.innerHTML = ""; empty.hidden = false; return; }
    empty.hidden = true;
    UI.renderGrid(grid, list);
  }

  // Re-render when an item is un-wished from a card
  S.on("wish", render);
  render();
})();
