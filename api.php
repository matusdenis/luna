<?php
/* ============================================================
   LUNA – jednoduché API pre web (PHP 7.4+ / 8.x, bez databázy)
   Obsah sa ukladá do data/*.json, obrázky do uploads/.
   ============================================================ */

// >>> HESLO DO ADMINISTRÁCIE <<<
// Heslo NIE JE v tomto súbore (repozitár je verejný). Je v súbore config.php,
// ktorý vytvorí GitHub pri nahrávaní na FTP z tajomstiev ADMIN_PASSWORD a LUNA_SECRET.
// Ručne: vytvor vedľa api.php súbor config.php s obsahom:
//   <?php const ADMIN_PASSWORD = 'tvoje-heslo'; const SECRET = 'dlhy-nahodny-text';
if (file_exists(__DIR__ . '/config.php')) require __DIR__ . '/config.php';
defined('ADMIN_PASSWORD') || define('ADMIN_PASSWORD', '');
defined('ADMIN_PASSWORD_HASH') || define('ADMIN_PASSWORD_HASH', ''); // hash z password_hash() – má prednosť
defined('SECRET') || define('SECRET', '');
const TOKEN_HOURS = 8;

// chyby PHP nikdy nevypisovať návštevníkom (prezrádzajú cesty na serveri)
ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE & ~E_WARNING);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');

$DIR = __DIR__ . '/data';
$UP  = __DIR__ . '/uploads';
if (!is_dir($DIR)) mkdir($DIR, 0755, true);
if (!is_dir($UP))  mkdir($UP, 0755, true);
// priečinok s dátami (objednávky, odberatelia) musí byť z webu nedostupný – pre Apache 2.2 aj 2.4
$deny = "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n";
if (@file_get_contents("$DIR/.htaccess") !== $deny) file_put_contents("$DIR/.htaccess", $deny);
if (!file_exists("$DIR/index.html")) file_put_contents("$DIR/index.html", '');

if (!function_exists('array_is_list')) { function array_is_list(array $a) { return $a === [] || array_keys($a) === range(0, count($a) - 1); } }
function out($a, $code = 200) { http_response_code($code); echo json_encode($a, JSON_UNESCAPED_UNICODE); exit; }
/* telo požiadavky ako JSON – s limitom veľkosti; vyžaduje Content-Type: application/json
   (cudzie stránky tak nemôžu posielať formuláre v mene návštevníka – prehliadač ich zablokuje) */
function body($maxBytes = 65536) {
  if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) out(['ok' => false, 'error' => 'Neplatná požiadavka'], 415);
  $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
  if (strlen($raw) > $maxBytes) out(['ok' => false, 'error' => 'Požiadavka je príliš veľká'], 413);
  $j = json_decode($raw, true); return is_array($j) ? $j : [];
}
function requirePost() { if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(['ok' => false, 'error' => 'Povolená je len metóda POST'], 405); }
function clientIp() { return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'; }
/* jednoduchý limit počtu pokusov (súbor data/limits.json, uzamknutý počas zápisu)
   $count=false → len kontrola; vráti true, ak je limit prekročený */
function limited($bucket, $max, $windowSec, $count = true) {
  global $DIR;
  $fh = fopen("$DIR/limits.json", 'c+'); if (!$fh) return false;
  flock($fh, LOCK_EX);
  $all = json_decode(stream_get_contents($fh), true) ?: [];
  $now = time(); $key = $bucket . ':' . hash('sha256', clientIp() . SECRET);
  foreach ($all as $k => $ts) { $all[$k] = array_values(array_filter($ts, fn($t) => $t > $now - 86400)); if (!$all[$k]) unset($all[$k]); }
  $hits = array_filter($all[$key] ?? [], fn($t) => $t > $now - $windowSec);
  $over = count($hits) >= $max;
  if ($count && !$over) $all[$key][] = $now;
  ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($all)); fflush($fh); flock($fh, LOCK_UN); fclose($fh);
  return $over;
}
function readJson($f, $def) { return file_exists($f) ? (json_decode(file_get_contents($f), true) ?? $def) : $def; }
function writeJson($f, $d) {
  $tmp = $f . '.tmp';
  file_put_contents($tmp, json_encode($d, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
  rename($tmp, $f);
}
/* prihlasovací token: platnosť + podpis. Kľúč obsahuje aj odtlačok hesla,
   takže po zmene hesla sa všetky staré prihlásenia automaticky zrušia. */
defined('PASSWORD_FINGERPRINT') || define('PASSWORD_FINGERPRINT', hash('sha256', ADMIN_PASSWORD_HASH . '|' . ADMIN_PASSWORD));
function tokenKey() { return hash('sha256', SECRET . '|' . PASSWORD_FINGERPRINT); }
function makeToken() { $exp = time() + TOKEN_HOURS * 3600; $n = bin2hex(random_bytes(8)); return "$exp.$n." . hash_hmac('sha256', "$exp.$n", tokenKey()); }
function authed() {
  if (strlen(SECRET) < 16) return false;
  $p = explode('.', (string)($_SERVER['HTTP_X_LUNA_TOKEN'] ?? ''));
  if (count($p) !== 3 || (int)$p[0] < time() || (int)$p[0] > time() + TOKEN_HOURS * 3600) return false;
  return hash_equals(hash_hmac('sha256', "$p[0].$p[1]", tokenKey()), $p[2]);
}
function requireAuth() { if (!authed()) out(['ok' => false, 'error' => 'Neprihlásený – prihlás sa znova.'], 401); }
function clean($s, $n = 500) { return mb_substr(trim(strip_tags((string)$s)), 0, $n); }

$a = $_GET['a'] ?? '';

switch ($a) {
  case 'get':
    $d = readJson("$DIR/data.json", null);
    out(['ok' => true, 'data' => $d]);

  case 'login':
    requirePost();
    $pw = (string)(body(2048)['password'] ?? '');
    usleep(400000); // spomalenie hádania hesla
    if ((ADMIN_PASSWORD === '' && ADMIN_PASSWORD_HASH === '') || strlen(SECRET) < 16)
      out(['ok' => false, 'error' => 'Heslo do administrácie nie je nastavené (chýba config.php).'], 503);
    // max. 8 chybných pokusov za 15 minút z jednej adresy
    if (limited('login-fail', 8, 900, false)) out(['ok' => false, 'error' => 'Príliš veľa pokusov. Skús to znova o 15 minút.'], 429);
    $good = ADMIN_PASSWORD_HASH ? password_verify($pw, ADMIN_PASSWORD_HASH) : hash_equals(ADMIN_PASSWORD, $pw);
    if (!$good) { limited('login-fail', 8, 900); out(['ok' => false, 'error' => 'Nesprávne heslo'], 403); }
    out(['ok' => true, 'token' => makeToken()]);

  case 'save':
    requirePost();
    requireAuth();
    $d = body(5 * 1024 * 1024);
    if (!isset($d['settings'], $d['events'], $d['products'])) out(['ok' => false, 'error' => 'Neplatné dáta'], 400);
    if (file_exists("$DIR/data.json")) copy("$DIR/data.json", "$DIR/data.backup-" . date('Ymd-His') . ".json");
    // ponechaj len posledných 20 záloh
    $bk = glob("$DIR/data.backup-*.json"); sort($bk);
    while (count($bk) > 20) unlink(array_shift($bk));
    writeJson("$DIR/data.json", $d);
    out(['ok' => true]);

  case 'order':
    requirePost();
    $o = body(20000);
    $c = is_array($o['customer'] ?? null) ? $o['customer'] : [];
    // robot vyplní aj skryté pole „website“ – tvárime sa, že je všetko OK
    if (!empty($o['website']) || !empty($c['website'])) out(['ok' => true, 'id' => 'OBJ-OK']);
    $data = readJson("$DIR/data.json", ['products' => [], 'settings' => []]);
    $s = is_array($data['settings'] ?? null) ? $data['settings'] : [];
    if (($s['showShop'] ?? true) === false) out(['ok' => false, 'error' => 'Obchod je momentálne zatvorený'], 403);
    if (empty($c['name']) || !filter_var($c['email'] ?? '', FILTER_VALIDATE_EMAIL) || empty($o['items']) || !is_array($o['items']) || count($o['items']) > 30)
      out(['ok' => false, 'error' => 'Vyplň všetky údaje'], 400);
    // max. 5 objednávok za hodinu z jednej adresy (ochrana pred spamom a zneužitím e-mailov)
    if (limited('order', 5, 3600)) out(['ok' => false, 'error' => 'Príliš veľa objednávok. Skús to neskôr alebo nám napíš e-mail.'], 429);
    // ceny prepočítaj podľa servera (nie podľa prehliadača)
    $byId = []; foreach (($data['products'] ?? []) as $p) if (($p['active'] ?? true) !== false) $byId[(string)$p['id']] = $p;
    $items = []; $sub = 0;
    foreach ($o['items'] as $it) {
      if (!is_array($it) || !is_scalar($it['id'] ?? null) || !isset($byId[(string)$it['id']])) continue;
      $p = $byId[$it['id']]; $q = max(1, min(99, (int)$it['qty']));
      $items[] = ['id' => $p['id'], 'name' => $p['name'], 'variant' => clean($it['variant'] ?? '', 40), 'qty' => $q, 'price' => (float)$p['price']];
      $sub += $q * (float)$p['price'];
    }
    if (!$items) out(['ok' => false, 'error' => 'Košík je prázdny'], 400);
    $delivery = ($c['delivery'] ?? '') === 'osobny' ? 'osobny' : 'posta';
    $ship = ($delivery === 'osobny' || (!empty($s['freeShippingFrom']) && $sub >= $s['freeShippingFrom'])) ? 0 : (float)($s['shippingPrice'] ?? 0);
    $order = [
      'id' => 'OBJ-' . strtoupper(base_convert((string)round(microtime(true) * 1000), 10, 36)),
      'created' => date('c'), 'status' => 'nová',
      'customer' => array_merge(array_fill_keys(['name', 'email', 'phone', 'street', 'city', 'zip', 'delivery', 'payment', 'note'], ''),
                    array_map(fn($v) => is_scalar($v) ? clean($v, 1000) : '', array_intersect_key($c, array_flip(['name', 'email', 'phone', 'street', 'city', 'zip', 'delivery', 'payment', 'note'])))),
      'items' => $items, 'subtotal' => $sub, 'shipping' => $ship, 'total' => $sub + $ship
    ];
    $orders = readJson("$DIR/orders.json", []);
    if (count($orders) >= 20000) out(['ok' => false, 'error' => 'Objednávku sa nepodarilo uložiť, napíš nám e-mail.'], 507);
    array_unshift($orders, $order);
    writeJson("$DIR/orders.json", $orders);
    // e-maily
    $lines = implode("\n", array_map(fn($i) => "{$i['qty']}× {$i['name']}" . ($i['variant'] ? " ({$i['variant']})" : '') . " – " . number_format($i['qty'] * $i['price'], 2, ',', ' ') . " €", $items));
    $txt = "Objednávka {$order['id']}\n\n$lines\nDoprava: " . number_format($ship, 2, ',', ' ') . " €\nSpolu: " . number_format($order['total'], 2, ',', ' ') . " €\n\n"
         . "{$order['customer']['name']}\n{$order['customer']['street']}, {$order['customer']['zip']} {$order['customer']['city']}\n{$order['customer']['email']} / {$order['customer']['phone']}\n"
         . "Doprava: $delivery, platba: {$order['customer']['payment']}\nPoznámka: {$order['customer']['note']}";
    // adresa obchodu len ak je to platný e-mail (žiadne vložené hlavičky)
    $shop = filter_var($s['shopEmail'] ?? '', FILTER_VALIDATE_EMAIL) ?: '';
    $host = preg_replace('/[^a-z0-9.-]/i', '', $_SERVER['SERVER_NAME'] ?? 'localhost');
    $hdr = "Content-Type: text/plain; charset=utf-8\r\nFrom: Luna obchod <" . ($shop ?: "noreply@$host") . ">";
    $subj = '=?UTF-8?B?' . base64_encode("Luna – objednávka {$order['id']}") . '?=';
    if ($shop) @mail($shop, $subj, $txt, $hdr);
    @mail($order['customer']['email'], $subj, "Ďakujeme za objednávku zo sveta Luny! 🌙\n\n" . $txt, $hdr);
    out(['ok' => true, 'id' => $order['id']]);

  case 'orders':
    requireAuth();
    header('Cache-Control: no-store, private');
    out(['ok' => true, 'orders' => readJson("$DIR/orders.json", [])]);

  case 'saveOrders':
    requirePost();
    requireAuth();
    $ord = body(20 * 1024 * 1024);
    if (!array_is_list($ord)) out(['ok' => false, 'error' => 'Neplatné dáta'], 400);
    writeJson("$DIR/orders.json", $ord);
    out(['ok' => true]);

  case 'subscribe':
    requirePost();
    $b = body(2048);
    if (!empty($b['website'])) out(['ok' => true]);            // robot
    $e = filter_var(trim((string)($b['email'] ?? '')), FILTER_VALIDATE_EMAIL);
    if (!$e || strlen($e) > 254) out(['ok' => false, 'error' => 'Neplatný e-mail'], 400);
    if (limited('subscribe', 5, 3600)) out(['ok' => false, 'error' => 'Príliš veľa pokusov, skús to neskôr.'], 429);
    $subs = readJson("$DIR/subscribers.json", []);
    if (count($subs) >= 50000) out(['ok' => true]);
    if (!in_array($e, array_column($subs, 'email'))) { $subs[] = ['email' => $e, 'date' => date('c'), 'consent' => 'Súhlas so zasielaním noviniek – formulár na webe (zásady v1)']; writeJson("$DIR/subscribers.json", $subs); }
    out(['ok' => true]);

  case 'subscribers':
    requireAuth();
    out(['ok' => true, 'subscribers' => readJson("$DIR/subscribers.json", [])]);

  case 'upload':
    requirePost();
    requireAuth();
    $f = $_FILES['file'] ?? null;
    if (!$f || $f['error'] !== UPLOAD_ERR_OK) out(['ok' => false, 'error' => 'Súbor sa nenahral'], 400);
    if ($f['size'] > 8 * 1024 * 1024) out(['ok' => false, 'error' => 'Max. 8 MB'], 400);
    $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    if (!isset($types[$mime]) || @getimagesize($f['tmp_name']) === false) out(['ok' => false, 'error' => 'Povolené sú len obrázky JPG, PNG, WEBP, GIF'], 400);
    $name = date('Ymd') . '-' . bin2hex(random_bytes(6)) . '.' . $types[$mime];
    if (!move_uploaded_file($f['tmp_name'], "$UP/$name")) out(['ok' => false, 'error' => 'Súbor sa nepodarilo uložiť'], 500);
    @chmod("$UP/$name", 0644);
    out(['ok' => true, 'url' => "uploads/$name"]);

  default:
    out(['ok' => false, 'error' => 'Neznáma akcia'], 404);
}
