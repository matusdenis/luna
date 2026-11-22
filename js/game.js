/* ============================================================
   Hra „Rozhýb Lunin svet“ – dieťa kliká na čarovné veci na nočnej
   oblohe, tie sa rozhýbu, zacinkajú a Luna ich okomentuje.
   Keď nájde všetkých osem, celé nebo sa roztancuje.
   ============================================================ */
(function () {
  const starPts = (cx, cy, R, r, n = 5) => Array.from({ length: n * 2 }, (_, i) => {
    const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R;
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");

  /* ---------- obrázky (SVG) ---------- */
  const ART = {
    moon: `<svg viewBox="0 0 100 100"><defs><radialGradient id="g-moon" cx="35%" cy="35%"><stop offset="0" stop-color="#fff6d6"/><stop offset="1" stop-color="#e8a94a"/></radialGradient></defs>
      <path d="M62 6a46 46 0 1 0 32 72A38 38 0 0 1 62 6Z" fill="url(#g-moon)"/>
      <circle cx="30" cy="60" r="5" fill="#f4a3a0" opacity=".55"/>
      <g class="eye-closed" fill="none" stroke="#7a4a1c" stroke-width="2.6" stroke-linecap="round"><path d="M24 44q5 4 10 0"/></g>
      <g class="eye-open" fill="#5a3412"><circle cx="29" cy="44" r="3.6"/><circle cx="30.4" cy="42.6" r="1.1" fill="#fff"/></g>
      <path d="M26 66q8 7 16 0" fill="none" stroke="#7a4a1c" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    star: `<svg viewBox="0 0 100 100"><defs><radialGradient id="g-star" cx="40%" cy="35%"><stop offset="0" stop-color="#fffbe6"/><stop offset=".6" stop-color="#ffd76e"/><stop offset="1" stop-color="#f0a83a"/></radialGradient></defs>
      <polygon points="${starPts(50, 54, 46, 21)}" fill="url(#g-star)" stroke="#fff3c4" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="42" cy="52" r="3.4" fill="#6b3d0e"/><circle cx="58" cy="52" r="3.4" fill="#6b3d0e"/>
      <path d="M43 61q7 6 14 0" fill="none" stroke="#6b3d0e" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    whale: `<svg viewBox="0 0 100 80"><defs><linearGradient id="g-wh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb4ff"/><stop offset="1" stop-color="#2d58b8"/></linearGradient></defs>
      <g class="spout" fill="#bfe3ff"><circle cx="78" cy="22" r="3"/><circle cx="72" cy="14" r="2.4"/><circle cx="84" cy="13" r="2.4"/><circle cx="78" cy="6" r="2"/></g>
      <g class="tail"><path d="M26 50 L6 34 Q10 48 12 52 Q8 58 4 68 Z" fill="#3a68c8"/></g>
      <path d="M22 52 Q28 26 62 28 Q94 30 96 50 Q96 70 64 72 Q34 74 22 52Z" fill="url(#g-wh)"/>
      <path d="M32 60 Q58 76 92 58 Q74 70 50 70 Q38 68 32 60Z" fill="#cfe6ff" opacity=".9"/>
      <path d="M58 62 q-4 12 -14 12 q6 -4 8 -13z" fill="#2d58b8"/>
      <circle cx="80" cy="47" r="3" fill="#0d1d4a"/><circle cx="81" cy="46" r="1" fill="#fff"/>
      <circle cx="85" cy="55" r="3.4" fill="#ff9fb4" opacity=".5"/>
      <g fill="#fff" opacity=".8"><circle cx="48" cy="40" r="1.2"/><circle cx="60" cy="36" r="1"/><circle cx="68" cy="42" r="1.3"/></g></svg>`,
    cloud: `<svg viewBox="0 0 100 70"><defs><linearGradient id="g-cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d6ccff"/></linearGradient></defs>
      <g fill="url(#g-cl)"><circle cx="30" cy="42" r="18"/><circle cx="52" cy="32" r="24"/><circle cx="74" cy="42" r="17"/><rect x="26" y="40" width="52" height="20" rx="10"/></g>
      <g fill="none" stroke="#6a5aa8" stroke-width="2.2" stroke-linecap="round"><path d="M42 42q4 3 8 0"/><path d="M56 42q4 3 8 0"/></g>
      <path d="M48 50q5 4 10 0" fill="none" stroke="#6a5aa8" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="39" cy="49" r="3.4" fill="#ffb3c8" opacity=".6"/><circle cx="67" cy="49" r="3.4" fill="#ffb3c8" opacity=".6"/></svg>`,
    owl: `<svg viewBox="0 0 100 100">
      <path d="M8 92 Q50 84 92 92" stroke="#6b4a2a" stroke-width="6" stroke-linecap="round" fill="none"/>
      <g class="wing-l"><ellipse cx="27" cy="62" rx="10" ry="20" fill="#7a5634"/></g>
      <g class="wing-r"><ellipse cx="73" cy="62" rx="10" ry="20" fill="#7a5634"/></g>
      <path d="M30 26 L34 12 L42 22 Z M70 26 L66 12 L58 22 Z" fill="#8f6640"/>
      <ellipse cx="50" cy="58" rx="25" ry="31" fill="#9a7048"/>
      <ellipse cx="50" cy="68" rx="15" ry="18" fill="#e9cfa6"/>
      <g stroke="#c9a77c" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M43 62q3 3 6 0M51 62q3 3 6 0M47 70q3 3 6 0"/></g>
      <circle cx="40" cy="42" r="10" fill="#fff"/><circle cx="60" cy="42" r="10" fill="#fff"/>
      <g class="pupils"><circle cx="41" cy="43" r="5" fill="#1d1a3a"/><circle cx="61" cy="43" r="5" fill="#1d1a3a"/><circle cx="42.5" cy="41.5" r="1.6" fill="#fff"/><circle cx="62.5" cy="41.5" r="1.6" fill="#fff"/></g>
      <g class="lids" fill="#9a7048"><rect x="29" y="31" width="22" height="22" rx="11"/><rect x="49" y="31" width="22" height="22" rx="11"/></g>
      <path d="M46 50 L54 50 L50 57 Z" fill="#f4a23a"/>
      <g fill="#f4a23a"><path d="M40 88h8M52 88h8" stroke="#f4a23a" stroke-width="3" stroke-linecap="round"/></g></svg>`,
    book: `<svg viewBox="0 0 100 80">
      <g class="pages"><rect x="22" y="14" width="64" height="54" rx="3" fill="#fff8e6"/><rect x="22" y="14" width="4" height="54" fill="#e6d3ac"/>
        <g stroke="#c9b38a" stroke-width="1.6" stroke-linecap="round"><path d="M34 26h42M34 33h42M34 40h36M34 47h42M34 54h28"/></g></g>
      <g class="cover"><rect x="20" y="12" width="64" height="58" rx="4" fill="#2f45a8"/><rect x="25" y="17" width="54" height="48" rx="3" fill="none" stroke="#f6c66a" stroke-width="1.6"/>
        <path d="M58 26a14 14 0 1 0 10 22a11 11 0 0 1 -10 -22Z" fill="#f6c66a"/>
        <polygon points="${starPts(42, 32, 5, 2.2)}" fill="#ffe9a8"/><polygon points="${starPts(36, 52, 3.6, 1.6)}" fill="#ffe9a8"/></g></svg>`,
    castle: `<svg viewBox="0 0 100 100"><defs><linearGradient id="g-ca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a7fd8"/><stop offset="1" stop-color="#3b3486"/></linearGradient></defs>
      <path class="flag" d="M50 4 L50 16 M50 4 L64 8 L50 12" stroke="#f6c66a" stroke-width="1.8" fill="#f6c66a" stroke-linejoin="round"/>
      <g fill="url(#g-ca)"><rect x="16" y="40" width="16" height="48"/><rect x="68" y="40" width="16" height="48"/><rect x="42" y="24" width="16" height="64"/><rect x="26" y="56" width="48" height="32"/></g>
      <g fill="#5b4fb5"><path d="M14 40 L24 22 L34 40Z M66 40 L76 22 L86 40Z M40 24 L50 6 L60 24Z"/></g>
      <path d="M44 88v-14a6 6 0 0 1 12 0v14Z" fill="#241f5c"/>
      <g class="wins"><rect class="win" style="--d:0s" x="21" y="50" width="6" height="9" rx="3"/><rect class="win" style="--d:.25s" x="47" y="34" width="6" height="9" rx="3"/>
        <rect class="win" style="--d:.5s" x="73" y="50" width="6" height="9" rx="3"/><rect class="win" style="--d:.75s" x="33" y="64" width="6" height="8" rx="3"/>
        <rect class="win" style="--d:1s" x="61" y="64" width="6" height="8" rx="3"/><rect class="win" style="--d:1.25s" x="47" y="50" width="6" height="9" rx="3"/></g>
      <g fill="#e9e3ff" opacity=".85"><ellipse cx="22" cy="92" rx="22" ry="7"/><ellipse cx="52" cy="94" rx="28" ry="7"/><ellipse cx="82" cy="92" rx="20" ry="7"/></g></svg>`,
    balloon: `<svg viewBox="0 0 60 100"><defs><linearGradient id="g-ba" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c2455e"/><stop offset=".5" stop-color="#ff7a8f"/><stop offset="1" stop-color="#c2455e"/></linearGradient></defs>
      <path d="M30 4 C8 4 2 30 14 50 L24 64 L36 64 L46 50 C58 30 52 4 30 4Z" fill="url(#g-ba)"/>
      <path d="M30 4 C22 20 22 46 26 64 L34 64 C38 46 38 20 30 4Z" fill="#f6c66a"/>
      <path d="M8 32 Q30 40 52 32" stroke="#fff" stroke-opacity=".5" stroke-width="1.5" fill="none"/>
      <g stroke="#8a6a4a" stroke-width="1.2"><path d="M24 64 L25 75M36 64 L35 75"/></g>
      <rect x="22" y="75" width="16" height="12" rx="2" fill="#a0703f"/><path d="M22 79h16" stroke="#7a5230" stroke-width="1.2"/></svg>`
  };

  /* [id, názov, čo povie Luna, tón] */
  const ITEMS = [
    ["moon", "Mesiačik", "Psst… Mesiačik sa zobudil a usmial sa na teba!", 523.25],
    ["star", "Hviezdička", "Hviezdička sa od radosti zatočila!", 659.25],
    ["whale", "Veľryba", "Veľryba si zaplávala medzi oblakmi – šplecht!", 392],
    ["balloon", "Balón", "Balón vyletel až ku hviezdam a zase sa vrátil.", 783.99],
    ["cloud", "Obláčik", "Z obláčika prší zlatý dáždik!", 587.33],
    ["owl", "Sova", "Huhú! Sova ti zamávala krídlami.", 440],
    ["castle", "Hrad", "V hrade v oblakoch sa rozsvietili okienka.", 698.46],
    ["book", "Knižka", "Z knižky vyleteli písmenká – čítaj so mnou!", 880]
  ];
  const PLAY_MS = { moon: 1700, star: 1500, whale: 2300, balloon: 3200, cloud: 1600, owl: 1800, castle: 2600, book: 2400 };

  /* ---------- zvuk: jemné zvončeky (Web Audio, bez súborov) ---------- */
  let muted = false;
  function bell(freq, at = 0, vol = .12) {
    if (muted) return;
    try {
      const A = window.LunaAudio && LunaAudio.get();
      if (!A) return;
      const ac = A.ctx, t = ac.currentTime + at;
      [[1, vol, 1.6], [2.01, vol * .35, .9], [3.02, vol * .12, .5]].forEach(([m, v, d]) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = freq * m;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(A.out); o.start(t); o.stop(t + d + .05);
      });
    } catch (e) { /* zvuk nie je podstatný */ }
  }
  const arp = (notes, step = .11) => notes.forEach((f, i) => bell(f, i * step, .09));

  window.LunaGame = {
    init(section) {
      const host = section && section.querySelector("#game");
      if (!host) return;
      host.innerHTML = `
        <div class="g-hud">
          <div class="g-progress" aria-live="polite"><span class="g-count">0</span> / ${ITEMS.length}
            <span class="g-stars">${ITEMS.map(() => "<i></i>").join("")}</span></div>
          <div class="g-tools"><button class="g-tool g-sound" aria-label="Vypnúť zvuk">🔔</button><button class="g-tool g-reset" aria-label="Hrať znova">↺</button></div>
        </div>
        <div class="g-scene">
          <div class="g-sky" aria-hidden="true"></div>
          ${ITEMS.map(([id, name]) => `<button class="g-obj g-${id}" data-id="${id}" aria-label="${name}"><span class="g-art">${ART[id]}</span></button>`).join("")}
          <div class="g-hills" aria-hidden="true"></div>
          <button class="g-luna" aria-label="Luna – poraď mi"><span class="g-face"></span></button>
          <div class="g-bubble" role="status"></div>
          <div class="g-fx" aria-hidden="true"></div>
        </div>`;

      const scene = host.querySelector(".g-scene"), fx = host.querySelector(".g-fx"), bubble = host.querySelector(".g-bubble");
      const found = new Set();
      let bubbleT, finished = false;

      function say(html, ms = 3800) {
        bubble.innerHTML = html; bubble.classList.remove("show"); void bubble.offsetWidth; bubble.classList.add("show");
        clearTimeout(bubbleT); if (ms) bubbleT = setTimeout(() => bubble.classList.remove("show"), ms);
        const l = host.querySelector(".g-luna"); l.classList.remove("talk"); void l.offsetWidth; l.classList.add("talk");
      }

      /* čiastočky: trblietky, písmenká, kvapky */
      function particles(el, kind, n) {
        const r = el.getBoundingClientRect(), s = scene.getBoundingClientRect();
        const cx = r.left - s.left + r.width / 2, cy = r.top - s.top + r.height / 2;
        for (let i = 0; i < n; i++) {
          const p = document.createElement("span");
          p.className = "g-p " + kind;
          if (kind === "spark") {
            const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * r.width * .7;
            p.style.cssText = `left:${cx}px;top:${cy}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--s:${.5 + Math.random()}`;
          } else if (kind === "rain") {
            p.style.cssText = `left:${r.left - s.left + r.width * (.2 + Math.random() * .6)}px;top:${r.top - s.top + r.height * .75}px;--dy:${60 + Math.random() * 90}px;animation-delay:${Math.random() * .8}s`;
          } else if (kind === "letter") {
            p.textContent = "ABCDEFGHIJKLMNOPRSTUVZ♪★"[Math.floor(Math.random() * 24)];
            p.style.cssText = `left:${cx}px;top:${cy}px;--dx:${(Math.random() - .5) * 220}px;--dy:${-60 - Math.random() * 120}px;animation-delay:${.35 + Math.random() * .6}s`;
          } else if (kind === "confetti") {
            p.style.cssText = `left:${Math.random() * s.width}px;top:-12px;--dy:${s.height + 30}px;--dx:${(Math.random() - .5) * 80}px;--s:${.6 + Math.random() * .9};animation-delay:${Math.random() * 1.8}s;animation-duration:${2.2 + Math.random() * 1.6}s`;
          }
          fx.append(p);
          setTimeout(() => p.remove(), 4500);
        }
      }

      function play(btn) {
        const id = btn.dataset.id, item = ITEMS.find((x) => x[0] === id);
        if (btn.classList.contains("play")) return;
        btn.classList.add("play");
        setTimeout(() => btn.classList.remove("play"), PLAY_MS[id]);
        bell(item[3]);
        particles(btn, "spark", 14);
        if (id === "cloud") particles(btn, "rain", 22);
        if (id === "book") particles(btn, "letter", 12);
        if (id === "castle") setTimeout(() => particles(btn, "spark", 18), 900);
        return item;
      }

      function update() {
        host.querySelector(".g-count").textContent = found.size;
        host.querySelectorAll(".g-stars i").forEach((s, i) => s.classList.toggle("on", i < found.size));
      }

      function finale() {
        finished = true;
        arp([523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]);
        host.querySelectorAll(".g-obj").forEach((b, i) => setTimeout(() => play(b), i * 180));
        particles(scene, "confetti", 70);
        say(`<b>Hurá! Rozhýbal(a) si celý môj svet!</b><br>Si skutočný čarodejník ✨<br><button class="btn btn-gold btn-small g-again">Hrať znova</button>`, 0);
        bubble.querySelector(".g-again").onclick = reset;
      }

      function reset() {
        found.clear(); finished = false; update();
        host.querySelectorAll(".g-obj").forEach((b) => b.classList.remove("found"));
        say("Ideme znova! Klikni na čarovné veci a rozhýb nočné nebo.");
      }

      host.querySelectorAll(".g-obj").forEach((btn) => (btn.onclick = () => {
        const item = play(btn);
        if (!item) return;
        const first = !found.has(item[0]);
        found.add(item[0]); btn.classList.add("found"); update();
        if (first && found.size === ITEMS.length && !finished) setTimeout(finale, 700);
        else say(item[2] + (first ? ` <span class="g-left">Zostáva ${ITEMS.length - found.size}.</span>` : ""));
      }));

      host.querySelector(".g-luna").onclick = () => {
        bell(1046.5, 0, .08); bell(1318.5, .12, .08);
        const left = ITEMS.filter(([id]) => !found.has(id));
        if (!left.length) say("Všetko si už našiel(a)! Klikaj ďalej, veci sa hýbu stále ✨");
        else { const [id, name] = left[Math.floor(Math.random() * left.length)]; say(`Psst… skús kliknúť na <b>${name.toLowerCase()}</b>!`); const b = host.querySelector(`.g-${id}`); b.classList.add("hint"); setTimeout(() => b.classList.remove("hint"), 2000); }
      };
      host.querySelector(".g-sound").onclick = (e) => {
        muted = !muted; e.currentTarget.textContent = muted ? "🔕" : "🔔";
        e.currentTarget.setAttribute("aria-label", muted ? "Zapnúť zvuk" : "Vypnúť zvuk");
      };
      host.querySelector(".g-reset").onclick = reset;

      // privítanie, keď hra príde na obrazovku
      new IntersectionObserver((es, io) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        setTimeout(() => say("Ahoj, som Luna! Klikni na čarovné veci a rozhýb môj svet. Nájdeš všetkých osem?", 5500), 600);
      }, { threshold: .4 }).observe(scene);
    }
  };
})();
