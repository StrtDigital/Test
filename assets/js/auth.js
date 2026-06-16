/* ==========================================================================
   VEYRA — Auth pages (login / register / forgot). Mock client-side flow.
   ========================================================================== */
(function () {
  "use strict";
  const D = window.VEYRA_DATA, UI = window.UI, S = window.Store;
  const { qs, qsa } = UI;

  // Auth visual background
  const bg = qs("#auth-bg");
  if (bg) bg.style.cssText += `;background:url("${D.lifestyle({ color: "#2b2622" })}") center/cover no-repeat`;

  const form = qs("#auth-form");
  if (!form) return;
  const mode = form.dataset.auth;

  const setError = (f, msg) => {
    const err = f.parentElement.querySelector(".field-error");
    f.classList.toggle("input--invalid", !!msg);
    if (err) err.textContent = msg || "";
    return !msg;
  };
  const isEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

  // Password strength meter (register)
  const pw = qs("#password"), fill = qs("#pw-fill");
  if (pw && fill) {
    pw.addEventListener("input", () => {
      const v = pw.value;
      let score = 0;
      if (v.length >= 6) score++; if (v.length >= 10) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\d/.test(v) || /[^A-Za-z0-9]/.test(v)) score++;
      const pcts = ["0%", "30%", "55%", "80%", "100%"];
      const colors = ["var(--line)", "#c0563c", "#c9a24b", "#7d8466", "var(--ok)"];
      fill.style.width = pcts[score]; fill.style.background = colors[score];
    });
  }

  // Social buttons
  qsa("[data-social]").forEach((b) => b.addEventListener("click", () => UI.toast(`${b.dataset.social} sign-in is a demo placeholder.`)));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = qs("#email");
    let ok = email.value.trim() && isEmail(email.value) ? setError(email, "") : setError(email, "Enter a valid email");

    if (mode === "login") {
      const p = qs("#password");
      ok = (p.value.length >= 6 ? setError(p, "") : setError(p, "At least 6 characters")) && ok;
      if (!ok) return;
      S.login(email.value);
      UI.toast("Signed in — welcome back!");
      setTimeout(() => location.href = "account.html", 700);
    }

    if (mode === "register") {
      const fn = qs("#fname"), ln = qs("#lname"), p = qs("#password"), terms = qs("#terms");
      ok = (fn.value.trim() ? setError(fn, "") : setError(fn, "Required")) && ok;
      ok = (ln.value.trim() ? setError(ln, "") : setError(ln, "Required")) && ok;
      ok = (p.value.length >= 6 ? setError(p, "") : setError(p, "At least 6 characters")) && ok;
      const te = qs("#terms-error");
      if (!terms.checked) { te.textContent = "Please accept the terms"; ok = false; } else te.textContent = "";
      if (!ok) return;
      S.login(email.value, `${fn.value} ${ln.value}`);
      UI.toast("Account created — welcome to VEYRA!");
      setTimeout(() => location.href = "account.html", 800);
    }

    if (mode === "forgot") {
      if (!ok) return;
      qs(".form-msg").textContent = `If an account exists for ${email.value}, a reset link is on its way.`;
      form.querySelector("button").disabled = true;
    }
  });
})();
