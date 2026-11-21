# Luna – web

Magický web pre Lunu (produkcia Divadlo OSKAR): úvodná stránka, tabuľka termínov, pesničky a videoklipy, albumy, predstavenia, novinky, newsletter, obchod s merchom a administrácia.

## Súbory
- `index.html` – hlavná stránka
- `obchod.html` – obchod (košík, objednávka)
- `admin.html` – administrácia (prepínače sekcií Podujatia / Obchod / Hra, termíny, predstavenia, albumy, piesne/klipy, produkty, objednávky, novinky, odberatelia, nastavenia, záloha)
- `js/game.js`, `js/piano.js`, `css/game.css` – hry: „Čarovné nebo“ (klikanie na čarovné veci) a „Lunin klavír“ (voľná hra + pesničky)
- `api.php` – ukladanie na serveri (bez databázy, JSON súbory v `data/`)
- `img/` – obrázky (dočasne výrezy z grafického návrhu – nahraď ich originálnymi fotkami)

## Nasadenie na hosting (napr. Websupport, bežný PHP hosting)
1. Nahraj celý priečinok na hosting (PHP 7.4+).
2. V `api.php` zmeň `ADMIN_PASSWORD` a `SECRET`.
3. Otvor `/admin.html`, prihlás sa, skontroluj obsah a klikni **Uložiť zmeny na web** – vytvorí sa `data/data.json`.
4. Objednávky chodia na e-mail z Nastavení (funkcia `mail()` hostingu) a sú v admine v sekcii Objednávky.

## Lokálny náhľad (bez PHP)
Web funguje aj bez servera: obsah sa vtedy berie z ukážkových dát a úpravy v admine sa ukladajú len v prehliadači. Heslo v tomto režime: `luna2026`.

## Čo doplniť
- Skutočné odkazy na YouTube klipy a Spotify (Admin → Piesne a klipy).
- Reálne termíny a odkazy na vstupenky (Admin → Termíny) – ukážkové termíny zmaž.
- Fotky produktov a ceny (Admin → Obchod).
- Obchodné podmienky a GDPR stránku (povinné pre e-shop).
