<?php
/* ============================================================
   LUNA – jednoduché API pre web (PHP 7.4+ / 8.x, bez databázy)
   Obsah sa ukladá do data/*.json, obrázky do uploads/.
   ============================================================ */

// >>> NASTAV SI HESLO DO ADMINISTRÁCIE <<<
// Bezpečnejšie: vlož sem hash z password_hash('tvoje-heslo', PASSWORD_DEFAULT)
const ADMIN_PASSWORD = 'zmen-ma-luna';
const ADMIN_PASSWORD_HASH = '';           // ak je vyplnený, použije sa namiesto ADMIN_PASSWORD
// Tajný kľúč na podpisovanie prihlásenia – zmeň na ľubovoľný dlhý náhodný text
const SECRET = 'zmen-tento-tajny-kluc-na-nieco-dlhe-a-nahodne';
const TOKEN_HOURS = 12;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$DIR = __DIR__ . '/data';
$UP  = __DIR__ . '/uploads';
if (!is_dir($DIR)) mkdir($DIR, 0755, true);
if (!is_dir($UP))  mkdir($UP, 0755, true);
if (!file_exists("$DIR/.htaccess")) file_put_contents("$DIR/.htaccess", "Require all denied\nDeny from all\n");

function out($a, $code = 200) { http_response_code($code); echo json_encode($a, JSON_UNESCAPED_UNICODE); exit; }
function body() { $j = json_decode(file_get_contents('php://input'), true); return is_array($j) ? $j : []; }
function readJson($f, $def) { return file_exists($f) ? (json_decode(file_get_contents($f), true) ?? $def) : $def; }
function writeJson($f, $d) {
  $tmp = $f . '.tmp';
  file_put_contents($tmp, json_encode($d, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
  rename($tmp, $f);
}
function makeToken() { $exp = time() + TOKEN_HOURS * 3600; return $exp . '.' . hash_hmac('sha256', (string)$exp, SECRET); }
function authed() {
  $t = $_SERVER['HTTP_X_LUNA_TOKEN'] ?? '';
  $p = explode('.', $t);
  if (count($p) !== 2 || (int)$p[0] < time()) return false;
  return hash_equals(hash_hmac('sha256', $p[0], SECRET), $p[1]);
}
function requireAuth() { if (!authed()) out(['ok' => false, 'error' => 'Neprihlásený – prihlás sa znova.'], 401); }
function clean($s, $n = 500) { return mb_substr(trim(strip_tags((string)$s)), 0, $n); }

$a = $_GET['a'] ?? '';

switch ($a) {
  case 'get':
    $d = readJson("$DIR/data.json", null);
    out(['ok' => true, 'data' => $d]);

  case 'login':
    $pw = (string)(body()['password'] ?? '');
    usleep(400000); // spomalenie hádania hesla
    $good = ADMIN_PASSWORD_HASH ? password_verify($pw, ADMIN_PASSWORD_HASH) : hash_equals(ADMIN_PASSWORD, $pw);
    if (!$good) out(['ok' => false, 'error' => 'Nesprávne heslo'], 403);
    out(['ok' => true, 'token' => makeToken()]);

  case 'save':
    requireAuth();
    $d = body();
    if (!isset($d['settings'], $d['events'], $d['products'])) out(['ok' => false, 'error' => 'Neplatné dáta'], 400);
    if (file_exists("$DIR/data.json")) copy("$DIR/data.json", "$DIR/data.backup-" . date('Ymd-His') . ".json");
    // ponechaj len posledných 20 záloh
    $bk = glob("$DIR/data.backup-*.json"); sort($bk);
    while (count($bk) > 20) unlink(array_shift($bk));
    writeJson("$DIR/data.json", $d);
    out(['ok' => true]);

  case 'order':
    $o = body();
    $c = $o['customer'] ?? [];
    if (empty($c['name']) || !filter_var($c['email'] ?? '', FILTER_VALIDATE_EMAIL) || empty($o['items'])) out(['ok' => false, 'error' => 'Vyplň všetky údaje'], 400);
    // ceny prepočítaj podľa servera (nie podľa prehliadača)
    $data = readJson("$DIR/data.json", ['products' => [], 'settings' => []]);
    $byId = []; foreach ($data['products'] as $p) $byId[$p['id']] = $p;
    $items = []; $sub = 0;
    foreach ($o['items'] as $it) {
      if (!isset($byId[$it['id']])) continue;
      $p = $byId[$it['id']]; $q = max(1, min(99, (int)$it['qty']));
      $items[] = ['id' => $p['id'], 'name' => $p['name'], 'variant' => clean($it['variant'] ?? '', 40), 'qty' => $q, 'price' => (float)$p['price']];
      $sub += $q * (float)$p['price'];
    }
    if (!$items) out(['ok' => false, 'error' => 'Košík je prázdny'], 400);
    $s = $data['settings'];
    $delivery = ($c['delivery'] ?? '') === 'osobny' ? 'osobny' : 'posta';
    $ship = ($delivery === 'osobny' || (!empty($s['freeShippingFrom']) && $sub >= $s['freeShippingFrom'])) ? 0 : (float)($s['shippingPrice'] ?? 0);
    $order = [
      'id' => 'OBJ-' . strtoupper(base_convert((string)round(microtime(true) * 1000), 10, 36)),
      'created' => date('c'), 'status' => 'nová',
      'customer' => array_map(fn($v) => clean($v), array_intersect_key($c, array_flip(['name', 'email', 'phone', 'street', 'city', 'zip', 'delivery', 'payment', 'note']))),
      'items' => $items, 'subtotal' => $sub, 'shipping' => $ship, 'total' => $sub + $ship
    ];
    $orders = readJson("$DIR/orders.json", []);
    array_unshift($orders, $order);
    writeJson("$DIR/orders.json", $orders);
    // e-maily
    $lines = implode("\n", array_map(fn($i) => "{$i['qty']}× {$i['name']}" . ($i['variant'] ? " ({$i['variant']})" : '') . " – " . number_format($i['qty'] * $i['price'], 2, ',', ' ') . " €", $items));
    $txt = "Objednávka {$order['id']}\n\n$lines\nDoprava: " . number_format($ship, 2, ',', ' ') . " €\nSpolu: " . number_format($order['total'], 2, ',', ' ') . " €\n\n"
         . "{$order['customer']['name']}\n{$order['customer']['street']}, {$order['customer']['zip']} {$order['customer']['city']}\n{$order['customer']['email']} / {$order['customer']['phone']}\n"
         . "Doprava: $delivery, platba: {$order['customer']['payment']}\nPoznámka: {$order['customer']['note']}";
    $hdr = "Content-Type: text/plain; charset=utf-8\r\nFrom: Luna obchod <" . ($s['shopEmail'] ?? 'noreply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost')) . ">";
    $subj = '=?UTF-8?B?' . base64_encode("Luna – objednávka {$order['id']}") . '?=';
    if (!empty($s['shopEmail'])) @mail($s['shopEmail'], $subj, $txt, $hdr);
    @mail($order['customer']['email'], $subj, "Ďakujeme za objednávku zo sveta Luny! 🌙\n\n" . $txt, $hdr);
    out(['ok' => true, 'id' => $order['id']]);

  case 'orders':
    requireAuth();
    out(['ok' => true, 'orders' => readJson("$DIR/orders.json", [])]);

  case 'saveOrders':
    requireAuth();
    writeJson("$DIR/orders.json", body());
    out(['ok' => true]);

  case 'subscribe':
    $e = filter_var(body()['email'] ?? '', FILTER_VALIDATE_EMAIL);
    if (!$e) out(['ok' => false, 'error' => 'Neplatný e-mail'], 400);
    $subs = readJson("$DIR/subscribers.json", []);
    if (!in_array($e, array_column($subs, 'email'))) { $subs[] = ['email' => $e, 'date' => date('c')]; writeJson("$DIR/subscribers.json", $subs); }
    out(['ok' => true]);

  case 'subscribers':
    requireAuth();
    out(['ok' => true, 'subscribers' => readJson("$DIR/subscribers.json", [])]);

  case 'upload':
    requireAuth();
    $f = $_FILES['file'] ?? null;
    if (!$f || $f['error'] !== UPLOAD_ERR_OK) out(['ok' => false, 'error' => 'Súbor sa nenahral'], 400);
    if ($f['size'] > 8 * 1024 * 1024) out(['ok' => false, 'error' => 'Max. 8 MB'], 400);
    $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    if (!isset($types[$mime])) out(['ok' => false, 'error' => 'Povolené sú len obrázky JPG, PNG, WEBP, GIF'], 400);
    $name = date('Ymd') . '-' . bin2hex(random_bytes(6)) . '.' . $types[$mime];
    move_uploaded_file($f['tmp_name'], "$UP/$name");
    out(['ok' => true, 'url' => "uploads/$name"]);

  default:
    out(['ok' => false, 'error' => 'Neznáma akcia'], 404);
}
