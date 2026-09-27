-- ============================================================
-- SKEMA DATABASE CLOUD SUPABASE UNTUK SAKO MA'ARIF NU JABAR
-- ============================================================
-- Petunjuk Penggunaan:
-- 1. Buat project baru di https://supabase.com (Gratis)
-- 2. Buka menu "SQL Editor" di sidebar kiri Supabase dashboard
-- 3. Tempel (Paste) seluruh kode SQL ini, lalu klik tombol "Run"
-- 4. Buka Project Settings > API, lalu salin "Project URL" dan "anon / public key"
-- 5. Masukkan ke panel Admin SAKO (/riki) pada menu "Database Cloud"
-- ============================================================

-- 1. TABEL PENGATURAN KONTEN (Tentang Kami, Visi Misi, Kepengurusan)
CREATE TABLE IF NOT EXISTS public.sako_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL BERITA DAN KEGIATAN
CREATE TABLE IF NOT EXISTS public.sako_news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  category TEXT DEFAULT 'Berita',
  author TEXT DEFAULT 'SAKOMA',
  date DATE DEFAULT CURRENT_DATE,
  dateFormatted TEXT,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  excerpt TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.sako_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sako_news ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Publik dapat membaca, Pengguna/Admin dapat mengubah)
-- Kebijakan baca terbuka untuk semua pengunjung website
CREATE POLICY "Public Read Settings" ON public.sako_settings
  FOR SELECT USING (true);

CREATE POLICY "Public Read News" ON public.sako_news
  FOR SELECT USING (true);

-- Kebijakan modifikasi (insert/update/delete)
-- Izinkan modifikasi dengan anon key atau authenticated user
CREATE POLICY "Allow All Ops for Settings" ON public.sako_settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow All Ops for News" ON public.sako_news
  FOR ALL USING (true) WITH CHECK (true);

-- 5. STORAGE BUCKET UNTUK UPLOAD GAMBAR (Opsional)
INSERT INTO storage.buckets (id, name, public)
VALUES ('sako-media', 'sako-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'sako-media');

CREATE POLICY "Authenticated Upload Storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'sako-media');

CREATE POLICY "Authenticated Update Storage" ON storage.objects
  FOR UPDATE USING (bucket_id = 'sako-media');
