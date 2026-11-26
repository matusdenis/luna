/* ============================================================
   LunaStore – dátová vrstva webu
   1) Ak beží na hostingu s PHP → číta/zapisuje cez api.php (data/data.json)
   2) Inak (lokálny náhľad) → predvolený obsah + úpravy uložené v prehliadači
   ============================================================ */
(function () {
  // bezpečný prístup k úložisku prehliadača (v súkromnom okne môže byť zakázané)
  const LS = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const LS_KEY = "luna-data-v1";
  const LS_ORDERS = "luna-orders-v1";
  const LS_CART = "luna-cart-v1";

  const DEFAULT = {
    settings: {
      tagline: "Magický svet pesničiek a príbehov pre deti",
      about:
        "Luna je čarovná sprievodkyňa detským svetom fantázie. Spieva piesne, rozpráva príbehy a spolu s deťmi objavuje miesta, kde sa sny stávajú skutočnosťou. Lunu pre vás s láskou pripravuje Divadlo OSKAR.",
      trailerUrl: "",
      producer: "Divadlo OSKAR",
      producerUrl: "https://www.divadlooskar.sk/",
      email: "luna.pesnicky@gmail.com",
      phone: "0948 441 117",
      address: "Holíčska 26, 851 05 Bratislava",
      youtube: "",
      instagram: "http://www.instagram.com/divadlo.oskar/",
      facebook: "https://www.facebook.com/divadlo.oskar/",
      spotify: "",
      youtubePlaylist: "",
      shopEmail: "luna.pesnicky@gmail.com",
      shippingPrice: 3.9,
      freeShippingFrom: 40,
      // prepínače sekcií webu (Admin → Nastavenia)
      showEvents: false,
      showShop: true,
      showGame: true
    },
    events: [
      { id: "e1", date: "2026-12-06", time: "10:00", show: "Luna a Mikulášska hviezda", city: "Bratislava", venue: "Dom kultúry Ružinov", ticketUrl: "", status: "predaj" },
      { id: "e2", date: "2026-12-06", time: "15:00", show: "Luna a Mikulášska hviezda", city: "Bratislava", venue: "Dom kultúry Ružinov", ticketUrl: "", status: "vypredane" },
      { id: "e3", date: "2026-12-13", time: "16:00", show: "Luna: Čítaj so mnou", city: "Trnava", venue: "Mestské kultúrne stredisko", ticketUrl: "", status: "predaj" },
      { id: "e4", date: "2026-12-20", time: "15:00", show: "Vianočná rozprávka s Lunou", city: "Nitra", venue: "Kultúrny dom", ticketUrl: "", status: "predaj" },
      { id: "e5", date: "2027-01-17", time: "10:30", show: "Luna: Čítaj so mnou", city: "Žilina", venue: "Dom odborov", ticketUrl: "", status: "coskoro" },
      { id: "e6", date: "2027-02-07", time: "16:00", show: "Cesta za hviezdami", city: "Banská Bystrica", venue: "Kultúrne centrum", ticketUrl: "", status: "coskoro" }
    ],
    shows: [
      { id: "s1", title: "Luna: Čítaj so mnou", description: "Hudobná rozprávka o tom, že každá kniha je dvierkami do iného sveta. Luna s deťmi spieva, hrá sa a objavuje čaro čítania.", age: "od 3 rokov", duration: "50 min", image: "img/attic.jpg" },
      { id: "s2", title: "Cesta za hviezdami", description: "Luna sa vydáva na nočnú cestu po oblohe za stratenou hviezdičkou. Stretne veľrybu, ktorá pláva medzi oblakmi, i strážcov hradu v oblakoch.", age: "od 4 rokov", duration: "55 min", image: "img/card-shows.jpg" },
      { id: "s3", title: "Vianočná rozprávka s Lunou", description: "Zimné pesničky, svetielka a príbeh o tom, ako Luna pomohla Mikulášovi rozsvietiť nebo nad mestom.", age: "od 3 rokov", duration: "45 min", image: "img/news-clip.jpg" }
    ],
    albums: [
      { id: "a1", title: "Lunine pesničky", year: "2026", cover: "img/card-songs.jpg", description: "Prvý album pesničiek z Luninho sveta.", spotifyUrl: "", youtubeUrl: "", buyProductId: "p2" }
    ],
    songs: [
      { id: "so1", title: "Čítaj", albumId: "a1", duration: "3:12", youtubeUrl: "", spotifyUrl: "", note: "Pieseň o čarovnom svete kníh" },
      { id: "so2", title: "Cesta za hviezdami", albumId: "a1", duration: "3:28", youtubeUrl: "", spotifyUrl: "", note: "Najnovší videoklip" },
      { id: "so3", title: "Veľryba v oblakoch", albumId: "a1", duration: "2:54", youtubeUrl: "", spotifyUrl: "", note: "" },
      { id: "so4", title: "Uspávanka pre Mesiac", albumId: "a1", duration: "3:40", youtubeUrl: "", spotifyUrl: "", note: "" }
    ],
    products: [
      { id: "p1", name: "Kniha: Lunine rozprávky", category: "Knihy", price: 14.9, image: "img/news-book.jpg", description: "Tri čarovné príbehy na dobrú noc s ilustráciami.", stock: 30, active: true },
      { id: "p2", name: "CD: Lunine pesničky", category: "Hudba", price: 12, image: "img/card-songs.jpg", description: "Všetky pesničky z Luninho sveta na jednom CD.", stock: 50, active: true },
      { id: "p3", name: "Hrnček Luna", category: "Darčeky", price: 11.5, image: "img/news-gifts.jpg", description: "Modrý hrnček so zlatým mesiačikom.", stock: 25, active: true },
      { id: "p4", name: "Plyšový macko Luny", category: "Darčeky", price: 19.9, image: "img/news-gifts.jpg", description: "Mäkučký kamarát na spinkanie.", stock: 15, active: true },
      { id: "p5", name: "Detské tričko Luna", category: "Oblečenie", price: 16.9, image: "img/card-world.jpg", description: "Bavlnené tričko s potlačou mesiačika. Veľkosti 98–152.", stock: 40, active: true, variants: "98, 110, 122, 134, 146, 152" },
      { id: "p6", name: "Svietiaca hviezdička", category: "Darčeky", price: 9.9, image: "img/news-gifts.jpg", description: "Nočné svetielko v tvare hviezdy.", stock: 20, active: true }
    ],
    news: [
      { id: "n1", title: "Nový videoklip: Cesta za hviezdami", text: "Pozri si najnovšiu pesničku plnú kúziel.", image: "img/news-clip.jpg", link: "#pesnicky" },
      { id: "n2", title: "Nová knižka: Lunine rozprávky", text: "Tri čarovné príbehy na dobrú noc.", image: "img/news-book.jpg", link: "obchod.html" },
      { id: "n3", title: "Darčeky zo sveta Luny", text: "Knižky, CD, tričká a ďalšie čarovné veci.", image: "img/news-gifts.jpg", link: "obchod.html" }
    ]
  };

  const clone = (o) => JSON.parse(JSON.stringify(o));
  let mode = "local";
  let data = null;

  async function tryApi(url, opts) {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("json")) throw new Error("not json");
    return r.json();
  }

  const LunaStore = {
    DEFAULT,
    get mode() { return mode; },

    async load() {
      if (location.protocol.startsWith("http")) {
        try {
          const res = await tryApi("api.php?a=get", { cache: "no-store" });
          if (res && res.ok) {
            mode = "api";
            data = Object.assign(clone(DEFAULT), res.data || {});
            return data;
          }
        } catch (e) { /* bez PHP → lokálny režim */ }
      }
      mode = "local";
      try {
        const saved = JSON.parse(LS.get(LS_KEY) || "null");
        data = saved ? Object.assign(clone(DEFAULT), saved) : clone(DEFAULT);
      } catch (e) { data = clone(DEFAULT); }
      return data;
    },

    get data() { return data; },

    async save(newData, token) {
      data = newData;
      if (mode === "api") {
        const res = await tryApi("api.php?a=save", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Luna-Token": token || "" },
          body: JSON.stringify(newData)
        });
        if (!res.ok) throw new Error(res.error || "Uloženie zlyhalo");
        return true;
      }
      LS.set(LS_KEY, JSON.stringify(newData));
      return true;
    },

    resetLocal() { LS.del(LS_KEY); },

    async login(password) {
      if (mode === "api") {
        const res = await tryApi("api.php?a=login", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password })
        });
        if (!res.ok) throw new Error(res.error || "Nesprávne heslo");
        return res.token;
      }
      // Lokálny náhľad: ukážkové heslo (na hostingu sa heslo nastavuje v api.php)
      if (password !== "luna2026") throw new Error("Nesprávne heslo");
      return "local";
    },

    /* --- objednávky z obchodu --- */
    async placeOrder(order) {
      order.id = "OBJ-" + Date.now().toString(36).toUpperCase();
      order.created = new Date().toISOString();
      order.status = "nová";
      if (mode === "api") {
        const res = await tryApi("api.php?a=order", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order)
        });
        if (!res.ok) throw new Error(res.error || "Objednávku sa nepodarilo odoslať");
        return res.id || order.id;
      }
      const list = JSON.parse(LS.get(LS_ORDERS) || "[]");
      list.unshift(order);
      LS.set(LS_ORDERS, JSON.stringify(list));
      return order.id;
    },

    async getOrders(token) {
      if (mode === "api") {
        const res = await tryApi("api.php?a=orders", { headers: { "X-Luna-Token": token || "" }, cache: "no-store" });
        return res.orders || [];
      }
      return JSON.parse(LS.get(LS_ORDERS) || "[]");
    },

    async saveOrders(orders, token) {
      if (mode === "api") {
        await tryApi("api.php?a=saveOrders", {
          method: "POST", headers: { "Content-Type": "application/json", "X-Luna-Token": token || "" },
          body: JSON.stringify(orders)
        });
        return;
      }
      LS.set(LS_ORDERS, JSON.stringify(orders));
    },

    /* --- newsletter --- */
    async subscribe(email) {
      if (mode === "api") {
        try { await tryApi("api.php?a=subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); } catch (e) {}
        return;
      }
      const list = JSON.parse(LS.get("luna-subs-v1") || "[]");
      if (!list.some((x) => x.email === email)) list.push({ email, date: new Date().toISOString() });
      LS.set("luna-subs-v1", JSON.stringify(list));
    },
    async getSubscribers(token) {
      if (mode === "api") {
        const res = await tryApi("api.php?a=subscribers", { headers: { "X-Luna-Token": token || "" }, cache: "no-store" });
        return res.subscribers || [];
      }
      return JSON.parse(LS.get("luna-subs-v1") || "[]");
    },

    /* --- košík --- */
    cart: {
      get() { try { return JSON.parse(LS.get(LS_CART) || "[]"); } catch (e) { return []; } },
      set(items) { LS.set(LS_CART, JSON.stringify(items)); document.dispatchEvent(new Event("cart")); },
      add(productId, variant, qty = 1) {
        const items = this.get();
        const f = items.find((i) => i.id === productId && (i.variant || "") === (variant || ""));
        if (f) f.qty += qty; else items.push({ id: productId, variant: variant || "", qty });
        this.set(items);
      },
      count() { return this.get().reduce((s, i) => s + i.qty, 0); },
      clear() { this.set([]); }
    }
  };

  /* --- pomocníci --- */
  LunaStore.util = {
    esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); },
    money(n) { return Number(n || 0).toLocaleString("sk-SK", { style: "currency", currency: "EUR" }); },
    uid(p) { return (p || "x") + Math.random().toString(36).slice(2, 9); },
    ytId(url) {
      if (!url) return "";
      const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
      return m ? m[1] : "";
    },
    // je sekcia zapnutá? (chýbajúce nastavenie = zapnutá)
    on(name) { return !data || !data.settings || data.settings["show" + name] !== false; },
    // Spotify odkaz (umelec / album / playlist / skladba) → adresa prehrávača na vloženie
    spotifyEmbed(url) {
      const m = String(url || "").match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(artist|album|playlist|track|show)\/([A-Za-z0-9]+)/);
      return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : "";
    },
    // YouTube playlist alebo kanál (/channel/UC…) → adresa prehrávača so zoznamom klipov
    ytListEmbed(url) {
      const s = String(url || "");
      let m = s.match(/[?&]list=([\w-]+)/);
      if (m) return `https://www.youtube-nocookie.com/embed/videoseries?list=${m[1]}&rel=0`;
      m = s.match(/youtube\.com\/channel\/UC([\w-]{22})/);
      if (m) return `https://www.youtube-nocookie.com/embed/videoseries?list=UU${m[1]}&rel=0`;
      return "";
    },
    safeUrl(u) { return /^(https?:|mailto:|tel:|#|img\/|[\w-]+\.html)/i.test(String(u || "")) ? u : ""; }
  };

  window.LunaStore = LunaStore;
})();
