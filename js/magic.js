/* ============================================================
   Čarovné efekty + spoločná hlavička a pätička
   ============================================================ */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICONS = {
    yt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8V6.2c0-.8.2-1.2 1.4-1.2H17V2h-2.6C11.5 2 10.5 3.4 10.5 5.9V8H8v3h2.5v11H14V11h2.6L17 8h-3Z"/></svg>',
    sp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm5 15.9a.7.7 0 0 1-1 .2c-2.7-1.6-6-2-10-1.1a.7.7 0 1 1-.3-1.4c4.3-1 8-.6 11 1.3.3.2.4.7.3 1Zm1.3-3a.9.9 0 0 1-1.2.3c-3-1.9-7.7-2.4-11.3-1.3a.9.9 0 1 1-.5-1.7c4.1-1.2 9.2-.6 12.7 1.5.4.3.5.8.3 1.2Zm.1-3.1C14.8 8.6 8.8 8.4 5.4 9.5a1 1 0 1 1-.6-2c3.9-1.2 10.6-1 14.7 1.5a1 1 0 1 1-1.1 1.8Z"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="m12 11 .9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3Z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    note: '<svg viewBox="0 0 48 48"><path d="M18 36V10l22-5v26"/><circle cx="13" cy="36" r="5"/><circle cx="35" cy="31" r="5"/></svg>',
    book: '<svg viewBox="0 0 48 48"><path d="M24 12c-4-3-10-4-18-3v28c8-1 14 0 18 3 4-3 10-4 18-3V9c-8-1-14 0-18 3Z"/><path d="M24 12v28M10 16h9M10 22h9M29 16h9M29 22h9"/></svg>',
    wand: '<svg viewBox="0 0 48 48"><path d="m8 40 22-22M30 18l4 4"/><path d="m34 6 1.5 4 4 1.5-4 1.5L34 17l-1.5-4-4-1.5 4-1.5Z"/><path d="m42 20 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z"/><path d="m20 8 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z"/></svg>',
    piano: '<svg viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="28" rx="3"/><path d="M15 10v28M24 10v28M33 10v28"/><path d="M13 10h4v15h-4zM22 10h4v15h-4zM31 10h4v15h-4z" fill="currentColor"/></svg>',
    cal: '<svg viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="30" rx="4"/><path d="M6 18h36M15 6v8M33 6v8"/><path d="M24 35s-7-4-7-8.5a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1C31 31 24 35 24 35Z"/></svg>',
    bag: '<svg viewBox="0 0 48 48"><path d="M9 16h30l-2 26H11L9 16Z"/><path d="M17 16v-4a7 7 0 0 1 14 0v4"/><path d="m24 22 2 4 4.4.6-3.2 3.1.8 4.3-4-2-4 2 .8-4.3-3.2-3.1 4.4-.6Z"/></svg>'
  };

  const LOGO = `<svg viewBox="0 0 60 60"><defs><radialGradient id="lg" cx="35%" cy="35%"><stop offset="0" stop-color="#fff1c4"/><stop offset="1" stop-color="#d89a35"/></radialGradient></defs>
    <path d="M38 6a24 24 0 1 0 16 38A20 20 0 0 1 38 6Z" fill="url(#lg)"/>
    <path d="m44 12 1.4 3.6 3.6 1.4-3.6 1.4L44 22l-1.4-3.6-3.6-1.4 3.6-1.4Z" fill="#fff6d8"/></svg>`;

  // [odkaz, názov, prepínač z nastavení]
  const NAV_ALL = [
    ["index.html", "Domov"],
    ["index.html#pesnicky", "Pesničky"],
    ["index.html#predstavenia", "Rozprávky"],
    ["index.html#hra", "Klavír", "Game"],
    ["index.html#terminy", "Podujatia", "Events"],
    ["obchod.html", "Obchod", "Shop"]
  ];
  const navItems = () => NAV_ALL.filter(([, , f]) => !f || !window.LunaStore || LunaStore.util.on(f));

  window.LunaUI = {
    ICONS,
    header(active) {
      const s = (window.LunaStore && LunaStore.data && LunaStore.data.settings) || {};
      const social = [["youtube", "yt", "YouTube"], ["instagram", "ig", "Instagram"], ["facebook", "fb", "Facebook"], ["spotify", "sp", "Spotify"]]
        .filter(([k]) => LunaStore.util.url(s[k])).map(([k, ic, t]) => `<a class="social" href="${LunaStore.util.esc(LunaStore.util.url(s[k]))}" target="_blank" rel="noopener" aria-label="${t}">${ICONS[ic]}</a>`).join("");
      const el = document.createElement("header");
      el.className = "site-header";
      el.innerHTML = `
        <a class="glitter-logo" href="index.html" aria-label="Luna – domov"><span class="glitter-text">Luna</span><i></i><i></i><i></i><i></i><i></i><i></i><i></i></a>
        <nav class="main-nav" aria-label="Hlavná navigácia">
          ${navItems().map(([h, t]) => `<a href="${h}" class="${t === active ? "active" : ""}">${t}</a>`).join("")}
        </nav>
        <div class="header-icons">${social}
          ${LunaStore.util.on("Shop") ? `<a class="cart-btn" href="obchod.html#kosik" aria-label="Košík">${ICONS.cart}<span class="cart-count" hidden>0</span></a>` : ""}
          <button class="icon-btn menu-toggle" aria-label="Menu">${ICONS.menu}</button>
        </div>`;
      document.body.prepend(el);
      el.querySelector(".menu-toggle").onclick = () => document.body.classList.toggle("nav-open");
      el.querySelectorAll(".main-nav a").forEach((a) => (a.onclick = () => document.body.classList.remove("nav-open")));
      const upd = () => {
        const n = LunaStore.cart.count(), b = el.querySelector(".cart-count");
        if (!b) return;
        b.textContent = n; b.hidden = !n;
      };
      document.addEventListener("cart", upd); upd();
    },
    footer() {
      const s = LunaStore.data.settings, e = LunaStore.util.esc;
      const f = document.createElement("footer");
      f.className = "site-footer";
      f.innerHTML = `<div class="footer-grid">
        <div><a class="glitter-logo" href="index.html" aria-label="Luna"><span class="glitter-text">Luna</span><i></i><i></i><i></i><i></i><i></i><i></i><i></i></a><p>${e(s.tagline)}.</p><p>Produkcia: <a href="${e(LunaStore.util.url(s.producerUrl))}" target="_blank" rel="noopener">${e(s.producer)}</a></p></div>
        <div><h4>KONTAKT</h4><ul>
          ${s.email ? `<li><a href="mailto:${e(s.email)}">${e(s.email)}</a></li>` : ""}
          ${s.phone ? `<li><a href="tel:${e(s.phone.replace(/\s/g, ""))}">${e(s.phone)}</a></li>` : ""}
          ${s.address ? `<li>${e(s.address)}</li>` : ""}</ul></div>
        <div><h4>MENU</h4><ul>${navItems().slice(1).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>
      </div><p class="copyright">© ${new Date().getFullYear()} Luna · ${e(s.producer)} ·
        <a href="obchodne-podmienky.html">Obchodné podmienky</a> · <a href="ochrana-osobnych-udajov.html">Ochrana osobných údajov</a> · <a href="#" class="cookie-link">Nastavenia cookies</a><br>
        <small>Prevádzkovateľ: MAR-ART, s.r.o. (Divadlo OSKAR), Holíčska 3074/26, 851 05 Bratislava, IČO 56598661</small></p>`;
      document.body.append(f);
      f.querySelector(".cookie-link").onclick = (ev) => { ev.preventDefault(); window.LunaConsent && LunaConsent.open(true); };
    },
    toast(msg) {
      let t = document.querySelector(".toast");
      if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.append(t); }
      t.textContent = msg; t.classList.add("show");
      clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2600);
    },
    video(url) {
      const id = LunaStore.util.ytId(url);
      // YouTube ukladá cookies – bez súhlasu najprv požiadaj o súhlas
      if (id && window.LunaConsent && !LunaConsent.media) {
        if (!this._waitConsent) {
          this._waitConsent = true;
          LunaConsent.onChange((c) => { const u = this._pendingVideo; this._pendingVideo = null; if (c.media && u) this.video(u); });
        }
        this._pendingVideo = url; LunaConsent.open(true); this.toast("Na prehratie videa povoľ externé médiá 🎬"); return;
      }
      if (!id) { const safe = LunaStore.util.url(url); if (safe) window.open(safe, "_blank", "noopener"); else this.toast("Klip už čoskoro ✨"); return; }
      let m = document.getElementById("videoModal");
      if (!m) {
        m = document.createElement("div"); m.id = "videoModal"; m.className = "modal";
        m.innerHTML = `<div class="modal-box"><button class="modal-close" aria-label="Zavrieť">×</button><iframe allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
        document.body.append(m);
        const close = () => { m.classList.remove("open"); m.querySelector("iframe").src = ""; };
        m.onclick = (ev) => { if (ev.target === m || ev.target.classList.contains("modal-close")) close(); };
        addEventListener("keydown", (ev) => ev.key === "Escape" && close());
      }
      m.querySelector("iframe").src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      m.classList.add("open");
    },
    reveal() {
      const io = new IntersectionObserver((es) => es.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        // počas úvodu počkaj, kým sa hmla rozplynie
        setTimeout(() => { el.classList.add("in"); goldDust(el); }, document.documentElement.classList.contains("veiled") ? 1400 : 0);
      }), { threshold: .15 });
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    },

    /* plávajúce dekorácie: [trieda, left%, top%, speed, rot] */
    decorate(section, items) {
      if (!section) return;
      const layer = document.createElement("div");
      layer.className = "decor-layer"; layer.setAttribute("aria-hidden", "true");
      layer.innerHTML = items.map(([cls, l, t, sp, rot, x]) =>
        `<i class="decor ${cls}" style="left:${l}%;top:${t}%" data-speed="${sp}"${rot ? ` data-rot="${rot}"` : ""}${x ? ` data-x="${x}"` : ""}></i>`).join("");
      section.prepend(layer);
    },
    mist(section, where = "top", x = .3) {
      if (!section) return;
      const m = document.createElement("div");
      m.className = "mist-band"; m.setAttribute("aria-hidden", "true");
      m.style[where] = "-110px"; m.dataset.x = x; m.dataset.speed = ".08";
      section.append(m);
    }
  };

  /* ---------- zlatý prášok okolo objavujúceho sa prvku ---------- */
  function goldDust(el) {
    if (reduce) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const n = Math.min(36, Math.max(12, Math.round((r.width * r.height) / 9000)));
    for (let i = 0; i < n; i++) {
      const d = document.createElement("span");
      d.className = "dust";
      const edge = Math.random();
      const x = r.left + Math.random() * r.width, y = r.top + (edge < .5 ? Math.random() * r.height : (edge < .75 ? 0 : r.height));
      d.style.left = x + "px"; d.style.top = y + "px";
      d.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
      d.style.setProperty("--dy", (-40 - Math.random() * 110) + "px");
      d.style.setProperty("--t", (1.2 + Math.random() * 1.2) + "s");
      d.style.animationDelay = Math.random() * .5 + "s";
      document.body.append(d);
      setTimeout(() => d.remove(), 3000);
    }
  }

  /* ---------- parallax: prvky s data-speed / data-rot / data-x ---------- */
  function parallax() {
    if (reduce) return;
    let ticking = false;
    function upd() {
      ticking = false;
      const vh = innerHeight;
      document.querySelectorAll("[data-speed]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const c = r.top - (el._py || 0) + r.height / 2 - vh / 2; // vzdialenosť od stredu obrazovky
        if (Math.abs(c) > vh * 1.6) return;
        const py = -c * +el.dataset.speed;
        const px = el.dataset.x ? c * +el.dataset.x : 0;
        el._py = py;
        el.style.translate = `${px.toFixed(1)}px ${py.toFixed(1)}px`;
        if (el.dataset.rot) el.style.rotate = (c * +el.dataset.rot).toFixed(2) + "deg";
      });
    }
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } };
    addEventListener("scroll", req, { passive: true });
    addEventListener("resize", req);
    window.LunaUI.parallax = req;
    req();
  }


  /* ---------- hviezdna obloha s padajúcimi hviezdami ---------- */
  function starfield() {
    const c = document.getElementById("sky");
    if (!c) return;
    const ctx = c.getContext("2d");
    let W, H, stars = [], shooting = [];
    const dpr = Math.min(devicePixelRatio || 1, 2);
    function resize() {
      W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr;
      c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
      const n = Math.round((innerWidth * innerHeight) / 3500);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.3 + .3) * dpr,
        p: Math.random() * Math.PI * 2, s: Math.random() * .02 + .005, gold: Math.random() < .18
      }));
    }
    resize(); addEventListener("resize", resize);
    let scrollY = 0; addEventListener("scroll", () => (scrollY = window.scrollY), { passive: true });
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.p += s.s;
        const a = .35 + Math.sin(s.p) * .35 + .3;
        const y = (s.y - scrollY * .15 * dpr * (s.r / 2)) % H;
        ctx.beginPath(); ctx.arc(s.x, y < 0 ? y + H : y, s.r, 0, 7);
        ctx.fillStyle = s.gold ? `rgba(255,214,140,${a})` : `rgba(255,255,255,${a})`;
        ctx.fill();
        if (s.r > 1.3 * dpr && a > .85) {
          ctx.strokeStyle = `rgba(255,240,200,${(a - .85) * 3})`; ctx.lineWidth = .6 * dpr;
          ctx.beginPath(); ctx.moveTo(s.x - 6 * dpr, y); ctx.lineTo(s.x + 6 * dpr, y);
          ctx.moveTo(s.x, y - 6 * dpr); ctx.lineTo(s.x, y + 6 * dpr); ctx.stroke();
        }
      }
      if (Math.random() < .006 && shooting.length < 2) {
        shooting.push({ x: Math.random() * W * .8 + W * .2, y: Math.random() * H * .4, vx: -(6 + Math.random() * 6) * dpr, vy: (2.5 + Math.random() * 2) * dpr, life: 1 });
      }
      shooting = shooting.filter((s) => s.life > 0);
      for (const s of shooting) {
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
        g.addColorStop(0, `rgba(255,240,200,${s.life})`); g.addColorStop(1, "rgba(255,240,200,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 2 * dpr; ctx.beginPath();
        ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14); ctx.stroke();
        s.x += s.vx; s.y += s.vy; s.life -= .015;
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    frame();
  }

  /* ---------- trblietky za kurzorom ---------- */
  function sparkles() {
    if (reduce || matchMedia("(pointer: coarse)").matches) return;
    let last = 0;
    addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - last < 45) return; last = now;
      const s = document.createElement("span");
      s.className = "sparkle";
      s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
      s.style.setProperty("--dx", (Math.random() * 30 - 15) + "px");
      s.style.setProperty("--dy", (Math.random() * 30 + 6) + "px");
      document.body.append(s);
      setTimeout(() => s.remove(), 900);
    });
  }

  /* ---------- svetlušky ---------- */
  window.LunaUI.fireflies = function (host, n = 14) {
    if (!host || reduce) return;
    for (let i = 0; i < n; i++) {
      const f = document.createElement("span");
      f.className = "firefly";
      f.style.left = Math.random() * 100 + "%"; f.style.top = 40 + Math.random() * 60 + "%";
      f.style.animationDuration = 6 + Math.random() * 8 + "s"; f.style.animationDelay = -Math.random() * 10 + "s";
      host.append(f);
    }
  };

  document.addEventListener("DOMContentLoaded", () => { starfield(); sparkles(); parallax(); });
})();
