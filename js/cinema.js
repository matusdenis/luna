/* ============================================================
   Filmové efekty: rozžiarené písmená, lúče, kométa, lesk, 3D karty
   ============================================================ */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;

  /* rozdelí text nadpisu na písmená (ikonky hviezd ponechá) */
  function splitLetters(el) {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    let i = 0;
    [...el.childNodes].forEach((n) => {
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((word) => {
        if (!word) return;
        if (/^\s+$/.test(word)) { frag.append(document.createTextNode(" ")); return; }
        const w = document.createElement("span");
        w.style.whiteSpace = "nowrap"; w.style.display = "inline-block";
        [...word].forEach((c) => {
          const s = document.createElement("span");
          s.className = "ch"; s.textContent = c; s.style.setProperty("--i", i++);
          w.append(s);
        });
        frag.append(w);
      });
      n.replaceWith(frag);
    });
  }

  /* kométa so zlatým chvostom letiaca cez hero */
  function comet(hero) {
    if (!hero || reduce) return;
    const c = document.createElement("canvas");
    c.id = "heroFx"; c.setAttribute("aria-hidden", "true");
    hero.append(c);
    const ctx = c.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W, H;
    const size = () => { W = c.width = hero.clientWidth * dpr; H = c.height = hero.clientHeight * dpr; };
    size(); addEventListener("resize", size);
    let parts = [], flight = null, next = performance.now() + 2600;

    function launch() {
      const ltr = Math.random() < .6;
      const y0 = H * (.15 + Math.random() * .35), y1 = H * (.1 + Math.random() * .4);
      flight = {
        t: 0, dur: 2600 + Math.random() * 1200,
        p0: [ltr ? -.05 * W : 1.05 * W, y0],
        p1: [W * (.3 + Math.random() * .2), H * (Math.random() * .1)],
        p2: [W * (.55 + Math.random() * .2), H * (.6 + Math.random() * .25)],
        p3: [ltr ? 1.05 * W : -.05 * W, y1]
      };
    }
    const bez = (a, b, c2, d, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c2 + t * t * t * d; };

    let visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(50, now - last); last = now;
      if (!visible || document.documentElement.classList.contains("veiled")) { requestAnimationFrame(frame); return; }
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      if (!flight && now > next) launch();
      if (flight) {
        flight.t += dt / flight.dur;
        const t = Math.min(1, flight.t);
        const x = bez(flight.p0[0], flight.p1[0], flight.p2[0], flight.p3[0], t);
        const y = bez(flight.p0[1], flight.p1[1], flight.p2[1], flight.p3[1], t);
        for (let k = 0; k < 7; k++) {
          parts.push({ x: x + (Math.random() - .5) * 6 * dpr, y: y + (Math.random() - .5) * 6 * dpr, vx: (Math.random() - .5) * .6 * dpr, vy: (Math.random() * .5 + .1) * dpr, life: 1, r: (Math.random() * 1.8 + .5) * dpr, d: .006 + Math.random() * .012 });
        }
        const g = ctx.createRadialGradient(x, y, 0, x, y, 26 * dpr);
        g.addColorStop(0, "rgba(255,255,240,1)"); g.addColorStop(.25, "rgba(255,225,150,.8)"); g.addColorStop(1, "rgba(255,190,90,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 26 * dpr, 0, 7); ctx.fill();
        // lúče hviezdy
        ctx.strokeStyle = "rgba(255,250,225,.9)"; ctx.lineWidth = 1.2 * dpr; ctx.beginPath();
        ctx.moveTo(x - 18 * dpr, y); ctx.lineTo(x + 18 * dpr, y); ctx.moveTo(x, y - 18 * dpr); ctx.lineTo(x, y + 18 * dpr); ctx.stroke();
        if (t >= 1) { flight = null; next = now + 6000 + Math.random() * 5000; }
      }
      parts = parts.filter((p) => p.life > 0);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.vy += .004 * dpr; p.life -= p.d;
        ctx.fillStyle = `hsla(${40 + Math.random() * 10},100%,${72 + Math.random() * 20}%,${p.life})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.5 + p.life * .5), 0, 7); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* 3D natočenie kariet podľa myši + odlesk */
  function tilt() {
    if (!fine || reduce) return;
    const SEL = ".world-card, .show-card, .product, .video-frame";
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest(SEL);
      if (!el) return;
      if (!el.classList.contains("tilt")) {
        el.classList.add("tilt");
        const gl = document.createElement("span"); gl.className = "glare"; el.append(gl);
        el.addEventListener("pointerleave", () => { el.classList.remove("tilting"); el.style.transform = ""; });
      }
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.classList.add("tilting");
      el.style.transform = `perspective(900px) rotateX(${(.5 - py) * 10}deg) rotateY(${(px - .5) * 12}deg) translateY(-8px) scale(1.02)`;
      el.style.setProperty("--gx", px * 100 + "%"); el.style.setProperty("--gy", py * 100 + "%");
    });
  }

  window.LunaFX = {
    init() {
      document.querySelectorAll(".section-title, .about h2").forEach(splitLetters);
      // lesk cez karty
      document.querySelectorAll(".world-card, .show-card, .video-frame, .news-item .img, .album, .table-wrap, .product").forEach((el) => {
        if (el.querySelector(":scope > .sweep")) return;
        el.classList.add("sweep-host");
        const s = document.createElement("span"); s.className = "sweep"; el.append(s);
      });
      const hero = document.getElementById("domov");
      if (hero && !hero.querySelector(".hero-rays")) {
        hero.insertAdjacentHTML("afterbegin", '<div class="hero-rays" aria-hidden="true"></div><div class="hero-glow" aria-hidden="true"></div>');
        hero.querySelector(".hero-bg").after(hero.querySelector(".hero-rays"), hero.querySelector(".hero-glow"));
        hero.querySelector(".hero-text").classList.add("reveal", "d1");
        hero.querySelector(".quick-links").classList.add("reveal", "d3");
        comet(hero);
      }
    }
  };
  tilt();
})();
