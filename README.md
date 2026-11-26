# Luna – web

Magický web pre Lunu (produkcia Divadlo OSKAR): úvodná stránka, tabuľka termínov, pesničky a videoklipy, albumy, predstavenia, novinky, newsletter, obchod s merchom a administrácia.

## Súbory
- `index.html` – hlavná stránka
- `obchod.html` – obchod (košík, objednávka)
- `admin.html` – administrácia (prepínače sekcií Podujatia / Obchod / Hra, termíny, predstavenia, albumy, piesne/klipy, produkty, objednávky, novinky, odberatelia, nastavenia, záloha)
- `js/audio.js` – spoločný zvuk hier (odomknutie na iPhone, hrá aj v tichom režime)
- `js/piano.js`, `css/game.css` – hra „Lunin klavír“ (voľná hra + pesničky)
- `api.php` – ukladanie na serveri (bez databázy, JSON súbory v `data/`)
- `img/` – obrázky (dočasne výrezy z grafického návrhu – nahraď ich originálnymi fotkami)

## SEO a AI vyhľadávanie (doména www.dievcazobrazka.sk)
- `index.html`, `obchod.html` – titulky, popisy, kanonické adresy, náhľady na sociálne siete, štruktúrované dáta (JSON-LD: web, Divadlo OSKAR, Luna, časté otázky; termíny a album sa dopĺňajú z obsahu v admine)
- `robots.txt` – povolené vyhľadávače aj AI asistenti (ChatGPT, Claude, Perplexity, Gemini…), admin a dáta zakázané
- `sitemap.xml` – mapa stránok (po väčších zmenách uprav dátum `lastmod`)
- `llms.txt` – súhrn webu pre AI asistentov (pri zmene kontaktov ho uprav)
- `.htaccess` – presmerovanie na https://www, kompresia, cache
- Po spustení domény: pridaj web do Google Search Console a Bing Webmaster Tools a odošli `sitemap.xml`.

## Nasadenie na hosting (automaticky cez GitHub → FTP)
Po každej zmene vo vetve `main` GitHub sám nahrá web na server cez SFTP (`.github/workflows/deploy.yml`).
1. V GitHube otvor **Settings → Secrets and variables → Actions → New repository secret** a pridaj:
   - `FTP_SERVER` – adresa FTP servera
   - `FTP_USERNAME`, `FTP_PASSWORD` – prihlasovacie údaje FTP
   - `FTP_DIR` – priečinok webu na serveri, na Websupporte `/dievcazobrazka.sk/web/`
   - `ADMIN_PASSWORD` – heslo do administrácie webu
   - `LUNA_SECRET` – dlhý náhodný text (aspoň 16 znakov)
   - nepovinne `FTP_PROTOCOL` – `ftps`, ak hosting nepodporuje SFTP
2. V záložke **Actions → Nahrať web na FTP → Run workflow** spusti prvé nahratie.
3. Otvor `/admin.html`, prihlás sa, skontroluj obsah a klikni **Uložiť zmeny na web** – vytvorí sa `data/data.json`.
4. Objednávky chodia na e-mail z Nastavení (funkcia `mail()` hostingu) a sú v admine v sekcii Objednávky.

Heslo do adminu nie je v repozitári (je verejný) – GitHub ho pri nahrávaní zapíše do `config.php` na serveri.
Priečinky `data/` a `uploads/` na serveri nahrávanie nemaže.

## Lokálny náhľad (bez PHP)
Web funguje aj bez servera: obsah sa vtedy berie z ukážkových dát a úpravy v admine sa ukladajú len v prehliadači. Heslo v tomto režime: `luna2026`.

## Čo doplniť
- Skutočné odkazy na YouTube klipy a Spotify (Admin → Piesne a klipy).
- Reálne termíny a odkazy na vstupenky (Admin → Termíny) – ukážkové termíny zmaž.
- Fotky produktov a ceny (Admin → Obchod).
- Obchodné podmienky a GDPR stránku (povinné pre e-shop).
