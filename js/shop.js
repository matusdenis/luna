/* Obchod – produkty, košík, objednávka */
(async function () {
  const d = await LunaStore.load();
  const { esc, money } = LunaStore.util;
  const s = d.settings;
  LunaUI.header("Obchod");
  LunaUI.footer();

  // obchod je v admine vypnutý → len oznam
  if (!LunaStore.util.on("Shop")) {
    document.querySelector(".shop-layout").innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 16px 80px">
      <p style="font-size:20px">Lunin obchod sa ešte len pripravuje. Čoskoro tu nájdeš čarovné darčeky ✨</p>
      <a class="btn btn-gold" href="index.html">Späť domov ›</a></div>`;
    LunaFX.init(); LunaUI.reveal();
    return;
  }

  const products = d.products.filter((p) => p.active !== false);
  const cats = ["Všetko", ...new Set(products.map((p) => p.category).filter(Boolean))];
  let cat = "Všetko";
  const catsEl = document.getElementById("cats");

  function renderCats() {
    catsEl.innerHTML = cats.map((c) => `<button class="${c === cat ? "on" : ""}">${esc(c)}</button>`).join("");
    catsEl.querySelectorAll("button").forEach((b, i) => (b.onclick = () => { cat = cats[i]; renderCats(); renderProducts(); }));
  }

  function renderProducts() {
    const list = products.filter((p) => cat === "Všetko" || p.category === cat);
    document.getElementById("products").innerHTML = list.map((p) => {
      const out = Number(p.stock) <= 0;
      const variants = String(p.variants || "").split(",").map((v) => v.trim()).filter(Boolean);
      return `<article class="product reveal d${list.indexOf(p) % 3} ${out ? "sold-out" : ""}" id="p-${esc(p.id)}">
        ${p.category ? `<span class="tag">${esc(p.category)}</span>` : ""}
        <div class="img"><img src="${esc(LunaStore.util.img(p.image) || "img/news-gifts.jpg")}" alt="${esc(p.name)}" loading="lazy"></div>
        <div class="body">
          <h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>
          <div class="price">${money(p.price)}</div>
          ${variants.length ? `<select aria-label="Veľkosť / variant">${variants.map((v) => `<option>${esc(v)}</option>`).join("")}</select>` : ""}
          <button class="btn btn-gold" data-id="${esc(p.id)}" ${out ? "disabled" : ""}>${out ? "Vypredané" : "Do košíka ✨"}</button>
        </div></article>`;
    }).join("") || `<p class="empty">V tejto kategórii zatiaľ nič nie je.</p>`;
    document.querySelectorAll(".product .btn-gold[data-id]").forEach((b) => (b.onclick = () => {
      const sel = b.parentElement.querySelector("select");
      LunaStore.cart.add(b.dataset.id, sel ? sel.value : "");
      LunaUI.toast("Pridané do košíka 🌙");
      fly(b);
    }));
  }

  // malá hviezdička letí do košíka
  function fly(from) {
    const to = document.querySelector(".cart-btn"); if (!to) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const st = document.createElement("div");
    st.textContent = "★";
    Object.assign(st.style, { position: "fixed", left: a.left + a.width / 2 + "px", top: a.top + "px", color: "#ffdf9a", fontSize: "28px", zIndex: 999, transition: "all .8s cubic-bezier(.5,-0.4,.6,1)", textShadow: "0 0 12px #f6c66a", pointerEvents: "none" });
    document.body.append(st);
    requestAnimationFrame(() => Object.assign(st.style, { left: b.left + 10 + "px", top: b.top + "px", transform: "scale(.4) rotate(360deg)", opacity: ".3" }));
    setTimeout(() => st.remove(), 850);
  }

  const cartEl = document.getElementById("kosik");
  function totals(items) {
    const sub = items.reduce((t, i) => { const p = products.find((x) => x.id === i.id); return t + (p ? p.price * i.qty : 0); }, 0);
    const pickup = (document.getElementById("delivery") || {}).value === "osobny";
    const ship = !sub || pickup || (s.freeShippingFrom && sub >= s.freeShippingFrom) ? 0 : Number(s.shippingPrice || 0);
    return { sub, ship, total: sub + ship };
  }

  function renderCart() {
    const items = LunaStore.cart.get().filter((i) => products.some((p) => p.id === i.id));
    if (!items.length) {
      cartEl.innerHTML = `<h2>Košík</h2><p class="muted">Košík je zatiaľ prázdny. Vyber si niečo čarovné ✨</p>`;
      return;
    }
    const t = totals(items);
    cartEl.innerHTML = `<h2>Košík</h2>
      <ul class="cart-items">${items.map((i, idx) => {
        const p = products.find((x) => x.id === i.id);
        return `<li class="cart-item"><img src="${esc(LunaStore.util.img(p.image) || "img/news-gifts.jpg")}" alt="">
          <div><b>${esc(p.name)}</b>${i.variant ? ` <span class="muted">(${esc(i.variant)})</span>` : ""}
            <div class="qty"><button data-q="${idx}" data-d="-1" aria-label="Menej">−</button>${i.qty}<button data-q="${idx}" data-d="1" aria-label="Viac">+</button></div></div>
          <div>${money(p.price * i.qty)}</div></li>`;
      }).join("")}</ul>
      <div class="cart-sum">
        <div><span>Medzisúčet</span><span>${money(t.sub)}</span></div>
        <div><span>Doprava</span><span id="shipVal">${t.ship ? money(t.ship) : "zdarma"}</span></div>
        ${s.freeShippingFrom && t.sub < s.freeShippingFrom ? `<div class="muted"><span>Doprava zdarma od ${money(s.freeShippingFrom)}</span></div>` : ""}
        <div class="total"><span>Spolu</span><span id="totalVal">${money(t.total)}</span></div>
      </div>
      <form class="checkout" id="checkout">
        <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label>Meno a priezvisko<input name="name" required autocomplete="name" maxlength="120"></label>
        <div class="row"><label>E-mail<input name="email" type="email" required autocomplete="email"></label>
          <label>Telefón<input name="phone" type="tel" required autocomplete="tel"></label></div>
        <label>Ulica a číslo<input name="street" required autocomplete="street-address"></label>
        <div class="row"><label>Mesto<input name="city" required autocomplete="address-level2"></label>
          <label>PSČ<input name="zip" required autocomplete="postal-code"></label></div>
        <div class="row"><label>Doprava<select name="delivery" id="delivery">
            <option value="posta">Slovenská pošta / kuriér</option><option value="osobny">Osobný odber na predstavení</option></select></label>
          <label>Platba<select name="payment"><option value="dobierka">Na dobierku</option><option value="prevod">Bankový prevod</option></select></label></div>
        <label>Poznámka<textarea name="note" rows="2"></textarea></label>
        <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" required style="width:auto"> Súhlasím s <a href="obchodne-podmienky.html" target="_blank">obchodnými podmienkami</a> a beriem na vedomie <a href="ochrana-osobnych-udajov.html#objednavky" target="_blank">spracovanie osobných údajov</a>.</label>
        <button class="btn btn-gold" type="submit">Odoslať objednávku</button>
      </form>`;
    cartEl.querySelectorAll("[data-q]").forEach((b) => (b.onclick = () => {
      const all = LunaStore.cart.get(), it = all[+b.dataset.q];
      it.qty += +b.dataset.d;
      LunaStore.cart.set(all.filter((x) => x.qty > 0));
    }));
    document.getElementById("delivery").onchange = () => {
      const t2 = totals(items);
      document.getElementById("shipVal").textContent = t2.ship ? money(t2.ship) : "zdarma";
      document.getElementById("totalVal").textContent = money(t2.total);
    };
    document.getElementById("checkout").onsubmit = async (ev) => {
      ev.preventDefault();
      const f = Object.fromEntries(new FormData(ev.target));
      const t2 = totals(items);
      const order = {
        customer: f, subtotal: t2.sub, shipping: t2.ship, total: t2.total,
        items: items.map((i) => { const p = products.find((x) => x.id === i.id); return { id: p.id, name: p.name, variant: i.variant, qty: i.qty, price: p.price }; })
      };
      const btn = ev.target.querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Odosielam…";
      try {
        const id = await LunaStore.placeOrder(order);
        LunaStore.cart.clear();
        cartEl.innerHTML = `<div class="done-box"><div class="moon">🌙</div><h2>Ďakujeme!</h2>
          <p>Objednávka <b>${esc(id)}</b> bola prijatá. Potvrdenie ti pošleme na ${esc(f.email)}.</p>
          ${f.payment === "prevod" ? `<p class="muted">Platobné údaje nájdeš v potvrdzovacom e-maile.</p>` : ""}
          <a class="btn" href="index.html">Späť do Luninho sveta</a></div>`;
      } catch (e) {
        btn.disabled = false; btn.textContent = "Odoslať objednávku";
        LunaUI.toast(e.message);
      }
    };
  }

  document.addEventListener("cart", renderCart);
  const _rp = renderProducts; renderProducts = () => { _rp(); LunaFX.init(); LunaUI.reveal(); LunaUI.parallax && LunaUI.parallax(); };
  LunaUI.decorate(document.querySelector(".shop-hero"), [["moon", 8, 20, .5, .05], ["star", 85, 30, .35], ["star s", 25, 70, .6], ["cloud", 70, 55, .25, 0, .2]]);
  document.querySelector(".shop-hero h1").dataset.speed = "-.15";
  renderCats(); renderProducts(); renderCart();
  if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
})();
