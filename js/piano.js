/* ============================================================
   Lunin klavír – voľná hra alebo „zahraj pesničku“
   (ďalšia klávesa svieti, dieťa ju stlačí a pesnička pokračuje)
   ============================================================ */
(function () {
  // biele klávesy C4–E5 (slovenské názvy: H namiesto B)
  const WHITE = [["C", 261.63], ["D", 293.66], ["E", 329.63], ["F", 349.23], ["G", 392], ["A", 440], ["H", 493.88], ["C", 523.25], ["D", 587.33], ["E", 659.25]];
  // čierne klávesy: [za ktorou bielou, frekvencia]
  const BLACK = [[0, 277.18], [1, 311.13], [3, 369.99], [4, 415.3], [5, 466.16], [7, 554.37], [8, 622.25]];
  const COLORS = ["#ff8f8f", "#ffb46e", "#ffdf73", "#9ee38c", "#6fd6c6", "#7fb6ff", "#b59cff", "#ff8fc8", "#ffb46e", "#ffdf73"];
  const KEYS_W = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"];
  const KEYS_B = ["w", "e", "t", "y", "u", "o", "p"];

  // pesničky (ľudové / voľné diela): [index bielej klávesy, dĺžka v dobách]
  const n = (s) => s.trim().split(/\s+/).map((t) => { const [k, d] = t.split(":"); return ["CDEFGAH".indexOf(k[0]) + (k[1] === "'" ? 7 : 0), +(d || 1)]; });
  const SONGS = [
    { id: "hviezdicka", name: "Hviezdička", icon: "★", notes: n("C C G G A A G:2 F F E E D D C:2 G G F F E E D:2 G G F F E E D:2 C C G G A A G:2 F F E E D D C:2") },
    { id: "ovecka", name: "Ovečka", icon: "🐑", notes: n("E D C D E E E:2 D D D:2 E G G:2 E D C D E E E E D D E D C:4") },
    { id: "oda", name: "Óda na radosť", icon: "♪", notes: n("E E F G G F E D C C D E E:1.5 D:.5 D:2 E E F G G F E D C C D E D:1.5 C:.5 C:2") }
  ];

  // výstup klavíra: hlasitosť + jemný filter, napojený na spoločný zvuk (js/audio.js)
  let master = null, masterCtx = null;
  function audio() {
    const A = window.LunaAudio && LunaAudio.get();
    if (!A) return null;
    if (masterCtx !== A.ctx) {
      masterCtx = A.ctx;
      master = A.ctx.createGain(); master.gain.value = .5;
      const f = A.ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 3200;
      master.connect(f).connect(A.out);
    }
    return A.ctx;
  }
  // jednoduchý „klavírny“ tón: trojuholník + vyššie harmonické, rýchly nástup a doznievanie
  function tone(freq, at = 0, len = 1.6) {
    try {
      const a = audio(); if (!a) return;
      const t = a.currentTime + at;
      [["triangle", 1, .5], ["sine", 2, .18], ["sine", 3, .06]].forEach(([type, m, v]) => {
        const o = a.createOscillator(), g = a.createGain();
        o.type = type; o.frequency.value = freq * m;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .006);
        g.gain.exponentialRampToValueAtTime(v * .35, t + .25); g.gain.exponentialRampToValueAtTime(.0001, t + len);
        o.connect(g).connect(master); o.start(t); o.stop(t + len + .05);
      });
    } catch (e) {}
  }

  window.LunaPiano = {
    init(section) {
      const host = section && section.querySelector("#piano");
      if (!host) return;
      host.innerHTML = `
        <div class="p-bar">
          <div class="p-songs" role="group" aria-label="Vyber pesničku">
            <button class="p-song on" data-song="">🎹 Hraj voľne</button>
            ${SONGS.map((s) => `<button class="p-song" data-song="${s.id}">${s.icon} ${s.name}</button>`).join("")}
          </div>
          <button class="btn btn-small p-listen" hidden>▶ Luna zahrá</button>
        </div>
        <div class="p-stage">
          <div class="p-luna" aria-hidden="true"><span class="g-face"></span></div>
          <div class="p-msg" role="status"></div>
          <div class="p-track" aria-hidden="true"></div>
          <div class="p-fly" aria-hidden="true"></div>
        </div>
        <div class="p-keys">
          ${WHITE.map(([name], i) => `<button class="p-w" data-w="${i}" style="--c:${COLORS[i]}" aria-label="Tón ${name}"><span class="p-dot"></span><span class="p-name">${name}</span></button>`).join("")}
          ${BLACK.map(([after], i) => `<button class="p-b" data-b="${i}" style="--at:${after + 1}" aria-label="Čierna klávesa"></button>`).join("")}
        </div>
        <p class="p-tip">Tip: na počítači môžeš hrať aj klávesnicou – <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>F</kbd> <kbd>G</kbd> <kbd>H</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd></p>`;

      const msg = host.querySelector(".p-msg"), track = host.querySelector(".p-track"), fly = host.querySelector(".p-fly");
      const whites = [...host.querySelectorAll(".p-w")], blacks = [...host.querySelectorAll(".p-b")];
      const listenBtn = host.querySelector(".p-listen");
      let song = null, pos = 0, demo = false, demoTimers = [];

      const say = (t) => { msg.innerHTML = t; msg.classList.remove("pop"); void msg.offsetWidth; msg.classList.add("pop"); };

      /* noty letiace z klávesy hore */
      function flyNote(keyEl, color) {
        const k = keyEl.getBoundingClientRect(), s = fly.getBoundingClientRect();
        const p = document.createElement("span");
        p.className = "p-note"; p.textContent = Math.random() < .5 ? "♪" : Math.random() < .5 ? "♫" : "★";
        p.style.cssText = `left:${k.left - s.left + k.width / 2}px;color:${color};--dx:${(Math.random() - .5) * 60}px;--r:${(Math.random() - .5) * 50}deg`;
        fly.append(p); setTimeout(() => p.remove(), 1600);
      }

      function press(el, freq, color) {
        tone(freq);
        el.classList.add("down"); setTimeout(() => el.classList.remove("down"), 180);
        flyNote(el, color);
      }

      function renderTrack() {
        if (!song) { track.innerHTML = ""; return; }
        track.innerHTML = song.notes.map(([w], i) => `<i class="${i < pos ? "done" : i === pos ? "now" : ""}" style="--c:${COLORS[w]}">${WHITE[w][0]}</i>`).join("");
        const now = track.querySelector(".now");
        if (now) track.scrollTo({ left: now.offsetLeft - track.clientWidth / 2 + now.offsetWidth / 2, behavior: "smooth" });
        whites.forEach((k) => k.classList.remove("next"));
        if (pos < song.notes.length && !demo) whites[song.notes[pos][0]].classList.add("next");
      }

      function stopDemo() { demoTimers.forEach(clearTimeout); demoTimers = []; demo = false; host.classList.remove("demo"); listenBtn.textContent = "▶ Luna zahrá"; }

      function choose(id) {
        stopDemo();
        song = SONGS.find((s) => s.id === id) || null; pos = 0;
        host.querySelectorAll(".p-song").forEach((b) => b.classList.toggle("on", b.dataset.song === (id || "")));
        listenBtn.hidden = !song;
        host.classList.toggle("learning", !!song);
        renderTrack();
        say(song ? `Zahráme <b>${song.name}</b>! Stláčaj klávesu, ktorá <b>svieti</b>. Alebo si ju najprv vypočuj ▶` : "Hraj, čo ťa napadne! Každá klávesa má svoju farbu a svoj tón ✨");
      }

      function finished() {
        whites.forEach((k) => k.classList.remove("next"));
        say(`<b>Bravo! Zahral(a) si celú pesničku ${song.name}!</b> 🌙 Chceš ešte raz? Stlač ktorúkoľvek klávesu.`);
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, .25 + i * .12, 1.2));
        for (let i = 0; i < 24; i++) setTimeout(() => flyNote(whites[Math.floor(Math.random() * whites.length)], COLORS[Math.floor(Math.random() * COLORS.length)]), i * 60);
        host.classList.add("cheer"); setTimeout(() => host.classList.remove("cheer"), 1500);
      }

      function hitWhite(i) {
        if (demo) return;
        press(whites[i], WHITE[i][1], COLORS[i]);
        if (!song) return;
        if (pos >= song.notes.length) { pos = 0; renderTrack(); say("Ideme znova od začiatku!"); return; }
        if (song.notes[pos][0] === i) {
          pos++; renderTrack();
          if (pos === song.notes.length) finished();
          else if (pos === Math.floor(song.notes.length / 2)) say("Super, už si v polovici! 🎶");
        } else {
          const want = whites[song.notes[pos][0]];
          want.classList.remove("wiggle"); void want.offsetWidth; want.classList.add("wiggle");
        }
      }
      function hitBlack(i) { if (!demo) press(blacks[i], BLACK[i][1], "#ffe7a8"); }

      /* ovládanie myšou / prstom – aj ťahaním po klávesoch */
      let dragging = false;
      const onDown = (e) => {
        const w = e.target.closest(".p-w"), b = e.target.closest(".p-b");
        if (!w && !b) return;
        e.preventDefault(); dragging = true;
        if (b) hitBlack(+b.dataset.b); else hitWhite(+w.dataset.w);
      };
      const keysEl = host.querySelector(".p-keys");
      keysEl.addEventListener("pointerdown", onDown);
      keysEl.addEventListener("pointerover", (e) => {
        if (!dragging || e.pointerType === "touch") return;
        const w = e.target.closest(".p-w"), b = e.target.closest(".p-b");
        if (b) hitBlack(+b.dataset.b); else if (w) hitWhite(+w.dataset.w);
      });
      // prst ťahaný po klávesoch (dotyk nevyvoláva pointerover)
      let lastTouchKey = null;
      keysEl.addEventListener("pointermove", (e) => {
        if (!dragging || e.pointerType !== "touch") return;
        const el = document.elementFromPoint(e.clientX, e.clientY), k = el && el.closest(".p-w, .p-b");
        if (!k || k === lastTouchKey) return;
        lastTouchKey = k;
        if (k.classList.contains("p-b")) hitBlack(+k.dataset.b); else hitWhite(+k.dataset.w);
      });
      addEventListener("pointerup", () => { dragging = false; lastTouchKey = null; });
      keysEl.addEventListener("click", (e) => { if (e.detail === 0) { const w = e.target.closest(".p-w"), b = e.target.closest(".p-b"); if (b) hitBlack(+b.dataset.b); else if (w) hitWhite(+w.dataset.w); } }); // Enter / medzerník

      /* klávesnica počítača – len keď je klavír na obrazovke */
      const onScreen = () => { if (host.offsetParent === null) return false; const r = host.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
      const held = new Set();
      addEventListener("keydown", (e) => {
        if (!onScreen() || e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
        const k = e.key.toLowerCase();
        if (held.has(k)) return;
        const wi = KEYS_W.indexOf(k), bi = KEYS_B.indexOf(k);
        if (wi < 0 && bi < 0) return;
        held.add(k); e.preventDefault();
        if (wi >= 0) hitWhite(wi); else hitBlack(bi);
      });
      addEventListener("keyup", (e) => held.delete(e.key.toLowerCase()));

      /* Luna zahrá ukážku */
      listenBtn.onclick = () => {
        if (demo) { stopDemo(); renderTrack(); return; }
        demo = true; host.classList.add("demo"); listenBtn.textContent = "■ Stop";
        say(`Počúvaj, ako znie <b>${song.name}</b>… potom to skús ty!`);
        whites.forEach((k) => k.classList.remove("next"));
        const beat = .42; let t = .2;
        song.notes.forEach(([w, d], i) => {
          demoTimers.push(setTimeout(() => {
            tone(WHITE[w][1], 0, Math.max(.8, d * beat * 2));
            whites[w].classList.add("down"); setTimeout(() => whites[w].classList.remove("down"), d * beat * 900);
            flyNote(whites[w], COLORS[w]);
            track.querySelectorAll("i").forEach((el, j) => el.classList.toggle("now", j === i));
          }, t * 1000));
          t += d * beat;
        });
        demoTimers.push(setTimeout(() => { stopDemo(); pos = 0; renderTrack(); say("A teraz ty! Stláčaj klávesu, ktorá svieti ✨"); }, (t + .4) * 1000));
      };

      host.querySelectorAll(".p-song").forEach((b) => (b.onclick = () => choose(b.dataset.song)));
      choose("");
    }
  };

  window.LunaGames = { init(section) { if (section) LunaPiano.init(section); } };
})();
