/* ============================================================
   Súhlas s cookies (GDPR / ePrivacy)
   - Web sám nepoužíva sledovacie ani reklamné cookies.
   - „Nevyhnutné“: košík, nastavenia a prihlásenie do adminu (localStorage / sessionStorage).
   - „Externé médiá“: prehrávače YouTube a Spotify – tie ukladajú vlastné cookies,
     preto sa načítajú až po súhlase.
   ============================================================ */
(function () {
  const KEY = "luna-consent", VERSION = 1;
  const listeners = [];
  const read = () => { try { const c = JSON.parse(localStorage.getItem(KEY) || "null"); return c && c.v === VERSION ? c : null; } catch (e) { return null; } };
  const write = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} };

  let state = read();
  let bar = null;

  function save(media) {
    state = { v: VERSION, media: !!media, date: new Date().toISOString() };
    write(state);
    close();
    listeners.forEach((fn) => fn(state));
  }

  function close() { if (bar) { bar.classList.remove("show"); setTimeout(() => { bar && bar.remove(); bar = null; }, 300); } }

  function open(focusSettings) {
    if (bar) return;
    bar = document.createElement("div");
    bar.className = "consent-bar"; bar.setAttribute("role", "dialog"); bar.setAttribute("aria-label", "Nastavenia cookies");
    bar.innerHTML = `
      <div class="cb-text">
        <h2>🍪 Cookies na tomto webe</h2>
        <p>Používame len nevyhnutné úložisko (napr. košík). Prehrávače <b>YouTube</b> a <b>Spotify</b> však ukladajú vlastné cookies,
        preto ich načítame až s tvojím súhlasom. <a href="ochrana-osobnych-udajov.html#cookies">Viac informácií</a></p>
        <details class="cb-more" ${focusSettings ? "open" : ""}><summary>Nastavenia</summary>
          <label class="cb-opt"><input type="checkbox" checked disabled> <span><b>Nevyhnutné</b> – košík, nastavenia webu. Vždy zapnuté.</span></label>
          <label class="cb-opt"><input type="checkbox" id="cbMedia" ${state && state.media ? "checked" : ""}> <span><b>Externé médiá</b> – videoklipy z YouTube a pesničky zo Spotify.</span></label>
          <button class="btn btn-small" id="cbSave">Uložiť výber</button>
        </details>
      </div>
      <div class="cb-btns">
        <button class="btn btn-gold" id="cbAll">Prijať všetko</button>
        <button class="btn" id="cbMin">Len nevyhnutné</button>
      </div>`;
    document.body.append(bar);
    requestAnimationFrame(() => bar.classList.add("show"));
    bar.querySelector("#cbAll").onclick = () => save(true);
    bar.querySelector("#cbMin").onclick = () => save(false);
    bar.querySelector("#cbSave").onclick = () => save(bar.querySelector("#cbMedia").checked);
  }

  window.LunaConsent = {
    get media() { return !!(state && state.media); },
    get decided() { return !!state; },
    allowMedia() { save(true); },
    open,
    onChange(fn) { listeners.push(fn); }
  };

  // lišta sa ukáže, kým sa návštevník nerozhodne
  const start = () => { if (!state) open(false); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
