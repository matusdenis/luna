/* ============================================================
   Spoločný zvuk pre hry (Web Audio) + odomknutie na iPhone/iPade
   - Safari pustí zvuk až po skutočnom ťuknutí (touchend / click),
     preto sa kontext vytvorí a „odomkne“ pri prvom takom geste.
   - V tichom režime iPhonu (prepínač na boku) je Web Audio stlmené;
     tiché zvukové <audio> v slučke + navigator.audioSession prepnú
     stránku do režimu prehrávania médií, takže hry znejú aj tak.
   ============================================================ */
(function () {
  let ctx = null, master = null, keepAlive = null, unlocked = false;

  // 0,5 s ticha ako WAV (vygenerované, žiadny súbor navyše)
  function silentWav() {
    const rate = 8000, n = rate / 2, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
    const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, "RIFF"); v.setUint32(4, 36 + n, true); w(8, "WAVE"); w(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    w(36, "data"); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
    return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  }

  function create() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 1;
    master.connect(ctx.destination);
    return ctx;
  }

  function unlock() {
    const c = create();
    if (!c) return;
    if (c.state !== "running") c.resume().catch(() => {});
    if (unlocked) return;
    // krátky tichý zvuk priamo v geste odomkne Web Audio na starších iOS
    try { const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch (e) {}
    // tiché <audio> v slučke = zvuk aj v tichom režime iPhonu
    if (!keepAlive && /iP(hone|ad|od)|Macintosh/.test(navigator.userAgent) && "ontouchend" in document) {
      keepAlive = document.createElement("audio");
      keepAlive.src = silentWav(); keepAlive.loop = true; keepAlive.setAttribute("playsinline", ""); keepAlive.preload = "auto";
      keepAlive.play().catch(() => {});
    }
    unlocked = true;
  }
  ["touchend", "pointerup", "click", "keydown"].forEach((ev) => addEventListener(ev, unlock, { capture: true, passive: true }));

  // keď sa stránka skryje, stíš; po návrate obnov
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) { ctx.suspend().catch(() => {}); keepAlive && keepAlive.pause(); }
    else if (unlocked) { ctx.resume().catch(() => {}); keepAlive && keepAlive.play().catch(() => {}); }
  });

  window.LunaAudio = {
    /* vráti bežiaci kontext a výstup, alebo null ak zvuk nejde */
    get() {
      const c = create();
      if (!c) return null;
      if (c.state === "suspended") c.resume().catch(() => {});
      return { ctx: c, out: master };
    },
    unlock
  };
})();
