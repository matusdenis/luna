/* Domovská stránka – vykreslenie obsahu z LunaStore */
(async function () {
  const d = await LunaStore.load();
  const { esc, money, ytId } = LunaStore.util;
  const I = LunaUI.ICONS;
  LunaUI.header("Domov");
  LunaUI.footer();

  const s = d.settings;
  const on = LunaStore.util.on;
  const showEvents = on("Events"), showShop = on("Shop"), showGame = on("Game");
  if (!showEvents) document.getElementById("terminy").remove();
  if (!showGame) document.getElementById("hra").remove();
  if (s.tagline) {
    const words = s.tagline.toUpperCase();
    document.getElementById("tagline").innerHTML =
      esc(words).replace(/ (PESNIČIEK|PRE DETI)/, "<br>$1").replace(/ (PRE DETI)/, "<br>$1") + '<span class="star-sep">★</span>';
  }
  document.getElementById("aboutText").textContent = s.about;
  const firstClip = d.songs.find((x) => ytId(x.youtubeUrl));
  document.getElementById("trailerBtn").onclick = () => LunaUI.video(s.trailerUrl || (firstClip && firstClip.youtubeUrl));
  document.getElementById("aboutPlay").onclick = () => LunaUI.video(s.trailerUrl || (firstClip && firstClip.youtubeUrl));

  /* rýchle odkazy pod hero */
  const quick = [["#pesnicky", "note", "Pesničky"], ["#predstavenia", "book", "Rozprávky"], showGame && ["#hra", "note", "Klavír"],
    showEvents && ["#terminy", "cal", "Podujatia"], showShop && ["obchod.html", "bag", "Obchod"]].filter(Boolean);
  document.getElementById("quickLinks").innerHTML = quick.map(([h, ic, t]) => `<a href="${h}">${I[ic]}<span>${t}</span></a>`).join("");

  /* karty Objav Lunin svet */
  const cards = [
    ["#pesnicky", "card-songs", "note", "Pesničky", "Vypočuj si Lunine piesne a pozri si videoklipy"],
    ["#predstavenia", "card-tales", "book", "Rozprávky", "Rozprávkové príbehy plné fantázie"],
    ["#o-lune", "card-world", "wand", "Svet Luny", "Magické miesta, postavy a tajomstvá"],
    showEvents ? ["#terminy", "card-shows", "cal", "Podujatia", "Kde sa s Lunou môžeš stretnúť naživo"]
      : showGame ? ["#hra", "card-shows", "note", "Lunin klavír", "Zahraj si a nauč sa pesničku"]
      : ["#novinky", "card-shows", "cal", "Novinky", "Čo nové sa deje v Luninom svete"]
  ];
  document.getElementById("worldCards").innerHTML = cards.map(([h, img, ic, t, p], i) => `
    <a class="world-card reveal d${i}" href="${h}">
      <div class="bg" style="background-image:url(img/${img}.jpg)"></div>
      <div class="body"><h3>${I[ic]}${t}</h3><p>${p}</p></div>
      <span class="arrow">›</span>
    </a>`).join("");

  /* ---------- TERMÍNY ---------- */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = !showEvents ? [] : d.events
    .filter((e) => new Date(e.date + "T00:00") >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const fCity = document.getElementById("fCity"), fShow = document.getElementById("fShow");
  if (showEvents) {
    [...new Set(upcoming.map((e) => e.city))].sort().forEach((c) => fCity.add(new Option(c, c)));
    [...new Set(upcoming.map((e) => e.show))].sort().forEach((c) => fShow.add(new Option(c, c)));
  }
  const STATUS = { predaj: "V predaji", vypredane: "Vypredané", coskoro: "Čoskoro" };
  function renderEvents() {
    const rows = upcoming.filter((e) => (!fCity.value || e.city === fCity.value) && (!fShow.value || e.show === fShow.value));
    const body = document.getElementById("eventsBody");
    if (!rows.length) { body.innerHTML = `<tr><td colspan="6" class="empty">Momentálne nemáme vypísané žiadne termíny. Sleduj nás – čoskoro pribudnú ✨</td></tr>`; return; }
    body.innerHTML = rows.map((e) => {
      const dt = new Date(e.date + "T00:00");
      const btn = e.status === "vypredane"
        ? `<span class="muted">—</span>`
        : e.ticketUrl ? `<a class="btn btn-small" href="${esc(e.ticketUrl)}" target="_blank" rel="noopener">Vstupenky</a>`
        : `<a class="btn btn-small" href="mailto:${esc(s.email)}?subject=${encodeURIComponent("Vstupenky: " + e.show + " – " + e.city + " " + dt.toLocaleDateString("sk-SK"))}">Rezervovať</a>`;
      return `<tr>
        <td class="c-date"><div class="date-badge"><div class="day"><b>${dt.getDate()}</b><small>${dt.toLocaleDateString("sk-SK", { month: "short" })}</small></div>
          <div class="wd">${dt.toLocaleDateString("sk-SK", { weekday: "long" })}<br>${dt.getFullYear()}</div></div></td>
        <td data-l="Čas">${esc(e.time || "")}</td>
        <td data-l="Predstavenie"><span class="show-name">${esc(e.show)}</span></td>
        <td data-l="Miesto">${esc(e.city)}<br><span class="muted">${esc(e.venue || "")}</span></td>
        <td data-l="Stav"><span class="status ${esc(e.status)}">${STATUS[e.status] || ""}</span></td>
        <td class="c-btn">${btn}</td></tr>`;
    }).join("");
  }
  if (showEvents) { fCity.onchange = fShow.onchange = renderEvents; renderEvents(); }

  /* ---------- PESNIČKY ---------- */
  const albumName = (id) => (d.albums.find((a) => a.id === id) || {}).title || "";
  document.getElementById("songList").innerHTML = d.songs.map((so) => {
    const hasClip = !!so.youtubeUrl;
    return `<li class="song">
      <button class="num" ${hasClip ? `data-clip="${esc(so.youtubeUrl)}" aria-label="Prehrať klip ${esc(so.title)}"` : "disabled aria-label='Klip čoskoro'"}><svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg></button>
      <div><h4>${esc(so.title)}</h4><div class="meta">${esc([albumName(so.albumId), so.duration, so.note].filter(Boolean).join(" · "))}</div></div>
      <div class="links">
        ${so.youtubeUrl ? `<a href="${esc(so.youtubeUrl)}" target="_blank" rel="noopener" aria-label="YouTube">${I.yt}</a>` : ""}
        ${so.spotifyUrl ? `<a href="${esc(so.spotifyUrl)}" target="_blank" rel="noopener" aria-label="Spotify">${I.sp}</a>` : ""}
        ${!so.youtubeUrl && !so.spotifyUrl ? `<span class="badge-soon">čoskoro</span>` : ""}
      </div></li>`;
  }).join("") || `<li class="empty">Pesničky čoskoro pribudnú.</li>`;
  document.querySelectorAll("[data-clip]").forEach((b) => (b.onclick = () => LunaUI.video(b.dataset.clip)));

  document.getElementById("albumList").innerHTML = d.albums.map((a) => {
    const n = d.songs.filter((x) => x.albumId === a.id).length;
    const prod = showShop && a.buyProductId && d.products.find((p) => p.id === a.buyProductId && p.active !== false);
    return `<div class="album">
      <div class="cover"><img src="${esc(a.cover || "img/card-songs.jpg")}" alt="Album ${esc(a.title)}" loading="lazy"></div>
      <div><h4>${esc(a.title)}</h4><p>${esc([a.year, n ? n + " pesničiek" : "", a.description].filter(Boolean).join(" · "))}</p>
        <div class="links">
          ${a.spotifyUrl ? `<a class="btn btn-small" href="${esc(a.spotifyUrl)}" target="_blank" rel="noopener">Spotify</a>` : ""}
          ${a.youtubeUrl ? `<a class="btn btn-small" href="${esc(a.youtubeUrl)}" target="_blank" rel="noopener">YouTube</a>` : ""}
          ${prod ? `<a class="btn btn-small btn-gold" href="obchod.html#p-${esc(prod.id)}">Kúpiť CD · ${money(prod.price)}</a>` : ""}
        </div></div></div>`;
  }).join("");

  /* ---------- PREDSTAVENIA ---------- */
  document.getElementById("showList").innerHTML = d.shows.map((sh, i) => {
    const next = upcoming.find((e) => e.show === sh.title);
    return `<article class="show-card reveal d${i % 3}">
      <div class="img" style="background-image:url('${esc(sh.image || "img/attic.jpg")}')"></div>
      <div class="body"><h3>${esc(sh.title)}</h3>
        <div class="chips">${sh.age ? `<span class="chip">👧 ${esc(sh.age)}</span>` : ""}${sh.duration ? `<span class="chip">⏱ ${esc(sh.duration)}</span>` : ""}</div>
        <p>${esc(sh.description)}</p>
        ${next ? `<a class="btn btn-ink btn-small" href="#terminy">Najbližšie: ${new Date(next.date + "T00:00").toLocaleDateString("sk-SK")} · ${esc(next.city)}</a>`
               : `<a class="btn btn-ink btn-small" href="mailto:${esc(s.email)}?subject=${encodeURIComponent("Objednávka predstavenia: " + sh.title)}">Objednať predstavenie</a>`}
      </div></article>`;
  }).join("");

  /* ---------- NOVINKY ---------- */
  const newsOk = (n) => showShop || !/obchod\.html/.test(n.link || "");
  document.getElementById("newsList").innerHTML = d.news.filter(newsOk).map((n, i) => `
    <a class="news-item reveal d${i % 3}" href="${esc(LunaStore.util.safeUrl(n.link) || "#")}">
      <div class="img"><img src="${esc(n.image)}" alt="" loading="lazy"></div>
      <h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></a>`).join("");

  /* ---------- NEWSLETTER ---------- */
  document.getElementById("joinForm").onsubmit = async (ev) => {
    ev.preventDefault();
    const email = ev.target.querySelector("input").value.trim();
    await LunaStore.subscribe(email);
    ev.target.reset(); document.querySelector(".consent input").checked = false;
    LunaUI.toast("Ďakujeme! Si súčasťou Luninho sveta 🌙");
  };

  LunaUI.fireflies(document.getElementById("pridaj-sa"));
  LunaUI.fireflies(document.getElementById("domov"), 16); // zlaté zrnká v hero

  /* ---------- parallax: každý prvok sa pri scrollovaní hýbe inou rýchlosťou ---------- */
  const $ = (q) => document.querySelector(q), $$ = (q) => document.querySelectorAll(q);
  const sp = (el, speed, rot) => { if (!el) return; el.dataset.speed = speed; if (rot) el.dataset.rot = rot; };
  if (matchMedia("(min-width: 861px)").matches) {
    sp($(".hero-text"), -.18);
    sp($(".quick-links"), -.06);
  // obsah sa hýbe len na väčších obrazovkách (na mobile len dekorácie)
  $$(".section-title, .lead").forEach((el) => sp(el, .05));
  sp($(".about > div:first-child"), -.06);
  sp($(".video-frame"), .1, .004);
  $$(".world-card").forEach((el, i) => sp(el, i % 2 ? -.04 : .05));
  $$(".show-card").forEach((el, i) => sp(el, [.06, -.05, .1][i % 3]));
  $$(".news-item").forEach((el, i) => sp(el, [-.05, .07, -.03][i % 3]));
  $$(".album").forEach((el) => sp(el, .07));
  sp($(".song-list"), -.03);
  sp($(".join-box"), -.12);
  sp($(".join-bg"), .25);
  }

  /* plávajúce mesiačiky, hviezdy a obláčiky: [trieda, left%, top%, speed, rotácia, posun do strany] */
  LunaUI.decorate($("#o-lune"), [["moon", 2, 8, .45, .04], ["star", 46, 12, .3], ["star s", 93, 20, .6], ["star s", 40, 85, .2], ["cloud", 72, 70, .25, 0, .15]]);
  LunaUI.decorate($("#svet"), [["star", 4, 12, .5], ["star s", 94, 30, .25], ["cloud", -6, 60, .3, 0, -.2], ["star s", 60, 6, .7]]);
  if (showEvents) LunaUI.decorate($("#terminy"), [["moon", 90, 2, .55, -.05], ["star", 6, 30, .35], ["star s", 12, 80, .6], ["cloud", 70, 78, .2, 0, .25]]);
  LunaUI.decorate($("#pesnicky"), [["star", 92, 10, .4], ["star s", 3, 50, .55], ["cloud", 60, -5, .3, 0, -.15]]);
  LunaUI.decorate($("#predstavenia"), [["moon", 93, 6, .4, .05], ["star s", 4, 20, .5], ["cloud", -8, 70, .25, 0, .2]]);
  LunaUI.decorate($("#novinky"), [["star", 8, 10, .45], ["star s", 90, 40, .3]]);
  LunaUI.mist($("#svet"), "top", .35);
  LunaUI.mist($("#pesnicky"), "top", -.3);
  LunaUI.mist($("#novinky"), "bottom", .25);
  LunaUI.parallax && LunaUI.parallax();

  if (showGame && window.LunaGames) LunaGames.init(document.getElementById("hra"));
  LunaFX.init();
  LunaUI.reveal();
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
})();
