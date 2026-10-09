/**
 * Automated Test Suite: Admin Input -> Public Profile Synchronization
 * SAKO Ma'arif NU Jawa Barat
 *
 * Menguji apakah seluruh input dari portal Admin (/riki) berhasil
 * tersimpan dan langsung mengubah tampilan pada web profile publik:
 * 1. kepengurusan.html (Mabisako, Pimpinan Harian, Bidang Kerja)
 * 2. profil.html (Tentang Kami, Visi, Misi, Tujuan)
 * 3. index.html (Hero Stats, Pilar Organisasi, Berita Terbaru)
 * 4. berita.html (Daftar Berita & Warta)
 * 5. Real-time Storage Event Sync (Update otomatis tanpa reload)
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.resolve(__dirname, '..');
const dataManagerCode = fs.readFileSync(path.join(ROOT_DIR, 'assets/js/data-manager.js'), 'utf8');
const mainJsCode = fs.readFileSync(path.join(ROOT_DIR, 'main.js'), 'utf8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       Detail: ${details}`);
  }
}

function createDOMForPage(htmlFileName, initialLocalStorage = {}) {
  const baseFile = htmlFileName.split('?')[0];
  const htmlContent = fs.readFileSync(path.join(ROOT_DIR, baseFile), 'utf8');
  const virtualConsole = new (require('jsdom').VirtualConsole)();
  // Filter out resource load error warnings for missing external CSS/scripts in node test
  virtualConsole.on('error', () => {});

  const dom = new JSDOM(htmlContent, {
    url: `http://localhost/${htmlFileName}`,
    runScripts: 'dangerously',
    virtualConsole
  });

  const { window } = dom;

  // Mock scrollTo and IntersectionObserver if not present
  window.scrollTo = () => {};
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // Populate initial localStorage
  Object.entries(initialLocalStorage).forEach(([k, v]) => {
    window.localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
  });

  // Execute data-manager.js inside DOM context
  window.eval(dataManagerCode);

  return { dom, window, document: window.document };
}

async function runTests() {
  console.log('================================================================');
  console.log('AUTOMATED TESTING: ADMIN INPUT TO PUBLIC PROFILE DISPLAY SYNC');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST SUITE 1: KEPENGURUSAN
  // --------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: KEPENGURUSAN (kepengurusan.html) ---');
  
  const testKepengurusanData = {
    mabisako: {
      ketua: { name: 'Prof. Dr. KH. Asep Mustofa, M.Ag.', role: 'Ketua Majelis Pembimbing Terpilih' },
      wakilKetua: ['Drs. H. Rahmat Hidayat, M.Si.', 'Dr. Hj. Siti Aminah, M.Pd.'],
      sekretaris: ['Ahmad Fauzan, M.Pd.I.'],
      anggota: ['H. Maman Sulaeman, M.M.', 'Deden Kurniawan, S.Pd.']
    },
    pimpinan: {
      ketua: { name: 'Riki Fauzi Rahman, S.Pd., M.Si.', role: 'Ketua Pimpinan Harian Sako Jawa Barat' },
      wakilKetua: ['Ust. Dani Ramdani, S.Pd.', 'H. Ridwan Kamil, S.T.'],
      sekretaris: ['M. Faisal Akbar, S.Kom.'],
      bendahara: ['Hj. Nina Karlina, S.E., M.M.']
    },
    bidang: [
      {
        id: 'organisasi',
        name: 'Bidang Organisasi, Kaderisasi & Hukum',
        ketua: 'H. Cecep Supriadi, S.H., M.H.',
        anggota: ['Iqbal Tawakal, S.H.', 'Fajar Maulana, S.H.']
      },
      {
        id: 'humas',
        name: 'Bidang Media Informasi & Komunikasi Digital',
        ketua: 'Budi Santoso, S.Kom.',
        anggota: ['Rina Novita, S.I.Kom.', 'Yoga Pratama']
      }
    ]
  };

  const kepengEnv = createDOMForPage('kepengurusan.html', {
    sako_data_kepengurusan: testKepengurusanData
  });

  // Jalankan main.js untuk hidrasi data
  kepengEnv.window.eval(mainJsCode);

  // Tunggu async hydration
  await new Promise(r => setTimeout(r, 200));

  const docKepeng = kepengEnv.document;

  // Verifikasi Mabisako Ketua
  const mabiKetuaName = docKepeng.getElementById('mabiKetuaName')?.textContent?.trim();
  const mabiKetuaRole = docKepeng.getElementById('mabiKetuaRole')?.textContent?.trim();
  const mabiKetuaAvatar = docKepeng.getElementById('mabiKetuaAvatar')?.textContent?.trim();

  assert(mabiKetuaName === testKepengurusanData.mabisako.ketua.name, 
    'Mabisako: Nama Ketua diperbarui di web profile', 
    `Expected: "${testKepengurusanData.mabisako.ketua.name}", Got: "${mabiKetuaName}"`);

  assert(mabiKetuaRole === testKepengurusanData.mabisako.ketua.role, 
    'Mabisako: Jabatan Ketua diperbarui di web profile',
    `Expected: "${testKepengurusanData.mabisako.ketua.role}", Got: "${mabiKetuaRole}"`);

  assert(mabiKetuaAvatar === 'AM', 
    'Mabisako: Inisial Avatar Ketua dihitung dengan benar',
    `Expected: "AM", Got: "${mabiKetuaAvatar}"`);

  // Verifikasi Mabisako List (Wakil, Sekretaris, Anggota)
  const mabiWakilText = docKepeng.getElementById('mabiWakilList')?.textContent || '';
  assert(mabiWakilText.includes('Drs. H. Rahmat Hidayat, M.Si.') && mabiWakilText.includes('Dr. Hj. Siti Aminah, M.Pd.'),
    'Mabisako: Daftar Wakil Ketua diperbarui di web profile');

  const mabiSekretarisText = docKepeng.getElementById('mabiSekretarisList')?.textContent || '';
  assert(mabiSekretarisText.includes('Ahmad Fauzan, M.Pd.I.'),
    'Mabisako: Daftar Sekretaris diperbarui di web profile');

  const mabiAnggotaText = docKepeng.getElementById('mabiAnggotaList')?.textContent || '';
  assert(mabiAnggotaText.includes('H. Maman Sulaeman, M.M.') && mabiAnggotaText.includes('Deden Kurniawan, S.Pd.'),
    'Mabisako: Daftar Anggota diperbarui di web profile');

  // Verifikasi Pimpinan Harian (Ketua, Wakil, Sekretaris, Bendahara)
  const pimpinanKetuaName = docKepeng.getElementById('pimpinanKetuaName')?.textContent?.trim();
  const pimpinanKetuaRole = docKepeng.getElementById('pimpinanKetuaRole')?.textContent?.trim();

  assert(pimpinanKetuaName === testKepengurusanData.pimpinan.ketua.name,
    'Pimpinan Harian: Nama Ketua diperbarui di web profile',
    `Expected: "${testKepengurusanData.pimpinan.ketua.name}", Got: "${pimpinanKetuaName}"`);

  assert(pimpinanKetuaRole === testKepengurusanData.pimpinan.ketua.role,
    'Pimpinan Harian: Jabatan Ketua diperbarui di web profile',
    `Expected: "${testKepengurusanData.pimpinan.ketua.role}", Got: "${pimpinanKetuaRole}"`);

  const pimpinanWakilText = docKepeng.getElementById('pimpinanWakilList')?.textContent || '';
  assert(pimpinanWakilText.includes('Ust. Dani Ramdani, S.Pd.'),
    'Pimpinan Harian: Daftar Wakil Ketua diperbarui di web profile');

  const pimpinanBendaharaText = docKepeng.getElementById('pimpinanBendaharaList')?.textContent || '';
  assert(pimpinanBendaharaText.includes('Hj. Nina Karlina, S.E., M.M.'),
    'Pimpinan Harian: Daftar Bendahara diperbarui di web profile');

  // Verifikasi Bidang Kerja
  const bidangGridText = docKepeng.getElementById('bidangGrid')?.textContent || '';
  assert(bidangGridText.includes('Bidang Organisasi, Kaderisasi & Hukum') &&
         bidangGridText.includes('H. Cecep Supriadi, S.H., M.H.') &&
         bidangGridText.includes('Iqbal Tawakal, S.H.'),
    'Bidang Kerja: Data nama bidang, ketua bidang, dan anggota diperbarui di web profile');

  // Verifikasi Posisi/Jabatan Kosong Tidak Ditampilkan
  const kepengEmptyEnv = createDOMForPage('kepengurusan.html', {
    sako_data_kepengurusan: {
      ...testKepengurusanData,
      mabisako: {
        ...testKepengurusanData.mabisako,
        wakilKetua: []
      }
    }
  });
  kepengEmptyEnv.window.eval(mainJsCode);
  await new Promise(r => setTimeout(r, 200));

  const docEmptyKepeng = kepengEmptyEnv.document;
  const mabiWakilSection = docEmptyKepeng.getElementById('mabiWakilList')?.closest('.kepeng-role-section');
  assert(mabiWakilSection?.style.display === 'none',
    'Kepengurusan: Jabatan yang kosong disembunyikan dan tidak ditampilkan di web profile');
  assert(!docEmptyKepeng.body.textContent.includes('Belum ada data'),
    'Kepengurusan: Teks "Belum ada data" tidak lagi muncul di web profile');

  // --------------------------------------------------------------------------
  // TEST SUITE 2: PROFIL ORGANISASI (profil.html)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: PROFIL ORGANISASI (profil.html) ---');

  const testTentangData = {
    introHeading: 'Profil & Rekam Jejak Pandu Maarif Jawa Barat',
    leadParagraph: 'Paragraf pengantar yang baru saja diupdate oleh Admin melalui portal.',
    paragraphs: [
      'Paragraf penjelasan kedua hasil input admin terbaru.',
      'Paragraf penjelasan ketiga mengenai komitmen organisasi.'
    ],
    stats: { tahun: '2027', bidang: '10', pengurus: '120+' },
    pillars: [
      { icon: '', title: 'Inovatif', desc: 'Pilar baru inovasi kepramukaan.' },
      { icon: '', title: 'Mandiri', desc: 'Pilar baru kemandirian santri.' }
    ]
  };

  const testVisiMisiData = {
    visi: 'Visi Baru: Menjadi barometer kepramukaan santri berdaya saing global 2030.',
    misi: [
      'Misi Baru 1: Transformasi digital kepanduan santri.',
      'Misi Baru 2: Penguatan jejaring sako internasional.'
    ],
    tujuan: [
      'Tujuan Baru 1: Terbentuknya 1000 gugus depan terakreditasi.',
      'Tujuan Baru 2: Sertifikasi pembina mahir berstandar nasional.'
    ]
  };

  const profilEnv = createDOMForPage('profil.html', {
    sako_data_tentang: testTentangData,
    sako_data_visimisi: testVisiMisiData
  });

  profilEnv.window.eval(mainJsCode);
  await new Promise(r => setTimeout(r, 200));

  const docProfil = profilEnv.document;

  // Verifikasi Tentang Intro Heading & Paragraphs
  const introContainer = docProfil.getElementById('profil-intro-text');
  const introText = introContainer?.textContent || '';
  assert(introText.includes('Profil & Rekam Jejak Pandu Maarif Jawa Barat'),
    'Profil: Heading Tentang Kami diperbarui di web profile');
  assert(introText.includes('Paragraf pengantar yang baru saja diupdate oleh Admin melalui portal.'),
    'Profil: Paragraf lead Tentang Kami diperbarui di web profile');
  assert(introText.includes('Paragraf penjelasan kedua hasil input admin terbaru.'),
    'Profil: Paragraf isi Tentang Kami diperbarui di web profile');

  // Verifikasi Visi
  const visiText = docProfil.querySelector('.profil-card-quote')?.textContent || '';
  assert(visiText.includes('Visi Baru: Menjadi barometer kepramukaan santri berdaya saing global 2030.'),
    'Profil: Teks Visi diperbarui di web profile',
    `Got: "${visiText}"`);

  // Verifikasi Misi
  const misiText = docProfil.getElementById('misi-list')?.textContent || '';
  assert(misiText.includes('Transformasi digital kepanduan santri.') && misiText.includes('Penguatan jejaring sako internasional.'),
    'Profil: Butir-butir Misi diperbarui di web profile');

  // Verifikasi Tujuan
  const tujuanText = docProfil.getElementById('tujuan-list')?.textContent || '';
  assert(tujuanText.includes('Terbentuknya 1000 gugus depan terakreditasi.') && tujuanText.includes('Sertifikasi pembina mahir berstandar nasional.'),
    'Profil: Butir-butir Tujuan diperbarui di web profile');

  // Verifikasi Angka Statistik di Profil
  const profilStatTahun = docProfil.getElementById('stat-tahun-profil')?.textContent?.trim();
  const profilStatBidang = docProfil.getElementById('stat-bidang-profil')?.textContent?.trim();
  const profilStatPengurus = docProfil.getElementById('stat-pengurus-profil')?.textContent?.trim();
  assert(profilStatTahun === '2027', 'Profil: Stat Tahun diperbarui di Profil', `Expected: 2027, Got: ${profilStatTahun}`);
  assert(profilStatBidang === '10', 'Profil: Stat Bidang diperbarui di Profil', `Expected: 10, Got: ${profilStatBidang}`);
  assert(profilStatPengurus === '120+', 'Profil: Stat Pengurus diperbarui di Profil', `Expected: 120+, Got: ${profilStatPengurus}`);

  // --------------------------------------------------------------------------
  // TEST SUITE 3: BERANDA / HOME STATS & PILLARS (index.html)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: BERANDA STATS & PILAR (index.html) ---');

  const indexEnv = createDOMForPage('index.html', {
    sako_data_tentang: testTentangData
  });

  indexEnv.window.eval(mainJsCode);
  await new Promise(r => setTimeout(r, 200));

  const docIndex = indexEnv.document;

  const statTahun = docIndex.getElementById('stat-tahun')?.textContent?.trim();
  const statBidang = docIndex.getElementById('stat-bidang')?.textContent?.trim();
  const statPengurus = docIndex.getElementById('stat-pengurus')?.textContent?.trim();

  assert(statTahun === '2027', 'Beranda: Stat Tahun diperbarui di Hero section', `Expected: 2027, Got: ${statTahun}`);
  assert(statBidang === '10', 'Beranda: Stat Bidang diperbarui di Hero section', `Expected: 10, Got: ${statBidang}`);
  assert(statPengurus === '120+', 'Beranda: Stat Pengurus diperbarui di Hero section', `Expected: 120+, Got: ${statPengurus}`);

  const aboutGridText = docIndex.querySelector('.about-grid')?.textContent || '';
  assert(aboutGridText.includes('Inovatif') && aboutGridText.includes('Pilar baru inovasi kepramukaan.'),
    'Beranda: Pilar-pilar organisasi diperbarui di web profile');

  // --------------------------------------------------------------------------
  // TEST SUITE 4: BERITA & WARTA (berita.html & index.html)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: BERITA & WARTA (berita.html & index.html) ---');

  const testBeritaList = [
    {
      id: 'rapat-kerja-daerah-2026',
      title: 'Rakerda Sako Ma\'arif NU Jabar Sukses Digelar di Bandung',
      slug: 'artikel-rakerda.html',
      category: 'Rakerda',
      author: 'Admin Riki',
      date: '2026-10-01',
      dateFormatted: '01 Oktober 2026',
      image: 'assets/images/kemah3.png',
      featured: true,
      excerpt: 'Rapat Kerja Daerah membahas agenda strategis kemandirian santri 5 tahun ke depan.',
      content: 'Isi lengkap dokumentasi hasil keputusan rakerda sako maarif jawa barat.'
    },
    {
      id: 'pelatihan-jurnalistik-pramuka',
      title: 'Pelatihan Jurnalistik & Cyber Sako Maarif NU',
      slug: 'artikel-jurnalistik.html',
      category: 'Pelatihan',
      author: 'Tim Humas',
      date: '2026-10-02',
      dateFormatted: '02 Oktober 2026',
      image: 'assets/images/kemah4.png',
      featured: false,
      excerpt: 'Meningkatkan literasi digital pembina dan anggota pramuka santri di era AI.',
      content: 'Isi materi pelatihan jurnalistik santri.'
    }
  ];

  // Verifikasi struktur awal index.html dan berita.html menggunakan animasi skeleton (tanpa berita lama)
  const initialIndexContent = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  assert(initialIndexContent.includes('news-card-skeleton'),
    'Beranda: Menggunakan animasi loading skeleton pada daftar berita bawaan');
  assert(!initialIndexContent.includes('Kemah Santri Pramuka Terpadu Sako Maarif NU Jawa Barat Tahun 2026...'),
    'Beranda: Teks berita lama bawaan web berhasil dihapus');

  const initialBeritaContent = fs.readFileSync(path.join(ROOT_DIR, 'berita.html'), 'utf8');
  assert(initialBeritaContent.includes('news-card-skeleton'),
    'Berita: Menggunakan animasi loading skeleton pada halaman berita bawaan');
  assert(!initialBeritaContent.includes('Semangat kepanduan, nilai keislaman, dan kebersamaan akan berpadu'),
    'Berita: Teks berita lama bawaan web berhasil dihapus');

  const beritaEnv = createDOMForPage('berita.html', {
    sako_data_berita: testBeritaList
  });

  beritaEnv.window.eval(mainJsCode);
  await new Promise(r => setTimeout(r, 200));

  const docBerita = beritaEnv.document;
  const featuredTitle = docBerita.querySelector('.news-card.featured .news-title a')?.textContent?.trim();
  const otherNewsGridText = (docBerita.getElementById('berita-grid') || docBerita.querySelector('.berita-grid') || docBerita.querySelector('.news-grid'))?.textContent || '';

  assert(featuredTitle === testBeritaList[0].title,
    'Berita: Artikel Utama (Featured) diperbarui di halaman berita',
    `Expected: "${testBeritaList[0].title}", Got: "${featuredTitle}"`);

  assert(otherNewsGridText.includes('Pelatihan Jurnalistik & Cyber Sako Maarif NU'),
    'Berita: Artikel reguler kedua muncul di daftar berita');

  // Cek kemunculan di index.html
  const indexNewsEnv = createDOMForPage('index.html', {
    sako_data_berita: testBeritaList
  });
  indexNewsEnv.window.eval(mainJsCode);
  await new Promise(r => setTimeout(r, 200));

  const docIndexNews = indexNewsEnv.document;
  const indexNewsText = docIndexNews.querySelector('.news-grid')?.textContent || '';
  assert(indexNewsText.includes(testBeritaList[0].title),
    'Beranda: Berita terbaru dari admin muncul di preview berita Beranda');

  const newsReadMoreHref = docIndexNews.querySelector('.news-card .news-readmore')?.getAttribute('href') || '';
  assert(newsReadMoreHref.startsWith('artikel-kmd.html?id='),
    'Beranda: Link berita admin mengarah ke artikel-kmd.html dengan parameter ID yang valid',
    `Got: "${newsReadMoreHref}"`);

  // Verifikasi 4 berita dan 4 galeri pada landing page (index.html)
  const fourBeritaList = [
    ...testBeritaList,
    {
      id: 'berita-3',
      title: 'Kegiatan Perkemahan Santri Wilayah 3',
      image: 'assets/images/kemah1.png',
      date: '2026-10-05',
      category: 'Kemah'
    },
    {
      id: 'berita-4',
      title: 'Pelantikan Pembina Mahir SAKO NU',
      image: 'assets/images/kemah2.png',
      date: '2026-10-08',
      category: 'Pelatihan'
    },
    {
      id: 'berita-5',
      title: 'Berita Kelima Cadangan',
      image: 'assets/images/kemah3.png',
      date: '2026-10-09',
      category: 'Bakti'
    }
  ];

  const index4Env = createDOMForPage('index.html', {
    sako_data_berita: fourBeritaList
  });
  index4Env.window.eval(mainJsCode);
  await new Promise(r => setTimeout(r, 200));

  const docIndex4 = index4Env.document;
  const renderedCardsCount = docIndex4.querySelectorAll('.news-grid .news-card').length;
  assert(renderedCardsCount === 4,
    'Beranda: Menampilkan tepat 4 berita di bagian Kegiatan & Informasi',
    `Expected 4, got ${renderedCardsCount}`);

  const renderedGalleryCount = docIndex4.querySelectorAll('#gallery-preview-grid .gallery-preview-item').length;
  assert(renderedGalleryCount === 4,
    'Beranda: Menampilkan tepat 4 foto dokumentasi kegiatan di preview galeri tanpa area kosong',
    `Expected 4, got ${renderedGalleryCount}`);

  // Verifikasi artikel dinamis dapat dibuka dan di-hydrate di halaman artikel-kmd.html
  const articlePageEnv = createDOMForPage('artikel-kmd.html?id=rapat-kerja-daerah-2026', {
    sako_data_berita: testBeritaList
  });
  articlePageEnv.window.eval(mainJsCode);
  await new Promise(r => setTimeout(r, 200));

  const docArticle = articlePageEnv.document;
  const hydratedTitle = docArticle.getElementById('articleMainTitle')?.textContent?.trim();
  const hydratedContent = docArticle.getElementById('articleBodyContent')?.textContent || '';
  assert(hydratedTitle === testBeritaList[0].title,
    'Artikel: Berita admin berhasil dibuka dan judul ter-hydrate di halaman artikel',
    `Expected: "${testBeritaList[0].title}", Got: "${hydratedTitle}"`);
  assert(hydratedContent.includes('Isi lengkap dokumentasi hasil keputusan rakerda'),
    'Artikel: Isi konten artikel berita admin berhasil di-render di halaman artikel');

  // --------------------------------------------------------------------------
  // TEST SUITE 5: REAL-TIME STORAGE EVENT SYNC (TANPA REFRESH)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: REAL-TIME STORAGE EVENT SYNC ---');

  const liveEnv = createDOMForPage('kepengurusan.html', {
    sako_data_kepengurusan: testKepengurusanData
  });
  liveEnv.window.eval(mainJsCode);
  await new Promise(r => setTimeout(r, 200));

  // Simulasi Admin mengupdate nama Ketua Pimpinan di tab admin (/riki)
  const updatedKepengData = JSON.parse(JSON.stringify(testKepengurusanData));
  updatedKepengData.pimpinan.ketua.name = 'Drs. H. Maman Abdurrahman, M.Ag.';
  updatedKepengData.pimpinan.ketua.role = 'Ketua Pimpinan Harian Periode Baru';

  // Simpan ke localStorage dan picu storage event (seperti yang dilakukan browser antar tab)
  liveEnv.window.localStorage.setItem('sako_data_kepengurusan', JSON.stringify(updatedKepengData));
  
  const storageEvent = new liveEnv.window.Event('storage');
  storageEvent.key = 'sako_data_kepengurusan';
  liveEnv.window.dispatchEvent(storageEvent);

  // Tunggu hidrasi otomatis berjalan
  await new Promise(r => setTimeout(r, 250));

  const updatedNameInDOM = liveEnv.document.getElementById('pimpinanKetuaName')?.textContent?.trim();
  const updatedRoleInDOM = liveEnv.document.getElementById('pimpinanKetuaRole')?.textContent?.trim();

  assert(updatedNameInDOM === 'Drs. H. Maman Abdurrahman, M.Ag.',
    'Realtime Sync: Tampilan web profile langsung berubah saat admin menyimpan data pengurus baru tanpa reload',
    `Expected: "Drs. H. Maman Abdurrahman, M.Ag.", Got: "${updatedNameInDOM}"`);

  assert(updatedRoleInDOM === 'Ketua Pimpinan Harian Periode Baru',
    'Realtime Sync: Jabatan langsung ter-update di web profile',
    `Expected: "Ketua Pimpinan Harian Periode Baru", Got: "${updatedRoleInDOM}"`);

  // --------------------------------------------------------------------------
  // TEST SUITE 6: HERO SLIDESHOW SELECTION & DYNAMIC SYNC (index.html)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 6: HERO SLIDESHOW SELECTION (index.html) ---');

  // Test 1: Admin selects only the second article for hero slideshow
  const customSlideshowCfg = {
    enabled: true,
    interval: 5000,
    selectedNewsIds: ['pelatihan-jurnalistik-pramuka']
  };

  const slideshowEnv = createDOMForPage('index.html', {
    sako_data_berita: testBeritaList,
    sako_hero_slideshow: customSlideshowCfg
  });

  slideshowEnv.window.eval(mainJsCode);
  await new Promise(r => setTimeout(r, 200));

  const docSlideshow = slideshowEnv.document;
  const slideTitles = Array.from(docSlideshow.querySelectorAll('.hero-slide-headline a')).map(a => a.textContent.trim());
  const slideBannerCount = docSlideshow.querySelectorAll('.hero-banner-slide').length;

  assert(slideTitles.length === 1 && slideTitles[0] === 'Pelatihan Jurnalistik & Cyber Sako Maarif NU',
    'Hero Slideshow: Hanya foto berita yang dipilih admin yang tampil di slideshow',
    `Expected: ["Pelatihan Jurnalistik & Cyber Sako Maarif NU"], Got: ${JSON.stringify(slideTitles)}`);

  assert(slideBannerCount === 1,
    'Hero Slideshow: Jumlah slide banner sesuai dengan jumlah foto yang dipilih admin',
    `Expected: 1, Got: ${slideBannerCount}`);

  // Test 2: Admin updates selection in real-time to include both articles
  const updatedSlideshowCfg = {
    enabled: true,
    interval: 3000,
    selectedNewsIds: ['rapat-kerja-daerah-2026', 'pelatihan-jurnalistik-pramuka']
  };

  slideshowEnv.window.localStorage.setItem('sako_hero_slideshow', JSON.stringify(updatedSlideshowCfg));
  const slideStorageEvent = new slideshowEnv.window.Event('storage');
  slideStorageEvent.key = 'sako_hero_slideshow';
  slideshowEnv.window.dispatchEvent(slideStorageEvent);

  await new Promise(r => setTimeout(r, 250));

  const updatedSlideTitles = Array.from(docSlideshow.querySelectorAll('.hero-slide-headline a')).map(a => a.textContent.trim());
  assert(updatedSlideTitles.length === 2 && updatedSlideTitles.includes('Rakerda Sako Ma\'arif NU Jabar Sukses Digelar di Bandung'),
    'Hero Slideshow Realtime: Perubahan pilihan gambar di admin langsung ter-update di slideshow Hero tanpa reload',
    `Expected length 2, Got: ${JSON.stringify(updatedSlideTitles)}`);

  // --------------------------------------------------------------------------
  // TEST SUITE 7: GALERI DOKUMENTASI & SKELETON (galeri.html)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 7: GALERI DOKUMENTASI & SKELETON (galeri.html) ---');

  const rawGaleriHtml = fs.readFileSync(path.join(ROOT_DIR, 'galeri.html'), 'utf8');
  assert(rawGaleriHtml.includes('galeri-item-skeleton'),
    'Galeri: Menggunakan animasi loading skeleton pada halaman galeri bawaan');

  assert(!rawGaleriHtml.includes('Kegiatan Pramuka 1') && !rawGaleriHtml.includes('Kegiatan Pramuka 9'),
    'Galeri: Foto statis lama bawaan tanpa badge berhasil dihapus dari galeri');

  const galeriEnv = createDOMForPage('galeri.html', {
    sako_data_berita: testBeritaList
  });

  galeriEnv.window.eval(mainJsCode);
  await new Promise(r => setTimeout(r, 200));

  const docGaleri = galeriEnv.document;
  const renderedItems = docGaleri.querySelectorAll('#galeri-grid .galeri-item');
  const renderedBadges = docGaleri.querySelectorAll('#galeri-grid .galeri-badge');

  assert(renderedItems.length === 2,
    'Galeri: Hanya foto berita yang memiliki badge kategori yang ditampilkan di galeri',
    `Expected: 2, Got: ${renderedItems.length}`);

  assert(renderedBadges.length === renderedItems.length && renderedBadges.length > 0,
    'Galeri: Seluruh item foto di galeri memiliki badge kategori berita yang sesuai',
    `Expected badges: ${renderedItems.length}, Got: ${renderedBadges.length}`);

  // --------------------------------------------------------------------------
  // TEST SUITE 8: FOOTER CONTACT EMAIL SYNCHRONIZATION
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 8: FOOTER CONTACT EMAIL SYNCHRONIZATION ---');

  const targetEmail = 'sakomaarifnujabar@gmail.com';
  const oldEmail = 'sakomaarifnu.jabar@gmail.com';
  const pagesToCheck = [
    'index.html',
    'profil.html',
    'kepengurusan.html',
    'berita.html',
    'galeri.html',
    'artikel-kmd.html',
    'artikel-kemah-santri.html'
  ];

  pagesToCheck.forEach(page => {
    const content = fs.readFileSync(path.join(ROOT_DIR, page), 'utf8');
    assert(content.includes(targetEmail),
      `Footer Email: ${page} mencantumkan email resmi ${targetEmail}`);
    assert(!content.includes(oldEmail),
      `Footer Email: ${page} tidak lagi mencantumkan email lama ${oldEmail}`);
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 9: FAVICON VERIFICATION (assets/images/logo.png)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 9: FAVICON VERIFICATION ---');

  const pagesForFavicon = [
    'index.html',
    'profil.html',
    'kepengurusan.html',
    'berita.html',
    'galeri.html',
    'artikel-kmd.html',
    'artikel-kemah-santri.html'
  ];

  pagesForFavicon.forEach(page => {
    const content = fs.readFileSync(path.join(ROOT_DIR, page), 'utf8');
    assert(content.includes('href="assets/images/logo.png"') && content.includes('rel="icon"'),
      `Favicon: ${page} memasang assets/images/logo.png sebagai favicon tab browser`);
  });

  const adminContent = fs.readFileSync(path.join(ROOT_DIR, 'riki', 'index.html'), 'utf8');
  assert(adminContent.includes('href="../assets/images/logo.png"') && adminContent.includes('rel="icon"'),
    'Favicon: riki/index.html memasang logo.png sebagai favicon tab browser');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`HASIL AUTOMATED TESTING: ${passedTests}/${totalTests} TESTS BERHASIL`);
  if (failedTests === 0) {
    console.log('STATUS: SEMUA SISTEM BERFUNGSI SEMPURNA (100% PASS)');
  } else {
    console.log(`STATUS: TERDAPAT ${failedTests} TEST GAGAL`);
  }
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error saat menjalankan test:', err);
  process.exit(1);
});
