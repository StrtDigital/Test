/* ==========================================================================
   VEYRA — Contact page: info cards, size table, FAQ, validated form
   ========================================================================== */
(function () {
  "use strict";
  const UI = window.UI;
  const { qs, ICON } = UI;

  // Info cards
  qs("#contact-info").innerHTML = `
    <div class="info-card">${ICON.mail}<div><strong>Email</strong><br><a class="link-underline" href="mailto:care@veyra.example">care@veyra.example</a><br><span class="muted" style="font-size:.85rem">Replies within 1 business day</span></div></div>
    <div class="info-card">${ICON.phone}<div><strong>Phone</strong><br><a class="link-underline" href="tel:+18005550199">+1 (800) 555-0199</a><br><span class="muted" style="font-size:.85rem">Mon–Fri, 9am–6pm ET</span></div></div>
    <div class="info-card">${ICON.pin}<div><strong>Flagship store</strong><br>14 Studio Lane, Brooklyn<br>New York, NY 11201</div></div>
    <div class="feature-tile"><strong>Follow us</strong><p class="muted" style="font-size:.85rem;margin-top:.3rem">@veyra.studio for new drops & styling.</p></div>`;

  // Size table
  const sizes = [["XS", "32–34", "26–28", "42"], ["S", "35–37", "29–31", "44"], ["M", "38–40", "32–34", "48"], ["L", "41–43", "35–37", "52"], ["XL", "44–46", "38–40", "56"]];
  qs("#size-table").innerHTML = sizes.map((r) => `<tr style="border-top:1px solid var(--line)">${r.map((c, i) => `<td style="padding:.8rem 1.1rem">${i === 0 ? "<strong>" + c + "</strong>" : c}</td>`).join("")}</tr>`).join("");

  // FAQ
  const faqs = [
    ["How long does delivery take?", "Standard delivery is 2–4 business days; express is 1–2 business days. International orders may take 5–10 business days."],
    ["What is your return policy?", "We offer free returns within 30 days on unworn items with original tags. Start a return from your account page."],
    ["Do you ship internationally?", "Yes — we ship to most countries worldwide. Duties and taxes are calculated at checkout where applicable."],
    ["How do I track my order?", "Once your order ships you'll receive a tracking link by email. You can also view order status under My Account → Orders."],
    ["Are your materials sustainable?", "We prioritise responsibly sourced and lower-impact materials, and we're working toward fully traceable supply chains by 2027."]
  ];
  qs("#faq-list").innerHTML = faqs.map(([q, a], i) => `
    <details ${i === 0 ? "open" : ""}><summary>${q}</summary><p>${a}</p></details>`).join("");

  // Form validation
  const form = qs("#contact-form");
  const setError = (f, msg) => { const e = f.parentElement.querySelector(".field-error"); f.classList.toggle("input--invalid", !!msg); if (e) e.textContent = msg || ""; return !msg; };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = qs("#name"), email = qs("#email"), msg = qs("#message");
    let ok = true;
    ok = (name.value.trim() ? setError(name, "") : setError(name, "Required")) && ok;
    ok = (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value) ? setError(email, "") : setError(email, "Enter a valid email")) && ok;
    ok = (msg.value.trim().length >= 10 ? setError(msg, "") : setError(msg, "Please write at least 10 characters")) && ok;
    if (!ok) return;
    qs(".form-msg").textContent = "Thanks! Your message has been sent — we'll be in touch soon.";
    form.reset();
  });
})();
