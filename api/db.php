<?php
/**
 * Konfigurasi Database MySQL Rumahweb
 * SAKO Ma'arif NU Jawa Barat
 *
 * Petunjuk:
 * Ubah DB_NAME, DB_USER, dan DB_PASS sesuai dengan database
 * yang Anda buat melalui MySQL Database Wizard di cPanel Rumahweb.
 */

// Konfigurasi Database (Ganti sesuai akun cPanel Anda)
define('DB_HOST', 'localhost');
define('DB_NAME', 'user_sakodb');        // Ganti dengan Nama Database cPanel Anda (contoh: cpaneluser_sakodb)
define('DB_USER', 'user_sakouser');      // Ganti dengan Username Database cPanel Anda
define('DB_PASS', 'PasswordDBAnda123!'); // Ganti dengan Password User Database cPanel Anda

/**
 * Mendapatkan koneksi PDO Database MySQL
 * @return PDO
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Koneksi database MySQL gagal. Periksa konfigurasi di api/db.php.',
                'details' => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    return $pdo;
}
