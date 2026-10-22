<?php
/**
 * Image Delivery Endpoint untuk Open Graph / WhatsApp Preview
 * SAKO Ma'arif NU Jawa Barat - Rumahweb Hosting
 *
 * Endpoint ini menjamin bot sosial media (WhatsApp, Facebook, Twitter, Telegram)
 * mendapatkan file gambar fisik/biner asli (bukan data Base64 mentah)
 * sehingga kartu pratinjau berita selalu memuat foto beritanya.
 */

$id = isset($_GET['id']) ? trim($_GET['id']) : '';

if (!$id) {
    serveDefaultImage();
    exit;
}

// Bersihkan nama ID agar aman untuk penamaan file cache
$cleanId = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
$cacheDir = __DIR__ . '/../uploads/cache/';
$cacheFile = $cacheDir . $cleanId . '.jpg';

// 1. Sajikan dari file cache fisik jika sudah ada (sangat cepat & hemat resource)
if (file_exists($cacheFile) && filesize($cacheFile) > 0) {
    serveFile($cacheFile, 'image/jpeg');
    exit;
}

// 2. Query ke Database MySQL
$article = null;
try {
    require_once __DIR__ . '/db.php';
    $db = getDbConnection();
    $stmt = $db->prepare("SELECT `id`, `image` FROM `sako_news` WHERE `id` = ? OR `slug` = ? LIMIT 1");
    $stmt->execute([$id, $id]);
    $article = $stmt->fetch();
} catch (Exception $e) {
    // Database connection fallback
}

if (!$article || empty($article['image'])) {
    serveDefaultImage();
    exit;
}

$rawImage = $article['image'];

// KASUS 1: Gambar tersimpan sebagai Base64 Data URL (data:image/...)
if (preg_match('/^data:(image\/[a-zA-Z0-9.-]+);base64,(.+)$/s', $rawImage, $matches)) {
    $mimeType = strtolower($matches[1]);
    $binaryData = base64_decode($matches[2]);

    if ($binaryData !== false && strlen($binaryData) > 0) {
        // Tentukan ekstensi cache
        $ext = (strpos($mimeType, 'png') !== false) ? 'png' : 'jpg';
        $finalCacheFile = $cacheDir . $cleanId . '.' . $ext;

        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0755, true);
        }
        @file_put_contents($finalCacheFile, $binaryData);

        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . strlen($binaryData));
        header('Cache-Control: public, max-age=604800'); // Cache 7 hari
        echo $binaryData;
        exit;
    }
}

// KASUS 2: Gambar berupa path relatif (misal: uploads/sako_... atau assets/images/...)
$localPath = __DIR__ . '/../' . ltrim($rawImage, '/');
if (file_exists($localPath) && is_file($localPath)) {
    $ext = strtolower(pathinfo($localPath, PATHINFO_EXTENSION));
    $mime = ($ext === 'png') ? 'image/png' : (($ext === 'webp') ? 'image/webp' : 'image/jpeg');
    serveFile($localPath, $mime);
    exit;
}

// KASUS 3: Gambar berupa URL eksternal (http...)
if (strpos($rawImage, 'http') === 0) {
    header('Location: ' . $rawImage, true, 302);
    exit;
}

serveDefaultImage();
exit;

function serveFile($path, $mime) {
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($path));
    header('Cache-Control: public, max-age=604800');
    readfile($path);
}

function serveDefaultImage() {
    $defaultPath = __DIR__ . '/../assets/images/kemah2.png';
    if (file_exists($defaultPath)) {
        header('Content-Type: image/png');
        header('Content-Length: ' . filesize($defaultPath));
        header('Cache-Control: public, max-age=604800');
        readfile($defaultPath);
    } else {
        http_response_code(404);
        echo "Image not found";
    }
}
