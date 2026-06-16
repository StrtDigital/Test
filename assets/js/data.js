/* ==========================================================================
   VEYRA — Sample data + on-brand SVG image generator
   Exposes window.VEYRA_DATA = { products, categories, collections, makeImage }
   ========================================================================== */
(function () {
  "use strict";

  /* ---- Branded SVG "photography" -------------------------------------
     Generates an editorial duotone placeholder so the site looks cohesive
     and works fully offline (no broken images, explicit content placeholder). */
  const GLYPHS = {
    tee: '<path d="M70 60 110 40 H190 L230 60 215 110 185 95 V250 H115 V95 L85 110Z"/>',
    jacket: '<path d="M80 55 110 40 H190 L220 55 205 120 185 110 V255 H150 V120 H150 V255 H115 V110 L95 120Z M150 40 V120"/>',
    dress: '<path d="M110 45 H190 L200 95 175 100 195 255 H105 L125 100 100 95Z"/>',
    pants: '<path d="M115 45 H185 L195 250 H160 L150 120 140 250 H105Z"/>',
    bag: '<path d="M105 110 H195 L205 250 H95Z M125 110 V90 A25 25 0 0 1 175 90 V110"/>',
    shoe: '<path d="M70 180 Q70 150 110 150 L150 150 200 185 230 195 230 215 70 215Z"/>',
    knit: '<path d="M85 60 110 45 H190 L215 60 205 105 185 95 V250 H115 V95 L95 105Z M115 95 H185"/>',
    hat: '<path d="M90 180 Q150 120 210 180 M70 185 H230 Q150 215 70 185Z"/>',
    accessory: '<circle cx="150" cy="150" r="78"/><circle cx="150" cy="150" r="40"/>'
  };

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function makeImage(opts) {
    const o = opts || {};
    const base = o.color || "#b1553a";
    const glyph = GLYPHS[o.glyph] || GLYPHS.tee;
    const label = (o.label || "VEYRA").toUpperCase();
    const top = shade(base, 38), bottom = shade(base, -28);
    const uid = "g" + Math.random().toString(36).slice(2, 8);
    const svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/>
    </linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#${uid})"/>
  <g transform="translate(0,40)" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${glyph}</g>
  <text x="150" y="372" text-anchor="middle" fill="rgba(255,255,255,.82)" font-family="Inter, sans-serif" font-size="13" letter-spacing="3" font-weight="600">${label}</text>
</svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  function lifestyle(opts) {
    const o = opts || {};
    const base = o.color || "#2b2622";
    const uid = "l" + Math.random().toString(36).slice(2, 8);
    const svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${shade(base,30)}"/><stop offset="1" stop-color="${shade(base,-30)}"/>
  </linearGradient></defs>
  <rect width="1200" height="800" fill="url(#${uid})"/>
  <g stroke="rgba(255,255,255,.10)" stroke-width="2">
    <circle cx="980" cy="180" r="220" fill="none"/><circle cx="980" cy="180" r="140" fill="none"/>
    <path d="M0 620 Q300 540 600 600 T1200 560" fill="none"/>
  </g>
</svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  /* ---- Color palette used across the catalogue ------------------------ */
  const C = {
    ink: { name: "Ink Black", hex: "#1c1a18" },
    bone: { name: "Bone", hex: "#e9e2d4" },
    clay: { name: "Burnt Clay", hex: "#b1553a" },
    sage: { name: "Sage", hex: "#7d8466" },
    sand: { name: "Sand", hex: "#c9b48f" },
    slate: { name: "Slate Blue", hex: "#566074" },
    plum: { name: "Plum", hex: "#5d4356" },
    cream: { name: "Cream", hex: "#f1ead9" },
    olive: { name: "Olive", hex: "#5c5d3d" },
    rust: { name: "Rust", hex: "#9c5a2e" },
    forest:{ name: "Forest", hex: "#34433a" },
    camel: { name: "Camel", hex: "#a9794d" }
  };

  const apparelSizes = ["XS", "S", "M", "L", "XL"];
  const numericSizes = ["28", "30", "32", "34", "36"];
  const shoeSizes = ["6", "7", "8", "9", "10", "11"];

  function sizes(list, soldOut) {
    return list.map((s) => ({ label: s, inStock: !(soldOut || []).includes(s) }));
  }

  /* ---- Catalogue ------------------------------------------------------ */
  const raw = [
    ["Atlas Oversized Tee","women","Tops",48,null,[C.bone,C.ink,C.clay],"tee",apparelSizes,["S"],4.6,128,"new","100% organic cotton, garment-dyed for a lived-in feel."],
    ["Meridian Wool Coat","women","Outerwear",289,229,[C.camel,C.ink,C.forest],"jacket",apparelSizes,[],4.9,86,"sale","Double-faced Italian wool with a relaxed drop shoulder."],
    ["Lumen Slip Dress","women","Dresses",128,null,[C.plum,C.ink,C.sand],"dress",apparelSizes,["XL"],4.4,57,null,"Bias-cut satin slip with adjustable straps."],
    ["Cove Ribbed Knit","women","Knitwear",96,null,[C.cream,C.sage,C.rust],"knit",apparelSizes,[],4.7,142,"new","Soft merino-blend rib knit with a high funnel neck."],
    ["Drift Wide-Leg Trouser","women","Bottoms",118,89,[C.ink,C.sand,C.olive],"pants",numericSizes,["36"],4.5,73,"sale","Fluid tailored trouser with a pressed crease."],
    ["Vela Linen Shirt","women","Tops",72,null,[C.cream,C.slate,C.clay],"tee",apparelSizes,[],4.3,61,null,"Breathable European linen with mother-of-pearl buttons."],
    ["Nomad Trench","women","Outerwear",245,null,[C.sand,C.ink],"jacket",apparelSizes,["XS"],4.8,49,null,"Water-resistant cotton gabardine, belted silhouette."],
    ["Sol Pleated Midi","women","Dresses",139,null,[C.rust,C.ink,C.sage],"dress",apparelSizes,[],4.6,38,"new","Sunray-pleated midi with a fluid drape."],

    ["Forge Heavy Hoodie","men","Tops",94,null,[C.ink,C.sage,C.bone],"knit",apparelSizes,[],4.8,210,"new","450gsm loopback cotton, boxy modern fit."],
    ["Range Field Jacket","men","Outerwear",215,169,[C.olive,C.ink,C.camel],"jacket",apparelSizes,["XL"],4.7,94,"sale","Waxed cotton utility jacket with four-pocket front."],
    ["Pioneer Selvedge Denim","men","Bottoms",148,null,[C.slate,C.ink],"pants",numericSizes,[],4.6,167,null,"14oz raw selvedge denim, tapered leg."],
    ["Base Pima Tee","men","Tops",38,null,[C.bone,C.ink,C.clay,C.sage],"tee",apparelSizes,[],4.5,302,null,"Buttery Pima cotton crew, mid-weight."],
    ["Crag Merino Crew","men","Knitwear",110,null,[C.forest,C.ink,C.camel],"knit",apparelSizes,["S"],4.7,88,null,"Fine-gauge merino crewneck, fully fashioned."],
    ["Tide Pleated Chino","men","Bottoms",98,79,[C.sand,C.ink,C.olive],"pants",numericSizes,[],4.4,76,"sale","Cotton-twill pleated chino with a tapered leg."],
    ["Summit Puffer","men","Outerwear",268,null,[C.ink,C.slate],"jacket",apparelSizes,["XS","S"],4.9,63,"new","Recycled down puffer rated for deep cold."],
    ["Ridge Overshirt","men","Tops",128,null,[C.olive,C.rust,C.ink],"jacket",apparelSizes,[],4.5,54,null,"Brushed flannel overshirt that layers as a jacket."],

    ["Halo Leather Tote","accessories","Bags",198,null,[C.camel,C.ink],"bag",["One Size"],[],4.8,121,"new","Full-grain vegetable-tanned leather, structured base."],
    ["Orbit Crossbody","accessories","Bags",118,89,[C.ink,C.clay,C.sand],"bag",["One Size"],[],4.4,77,"sale","Compact crossbody with adjustable webbing strap."],
    ["Trace Runner","accessories","Footwear",135,null,[C.bone,C.ink,C.sage],"shoe",shoeSizes,["6"],4.6,189,"new","Lightweight knit runner with recycled sole."],
    ["Anchor Chelsea Boot","accessories","Footwear",215,null,[C.ink,C.camel],"shoe",shoeSizes,[],4.7,96,null,"Leather Chelsea boot with stacked rubber sole."],
    ["Stone Wool Beanie","accessories","Hats",42,null,[C.ink,C.rust,C.sage,C.cream],"hat",["One Size"],[],4.5,143,null,"Chunky lambswool rib-knit beanie."],
    ["Field Canvas Cap","accessories","Hats",36,28,[C.olive,C.sand,C.ink],"hat",["One Size"],[],4.2,64,"sale","Washed-canvas six-panel cap with curved brim."],
    ["Loop Leather Belt","accessories","Accessories",68,null,[C.camel,C.ink],"accessory",["S","M","L"],[],4.6,52,null,"Bridle leather belt with brushed brass buckle."],
    ["Dawn Silk Scarf","accessories","Accessories",58,null,[C.clay,C.plum,C.slate],"accessory",["One Size"],[],4.4,41,"new","Hand-rolled mulberry silk, seasonal print."]
  ];

  function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

  const REVIEW_BANK = [
    ["Maya R.", 5, "Exceeded expectations", "The fabric quality is genuinely premium and the fit is exactly as described. Already eyeing a second colour."],
    ["Daniel K.", 4, "Great everyday piece", "Comfortable and well made. Runs slightly large so consider sizing down if between sizes."],
    ["Priya S.", 5, "My new favourite", "Beautiful drape and the colour is even richer in person. Shipping was quick too."],
    ["Tom W.", 4, "Solid quality", "Holds up well after several washes. Stitching is clean throughout."],
    ["Lena M.", 5, "Worth every penny", "Feels luxurious without the designer markup. Will be back for more."],
    ["Chris A.", 3, "Good but sizing tricky", "Lovely material but the fit was a little boxy for me. Returns were painless though."]
  ];

  const products = raw.map((r, i) => {
    const [name, category, subcategory, price, salePrice, colors, glyph, sizeList, soldOut, rating, reviewsCount, badge, description] = r;
    const id = slugify(name);
    const gallery = colors.map((c) => ({ color: c.name, src: makeImage({ color: c.hex, glyph, label: "VEYRA" }) }));
    // 1–4 sample reviews per product, deterministic-ish
    const n = (i % 4) + 2;
    const reviews = [];
    for (let k = 0; k < n; k++) {
      const b = REVIEW_BANK[(i + k) % REVIEW_BANK.length];
      reviews.push({ author: b[0], rating: b[1], title: b[2], body: b[3], date: `2026-0${(k % 5) + 1}-1${k}` });
    }
    return {
      id, name, category, subcategory, price, salePrice,
      colors, glyph,
      sizes: sizes(sizeList, soldOut),
      rating, reviewsCount, badge, description,
      materials: ["Designed in our studio", "Responsibly sourced materials", "Free returns within 30 days"],
      gallery, reviews,
      createdAt: Date.now() - i * 86400000
    };
  });

  const categories = [
    { id: "women", label: "Women", subs: ["Tops", "Outerwear", "Dresses", "Knitwear", "Bottoms"] },
    { id: "men", label: "Men", subs: ["Tops", "Outerwear", "Knitwear", "Bottoms"] },
    { id: "accessories", label: "Accessories", subs: ["Bags", "Footwear", "Hats", "Accessories"] }
  ];

  const collections = [
    { title: "The Tailoring Edit", category: "women", sub: "Outerwear", color: C.camel.hex, glyph: "jacket" },
    { title: "Everyday Knits", category: "men", sub: "Knitwear", color: C.sage.hex, glyph: "knit" },
    { title: "Off-Duty", category: "men", sub: "Tops", color: C.ink.hex, glyph: "tee" },
    { title: "Carry Goods", category: "accessories", sub: "Bags", color: C.clay.hex, glyph: "bag" }
  ];

  window.VEYRA_DATA = { products, categories, collections, makeImage, lifestyle, palette: C };
})();
