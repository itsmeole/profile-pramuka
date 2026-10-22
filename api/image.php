<?php
/**
 * Image Delivery Endpoint untuk Open Graph / WhatsApp Preview
 * SAKO Ma'arif NU Jawa Barat - Rumahweb Hosting
 *
 * Mengoptimalkan foto berita menjadi format Banner Landscape (1200x630 px, rasio 1.91:1)
 * dengan kompresi JPEG < 250 KB agar WhatsApp, Facebook, dan Twitter selalu
 * menampilkan kartu pratinjau besar (Large Image Card / Header Preview seperti Instagram),
 * bukan thumbnail kecil di samping teks.
 */

$id = isset($_GET['id']) ? trim($_GET['id']) : '';

if (!$id) {
    serveDefaultImage();
    exit;
}

// Bersihkan nama ID agar aman untuk penamaan file cache
$cleanId = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
$cacheDir = __DIR__ . '/../uploads/cache/';
$bannerFile = $cacheDir . $cleanId . '_banner.jpg';
$forceRefresh = isset($_GET['refresh']) || isset($_GET['force']);

// 1. Sajikan dari file cache banner jika sudah ada dan tidak dipaksa refresh
if (!$forceRefresh && file_exists($bannerFile) && filesize($bannerFile) > 0) {
    serveFile($bannerFile, 'image/jpeg');
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
$binaryData = null;

// Ekstrak data biner dari berbagai format penyimpanan gambar:
if (preg_match('/^data:(image\/[a-zA-Z0-9.-]+);base64,(.+)$/s', $rawImage, $matches)) {
    // Kasus Base64 Data URL
    $binaryData = base64_decode($matches[2]);
} elseif (strpos($rawImage, 'http') === 0) {
    // Kasus URL eksternal
    $context = stream_context_create(['http' => ['timeout' => 5]]);
    $binaryData = @file_get_contents($rawImage, false, $context);
} else {
    // Kasus path lokal relatif
    $localPath = __DIR__ . '/../' . ltrim($rawImage, '/');
    if (file_exists($localPath) && is_file($localPath)) {
        $binaryData = @file_get_contents($localPath);
    }
}

if (!$binaryData) {
    serveDefaultImage();
    exit;
}

// 3. Buat banner landscape 1200 x 630 px menggunakan GD (standar WhatsApp Large Card)
if (function_exists('imagecreatefromstring') && function_exists('imagecreatetruecolor')) {
    $srcImg = @imagecreatefromstring($binaryData);
    if ($srcImg) {
        $origW = imagesx($srcImg);
        $origH = imagesy($srcImg);

        $targetW = 1200;
        $targetH = 630;
        $targetRatio = $targetW / $targetH; // 1.9047
        $srcRatio = $origW / $origH;

        if ($srcRatio > $targetRatio) {
            // Gambar sumber lebih lebar: potong sisi kanan dan kiri
            $cropH = $origH;
            $cropW = (int)($origH * $targetRatio);
            $cropX = (int)(($origW - $cropW) / 2);
            $cropY = 0;
        } else {
            // Gambar sumber lebih tinggi (kotak/portrait): potong atas dan bawah secara terukur
            $cropW = $origW;
            $cropH = (int)($origW / $targetRatio);
            $cropX = 0;
            // Fokus sedikit ke area tengah-atas agar wajah/objek utama tidak terpotong
            $cropY = (int)(($origH - $cropH) * 0.35);
            if ($cropY < 0) $cropY = 0;
        }

        $canvas = imagecreatetruecolor($targetW, $targetH);
        
        // Background putih jika sumber memiliki transparansi
        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefilledrectangle($canvas, 0, 0, $targetW, $targetH, $white);

        imagecopyresampled($canvas, $srcImg, 0, 0, $cropX, $cropY, $targetW, $targetH, $cropW, $cropH);
        imagedestroy($srcImg);

        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0755, true);
        }

        // Kompresi kualitas 82 menghasilkan file ~80-160 KB (aman di bawah batas 300 KB WhatsApp)
        imagejpeg($canvas, $bannerFile, 82);
        imagedestroy($canvas);

        serveFile($bannerFile, 'image/jpeg');
        exit;
    }
}

// 4. Fallback jika GD tidak tersedia: simpan dan sajikan data biner asli
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}
@file_put_contents($bannerFile, $binaryData);
serveFile($bannerFile, 'image/jpeg');
exit;

function serveFile($path, $mime) {
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($path));
    header('Cache-Control: public, max-age=604800'); // Cache 7 hari
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
