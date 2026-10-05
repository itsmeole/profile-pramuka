<?php
/**
 * Upload Image API Endpoint
 * SAKO Ma'arif NU Jawa Barat - Rumahweb Hosting
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Metode request tidak diizinkan'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File tidak ditemukan atau terjadi kesalahan saat upload'], JSON_UNESCAPED_UNICODE);
    exit;
}

$file = $_FILES['file'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Format file tidak diizinkan. Gunakan JPG, PNG, WEBP, atau GIF'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Batas maksimal 8MB
if ($file['size'] > 8 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Ukuran file melebihi batas 8MB'], JSON_UNESCAPED_UNICODE);
    exit;
}

$targetDir = __DIR__ . '/../uploads/';
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$newFileName = 'sako_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$targetPath = $targetDir . $newFileName;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode([
        'success' => true,
        'url' => 'uploads/' . $newFileName,
        'filename' => $newFileName,
        'message' => 'Foto berhasil diunggah'
    ], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Gagal memindahkan file ke folder uploads hosting'], JSON_UNESCAPED_UNICODE);
}
