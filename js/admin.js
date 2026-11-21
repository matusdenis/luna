/* Administrácia – termíny, predstavenia, albumy, piesne, obchod, objednávky, novinky, nastavenia */
(async function () {
  const app = document.getElementById("app");
  await LunaStore.load();
  const { esc, money, uid } = LunaStore.util;
  const SS = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }, del(k) { try { sessionStorage.removeItem(k); } catch (e) {} } };
  let token = SS.get("luna-token");
  let data = JSON.parse(JSON.stringify(LunaStore.data));
  let dirty = false;
  let tab = "events";

  const STATUS = { predaj: "V predaji", vypredane: "Vypredané", coskoro: "Čoskoro" };
  const albumOpts = () => [["", "— bez albumu —"], ...data.albums.map((a) => [a.id, a.title])];
  const productOpts = () => [["", "— žiadny —"], ...data.products.map((p) => [p.id, p.name])];
  const showOpts = () => data.shows.map((s) => s.title);

  /* Schéma sekcií – podľa nej sa generujú tabuľky aj formuláre */
  const SECTIONS = {
    events: {
      title: "Termíny", item: "termín", sort: (a, b) => (a.date + a.time).localeCompare(b.date + b.time),
      cols: [["date", "Dátum", (v) => v ? new Date(v + "T00:00").toLocaleDateString("sk-SK") : ""], ["time", "Čas"], ["show", "Predstavenie"], ["city", "Mesto"], ["venue", "Miesto"], ["status", "Stav", (v) => STATUS[v] || v]],
      fields: [
        ["date", "Dátum", "date", { required: true }], ["time", "Čas", "time"],
        ["show", "Predstavenie", "datalist", { options: showOpts, required: true }],
        ["status", "Stav", "select", { options: () => Object.entries(STATUS) }],
        ["city", "Mesto", "text", { required: true }], ["venue", "Miesto konania (sála, adresa)", "text"],
        ["ticketUrl", "Odkaz na vstupenky", "url", { full: true, hint: "napr. GoOut, Ticketportal… Ak je prázdne, zobrazí sa tlačidlo Rezervovať (e-mail)." }]
      ]
    },
    shows: {
      title: "Predstavenia", item: "predstavenie",
      cols: [["image", "", "img"], ["title", "Názov"], ["age", "Vek"], ["duration", "Dĺžka"]],
      fields: [["title", "Názov", "text", { required: true, full: true }], ["age", "Vek", "text"], ["duration", "Dĺžka", "text"],
        ["description", "Popis", "textarea", { full: true }], ["image", "Obrázok", "image", { full: true }]]
    },
    albums: {
      title: "Albumy", item: "album",
      cols: [["cover", "", "img"], ["title", "Názov"], ["year", "Rok"], ["id", "Piesní", (v) => data.songs.filter((s) => s.albumId === v).length]],
      fields: [["title", "Názov", "text", { required: true }], ["year", "Rok", "text"], ["description", "Popis", "textarea", { full: true }],
        ["cover", "Obal", "image", { full: true }], ["spotifyUrl", "Spotify", "url"], ["youtubeUrl", "YouTube playlist", "url"],
        ["buyProductId", "Produkt v obchode (CD)", "select", { options: productOpts }]]
    },
    songs: {
      title: "Piesne a klipy", item: "pieseň",
      cols: [["title", "Názov"], ["albumId", "Album", (v) => (data.albums.find((a) => a.id === v) || {}).title || ""], ["duration", "Dĺžka"], ["youtubeUrl", "Klip", (v) => v ? "▶ áno" : "—"], ["spotifyUrl", "Spotify", (v) => v ? "áno" : "—"]],
      fields: [["title", "Názov", "text", { required: true }], ["albumId", "Album", "select", { options: albumOpts }], ["duration", "Dĺžka (m:ss)", "text"],
        ["note", "Krátky popis", "text"], ["youtubeUrl", "YouTube videoklip", "url", { full: true, hint: "Vlož odkaz na YouTube – na webe sa klip prehrá priamo v okne." }], ["spotifyUrl", "Spotify", "url", { full: true }]]
    },
    products: {
      title: "Obchod – produkty", item: "produkt",
      cols: [["image", "", "img"], ["name", "Názov"], ["category", "Kategória"], ["price", "Cena", (v) => money(v)], ["stock", "Sklad"], ["active", "Na webe", (v) => v === false ? "skrytý" : "áno"]],
      fields: [["name", "Názov", "text", { required: true }], ["category", "Kategória", "datalist", { options: () => [...new Set(["Knihy", "Hudba", "Oblečenie", "Darčeky", ...data.products.map((p) => p.category)])] }],
        ["price", "Cena (€)", "number", { step: "0.01", required: true }], ["stock", "Počet na sklade", "number"],
        ["variants", "Varianty / veľkosti", "text", { full: true, hint: "oddelené čiarkou, napr. 98, 110, 122" }],
        ["description", "Popis", "textarea", { full: true }], ["image", "Fotka", "image", { full: true }], ["active", "Zobraziť v obchode", "checkbox"]]
    },
    news: {
      title: "Novinky", item: "novinku",
      cols: [["image", "", "img"], ["title", "Nadpis"], ["text", "Text"]],
      fields: [["title", "Nadpis", "text", { required: true, full: true }], ["text", "Text", "textarea", { full: true }], ["image", "Obrázok", "image", { full: true }], ["link", "Odkaz", "text", { full: true, hint: "napr. obchod.html, #pesnicky alebo https://…" }]]
    }
  };

  /* ---------------- PRIHLÁSENIE ---------------- */
  function loginView() {
    app.innerHTML = `<div class="login"><form class="card" id="lf">
      <h1>Luna</h1><p>Administrácia webu</p>
      <input type="password" placeholder="Heslo" required autofocus>
      <button class="a-btn pri" style="width:100%;padding:12px">Prihlásiť sa</button>
      ${LunaStore.mode === "local" ? `<p class="muted" style="font-size:13px;margin-top:14px">Lokálny náhľad – heslo: <b>luna2026</b></p>` : ""}
      <p><a href="index.html" style="font-size:13px">← späť na web</a></p></form></div>`;
    document.getElementById("lf").onsubmit = async (e) => {
      e.preventDefault();
      try {
        token = await LunaStore.login(e.target.querySelector("input").value);
        SS.set("luna-token", token); main();
      } catch (err) { alert(err.message); }
    };
  }

  /* ---------------- HLAVNÉ ROZHRANIE ---------------- */
  async function main() {
    app.innerHTML = `
      <div class="adm-top"><a class="logo" href="index.html" target="_blank"><span>Luna</span></a><small>ADMINISTRÁCIA</small>
        <div class="bar" style="margin:0"><span class="unsaved" id="dirty" hidden>● neuložené zmeny</span>
          <button class="a-btn gold" id="saveAll">💾 Uložiť zmeny na web</button>
          <a class="a-btn" href="index.html" target="_blank">Zobraziť web ↗</a>
          <button class="a-btn" id="logout">Odhlásiť</button></div></div>
      <div class="adm"><nav class="adm-nav" id="nav"></nav><section class="adm-main" id="main"></section></div>
      <div class="dlg" id="dlg"><form class="card" id="dlgForm"></form></div>`;
    document.getElementById("saveAll").onclick = saveAll;
    document.getElementById("logout").onclick = () => { SS.del("luna-token"); token = null; loginView(); };
    addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
    renderNav(); renderTab();
  }

  function setDirty(v) { dirty = v; const el = document.getElementById("dirty"); if (el) el.hidden = !v; }

  async function saveAll() {
    try { await LunaStore.save(data, token); setDirty(false); LunaUI.toast("Uložené ✨ Zmeny sú na webe."); }
    catch (e) { alert("Chyba pri ukladaní: " + e.message); }
  }

  function renderNav() {
    const tabs = [...Object.entries(SECTIONS).map(([k, v]) => [k, v.title, data[k].length]), ["orders", "Objednávky", null], ["subs", "Odberatelia", null], ["settings", "Nastavenia", null], ["backup", "Záloha / export", null]];
    const nav = document.getElementById("nav");
    nav.innerHTML = tabs.map(([k, t, n]) => `<button class="${k === tab ? "on" : ""}" data-k="${k}"><span>${t}</span>${n != null ? `<span class="cnt">${n}</span>` : ""}</button>`).join("");
    nav.querySelectorAll("button").forEach((b) => (b.onclick = () => { tab = b.dataset.k; renderNav(); renderTab(); }));
  }

  function renderTab() {
    const m = document.getElementById("main");
    const modeNote = LunaStore.mode === "local"
      ? `<div class="note">Lokálny režim: zmeny sa ukladajú len v tomto prehliadači. Po nahratí webu na hosting s PHP sa budú ukladať na server pre všetkých návštevníkov (viď README).</div>` : "";
    if (SECTIONS[tab]) return listView(m, tab, modeNote);
    if (tab === "orders") return ordersView(m);
    if (tab === "subs") return subsView(m);
    if (tab === "settings") return settingsView(m, modeNote);
    if (tab === "backup") return backupView(m);
  }

  function cell(v, fmt, row) {
    if (fmt === "img") return v ? `<img src="${esc(v)}" alt="">` : "";
    if (typeof fmt === "function") return esc(fmt(v, row));
    const s = String(v ?? ""); return esc(s.length > 70 ? s.slice(0, 70) + "…" : s);
  }

  function listView(m, key, note) {
    const S = SECTIONS[key];
    let rows = data[key].map((r, i) => ({ r, i }));
    if (S.sort) rows.sort((a, b) => S.sort(a.r, b.r));
    const today = new Date().toISOString().slice(0, 10);
    m.innerHTML = `${note}<h1>${S.title}</h1>
      <div class="bar"><button class="a-btn pri" id="add">+ Pridať ${S.item}</button>
      ${key === "events" ? `<span class="muted">Minulé termíny sa na webe automaticky skryjú.</span>` : ""}</div>
      <table class="adm-t"><thead><tr>${S.cols.map((c) => `<th>${c[1]}</th>`).join("")}<th></th></tr></thead>
      <tbody>${rows.map(({ r, i }) => `<tr class="${key === "events" && r.date < today ? "past" : ""}">${S.cols.map(([f, , fmt]) => `<td>${cell(r[f], fmt, r)}</td>`).join("")}
        <td class="act"><button class="a-btn" data-e="${i}">Upraviť</button> <button class="a-btn" data-c="${i}" title="Duplikovať">⧉</button> <button class="a-btn del" data-d="${i}">Zmazať</button></td></tr>`).join("")
        || `<tr><td colspan="${S.cols.length + 1}" style="text-align:center;padding:30px">Zatiaľ prázdne.</td></tr>`}</tbody></table>`;
    m.querySelector("#add").onclick = () => edit(key, null);
    m.querySelectorAll("[data-e]").forEach((b) => (b.onclick = () => edit(key, +b.dataset.e)));
    m.querySelectorAll("[data-c]").forEach((b) => (b.onclick = () => { const copy = { ...data[key][+b.dataset.c], id: uid(key[0]) }; data[key].push(copy); setDirty(true); renderNav(); edit(key, data[key].length - 1); }));
    m.querySelectorAll("[data-d]").forEach((b) => (b.onclick = () => {
      if (!confirm("Naozaj zmazať?")) return;
      data[key].splice(+b.dataset.d, 1); setDirty(true); renderNav(); renderTab();
    }));
  }

  function fieldHtml([name, label, type, o = {}], val) {
    const full = o.full ? "full" : "";
    const hint = o.hint ? `<span class="hint">${o.hint}</span>` : "";
    const req = o.required ? "required" : "";
    const v = esc(val ?? "");
    if (type === "textarea") return `<label class="${full}">${label}<textarea name="${name}" rows="4" ${req}>${v}</textarea>${hint}</label>`;
    if (type === "select") return `<label class="${full}">${label}<select name="${name}">${o.options().map((op) => { const [k, t] = Array.isArray(op) ? op : [op, op]; return `<option value="${esc(k)}" ${String(k) === String(val ?? "") ? "selected" : ""}>${esc(t)}</option>`; }).join("")}</select>${hint}</label>`;
    if (type === "datalist") return `<label class="${full}">${label}<input name="${name}" list="dl-${name}" value="${v}" ${req}><datalist id="dl-${name}">${o.options().map((x) => `<option value="${esc(x)}">`).join("")}</datalist>${hint}</label>`;
    if (type === "checkbox") return `<label class="${full}" style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="${name}" ${val !== false ? "checked" : ""}> ${label}</label>`;
    if (type === "image") return `<label class="${full}">${label}<div class="img-field"><img src="${v || "data:,"}" alt=""><input type="text" name="${name}" value="${v}" placeholder="img/… alebo https://…"><input type="file" accept="image/*" data-up="${name}"></div><span class="hint">Vlož odkaz na obrázok alebo nahraj súbor.</span></label>`;
    return `<label class="${full}">${label}<input type="${type}" name="${name}" value="${v}" ${req} ${o.step ? `step="${o.step}"` : ""}>${hint}</label>`;
  }

  function edit(key, idx) {
    const S = SECTIONS[key];
    const rec = idx == null ? { id: uid(key[0]), status: "predaj", active: true } : data[key][idx];
    const dlg = document.getElementById("dlg"), f = document.getElementById("dlgForm");
    f.innerHTML = `<h2>${idx == null ? "Nový " : "Upraviť "}${S.item}</h2><div class="form">${S.fields.map((fd) => fieldHtml(fd, rec[fd[0]])).join("")}</div>
      <div class="bar" style="margin:18px 0 0;justify-content:flex-end"><button type="button" class="a-btn" id="cancel">Zrušiť</button><button class="a-btn pri">Hotovo</button></div>`;
    dlg.classList.add("open");
    f.querySelector("#cancel").onclick = () => dlg.classList.remove("open");
    f.querySelectorAll("[data-up]").forEach((inp) => (inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      const url = await uploadImage(file);
      const t = f.querySelector(`input[name="${inp.dataset.up}"]`); t.value = url;
      inp.parentElement.querySelector("img").src = url;
    }));
    f.querySelectorAll(".img-field input[type=text]").forEach((t) => (t.oninput = () => (t.parentElement.querySelector("img").src = t.value)));
    f.onsubmit = (e) => {
      e.preventDefault();
      const out = { ...rec };
      S.fields.forEach(([name, , type]) => {
        const el = f.elements[name];
        if (type === "checkbox") out[name] = el.checked;
        else if (type === "number") out[name] = el.value === "" ? "" : Number(el.value);
        else out[name] = el.value.trim();
      });
      // premenované predstavenie → aktualizuj aj termíny
      if (key === "shows" && idx != null && rec.title !== out.title) data.events.forEach((ev) => { if (ev.show === rec.title) ev.show = out.title; });
      if (idx == null) data[key].push(out); else data[key][idx] = out;
      dlg.classList.remove("open"); setDirty(true); renderNav(); renderTab();
    };
  }

  async function uploadImage(file) {
    if (LunaStore.mode === "api") {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("api.php?a=upload", { method: "POST", headers: { "X-Luna-Token": token }, body: fd }).then((r) => r.json());
      if (!r.ok) { alert(r.error || "Nahrávanie zlyhalo"); return ""; }
      return r.url;
    }
    // lokálne: zmenšiť a uložiť ako data URL
    const img = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = URL.createObjectURL(file); });
    const k = Math.min(1, 900 / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = img.width * k; c.height = img.height * k;
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", .82);
  }

  /* ---------------- OBJEDNÁVKY ---------------- */
  async function ordersView(m) {
    let orders = [];
    try { orders = await LunaStore.getOrders(token); } catch (e) { m.innerHTML = `<p>Objednávky sa nepodarilo načítať.</p>`; return; }
    const STATES = ["nová", "zaplatená", "odoslaná", "vybavená", "zrušená"];
    m.innerHTML = `<h1>Objednávky</h1>
      <div class="bar"><button class="a-btn" id="csv">Export CSV</button><span class="muted">${orders.length} objednávok · tržby (bez zrušených): ${money(orders.filter((o) => o.status !== "zrušená").reduce((s, o) => s + Number(o.total || 0), 0))}</span></div>
      <table class="adm-t"><thead><tr><th>Číslo</th><th>Dátum</th><th>Zákazník</th><th>Položky</th><th>Spolu</th><th>Doprava / platba</th><th>Stav</th></tr></thead><tbody>
      ${orders.map((o, i) => `<tr><td><b>${esc(o.id)}</b></td><td>${new Date(o.created).toLocaleString("sk-SK")}</td>
        <td>${esc(o.customer.name)}<br><span class="muted">${esc(o.customer.email)} · ${esc(o.customer.phone)}<br>${esc(o.customer.street)}, ${esc(o.customer.zip)} ${esc(o.customer.city)}</span>${o.customer.note ? `<br><i>${esc(o.customer.note)}</i>` : ""}</td>
        <td>${o.items.map((it) => `${it.qty}× ${esc(it.name)}${it.variant ? ` (${esc(it.variant)})` : ""}`).join("<br>")}</td>
        <td><b>${money(o.total)}</b></td><td>${esc(o.customer.delivery)} / ${esc(o.customer.payment)}</td>
        <td><select data-o="${i}">${STATES.map((s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select></td></tr>`).join("")
        || `<tr><td colspan="7" style="text-align:center;padding:30px">Zatiaľ žiadne objednávky.</td></tr>`}</tbody></table>`;
    m.querySelectorAll("[data-o]").forEach((s) => (s.onchange = async () => {
      orders[+s.dataset.o].status = s.value;
      await LunaStore.saveOrders(orders, token); LunaUI.toast("Stav objednávky uložený");
    }));
    m.querySelector("#csv").onclick = () => download("objednavky.csv", "﻿" + [["Číslo", "Dátum", "Meno", "E-mail", "Telefón", "Adresa", "Položky", "Spolu", "Doprava", "Platba", "Stav"],
      ...orders.map((o) => [o.id, o.created, o.customer.name, o.customer.email, o.customer.phone, `${o.customer.street}, ${o.customer.zip} ${o.customer.city}`,
        o.items.map((it) => `${it.qty}x ${it.name} ${it.variant || ""}`).join(" | "), o.total, o.customer.delivery, o.customer.payment, o.status])]
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n"), "text/csv");
  }

  async function subsView(m) {
    const subs = await LunaStore.getSubscribers(token).catch(() => []);
    m.innerHTML = `<h1>Odberatelia noviniek</h1><div class="bar"><button class="a-btn" id="copy">Kopírovať e-maily</button><span class="muted">${subs.length} odberateľov</span></div>
      <table class="adm-t"><thead><tr><th>E-mail</th><th>Dátum prihlásenia</th></tr></thead><tbody>
      ${subs.map((s) => `<tr><td>${esc(s.email)}</td><td>${new Date(s.date).toLocaleString("sk-SK")}</td></tr>`).join("") || `<tr><td colspan="2" style="text-align:center;padding:30px">Zatiaľ nikto.</td></tr>`}</tbody></table>`;
    m.querySelector("#copy").onclick = () => { navigator.clipboard.writeText(subs.map((s) => s.email).join(", ")); LunaUI.toast("Skopírované"); };
  }

  /* ---------------- NASTAVENIA ---------------- */
  function settingsView(m, note) {
    const F = [["tagline", "Podnadpis (hero)", "text", { full: true }], ["about", "Kto je Luna? (text)", "textarea", { full: true }],
      ["trailerUrl", "Video ukážka (YouTube)", "url", { full: true, hint: "Tlačidlo „Pozri si ukážku“. Ak je prázdne, použije sa prvý klip." }],
      ["producer", "Producent", "text"], ["producerUrl", "Web producenta", "url"], ["email", "Kontaktný e-mail", "email"], ["phone", "Telefón", "text"],
      ["address", "Adresa", "text", { full: true }], ["youtube", "YouTube kanál", "url"], ["spotify", "Spotify", "url"], ["instagram", "Instagram", "url"], ["facebook", "Facebook", "url"],
      ["shopEmail", "E-mail pre objednávky", "email"], ["shippingPrice", "Cena dopravy (€)", "number", { step: "0.01" }], ["freeShippingFrom", "Doprava zdarma od (€)", "number", { step: "0.01" }]];
    m.innerHTML = `${note}<h1>Nastavenia</h1><form class="card" id="sf"><div class="form">${F.map((f) => fieldHtml(f, data.settings[f[0]])).join("")}</div>
      <div class="bar" style="margin:18px 0 0"><button class="a-btn pri">Použiť</button></div></form>`;
    m.querySelector("#sf").onsubmit = (e) => {
      e.preventDefault();
      F.forEach(([n, , t]) => { const v = e.target.elements[n].value.trim(); data.settings[n] = t === "number" ? Number(v || 0) : v; });
      setDirty(true); LunaUI.toast("Nastavenia pripravené – nezabudni Uložiť zmeny");
    };
  }

  function backupView(m) {
    m.innerHTML = `<h1>Záloha a export</h1><div class="card"><p>Stiahni si celý obsah webu ako súbor JSON (záloha), alebo ho nahraj späť.</p>
      <div class="bar"><button class="a-btn pri" id="exp">⬇ Stiahnuť zálohu (data.json)</button>
      <label class="a-btn">⬆ Nahrať zálohu<input type="file" accept=".json" id="imp" hidden></label>
      ${LunaStore.mode === "local" ? `<button class="a-btn del" id="reset">Obnoviť ukážkový obsah</button>` : ""}</div></div>`;
    m.querySelector("#exp").onclick = () => download("data.json", JSON.stringify(data, null, 2), "application/json");
    m.querySelector("#imp").onchange = async (e) => {
      try { const j = JSON.parse(await e.target.files[0].text()); data = Object.assign(JSON.parse(JSON.stringify(LunaStore.DEFAULT)), j); setDirty(true); renderNav(); LunaUI.toast("Záloha načítaná – ulož zmeny"); }
      catch (err) { alert("Neplatný súbor"); }
    };
    const r = m.querySelector("#reset");
    if (r) r.onclick = () => { if (confirm("Vymazať všetky lokálne zmeny?")) { LunaStore.resetLocal(); location.reload(); } };
  }

  function download(name, content, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click();
  }

  if (token) main(); else loginView();
})();
