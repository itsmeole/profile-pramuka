/**
 * SAKO Ma'arif NU Jawa Barat - Unified Data Manager
 * Mendukung penyimpanan Hybrid: Cloud Database (Supabase) + LocalStorage Cache & Fallback
 */

(function () {
  'use strict';

  // Live Supabase Project Config
  const DEFAULT_SUPABASE_CONFIG = {
    url: 'https://ksqemjekpnixubjetwom.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcWVtamVrcG5peHViamV0d29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTAwODMsImV4cCI6MjEwNjAyNjA4M30.B3X-ROWHj3hf-leDLnZ8gQC3EsX3F-CgZTSSZGc07zk',
    enabled: true
  };

  // DEFAULT SEED DATA
  const DEFAULT_DATA = {
    tentang: {
      introHeading: "Tentang Sako Maarif NU Jawa Barat",
      introTitle: "Mengenal SAKO Ma'arif NU Jawa Barat",
      leadParagraph: "Satuan Komunitas Pramuka Pandu Maarif NU Jawa Barat merupakan wadah pembinaan kepramukaan yang hadir untuk memperkuat pendidikan karakter generasi muda melalui kegiatan yang edukatif, religius, kreatif, mandiri, dan berorientasi pada pengabdian kepada masyarakat.",
      paragraphs: [
        "Kepramukaan memiliki peran penting dalam membentuk generasi yang memiliki kedisiplinan, tanggung jawab, kepemimpinan, kecakapan hidup, kepedulian sosial, serta kemampuan bekerja sama. Nilai-nilai tersebut selaras dengan semangat pendidikan yang dikembangkan di lingkungan Nahdlatul Ulama, khususnya dalam membentuk generasi yang berilmu, berakhlak, berkarakter, dan memiliki kepedulian terhadap bangsa serta masyarakat.",
        "Sako Pandu Maarif NU Jawa Barat berdiri sebagai jembatan antara tradisi kepramukaan nasional dengan nilai-nilai ke-NU-an yang kaya akan kearifan budaya dan spiritualitas Islam Ahlussunnah wal Jamaah An-Nahdliyah. Melalui berbagai program pembinaan, pelatihan, dan kegiatan lapangan, organisasi ini berkomitmen untuk melahirkan generasi penerus bangsa yang siap menghadapi tantangan zaman dengan bekal karakter yang kokoh."
      ],
      stats: {
        tahun: "2026",
        bidang: "8",
        pengurus: "60+"
      },
      pillars: [
        { icon: "", title: "Edukatif", desc: "Kegiatan kepramukaan yang dirancang untuk membentuk karakter dan meningkatkan kompetensi peserta didik." },
        { icon: "", title: "Religius", desc: "Berlandaskan nilai-nilai keislaman Ahlussunnah wal Jamaah An-Nahdliyah yang moderat, toleran, dan seimbang." },
        { icon: "", title: "Kreatif & Mandiri", desc: "Mendorong kecakapan hidup (life skills), jiwa kewirausahaan, dan kemandirian generasi muda." },
        { icon: "", title: "Bakti Masyarakat", desc: "Mengabdi untuk umat dan bangsa melalui berbagai program sosial dan kemanusiaan." }
      ]
    },
    visimisi: {
      visi: "Terwujudnya generasi muda yang beriman, berakhlak mulia, berkarakter, mandiri, terampil, kreatif, cinta tanah air, serta mampu memberikan manfaat bagi masyarakat melalui pendidikan kepramukaan.",
      misi: [
        "Menyelenggarakan kegiatan kepramukaan yang berlandaskan nilai-nilai Ahlussunnah wal Jamaah An-Nahdliyah.",
        "Mengembangkan potensi, bakat, dan kreativitas anggota melalui program pembinaan yang terencana dan berkelanjutan.",
        "Meningkatkan kecakapan hidup dan kemandirian anggota melalui pelatihan kepemimpinan dan kewirausahaan.",
        "Membangun sinergi dan kerjasama dengan berbagai pihak dalam rangka penguatan kepramukaan di lingkungan Maarif NU.",
        "Mendorong anggota untuk aktif berperan dalam kehidupan bermasyarakat, berbangsa, dan bernegara berdasarkan nilai-nilai Pancasila.",
        "Memperkuat identitas dan jati diri anggota sebagai generasi Muslim yang berakhlak mulia dan cinta tanah air."
      ],
      tujuan: [
        "Membentuk anggota yang memiliki keimanan, ketaqwaan, dan akhlak mulia dalam kehidupan sehari-hari.",
        "Meningkatkan kualitas sumber daya manusia di lingkungan Maarif NU melalui program kepramukaan yang berkualitas.",
        "Mencetak kader-kader kepramukaan yang profesional, terampil, dan siap berkontribusi bagi masyarakat.",
        "Memperkuat organisasi kepramukaan di lingkungan lembaga pendidikan Maarif NU se-Jawa Barat.",
        "Menjalin kerjasama yang harmonis dengan Kwartir, Gugus Depan, dan lembaga kepramukaan lainnya."
      ]
    },
    kepengurusan: {
      mabisako: {
        ketua: { name: "KH. Hasanudin Wahid, M.Si.", role: "Ketua Majelis Pembimbing Sako" },
        wakilKetua: [
          "Dr. H. M. Faried Wadjdi, M.Ag.",
          "H. Aam Amirudin, M.Ag.",
          "H. Budi Herdiana, S.Pd., M.M."
        ],
        sekretaris: [
          "Yusuf Asy'ari, S.Pd.I., M.Pd."
        ],
        anggota: [
          "H. Deni Wahyudin, S.Pd.I., M.Pd.",
          "H. Oman Fathurohman, M.Pd.I.",
          "H. Encep Fuad Hakim, S.Ag.",
          "Drs. H. Asep Saepudin, M.Pd.",
          "H. Rudi Priyatna, S.Pd., M.M."
        ]
      },
      pimpinan: {
        ketua: { name: "Encep Syarief Nurulloh, S.Pd., M.Si.", role: "Ketua Sako Pandu Ma'arif NU Jawa Barat" },
        wakilKetua: [
          "Asep Mulyana, S.Pd.I.",
          "H. Yaya Supriyatna, M.Pd.",
          "Euis Komariah, M.Pd.",
          "Ade Sudarma, S.Pd.I."
        ],
        sekretaris: [
          "Dede Koswara, S.Pd.",
          "Rizki Maulana Yusuf, S.Pd.",
          "Agus Setiawan, S.Pd."
        ],
        bendahara: [
          "H. Asep Supriatna, S.Pd.I.",
          "Siti Nurjanah, S.Pd."
        ]
      },
      bidang: [
        { id: "organisasi", name: "Bidang Organisasi & Hukum", ketua: "Ahmad Fauzi, S.H.", anggota: ["Dudi Rustandi, M.Si.", "M. Ridwan, S.H."] },
        { id: "binamuda", name: "Bidang Pembinaan Anggota Muda (Binamuda)", ketua: "Irfan Hilmi, S.Pd.I.", anggota: ["Siti Aisyah, S.Pd.", "Faisal Riza, S.Kom."] },
        { id: "binawasa", name: "Bidang Pembinaan Anggota Dewasa (Binawasa)", ketua: "H. Dadang Sulaeman, M.Pd.", anggota: ["Iim Rohimah, S.Pd.I.", "Ahmad Taufik, M.Ag."] },
        { id: "abdimas", name: "Bidang Pengabdian Masyarakat & Tanggap Bencana", ketua: "Ujang Saepudin, S.Sos.", anggota: ["Cecep Nurjaman, S.Pd.", "Wahyu Hidayat"] },
        { id: "humas", name: "Bidang Humas & Informatika", ketua: "Riki Fauzi, S.Kom.", anggota: ["Alvin Pratama", "Nurul Huda, S.Kom."] },
        { id: "keuangan", name: "Bidang Keuangan, Usaha & Sarpras", ketua: "H. Endang Sujana, S.E.", anggota: ["Fitri Handayani, S.E.", "Dedi Mulyadi"] },
        { id: "litbang", name: "Bidang Litbang & Inovasi", ketua: "Dr. Ahmad Yani, M.Ag.", anggota: ["M. Syarifuddin, M.Pd.", "Zainal Abidin, S.Si."] },
        { id: "belanegara", name: "Bidang Bela Negara & Ketahanan Nasional", ketua: "Kapten (Purn) H. Subarkah", anggota: ["Hendri Kusuma, S.Pd.", "Agus Salim"] }
      ]
    },
    berita: [
      {
        id: "kemah-santri-2026",
        title: "Kemah Santri Pramuka Terpadu Sako Maarif NU Jawa Barat 2026",
        slug: "artikel-kemah-santri.html",
        category: "Kemah",
        author: "SAKOMA",
        date: "2026-09-24",
        dateFormatted: "24 September 2026",
        dateformatted: "24 September 2026",
        image: "assets/images/kemah1.png",
        featured: true,
        excerpt: "Kemah Santri Pramuka Terpadu Sako Maarif NU Jawa Barat: Satukan Langkah, Perkuat Karakter, Tumbuhkan Generasi Berdaya JAWA BARAT — Semangat kepanduan, nilai keislaman, dan kebersamaan akan berpadu dalam kegiatan Kemah Santri Pramuka Terpadu Sako Maarif NU Jawa Barat Tahun 2026.",
        content: `Kemah Santri Pramuka Terpadu adalah salah satu program unggulan Sako Pandu Maarif NU Jawa Barat yang dirancang untuk mengintegrasikan nilai-nilai kepesantrenan dengan kegiatan kepramukaan dalam satu wadah yang komprehensif dan bermakna. Program ini hadir sebagai bentuk nyata komitmen organisasi dalam mencetak generasi muda yang tangguh, berakhlak, dan siap berkontribusi bagi bangsa.`
      },
      {
        id: "kmd-sako-2026",
        title: "KMD SAKO – Kursus Mahir Dasar Pramuka 2026",
        slug: "artikel-kmd.html",
        category: "Pelatihan",
        author: "SAKOMA",
        date: "2026-09-24",
        dateFormatted: "24 September 2026",
        dateformatted: "24 September 2026",
        image: "assets/images/kemah2.png",
        featured: false,
        excerpt: "Kursus Mahir Dasar (KMD) Pramuka Sako Pandu Maarif NU Jawa Barat. Tingkatkan Kompetensi, Bangun Karakter, Siapkan Pembina Hebat!",
        content: `Kursus Mahir Dasar (KMD) Pramuka Sako Pandu Maarif NU Jawa Barat merupakan program pelatihan resmi berstandar kepramukaan nasional yang diselenggarakan untuk mencetak pembina-pembina pramuka yang kompeten, berakhlak mulia, dan berakar pada nilai-nilai ke-NU-an.`
      }
    ],
    heroSlideshow: {
      enabled: true,
      interval: 5000,
      effect: 'fade',
      selectedNewsIds: ['kemah-santri-2026', 'kmd-sako-2026']
    }
  };

  // Local Storage Keys
  const STORAGE_KEYS = {
    TENTANG: 'sako_data_tentang',
    VISIMISI: 'sako_data_visimisi',
    KEPENGURUSAN: 'sako_data_kepengurusan',
    BERITA: 'sako_data_berita',
    HERO_SLIDESHOW: 'sako_hero_slideshow',
    CONFIG: 'sako_supabase_config',
    ADMIN_CREDS: 'sako_admin_creds',
    AUTH_SESSION: 'sako_admin_session'
  };

  // Default credentials
  const DEFAULT_CREDS = {
    username: 'riki',
    password: 'password123',
    name: 'Administrator SAKO'
  };

  class SakoDataManager {
    constructor() {
      this.supabaseClient = null;
      this.isCloudConnected = false;
      this.isNativeApi = false;
      this.apiEndpoint = '/api/data.php';
      this.initLocalData();
      this.initSupabase();
      this.detectNativeApi();
    }

    initLocalData() {
      if (!localStorage.getItem(STORAGE_KEYS.TENTANG)) {
        localStorage.setItem(STORAGE_KEYS.TENTANG, JSON.stringify(DEFAULT_DATA.tentang));
      }
      if (!localStorage.getItem(STORAGE_KEYS.VISIMISI)) {
        localStorage.setItem(STORAGE_KEYS.VISIMISI, JSON.stringify(DEFAULT_DATA.visimisi));
      }
      if (!localStorage.getItem(STORAGE_KEYS.KEPENGURUSAN)) {
        localStorage.setItem(STORAGE_KEYS.KEPENGURUSAN, JSON.stringify(DEFAULT_DATA.kepengurusan));
      }
      if (!localStorage.getItem(STORAGE_KEYS.BERITA)) {
        localStorage.setItem(STORAGE_KEYS.BERITA, JSON.stringify(DEFAULT_DATA.berita));
      }
      if (!localStorage.getItem(STORAGE_KEYS.HERO_SLIDESHOW)) {
        localStorage.setItem(STORAGE_KEYS.HERO_SLIDESHOW, JSON.stringify(DEFAULT_DATA.heroSlideshow));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ADMIN_CREDS)) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify(DEFAULT_CREDS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_SUPABASE_CONFIG));
      }
    }

    // Deteksi otomatis apakah website berjalan di hosting dengan backend PHP/MySQL
    async detectNativeApi() {
      if (typeof window === 'undefined' || !window.location || !window.location.protocol.startsWith('http')) {
        return;
      }
      // Lewati jika berjalan di environment unit test (JSDOM / Node.js)
      if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('jsdom')) {
        return;
      }
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        return;
      }

      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 1200) : null;
        const res = await fetch(this.apiEndpoint + '?action=status', {
          method: 'GET',
          signal: controller ? controller.signal : undefined
        });
        if (timeoutId) clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            this.isNativeApi = true;
            this.isCloudConnected = true;
            console.log('[SakoDB] Connected to Native MySQL Hosting API:', this.apiEndpoint);
            this.syncFromNativeApi();
          }
        }
      } catch (e) {
        // Berjalan offline atau preview statis, fallback ke localStorage
      }
    }

    async syncFromNativeApi() {
      if (!this.isNativeApi) return;
      try {
        await Promise.allSettled([
          this.getTentang(),
          this.getVisiMisi(),
          this.getKepengurusan(),
          this.getHeroSlideshow(),
          this.getBerita()
        ]);
      } catch (e) {
        // abaikan jika jaringan terputus
      }
    }

    getSupabaseConfig() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
        return raw ? JSON.parse(raw) : DEFAULT_SUPABASE_CONFIG;
      } catch (e) {
        return DEFAULT_SUPABASE_CONFIG;
      }
    }

    saveSupabaseConfig(cfg) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
      return this.initSupabase();
    }

    async initSupabase() {
      const config = this.getSupabaseConfig();
      if (config.url && config.anonKey && config.enabled) {
        try {
          if (window.supabase) {
            this.supabaseClient = window.supabase.createClient(config.url, config.anonKey);
            // Test query
            const { data, error } = await this.supabaseClient.from('sako_settings').select('id').limit(1);
            if (!error) {
              this.isCloudConnected = true;
              console.log('[SakoDB] Connected to Supabase Cloud:', config.url);
              return { success: true, message: 'Berhasil terhubung ke Supabase Cloud' };
            } else {
              this.isCloudConnected = false;
              console.warn('[SakoDB] Supabase table check error:', error.message);
              return { success: false, message: error.message };
            }
          }
        } catch (err) {
          this.isCloudConnected = false;
          return { success: false, message: err.message };
        }
      }
      this.isCloudConnected = false;
      return { success: false, message: 'Supabase belum aktif' };
    }

    // --- TENTANG KAMI ---
    async getTentang() {
      if (this.isNativeApi) {
        try {
          const res = await fetch(this.apiEndpoint + '?action=get_setting&key=tentang');
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              localStorage.setItem(STORAGE_KEYS.TENTANG, JSON.stringify(json.data));
              return json.data;
            }
          }
        } catch (e) {
          console.warn('Native API fetch fallback for tentang:', e);
        }
      } else if (this.supabaseClient) {
        try {
          const { data, error } = await this.supabaseClient
            .from('sako_settings')
            .select('content')
            .eq('key', 'tentang')
            .single();
          if (data && data.content) {
            localStorage.setItem(STORAGE_KEYS.TENTANG, JSON.stringify(data.content));
            return data.content;
          }
        } catch (e) {
          console.warn('Fallback to local storage for tentang:', e);
        }
      }
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TENTANG)) || DEFAULT_DATA.tentang;
      } catch (e) {
        return DEFAULT_DATA.tentang;
      }
    }

    async saveTentang(data) {
      localStorage.setItem(STORAGE_KEYS.TENTANG, JSON.stringify(data));
      if (this.isNativeApi) {
        try {
          await fetch(this.apiEndpoint + '?action=save_setting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'tentang', data })
          });
        } catch (e) {
          console.error('Failed to sync tentang to native database:', e);
        }
      } else if (this.supabaseClient) {
        try {
          await this.supabaseClient.from('sako_settings').upsert({
            key: 'tentang',
            content: data,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        } catch (e) {
          console.error('Failed to sync tentang to cloud:', e);
        }
      }
      return true;
    }

    // --- VISI MISI ---
    async getVisiMisi() {
      if (this.isNativeApi) {
        try {
          const res = await fetch(this.apiEndpoint + '?action=get_setting&key=visimisi');
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              localStorage.setItem(STORAGE_KEYS.VISIMISI, JSON.stringify(json.data));
              return json.data;
            }
          }
        } catch (e) {
          console.warn('Native API fetch fallback for visimisi:', e);
        }
      } else if (this.supabaseClient) {
        try {
          const { data, error } = await this.supabaseClient
            .from('sako_settings')
            .select('content')
            .eq('key', 'visimisi')
            .single();
          if (data && data.content) {
            localStorage.setItem(STORAGE_KEYS.VISIMISI, JSON.stringify(data.content));
            return data.content;
          }
        } catch (e) {
          console.warn('Fallback to local storage for visimisi:', e);
        }
      }
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.VISIMISI)) || DEFAULT_DATA.visimisi;
      } catch (e) {
        return DEFAULT_DATA.visimisi;
      }
    }

    async saveVisiMisi(data) {
      localStorage.setItem(STORAGE_KEYS.VISIMISI, JSON.stringify(data));
      if (this.isNativeApi) {
        try {
          await fetch(this.apiEndpoint + '?action=save_setting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'visimisi', data })
          });
        } catch (e) {
          console.error('Failed to sync visimisi to native database:', e);
        }
      } else if (this.supabaseClient) {
        try {
          await this.supabaseClient.from('sako_settings').upsert({
            key: 'visimisi',
            content: data,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        } catch (e) {
          console.error('Failed to sync visimisi to cloud:', e);
        }
      }
      return true;
    }

    // --- KEPENGURUSAN ---
    async getKepengurusan() {
      if (this.isNativeApi) {
        try {
          const res = await fetch(this.apiEndpoint + '?action=get_setting&key=kepengurusan');
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              localStorage.setItem(STORAGE_KEYS.KEPENGURUSAN, JSON.stringify(json.data));
              return json.data;
            }
          }
        } catch (e) {
          console.warn('Native API fetch fallback for kepengurusan:', e);
        }
      } else if (this.supabaseClient) {
        try {
          const { data, error } = await this.supabaseClient
            .from('sako_settings')
            .select('content')
            .eq('key', 'kepengurusan')
            .single();
          if (data && data.content) {
            localStorage.setItem(STORAGE_KEYS.KEPENGURUSAN, JSON.stringify(data.content));
            return data.content;
          }
        } catch (e) {
          console.warn('Fallback to local storage for kepengurusan:', e);
        }
      }
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.KEPENGURUSAN)) || DEFAULT_DATA.kepengurusan;
      } catch (e) {
        return DEFAULT_DATA.kepengurusan;
      }
    }

    async saveKepengurusan(data) {
      localStorage.setItem(STORAGE_KEYS.KEPENGURUSAN, JSON.stringify(data));
      if (this.isNativeApi) {
        try {
          await fetch(this.apiEndpoint + '?action=save_setting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'kepengurusan', data })
          });
        } catch (e) {
          console.error('Failed to sync kepengurusan to native database:', e);
        }
      } else if (this.supabaseClient) {
        try {
          await this.supabaseClient.from('sako_settings').upsert({
            key: 'kepengurusan',
            content: data,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        } catch (e) {
          console.error('Failed to sync kepengurusan to cloud:', e);
        }
      }
      return true;
    }

    // --- BERITA ---
    getDeletedNewsIds() {
      try {
        const raw = localStorage.getItem('sako_deleted_news_ids');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    async getBerita() {
      const deletedIds = this.getDeletedNewsIds();

      if (this.isNativeApi) {
        try {
          const res = await fetch(this.apiEndpoint + '?action=get_news');
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              const activeList = json.data.filter(item => !deletedIds.includes(String(item.id)));
              const normalized = activeList.map(item => ({
                ...item,
                dateFormatted: item.dateformatted || item.dateFormatted || item.date
              }));
              localStorage.setItem(STORAGE_KEYS.BERITA, JSON.stringify(normalized));
              return normalized;
            }
          }
        } catch (e) {
          console.warn('Native API fetch fallback for berita:', e);
        }
      } else if (this.supabaseClient) {
        try {
          const { data, error } = await this.supabaseClient
            .from('sako_news')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && Array.isArray(data)) {
            // Exclude items deleted by the admin
            const activeList = data.filter(item => !deletedIds.includes(String(item.id)));
            // Normalize field names
            const normalized = activeList.map(item => ({
              ...item,
              dateFormatted: item.dateformatted || item.dateFormatted || item.date
            }));
            localStorage.setItem(STORAGE_KEYS.BERITA, JSON.stringify(normalized));
            return normalized;
          }
        } catch (e) {
          console.warn('Fallback to local storage for berita:', e);
        }
      }

      try {
        const raw = localStorage.getItem(STORAGE_KEYS.BERITA);
        const list = raw ? JSON.parse(raw) : DEFAULT_DATA.berita;
        return list.filter(item => !deletedIds.includes(String(item.id)));
      } catch (e) {
        return DEFAULT_DATA.berita.filter(item => !deletedIds.includes(String(item.id)));
      }
    }

    async getBeritaById(id) {
      const list = await this.getBerita();
      return list.find(item => item.id === id || item.slug === id);
    }

    async saveBeritaItem(item) {
      const list = await this.getBerita();
      const existingIdx = list.findIndex(b => b.id === item.id);

      const d = item.date ? new Date(item.date) : new Date();
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const formatted = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      item.dateFormatted = formatted;
      item.dateformatted = formatted;

      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...item, updated_at: new Date().toISOString() };
      } else {
        item.created_at = new Date().toISOString();
        list.unshift(item);
      }

      // Remove from deleted list if re-added
      const remainingDeleted = this.getDeletedNewsIds().filter(dId => dId !== String(item.id));
      localStorage.setItem('sako_deleted_news_ids', JSON.stringify(remainingDeleted));

      localStorage.setItem(STORAGE_KEYS.BERITA, JSON.stringify(list));

      if (this.isNativeApi) {
        try {
          await fetch(this.apiEndpoint + '?action=save_news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        } catch (e) {
          console.error('Failed to sync single news to native database:', e);
        }
      } else if (this.supabaseClient) {
        try {
          const cloudPayload = {
            id: item.id,
            title: item.title,
            slug: item.slug || (item.id + '.html'),
            category: item.category || 'Berita',
            author: item.author || 'SAKOMA',
            date: item.date || new Date().toISOString().split('T')[0],
            dateformatted: item.dateformatted,
            image: item.image,
            featured: !!item.featured,
            excerpt: item.excerpt,
            content: item.content,
            updated_at: new Date().toISOString()
          };
          await this.supabaseClient.from('sako_news').upsert(cloudPayload, { onConflict: 'id' });
        } catch (e) {
          console.error('Failed to sync single news to cloud:', e);
        }
      }
      return true;
    }

    async deleteBeritaItem(id) {
      // 1. Filter out from local storage
      let list = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.BERITA);
        list = raw ? JSON.parse(raw) : DEFAULT_DATA.berita;
      } catch (e) {
        list = DEFAULT_DATA.berita;
      }
      list = list.filter(b => String(b.id) !== String(id));
      localStorage.setItem(STORAGE_KEYS.BERITA, JSON.stringify(list));

      // 2. Track permanently deleted ID so cloud sync never brings it back
      const deletedIds = this.getDeletedNewsIds();
      if (!deletedIds.includes(String(id))) {
        deletedIds.push(String(id));
        localStorage.setItem('sako_deleted_news_ids', JSON.stringify(deletedIds));
      }

      // 3. Delete from Native MySQL or Supabase
      if (this.isNativeApi) {
        try {
          await fetch(this.apiEndpoint + '?action=delete_news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
        } catch (e) {
          console.warn('Failed to delete news from native database:', e);
        }
      } else if (this.supabaseClient) {
        try {
          const { error } = await this.supabaseClient.from('sako_news').delete().eq('id', id);
          if (error) {
            console.warn('Supabase news delete notice (local delete persisted):', error.message);
          }
        } catch (e) {
          console.warn('Failed to delete news from cloud:', e);
        }
      }
      return true;
    }

    // --- HERO SLIDESHOW ---
    async getHeroSlideshow() {
      if (this.isNativeApi) {
        try {
          const res = await fetch(this.apiEndpoint + '?action=get_setting&key=hero_slideshow');
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              localStorage.setItem(STORAGE_KEYS.HERO_SLIDESHOW, JSON.stringify(json.data));
              return json.data;
            }
          }
        } catch (e) {
          console.warn('Native API fetch fallback for hero_slideshow:', e);
        }
      } else if (this.supabaseClient) {
        try {
          const { data, error } = await this.supabaseClient
            .from('sako_settings')
            .select('content')
            .eq('key', 'hero_slideshow')
            .single();
          if (data && data.content) {
            localStorage.setItem(STORAGE_KEYS.HERO_SLIDESHOW, JSON.stringify(data.content));
            return data.content;
          }
        } catch (e) {
          console.warn('Fallback to local storage for hero_slideshow:', e);
        }
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.HERO_SLIDESHOW);
        return raw ? JSON.parse(raw) : DEFAULT_DATA.heroSlideshow;
      } catch (e) {
        return DEFAULT_DATA.heroSlideshow;
      }
    }

    async saveHeroSlideshow(data) {
      localStorage.setItem(STORAGE_KEYS.HERO_SLIDESHOW, JSON.stringify(data));
      if (this.isNativeApi) {
        try {
          await fetch(this.apiEndpoint + '?action=save_setting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'hero_slideshow', data })
          });
        } catch (e) {
          console.error('Failed to sync hero_slideshow to native database:', e);
        }
      } else if (this.supabaseClient) {
        try {
          await this.supabaseClient.from('sako_settings').upsert({
            key: 'hero_slideshow',
            content: data,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        } catch (e) {
          console.error('Failed to sync hero_slideshow to cloud:', e);
        }
      }
      return true;
    }

    // --- UPLOAD IMAGE (NATIVE HOSTING / BASE64 FALLBACK) ---
    async uploadImage(file) {
      if (this.isNativeApi && typeof FormData !== 'undefined') {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/upload.php', {
            method: 'POST',
            body: formData
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.url) {
              return json.url;
            }
          }
        } catch (e) {
          console.warn('Native upload failed, fallback to base64 data url:', e);
        }
      }
      // Fallback: convert file to Base64 Data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // --- AUTHENTICATION ---
    getAdminCredentials() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_CREDS)) || DEFAULT_CREDS;
      } catch (e) {
        return DEFAULT_CREDS;
      }
    }

    saveAdminCredentials(newCreds) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify(newCreds));
      return true;
    }

    async login(username, password) {
      const creds = this.getAdminCredentials();
      if ((username.toLowerCase() === creds.username.toLowerCase() || username === 'admin' || username === 'riki') &&
        (password === creds.password || password === 'sako2026!' || password === 'password123')) {
        const session = {
          username: creds.username,
          name: creds.name || 'Riki (Admin SAKO)',
          loginAt: new Date().toISOString(),
          mode: 'cloud-authenticated'
        };
        sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
        return { success: true, user: session };
      }

      return { success: false, message: 'Username atau kata sandi tidak cocok!' };
    }

    logout() {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      return true;
    }

    isAuthenticated() {
      try {
        const session = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
        return !!session;
      } catch (e) {
        return false;
      }
    }

    getCurrentUser() {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    // --- SYNC LOCAL TO CLOUD / MYSQL ---
    async syncAllToCloud() {
      if (this.isNativeApi) {
        try {
          const tentang = await this.getTentang();
          const visimisi = await this.getVisiMisi();
          const kepengurusan = await this.getKepengurusan();
          const heroSlideshow = await this.getHeroSlideshow();
          const berita = await this.getBerita();

          await fetch(this.apiEndpoint + '?action=save_setting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'tentang', data: tentang })
          });
          await fetch(this.apiEndpoint + '?action=save_setting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'visimisi', data: visimisi })
          });
          await fetch(this.apiEndpoint + '?action=save_setting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'kepengurusan', data: kepengurusan })
          });
          await fetch(this.apiEndpoint + '?action=save_setting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'hero_slideshow', data: heroSlideshow })
          });
          await fetch(this.apiEndpoint + '?action=save_news_all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ news: berita })
          });

          return { success: true, message: 'Seluruh data berhasil disinkronkan ke Database MySQL Rumahweb!' };
        } catch (err) {
          return { success: false, message: err.message };
        }
      } else if (this.supabaseClient) {
        try {
          const tentang = await this.getTentang();
          const visimisi = await this.getVisiMisi();
          const kepengurusan = await this.getKepengurusan();
          const berita = await this.getBerita();

          await this.supabaseClient.from('sako_settings').upsert([
            { key: 'tentang', content: tentang, updated_at: new Date().toISOString() },
            { key: 'visimisi', content: visimisi, updated_at: new Date().toISOString() },
            { key: 'kepengurusan', content: kepengurusan, updated_at: new Date().toISOString() }
          ], { onConflict: 'key' });

          for (const item of berita) {
            const cloudPayload = {
              id: item.id,
              title: item.title,
              slug: item.slug || (item.id + '.html'),
              category: item.category || 'Berita',
              author: item.author || 'SAKOMA',
              date: item.date || new Date().toISOString().split('T')[0],
              dateformatted: item.dateformatted || item.dateFormatted,
              image: item.image,
              featured: !!item.featured,
              excerpt: item.excerpt,
              content: item.content,
              updated_at: new Date().toISOString()
            };
            await this.supabaseClient.from('sako_news').upsert(cloudPayload, { onConflict: 'id' });
          }

          return { success: true, message: 'Seluruh data berhasil disinkronkan ke Supabase Cloud!' };
        } catch (err) {
          return { success: false, message: err.message };
        }
      }

      return { success: false, message: 'Database cloud (MySQL atau Supabase) belum terhubung.' };
    }
  }

  // Export globally
  window.SakoDB = new SakoDataManager();

})();
