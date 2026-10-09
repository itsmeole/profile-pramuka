-- ============================================================
-- SKEMA & DATA AWAL DATABASE MYSQL RUMAHWEB HOSTING
-- SAKO PANDU MA'ARIF NU JAWA BARAT
-- ============================================================
-- Petunjuk Penggunaan:
-- 1. Login ke cPanel Rumahweb > Buka phpMyAdmin
-- 2. Pilih nama database yang telah Anda buat
-- 3. Klik menu "Import" di bilah atas
-- 4. Pilih file database.sql ini, lalu klik tombol "Go / Impor"
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. STRUKTUR TABEL `sako_settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sako_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(64) UNIQUE NOT NULL,
    `content` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. STRUKTUR TABEL `sako_news`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sako_news` (
    `id` VARCHAR(100) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255),
    `category` VARCHAR(100) DEFAULT 'Berita',
    `author` VARCHAR(100) DEFAULT 'SAKOMA',
    `date` DATE,
    `dateFormatted` VARCHAR(100),
    `image` LONGTEXT,
    `featured` TINYINT(1) DEFAULT 0,
    `excerpt` TEXT,
    `content` LONGTEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. DATA AWAL (SEED DATA) BERITA
-- --------------------------------------------------------
INSERT INTO `sako_news` (`id`, `title`, `slug`, `category`, `author`, `date`, `dateFormatted`, `image`, `featured`, `excerpt`, `content`) VALUES
('kemah-santri-2026', 'Kemah Santri Pramuka Terpadu Sako Maarif NU Jawa Barat 2026', 'artikel-kemah-santri.html', 'Kemah Santri', 'SAKOMA', '2026-09-26', '26 September 2026', 'assets/images/kemah1.png', 1, 'Kemah Santri Pramuka Terpadu Sako Pandu Maarif NU Jawa Barat 2026 sukses diselenggarakan dengan penuh semangat kepanduan dan nilai-nilai religius.', 'Kemah Santri Pramuka Terpadu Sako Pandu Maarif NU Jawa Barat 2026 resmi ditutup dengan khidmat. Kegiatan yang berlangsung selama tiga hari di Bumi Perkemahan Kiara Payung, Sumedang ini berhasil menghimpun ribuan pramuka santri dari berbagai pondok pesantren dan madrasah Maarif se-Jawa Barat.'),
('kmd-sako-2026', 'KMD SAKO – Kursus Mahir Dasar Pramuka 2026', 'artikel-kmd.html', 'Pelatihan', 'SAKOMA', '2026-09-24', '24 September 2026', 'assets/images/kemah2.png', 0, 'Kursus Mahir Dasar (KMD) Pramuka Sako Pandu Maarif NU Jawa Barat. Tingkatkan Kompetensi, Bangun Karakter, Siapkan Pembina Hebat!', 'Kursus Mahir Dasar (KMD) Pramuka Sako Pandu Maarif NU Jawa Barat merupakan program pelatihan resmi berstandar kepramukaan nasional yang diselenggarakan untuk mencetak pembina-pembina pramuka yang kompeten, berakhlak mulia, dan berakar pada nilai-nilai ke-NU-an.'),
('rakerda-sako-2026', 'Rapat Kerja Daerah Sako Pandu Maarif NU Jawa Barat 2026', 'artikel-kmd.html', 'Organisasi', 'SAKOMA', '2026-09-20', '20 September 2026', 'assets/images/kemah3.png', 0, 'Konsolidasi organisasi dan perumusan arah program strategis pembinaan kepramukaan santri se-Jawa Barat menuju kemandirian gugus depan.', 'Rapat Kerja Daerah (Rakerda) Sako Pandu Maarif NU Jawa Barat sukses menetapkan arah kebijakan strategis organisasi. Agenda difokuskan pada penguatan sinergi gugus depan madrasah, standardisasi mutu pembina, serta peningkatan kemandirian organisasi.'),
('bakti-lingkungan-2026', 'Aksi Peduli Lingkungan & Gerakan Pramuka Menanam Sako NU', 'artikel-kmd.html', 'Bakti Masyarakat', 'SAKOMA', '2026-09-15', '15 September 2026', 'assets/images/kemah4.png', 0, 'Wujud kepedulian Pramuka Sako Maarif NU terhadap kelestarian alam melalui aksi penanaman pohon dan edukasi ramah lingkungan.', 'Sebagai pengejawantahan dari Dasa Darma Pramuka dan ajaran Islam ramah lingkungan, Sako Pandu Maarif NU Jawa Barat menggelar bakti lingkungan di kawasan perkemahan. Aksi ini menanamkan kesadaran ekologis bagi para santri.')
ON DUPLICATE KEY UPDATE `id` = `id`;

COMMIT;
