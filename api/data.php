<?php
/**
 * REST API Data Manager (MySQL Backend)
 * SAKO Ma'arif NU Jawa Barat - Rumahweb Hosting
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

// 1. CEK KONEKSI STATUS
if ($action === 'status') {
    try {
        $db = getDbConnection();
        $db->query("SELECT 1");
        echo json_encode([
            'success' => true,
            'status' => 'connected',
            'message' => 'Database MySQL Rumahweb terhubung dan aktif',
            'time' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'status' => 'disconnected',
            'error' => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// 2. ENDPOINT GET (AMBIL DATA)
if ($method === 'GET') {
    $db = getDbConnection();

    // Ambil Pengaturan (tentang, visimisi, kepengurusan, hero_slideshow)
    if ($action === 'get_setting') {
        $key = isset($_GET['key']) ? trim($_GET['key']) : '';
        if (!$key) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Parameter key diperlukan'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $db->prepare("SELECT content FROM sako_settings WHERE `key` = ? LIMIT 1");
        $stmt->execute([$key]);
        $row = $stmt->fetch();

        if ($row && !empty($row['content'])) {
            $parsed = json_decode($row['content'], true);
            echo json_encode(['success' => true, 'data' => $parsed], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'data' => null, 'message' => 'Data tidak ditemukan'], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }

    // Ambil Daftar Berita
    if ($action === 'get_news') {
        $stmt = $db->prepare("SELECT * FROM sako_news ORDER BY `date` DESC, `updated_at` DESC");
        $stmt->execute();
        $rows = $stmt->fetchAll();
        $items = [];
        foreach ($rows as $row) {
            $row['featured'] = (bool)$row['featured'];
            $items[] = $row;
        }
        echo json_encode(['success' => true, 'data' => $items], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// 3. ENDPOINT POST (SIMPAN ATAU HAPUS DATA)
if ($method === 'POST') {
    $db = getDbConnection();
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    // Simpan Pengaturan (Tentang, Visi Misi, Kepengurusan, Slideshow)
    if ($action === 'save_setting') {
        $key = isset($payload['key']) ? trim($payload['key']) : '';
        $data = isset($payload['data']) ? $payload['data'] : null;

        if (!$key || $data === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Parameter key dan data wajib diisi'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $jsonStr = json_encode($data, JSON_UNESCAPED_UNICODE);
        $stmt = $db->prepare("
            INSERT INTO sako_settings (`key`, `content`, `updated_at`)
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `updated_at` = NOW()
        ");
        $stmt->execute([$key, $jsonStr]);

        echo json_encode(['success' => true, 'message' => 'Pengaturan ' . $key . ' berhasil disimpan'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Simpan Satu Berita (Tambah / Edit)
    if ($action === 'save_news') {
        $item = $payload;
        if (!isset($item['id']) || empty($item['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID Berita wajib diisi'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $id = $item['id'];
        $title = $item['title'] ?? 'Tanpa Judul';
        $slug = $item['slug'] ?? ($id . '.html');
        $category = $item['category'] ?? 'Berita';
        $author = $item['author'] ?? 'SAKOMA';
        $date = !empty($item['date']) ? $item['date'] : date('Y-m-d');
        $dateFormatted = $item['dateFormatted'] ?? ($item['dateformatted'] ?? date('d F Y'));
        $image = $item['image'] ?? '';
        $featured = !empty($item['featured']) ? 1 : 0;
        $excerpt = $item['excerpt'] ?? '';
        $content = $item['content'] ?? '';

        $stmt = $db->prepare("
            INSERT INTO sako_news 
            (id, title, slug, category, author, date, dateFormatted, image, featured, excerpt, content, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            slug = VALUES(slug),
            category = VALUES(category),
            author = VALUES(author),
            date = VALUES(date),
            dateFormatted = VALUES(dateFormatted),
            image = VALUES(image),
            featured = VALUES(featured),
            excerpt = VALUES(excerpt),
            content = VALUES(content),
            updated_at = NOW()
        ");

        $stmt->execute([$id, $title, $slug, $category, $author, $date, $dateFormatted, $image, $featured, $excerpt, $content]);
        echo json_encode(['success' => true, 'message' => 'Berita berhasil disimpan'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Simpan Seluruh Berita (Bulk Sync)
    if ($action === 'save_news_all') {
        $newsList = isset($payload['news']) ? $payload['news'] : [];
        $db->beginTransaction();
        try {
            $db->exec("DELETE FROM sako_news");
            $stmt = $db->prepare("
                INSERT INTO sako_news 
                (id, title, slug, category, author, date, dateFormatted, image, featured, excerpt, content, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            foreach ($newsList as $item) {
                $featured = !empty($item['featured']) ? 1 : 0;
                $stmt->execute([
                    $item['id'],
                    $item['title'] ?? '',
                    $item['slug'] ?? ($item['id'] . '.html'),
                    $item['category'] ?? 'Berita',
                    $item['author'] ?? 'SAKOMA',
                    $item['date'] ?? date('Y-m-d'),
                    $item['dateFormatted'] ?? ($item['dateformatted'] ?? date('d F Y')),
                    $item['image'] ?? '',
                    $featured,
                    $item['excerpt'] ?? '',
                    $item['content'] ?? ''
                ]);
            }
            $db->commit();
            echo json_encode(['success' => true, 'message' => 'Seluruh berita berhasil disinkronkan'], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }

    // Hapus Berita
    if ($action === 'delete_news') {
        $id = $payload['id'] ?? ($_GET['id'] ?? '');
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID Berita wajib diisi'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $db->prepare("DELETE FROM sako_news WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Berita berhasil dihapus'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Action API tidak dikenali'], JSON_UNESCAPED_UNICODE);
