<?php
/**
 * Server-Side Open Graph & Meta Handler untuk Berita SAKO Ma'arif NU Jabar
 * Memastikan gambar, judul, dan ringkasan berita tampil sempurna saat dibagikan ke WhatsApp, FB, Telegram, dll.
 */

$reqId = isset($_GET['id']) ? trim($_GET['id']) : '';
$article = null;

// Coba ambil data berita dari database MySQL jika ada parameter id
if ($reqId) {
    try {
        if (file_exists(__DIR__ . '/api/db.php')) {
            require_once __DIR__ . '/api/db.php';
            $db = getDbConnection();
            $stmt = $db->prepare("SELECT * FROM sako_news WHERE id = ? OR slug = ? LIMIT 1");
            $stmt->execute([$reqId, $reqId]);
            $article = $stmt->fetch();
        }
    } catch (Exception $e) {
        // Fallback jika database belum aktif atau terjadi error koneksi
    }
}

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "https://";
$host = !empty($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'sakomaarifnujabar.org';
$baseUrl = $protocol . $host;

// Nilai bawaan jika bukan artikel dinamis atau data di DB tidak ditemukan
$title = $article && !empty($article['title']) 
    ? htmlspecialchars($article['title']) . " | SAKO Ma'arif NU Jawa Barat"
    : "KMD SAKO – Kursus Mahir Dasar Pramuka 2026 | SAKO Ma'arif NU Jawa Barat";

$rawDesc = $article && !empty($article['excerpt']) 
    ? $article['excerpt'] 
    : ($article && !empty($article['content']) ? substr(strip_tags($article['content']), 0, 160) : "Kursus Mahir Dasar (KMD) Pramuka Sako Pandu Maarif NU Jawa Barat. Tingkatkan Kompetensi, Bangun Karakter, Siapkan Pembina Hebat!");
$desc = htmlspecialchars($rawDesc);

$image = $baseUrl . "/assets/images/kemah2.png";
$imageType = "image/png";

if ($article && !empty($article['image'])) {
    $rawImg = $article['image'];
    if (strpos($rawImg, 'data:image/') === 0) {
        // Gambar tersimpan sebagai Base64 di database:
        // Arahkan ke endpoint biner api/image.php agar WhatsApp crawler dapat membacanya sebagai gambar asli
        $cleanId = preg_replace('/[^a-zA-Z0-9_-]/', '', $reqId);
        $image = $baseUrl . "/api/image.php?id=" . urlencode($cleanId);
        $imageType = (strpos($rawImg, 'image/png') !== false) ? "image/png" : "image/jpeg";
    } elseif (strpos($rawImg, 'http') === 0) {
        $image = $rawImg;
        $imageType = (strpos($rawImg, '.png') !== false) ? "image/png" : "image/jpeg";
    } else {
        $image = $baseUrl . '/' . ltrim($rawImg, '/');
        $imageType = (strpos($rawImg, '.png') !== false) ? "image/png" : "image/jpeg";
    }
}

$pageUrl = $baseUrl . '/artikel-kmd.html' . ($reqId ? '?id=' . urlencode($reqId) : '');

// Baca file template artikel-kmd.html
$templateFile = __DIR__ . '/artikel-kmd.html';
if (!file_exists($templateFile)) {
    http_response_code(404);
    echo "Halaman artikel tidak ditemukan.";
    exit;
}

$html = file_get_contents($templateFile);

// Ganti tag <title>
$html = preg_replace('/<title>.*?<\/title>/is', "<title>{$title}</title>", $html);

// Ganti meta description
$html = preg_replace('/<meta\s+name=["\']description["\']\s+content=["\'].*?["\']\s*\/?>/is', "<meta name=\"description\" content=\"{$desc}\" />", $html);

// Ganti Open Graph Meta Tags
$html = preg_replace('/<meta\s+property=["\']og:title["\']\s+content=["\'].*?["\']\s*\/?>/is', "<meta property=\"og:title\" content=\"{$title}\" />", $html);
$html = preg_replace('/<meta\s+property=["\']og:description["\']\s+content=["\'].*?["\']\s*\/?>/is', "<meta property=\"og:description\" content=\"{$desc}\" />", $html);
$html = preg_replace('/<meta\s+property=["\']og:image["\']\s+content=["\'].*?["\']\s*\/?>/is', "<meta property=\"og:image\" content=\"{$image}\" />", $html);
$html = preg_replace('/<meta\s+property=["\']og:image:secure_url["\']\s+content=["\'].*?["\']\s*\/?>/is', "<meta property=\"og:image:secure_url\" content=\"{$image}\" />", $html);
$html = preg_replace('/<meta\s+property=["\']og:url["\']\s+content=["\'].*?["\']\s*\/?>/is', "<meta property=\"og:url\" content=\"{$pageUrl}\" />", $html);

// Ganti Twitter Cards
$html = preg_replace('/<meta\s+name=["\']twitter:title["\']\s+content=["\'].*?["\']\s*\/?>/is', "<meta name=\"twitter:title\" content=\"{$title}\" />", $html);
$html = preg_replace('/<meta\s+name=["\']twitter:description["\']\s+content=["\'].*?["\']\s*\/?>/is', "<meta name=\"twitter:description\" content=\"{$desc}\" />", $html);
$html = preg_replace('/<meta\s+name=["\']twitter:image["\']\s+content=["\'].*?["\']\s*\/?>/is', "<meta name=\"twitter:image\" content=\"{$image}\" />", $html);

header('Content-Type: text/html; charset=utf-8');
echo $html;
