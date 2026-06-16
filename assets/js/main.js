/* ==========================================================================
   VEYRA — Home page logic
   ========================================================================== */
(function () {
  "use strict";
  const D = window.VEYRA_DATA, UI = window.UI;
  const { qs, ICON } = UI;

  /* Hero / promo backgrounds (branded SVG lifestyle art) */
  function bg(el, src) { if (el) { el.style.cssText += `;background:url("${src}") center/cover no-repeat`; } }
  bg(qs("#hero-bg"), D.lifestyle({ color: "#2b2622" }));
  bg(qs("#promo-bg"), D.lifestyle({ color: "#8f3f29" }));
  bg(qs("#split-bg-1"), D.lifestyle({ color: "#7d8466" }));
  bg(qs("#split-bg-2"), D.lifestyle({ color: "#566074" }));

  /* USP strip */
  const usps = [
    [ICON.truck, "Free shipping", "On all orders over $150"],
    [ICON.refresh, "30-day returns", "Easy, no-fuss returns"],
    [ICON.leaf, "Responsibly made", "Lower-impact materials"],
    [ICON.shield, "Secure checkout", "Encrypted & protected"]
  ];
  qs("#usp").innerHTML = usps.map(([icon, t, s], i) => `
    <div class="usp__item d${i}" data-reveal>${icon}<div><strong>${t}</strong><span>${s}</span></div></div>`).join("");

  /* Featured collections */
  qs("#collections").innerHTML = D.collections.map((c) => `
    <a class="collection" href="shop.html?category=${c.category}&sub=${encodeURIComponent(c.sub)}" data-reveal>
      <img src="${D.makeImage({ color: c.color, glyph: c.glyph, label: 'VEYRA' })}" alt="${c.title}" loading="lazy">
      <div class="collection__label">
        <span class="eyebrow" style="color:var(--gold)">${c.sub}</span>
        <h3>${c.title}</h3>
        <span class="link-underline" style="color:#fff">Shop now →</span>
      </div>
    </a>`).join("");

  /* Trending = highest rated; New arrivals = badge new */
  const trending = [...D.products].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const newArrivals = D.products.filter((p) => p.badge === "new").slice(0, 8);

  UI.renderGrid(qs("#trending"), trending);
  UI.renderGrid(qs("#new-arrivals"), newArrivals.length ? newArrivals : D.products.slice(0, 8));

  UI.observeReveal();
})();
