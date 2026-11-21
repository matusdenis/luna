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
    cal: '<svg viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="30" rx="4"/><path d="M6 18h36M15 6v8M33 6v8"/><path d="M24 35s-7-4-7-8.5a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1C31 31 24 35 24 35Z"/></svg>',
    bag: '<svg viewBox="0 0 48 48"><path d="M9 16h30l-2 26H11L9 16Z"/><path d="M17 16v-4a7 7 0 0 1 14 0v4"/><path d="m24 22 2 4 4.4.6-3.2 3.1.8 4.3-4-2-4 2 .8-4.3-3.2-3.1 4.4-.6Z"/></svg>'
  };

  const LOGO = `<svg viewBox="0 0 60 60"><defs><radialGradient id="lg" cx="35%" cy="35%"><stop offset="0" stop-color="#fff1c4"/><stop offset="1" stop-color="#d89a35"/></radialGradient></defs>
    <path d="M38 6a24 24 0 1 0 16 38A20 20 0 0 1 38 6Z" fill="url(#lg)"/>
    <path d="m44 12 1.4 3.6 3.6 1.4-3.6 1.4L44 22l-1.4-3.6-3.6-1.4 3.6-1.4Z" fill="#fff6d8"/></svg>`;

  const NAV = [
    ["index.html", "Domov"],
    ["index.html#pesnicky", "Pesničky"],
    ["index.html#predstavenia", "Rozprávky"],
    ["index.html#svet", "Svet Luny"],
    ["index.html#terminy", "Podujatia"],
    ["obchod.html", "Obchod"]
  ];

  window.LunaUI = {
    ICONS,
    header(active) {
      const s = (window.LunaStore && LunaStore.data && LunaStore.data.settings) || {};
      const social = [["youtube", "yt", "YouTube"], ["instagram", "ig", "Instagram"], ["facebook", "fb", "Facebook"], ["spotify", "sp", "Spotify"]]
        .filter(([k]) => s[k]).map(([k, ic, t]) => `<a class="social" href="${s[k]}" target="_blank" rel="noopener" aria-label="${t}">${ICONS[ic]}</a>`).join("");
      const el = document.createElement("header");
      el.className = "site-header";
      el.innerHTML = `
        <a class="glitter-logo" href="index.html" aria-label="Luna – domov"><span class="glitter-text">Luna</span><i></i><i></i><i></i></a>
        <nav class="main-nav" aria-label="Hlavná navigácia">
          ${NAV.map(([h, t]) => `<a href="${h}" class="${t === active ? "active" : ""}">${t}</a>`).join("")}
        </nav>
        <div class="header-icons">${social}
          <a class="cart-btn" href="obchod.html#kosik" aria-label="Košík">${ICONS.cart}<span class="cart-count" hidden>0</span></a>
          <button class="icon-btn menu-toggle" aria-label="Menu">${ICONS.menu}</button>
        </div>`;
      document.body.prepend(el);
      el.querySelector(".menu-toggle").onclick = () => document.body.classList.toggle("nav-open");
      el.querySelectorAll(".main-nav a").forEach((a) => (a.onclick = () => document.body.classList.remove("nav-open")));
      const upd = () => {
        const n = LunaStore.cart.count(), b = el.querySelector(".cart-count");
        b.textContent = n; b.hidden = !n;
      };
      document.addEventListener("cart", upd); upd();
    },
    footer() {
      const s = LunaStore.data.settings, e = LunaStore.util.esc;
      const f = document.createElement("footer");
      f.className = "site-footer";
      f.innerHTML = `<div class="footer-grid">
        <div><a class="glitter-logo" href="index.html" aria-label="Luna"><span class="glitter-text">Luna</span><i></i><i></i><i></i></a><p>${e(s.tagline)}.</p><p>Produkcia: <a href="${e(s.producerUrl)}" target="_blank" rel="noopener">${e(s.producer)}</a></p></div>
        <div><h4>KONTAKT</h4><ul>
          ${s.email ? `<li><a href="mailto:${e(s.email)}">${e(s.email)}</a></li>` : ""}
          ${s.phone ? `<li><a href="tel:${e(s.phone.replace(/\s/g, ""))}">${e(s.phone)}</a></li>` : ""}
          ${s.address ? `<li>${e(s.address)}</li>` : ""}</ul></div>
        <div><h4>MENU</h4><ul>${NAV.slice(1).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}<li><a href="admin.html">Administrácia</a></li></ul></div>
      </div><p class="copyright">© ${new Date().getFullYear()} Luna · ${e(s.producer)}</p>`;
      document.body.append(f);
    },
    toast(msg) {
      let t = document.querySelector(".toast");
      if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.append(t); }
      t.textContent = msg; t.classList.add("show");
      clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2600);
    },
    video(url) {
      const id = LunaStore.util.ytId(url);
      if (!id) { if (url) window.open(url, "_blank"); else this.toast("Klip už čoskoro ✨"); return; }
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

  /* ---------- úvod: zlatá kométa zakrúži, vybuchne a z výbuchu sa zjaví logo,
     ktoré odletí do hlavičky ---------- */
  function intro() {
    if (reduce || !document.getElementById("sky")) return;
    let seen = false;
    try { seen = sessionStorage.getItem("luna-intro"); sessionStorage.setItem("luna-intro", "1"); } catch (e) {}
    const short = !!seen; // pri ďalšom načítaní v tej istej relácii kratšia verzia (bez videa)
    const root = document.documentElement;
    root.classList.add("veiled", "logo-flying");
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!location.hash) scrollTo(0, 0);
    const ov = document.createElement("div");
    ov.id = "intro"; ov.setAttribute("aria-hidden", "true");
    ov.innerHTML = `<div class="bg"></div><div class="fog"></div><div class="fog f2"></div><div class="fog f3"></div>
      ${short ? "" : `<video class="intro-video" src="img/intro-particles.mp4" muted playsinline preload="auto"></video>`}<canvas></canvas>`;
    document.body.append(ov);
    const video = ov.querySelector("video");
    const c = ov.querySelector("canvas"), ctx = c.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = (c.width = innerWidth * dpr), H = (c.height = innerHeight * dpr);
    const R = Math.hypot(W, H) / 2;
    const S = dpr * Math.min(1.4, Math.max(.7, innerWidth / 1100));
    const rnd = (a, b) => a + Math.random() * (b - a);
    const hue = () => rnd(34, 52);

    // stred prstenca z videa (v CSS px), video je roztiahnuté cez celú obrazovku (cover)
    const vs = Math.max(innerWidth / 1280, innerHeight / 720);
    const ringX = (innerWidth - 1280 * vs) / 2 + .47 * 1280 * vs;
    const ringY = (innerHeight - 720 * vs) / 2 + .465 * 720 * vs;
    let bx = innerWidth / 2, by = innerHeight / 2; // miesto výbuchu

    let mode = short ? "swirl" : "wait"; // wait → video | swirl (náhradný vír prachu)
    const GATHER = short ? 900 : 2200;
    let swirlStart = performance.now();
    if (video) {
      video.playbackRate = 1.15;
      video.play().then(() => { if (mode === "wait") mode = "video"; }).catch(() => { mode = "swirl"; swirlStart = performance.now(); });
      setTimeout(() => { if (mode === "wait") { mode = "swirl"; swirlStart = performance.now(); } }, 900);
    }

    const swirl = Array.from({ length: short ? 380 : 700 }, () => ({
      a: rnd(0, Math.PI * 2), rad: rnd(.3, 1.05) * R, sp: rnd(1.6, 3.4) * (Math.random() < .5 ? 1 : -1), r: rnd(.6, 2.2) * S, h: hue(), px: 0, py: 0
    }));
    let sparks = [], rings = [], rain = [];
    const bursts = [];
    function explode(x, y, n, power, ring) {
      for (let i = 0; i < n; i++) {
        const a = rnd(0, Math.PI * 2), v = Math.pow(Math.random(), .55) * power * S;
        sparks.push({ x, y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, d: rnd(.006, .016), r: rnd(.8, 2.6) * S, h: hue(), star: Math.random() < .12 });
      }
      if (ring) rings.push({ x, y, r: 0, v: ring * S, life: 1, w: rnd(2, 5) * S });
    }
    function star(x, y, size, a) {
      ctx.globalAlpha = a; ctx.beginPath();
      for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4, rr = k % 2 ? size * .22 : size; ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); }
      ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    }

    /* veľké logo, ktoré sa zjaví z výbuchu a odletí do hlavičky */
    const big = document.createElement("div");
    big.className = "intro-logo glitter-logo"; big.setAttribute("aria-hidden", "true");
    big.innerHTML = `<span class="glitter-text">Luna</span><i></i><i></i><i></i>`;
    document.body.append(big);
    function showLogo() {
      big.style.left = bx + "px"; big.style.top = by + "px";
      big.classList.add("show");
      setTimeout(flyLogo, 2000);
    }
    function flyLogo() {
      lift();
      const target = document.querySelector(".site-header .glitter-text");
      const txt = big.querySelector(".glitter-text");
      if (!target) { landed(); return; }
      const a = txt.getBoundingClientRect(), b = target.getBoundingClientRect();
      const k = b.height / a.height;
      // posun stredu veľkého loga na stred loga v hlavičke
      const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
      big.classList.add("fly");
      big.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${k})`;
      // stopa trblietok za letiacim logom
      const trail = setInterval(() => goldDust(txt), 120);
      setTimeout(() => { clearInterval(trail); landed(); }, 1150);
    }
    function landed() {
      root.classList.remove("logo-flying");
      const target = document.querySelector(".site-header .glitter-logo");
      if (target) { goldDust(target); target.classList.add("landed"); setTimeout(() => target.classList.remove("landed"), 1200); }
      big.style.transition = "opacity .35s"; big.style.opacity = 0;
      setTimeout(() => big.remove(), 400);
    }

    let boomAt = 0, lifted = false, last = performance.now(), done = false;
    function boom(t) {
      boomAt = t;
      if (mode === "video") { bx = ringX; by = ringY; video.classList.add("out"); }
      const x = bx * dpr, y = by * dpr;
      // jemné rozvinutie trblietok namiesto prudkého výbuchu
      explode(x, y, short ? 320 : 600, 12, 0);
      rings.push({ x, y, r: 0, v: 8 * S, life: 1, w: 2 * S });
      const n = short ? 1 : 2;
      for (let i = 0; i < n; i++) bursts.push({ at: t + 500 + i * rnd(400, 600), x: rnd(.12, .88) * W, y: rnd(.12, .7) * H });
      for (let i = 0; i < (short ? 150 : 320); i++) rain.push({ x: rnd(0, W), y: rnd(-H * .6, H * .2), vy: rnd(.8, 2.6) * S, sway: rnd(0, 6.28), r: rnd(.6, 1.8) * S, h: hue(), life: 1, delay: rnd(200, 900) });
      root.style.setProperty("--ix", bx + "px"); root.style.setProperty("--iy", by + "px");
      showLogo(); // stránka sa otvorí, až keď logo odletí do hlavičky
    }
    function lift() {
      if (lifted) return; lifted = true;
      ov.classList.add("lift");
      root.classList.remove("veiled");
      root.classList.add("iris");
      setTimeout(() => root.classList.remove("iris"), 2200);
      setTimeout(() => document.querySelectorAll(".reveal.in").forEach(goldDust), 700);
    }
    const AFTER = 3600; // ako dlho po výbuchu ešte dobiehajú iskry

    function frame(now) {
      const dt = Math.min(40, now - last) / 16.7; last = now;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = boomAt ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      if (!boomAt) {
        if (mode === "video" && video.currentTime >= 2.7) boom(now);
        else if (mode === "swirl") {
          const t = now - swirlStart, k = Math.min(1, t / GATHER), e = k * k * (3 - 2 * k);
          const cx = bx * dpr, cy = by * dpr;
          for (const p of swirl) {
            const ang = p.a + p.sp * e * 2.2, rr = p.rad * Math.pow(1 - e, 1.4) + 4 * S;
            const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr * .72;
            ctx.strokeStyle = `hsla(${p.h},100%,72%,${.25 + k * .75})`; ctx.lineWidth = p.r;
            if (p.px) { ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(x, y); ctx.stroke(); }
            p.px = x; p.py = y;
          }
          const cr = Math.max(1, (20 + 70 * k * k) * S * (1 + Math.sin(t / 55) * .15 * k));
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
          g.addColorStop(0, `rgba(255,255,245,${.6 * k})`); g.addColorStop(.25, `rgba(255,226,150,${.45 * k})`); g.addColorStop(1, "rgba(255,170,60,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, 7); ctx.fill();
          if (k >= 1) boom(now);
        }
      } else {
        const since = now - boomAt, cx = bx * dpr, cy = by * dpr;
        const fk = Math.max(0, 1 - since / 1100), flash = .3 * fk * fk;
        if (flash > 0) {
          const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.2);
          fg.addColorStop(0, `rgba(255,250,235,${flash})`); fg.addColorStop(.4, `rgba(255,225,160,${flash * .7})`); fg.addColorStop(1, `rgba(255,200,120,${flash * .15})`);
          ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
        }
        while (bursts.length && bursts[0].at <= now) { const b = bursts.shift(); explode(b.x, b.y, short ? 50 : 80, 6, 0); }
        rings = rings.filter((g) => g.life > 0);
        for (const g of rings) {
          g.r += g.v * dt; g.v *= .975; g.life -= .012 * dt;
          ctx.strokeStyle = `rgba(255,228,160,${g.life * .35})`; ctx.lineWidth = g.w * g.life;
          ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, 7); ctx.stroke();
        }
        sparks = sparks.filter((p) => p.life > 0);
        for (const p of sparks) {
          p.px = p.x; p.py = p.y; p.x += p.vx * dt; p.y += p.vy * dt;
          p.vx *= .955; p.vy = p.vy * .955 + .09 * S * dt; p.life -= p.d * dt;
          const tw = .6 + Math.random() * .4;
          ctx.strokeStyle = `hsla(${p.h},100%,${68 + p.life * 25}%,${p.life * tw})`;
          ctx.lineWidth = p.r * (.4 + p.life * .6);
          ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
          if (p.star && p.life > .25) { ctx.fillStyle = `hsl(${p.h},100%,88%)`; star(p.x, p.y, p.r * 4, p.life * tw); }
        }
        for (const p of rain) {
          if (since < p.delay) continue;
          p.y += p.vy * dt; p.sway += .05 * dt; p.x += Math.sin(p.sway) * .6 * S;
          p.life = Math.max(0, 1 - (since - p.delay) / (AFTER - p.delay));
          ctx.fillStyle = `hsla(${p.h},100%,80%,${p.life * (Math.random() < .1 ? 1 : .55)})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
        }
        if (since > AFTER) { finish(); return; }
      }
      requestAnimationFrame(frame);
    }
    function finish() {
      if (done) return; done = true;
      ov.style.transition = "opacity .6s"; ov.style.opacity = 0; setTimeout(() => ov.remove(), 600);
    }
    ov.addEventListener("click", () => { if (!boomAt) boom(performance.now()); });
    // poistka: aj keby animácia neprebehla (napr. skrytá karta), stránku vždy odhaľ
    setTimeout(() => { if (!boomAt) { lift(); landed(); } finish(); }, 9000);
    requestAnimationFrame(frame);
  }
  intro();

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
