/* ============================================================
   SAKO Ma'arif NU Jawa Barat – Main JavaScript
   Enhanced with dynamic content synchronization via SakoDB
   ============================================================ */

(function () {
  'use strict';

  /* --- Theme Toggle --- */
  function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const root = document.documentElement;

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      localStorage.setItem('sako-theme', theme);
      if (sunIcon && moonIcon) {
        sunIcon.style.display  = theme === 'dark' ? 'block' : 'none';
        moonIcon.style.display = theme === 'dark' ? 'none'  : 'block';
      }
    }

    // Apply stored or default
    const stored = localStorage.getItem('sako-theme') || 'light';
    applyTheme(stored);

    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') || 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  }
  initTheme();

  /* --- Navbar Scroll Effect --- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');

  function handleNavbarScroll() {
    const scrollY = window.scrollY;
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 20);
    }
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 400);
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* --- Mobile Nav Toggle --- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  function setMobileNavOpen(isOpen) {
    if (!navLinks || !navToggle) return;
    navLinks.classList.toggle('open', isOpen);
    if (navbar) navbar.classList.toggle('nav-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    const spans = navToggle.querySelectorAll('span');
    animateHamburger(spans, isOpen);
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = !navLinks.classList.contains('open');
      setMobileNavOpen(isOpen);
    });

    // Close on nav link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        setMobileNavOpen(false);
      });
    });

    // Close on resize above mobile
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
        setMobileNavOpen(false);
      }
    });
  }

  function animateHamburger(spans, open) {
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  }

  /* --- Active Nav Link --- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* --- Scroll Reveal --- */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(el => observer.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('visible'));
    }
  }
  initScrollReveal();

  /* --- Back to Top --- */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Lightbox (Galeri) --- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightbox && lightboxImg) {
    document.addEventListener('click', (e) => {
      const item = e.target.closest('.galeri-item');
      if (item) {
        const img = item.querySelector('img');
        if (img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || 'Dokumentasi Foto';
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => { lightboxImg.src = ''; }, 300);
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });
  }

  /* --- Counter Animation (Stats) --- */
  const statNums = document.querySelectorAll('.stat-num');
  if (statNums.length && 'IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNums.forEach(el => counterObs.observe(el));
  }

  function animateCounter(el) {
    const text = el.textContent;
    const suffix = text.replace(/[0-9]/g, '');
    const target = parseInt(text.replace(/\D/g, ''), 10);
    if (isNaN(target)) return;

    const duration = 1200;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  /* --- Gallery filter --- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.gallery-filter-btn');
    if (!btn) return;

    document.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.galeri-item').forEach(item => {
      const cat = (item.dataset.category || '').toLowerCase();
      if (filter === 'all' || cat.includes(filter) || (filter === 'upacara' && !cat.includes('kemah') && !cat.includes('pelatihan'))) {
        item.style.display = '';
        setTimeout(() => item.style.opacity = '1', 10);
      } else {
        item.style.opacity = '0';
        setTimeout(() => item.style.display = 'none', 200);
      }
    });
  });

  /* ============================================================
     DYNAMIC CONTENT RENDERING (SAKODB CONNECTOR)
     ============================================================ */
  function getInitials(name) {
    if (!name) return 'S';
    const clean = name.replace(/\b(Prof|Dr|Drs|Dra|KH|H|Hj|Ust|Ustadzah|Ir|M\.Si|M\.Ag|M\.Pd|S\.Pd|S\.H|S\.Kom|S\.E|S\.Ag|M\.M|S\.Pd\.I|M\.Pd\.I)\b\.?/gi, '').replace(/[,\.]/g, ' ').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (!parts.length) return 'S';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function getArticleUrl(item) {
    if (!item) return 'berita.html';
    if (item.slug && item.slug.endsWith('.html')) return item.slug;
    if (item.id === 'kemah-santri-2026') return 'artikel-kemah-santri.html';
    if (item.id === 'kmd-sako-2026') return 'artikel-kmd.html';
    return `artikel-kmd.html?id=${encodeURIComponent(item.id)}`;
  }

  function renderPersonList(container, names) {
    if (!container) return;
    if (!names || !names.length) {
      container.innerHTML = '<div class="kepeng-person-item"><span style="color:var(--text-muted);font-size:13px;padding:4px 0;">Belum ada data</span></div>';
      return;
    }
    container.innerHTML = names.map(name => `
      <div class="kepeng-person-item">
        <div class="kepeng-avatar-sm">${getInitials(name)}</div>
        <span>${name}</span>
      </div>
    `).join('');
  }

  async function hydrateCurrentPage() {
    if (!window.SakoDB) return;

    try {
      const path = (window.location.pathname || '').toLowerCase();
      const isKepengurusan = !!document.querySelector('.kepengurusan-section') || path.includes('kepengurusan');
      const isProfil = !!document.querySelector('.profil-section') || path.includes('profil');
      const isIndex = !!document.getElementById('home') || !!document.querySelector('.hero') || path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('/index') || path === '';
      const isBerita = !!document.querySelector('.berita-section') || (path.includes('berita') && !path.includes('artikel'));
      const isArticle = !!document.querySelector('.article-section') || path.includes('artikel');
      const isGaleri = !!document.querySelector('.galeri-section') || !!document.querySelector('.gallery-preview-section');

      // 1. KEPENGURUSAN PAGE
      if (isKepengurusan) {
        const kep = await window.SakoDB.getKepengurusan();
        if (kep) {
          // Mabisako
          if (kep.mabisako) {
            const mabiKetuaName = document.getElementById('mabiKetuaName') || document.querySelector('.kepeng-person-name');
            const mabiKetuaRole = document.getElementById('mabiKetuaRole') || document.querySelector('.kepeng-person-role');
            const mabiKetuaAvatar = document.getElementById('mabiKetuaAvatar') || document.querySelector('.kepeng-avatar');
            if (mabiKetuaName && kep.mabisako.ketua?.name) mabiKetuaName.textContent = kep.mabisako.ketua.name;
            if (mabiKetuaRole && kep.mabisako.ketua?.role) mabiKetuaRole.textContent = kep.mabisako.ketua.role;
            if (mabiKetuaAvatar && kep.mabisako.ketua?.name) mabiKetuaAvatar.textContent = getInitials(kep.mabisako.ketua.name);

            renderPersonList(document.getElementById('mabiWakilList'), kep.mabisako.wakilKetua);
            renderPersonList(document.getElementById('mabiSekretarisList'), kep.mabisako.sekretaris);
            renderPersonList(document.getElementById('mabiAnggotaList'), kep.mabisako.anggota);
          }

          // Pimpinan Harian
          if (kep.pimpinan) {
            const pimpinanKetuaName = document.getElementById('pimpinanKetuaName') || document.querySelectorAll('.kepeng-person-name')[1];
            const pimpinanKetuaRole = document.getElementById('pimpinanKetuaRole') || document.querySelectorAll('.kepeng-person-role')[1];
            const pimpinanKetuaAvatar = document.getElementById('pimpinanKetuaAvatar') || document.querySelectorAll('.kepeng-avatar')[1];
            if (pimpinanKetuaName && kep.pimpinan.ketua?.name) pimpinanKetuaName.textContent = kep.pimpinan.ketua.name;
            if (pimpinanKetuaRole && kep.pimpinan.ketua?.role) pimpinanKetuaRole.textContent = kep.pimpinan.ketua.role;
            if (pimpinanKetuaAvatar && kep.pimpinan.ketua?.name) pimpinanKetuaAvatar.textContent = getInitials(kep.pimpinan.ketua.name);

            renderPersonList(document.getElementById('pimpinanWakilList'), kep.pimpinan.wakilKetua);
            renderPersonList(document.getElementById('pimpinanSekretarisList'), kep.pimpinan.sekretaris);
            renderPersonList(document.getElementById('pimpinanBendaharaList'), kep.pimpinan.bendahara);
          }

          // Bidang-Bidang Pengurus
          const bidangGrid = document.getElementById('bidangGrid') || document.querySelector('.bidang-grid');
          if (bidangGrid && kep.bidang && kep.bidang.length) {
            bidangGrid.innerHTML = kep.bidang.map((b, idx) => `
              <div class="bidang-card">
                <div class="bidang-card-title">
                  <span class="bidang-num">${idx + 1}</span>
                  ${b.name || 'Bidang Kerja ' + (idx + 1)}
                </div>
                <div class="bidang-members">
                  ${b.ketua ? `<div class="bidang-member"><strong>${b.ketua}</strong> — Ketua Bidang</div>` : ''}
                  ${(b.anggota || []).map(a => `<div class="bidang-member">${a}</div>`).join('')}
                </div>
              </div>
            `).join('');
          }
        }
      }

      // 2. PROFIL PAGE (TENTANG, VISI, MISI, TUJUAN)
      if (isProfil) {
        const tentang = await window.SakoDB.getTentang();
        const visimisi = await window.SakoDB.getVisiMisi();

        if (tentang) {
          const introContainer = document.getElementById('profil-intro-text') || document.querySelector('.profil-text-content');
          if (introContainer) {
            const heading = tentang.introHeading || 'Tentang Sako Maarif NU Jawa Barat';
            const leadP = tentang.leadParagraph ? `<p>${tentang.leadParagraph}</p>` : '';
            const otherPs = (tentang.paragraphs || []).filter(Boolean).map(p => `<p>${p}</p>`).join('');
            introContainer.innerHTML = `<span class="profil-intro-heading">${heading}</span>${leadP}${otherPs}`;
          }
        }

        if (visimisi) {
          const visiQuote = document.querySelector('.profil-card-quote');
          if (visiQuote && visimisi.visi) visiQuote.textContent = `"${visimisi.visi}"`;

          const misiList = document.getElementById('misi-list') || document.querySelector('.misi-list');
          if (misiList && visimisi.misi && visimisi.misi.length) {
            misiList.innerHTML = visimisi.misi.map((m, idx) => `
              <div class="misi-item"><span class="misi-num">${idx + 1}</span><span class="misi-text">${m}</span></div>
            `).join('');
          }

          const tujuanList = document.getElementById('tujuan-list') || document.querySelector('.tujuan-list');
          if (tujuanList && visimisi.tujuan && visimisi.tujuan.length) {
            tujuanList.innerHTML = visimisi.tujuan.map((t, idx) => `
              <div class="tujuan-item"><span class="tujuan-num">${idx + 1}</span><span class="tujuan-text">${t}</span></div>
            `).join('');
          }
        }
      }

      // 3. INDEX / BERANDA (STATS, PILARS, NEWS PREVIEW)
      if (isIndex) {
        const tentangData = await window.SakoDB.getTentang();
        if (tentangData) {
          // Dynamic Hero Stats
          if (tentangData.stats) {
            const statTahun = document.getElementById('stat-tahun');
            const statBidang = document.getElementById('stat-bidang');
            const statPengurus = document.getElementById('stat-pengurus');
            if (statTahun && tentangData.stats.tahun) statTahun.textContent = tentangData.stats.tahun;
            if (statBidang && tentangData.stats.bidang) statBidang.textContent = tentangData.stats.bidang;
            if (statPengurus && tentangData.stats.pengurus) statPengurus.textContent = tentangData.stats.pengurus;
          }

          // Pillars
          const aboutGrid = document.querySelector('.about-grid');
          if (aboutGrid && tentangData.pillars && tentangData.pillars.length) {
            aboutGrid.innerHTML = '';
            tentangData.pillars.forEach((p, idx) => {
              const card = document.createElement('div');
              card.className = `about-card reveal reveal-delay-${(idx % 4) + 1}`;
              const iconSvg = p.icon && !/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u.test(p.icon)
                ? p.icon
                : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
              card.innerHTML = `
                <div class="about-icon">${iconSvg}</div>
                <h3>${p.title}</h3>
                <p>${p.desc}</p>
              `;
              aboutGrid.appendChild(card);
            });
            initScrollReveal();
          }
        }
      }

      // 4. BERITA & WARTA (INDEX & BERITA PAGES)
      const newsGrid = document.querySelector('.news-grid') || document.querySelector('.berita-grid');
      const beritaList = await window.SakoDB.getBerita();

      if (beritaList && beritaList.length && newsGrid) {
        if (isIndex) {
          newsGrid.innerHTML = '';
          beritaList.slice(0, 3).forEach((item, idx) => {
            const article = document.createElement('article');
            article.className = `news-card reveal reveal-delay-${idx + 1}`;
            const targetUrl = getArticleUrl(item);
            article.innerHTML = `
              <div class="news-card-img">
                <img src="${item.image || 'assets/images/kemah1.png'}" alt="${item.title}" onerror="this.parentElement.classList.add('img-fallback')" />
                <span class="news-category">${item.category || 'Berita'}</span>
              </div>
              <div class="news-card-body">
                <div class="news-meta">
                  <span class="news-author">${item.author || 'SAKOMA'}</span>
                  <span class="news-date">${item.dateFormatted || item.date || ''}</span>
                </div>
                <h3 class="news-title">
                  <a href="${targetUrl}">${item.title}</a>
                </h3>
                <p class="news-excerpt">${item.excerpt || ''}</p>
                <a href="${targetUrl}" class="news-readmore">Baca Selengkapnya →</a>
              </div>
            `;
            newsGrid.appendChild(article);
          });
          initScrollReveal();
        } else if (isBerita) {
          const featuredWrap = document.querySelector('.news-card.featured');
          const featuredItem = beritaList.find(b => b.featured) || beritaList[0];

          if (featuredWrap && featuredItem) {
            const targetUrl = getArticleUrl(featuredItem);
            const img = featuredWrap.querySelector('.news-card-img img');
            const cat = featuredWrap.querySelector('.news-category');
            const date = featuredWrap.querySelector('.news-date');
            const titleA = featuredWrap.querySelector('.news-title a');
            const excerpt = featuredWrap.querySelector('.news-excerpt');
            const btn = featuredWrap.querySelector('.btn');

            if (img) img.src = featuredItem.image || 'assets/images/kemah1.png';
            if (cat) cat.textContent = featuredItem.category || 'Berita';
            if (date) date.textContent = featuredItem.dateFormatted || featuredItem.date || '';
            if (titleA) { titleA.textContent = featuredItem.title; titleA.href = targetUrl; }
            if (excerpt) excerpt.textContent = featuredItem.excerpt || '';
            if (btn) btn.href = targetUrl;
          }

          const otherNews = beritaList.filter(b => b.id !== featuredItem.id);
          if (otherNews.length) {
            newsGrid.innerHTML = '';
            otherNews.forEach((item, idx) => {
              const article = document.createElement('article');
              article.className = `news-card reveal reveal-delay-${(idx % 3) + 1}`;
              const targetUrl = getArticleUrl(item);
              article.innerHTML = `
                <div class="news-card-img">
                  <img src="${item.image || 'assets/images/kemah2.png'}" alt="${item.title}" onerror="this.parentElement.classList.add('img-fallback')" />
                  <span class="news-category">${item.category || 'Berita'}</span>
                </div>
                <div class="news-card-body">
                  <div class="news-meta">
                    <span class="news-author">${item.author || 'SAKOMA'}</span>
                    <span class="news-date">${item.dateFormatted || item.date || ''}</span>
                  </div>
                  <h3 class="news-title">
                    <a href="${targetUrl}">${item.title}</a>
                  </h3>
                  <p class="news-excerpt">${item.excerpt || ''}</p>
                  <a href="${targetUrl}" class="news-readmore">Baca Selengkapnya →</a>
                </div>
              `;
              newsGrid.appendChild(article);
            });
            initScrollReveal();
          }
        }
      }

      // 5. DETAIL ARTIKEL BERITA
      if (isArticle) {
        const urlParams = new URLSearchParams(window.location.search);
        const reqId = urlParams.get('id');
        const activeId = reqId || (path.includes('kemah') ? 'kemah-santri-2026' : 'kmd-sako-2026');

        const articleList = await window.SakoDB.getBerita();
        const article = articleList?.find(b => b.id === activeId || (b.slug && path.includes(b.slug)));

        if (article) {
          if (reqId) {
            document.title = `${article.title} – SAKO Ma'arif NU Jawa Barat`;
          }
          const heroTitle = document.getElementById('articleHeroTitle');
          const heroSub = document.getElementById('articleHeroSub');
          const breadcrumbCurrent = document.getElementById('articleBreadcrumbCurrent');
          const badgeTag = document.getElementById('articleBadgeTag');
          const coverImg = document.getElementById('articleCoverImg');
          const catLabel = document.getElementById('articleCatLabel');
          const authorLabel = document.getElementById('articleAuthorLabel');
          const dateLabel = document.getElementById('articleDateLabel');
          const mainTitle = document.getElementById('articleMainTitle');
          const bodyContent = document.getElementById('articleBodyContent');

          if (heroTitle) heroTitle.textContent = article.title;
          if (heroSub && reqId) heroSub.textContent = `Warta Resmi SAKO Ma'arif NU Jawa Barat`;
          if (breadcrumbCurrent) breadcrumbCurrent.textContent = article.title;
          if (badgeTag) badgeTag.textContent = article.category || 'Berita';
          if (catLabel) catLabel.textContent = article.category || 'Berita';
          if (authorLabel) authorLabel.textContent = article.author || 'SAKOMA';
          if (dateLabel) dateLabel.textContent = article.dateFormatted || article.date || '';
          if (mainTitle) mainTitle.textContent = article.title;
          if (coverImg && article.image) {
            coverImg.src = article.image;
            coverImg.alt = article.title;
          }
          if (reqId && bodyContent && article.content) {
            const rawParagraphs = article.content.split(/\n\s*\n/).filter(Boolean);
            bodyContent.innerHTML = `
              <div class="highlight-box">
                <strong>${article.category || 'Warta'}</strong> — ${article.excerpt || article.title}
              </div>
              ${rawParagraphs.map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')}
            `;
          }
        }
      }

      // 6. DYNAMIC GALLERY (GALERI PAGE & PREVIEW)
      if (isGaleri && window.SakoDB) {
        const galeriGrid = document.querySelector('.galeri-grid');
        const galleryPreviewGrid = document.querySelector('.gallery-preview-grid');
        const newsItems = await window.SakoDB.getBerita();

        const basePhotos = [
          { image: 'assets/images/kemah1.png', title: 'Kemah Santri Pramuka Terpadu Jawa Barat', category: 'kemah' },
          { image: 'assets/images/kemah2.png', title: 'Kursus Mahir Dasar (KMD) Pembina Pramuka', category: 'pelatihan' },
          { image: 'assets/images/kemah3.png', title: 'Upacara Pembukaan & Apel Akbar Pramuka SAKO', category: 'upacara' },
          { image: 'assets/images/kemah4.png', title: 'Latihan Keterampilan Lapangan & Pionering', category: 'kemah' },
          { image: 'assets/images/kemah2.png', title: 'Pendidikan Karakter & Kepanduan Ma\'arif NU', category: 'pelatihan' },
          { image: 'assets/images/kemah1.png', title: 'Dokumentasi Kebersamaan Pramuka Santri', category: 'kemah' },
          { image: 'assets/images/kemah3.png', title: 'Giat Prestasi & Persaudaraan Pandu Ma\'arif', category: 'upacara' },
          { image: 'assets/images/kemah4.png', title: 'Malam Api Unggun & Renungan Pandu NU', category: 'kemah' }
        ];

        const newsPhotos = [];
        if (newsItems && newsItems.length) {
          newsItems.forEach(item => {
            if (item.image) {
              const catLower = (item.category || '').toLowerCase();
              const catSlug = catLower.includes('latih') || catLower.includes('kmd') ? 'pelatihan' :
                             catLower.includes('kemah') ? 'kemah' : 'upacara';
              newsPhotos.push({
                image: item.image,
                title: item.title,
                category: catSlug,
                categoryName: item.category || 'Berita',
                date: item.dateFormatted || item.date || '',
                isFromNews: true
              });
            }
          });
        }

        const fullGallery = [...newsPhotos, ...basePhotos];

        if (galeriGrid) {
          galeriGrid.innerHTML = '';
          fullGallery.forEach((photo, idx) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = `galeri-item reveal reveal-delay-${(idx % 3) + 1}`;
            itemDiv.setAttribute('data-category', photo.category || 'kemah');

            const badgeTag = photo.isFromNews ? `
              <span style="position: absolute; top: 12px; left: 12px; z-index: 2; background: rgba(37,99,37,0.92); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; backdrop-filter: blur(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.5px;">
                ${photo.categoryName}
              </span>
            ` : '';

            itemDiv.innerHTML = `
              ${badgeTag}
              <img src="${photo.image}" alt="${photo.title}" loading="lazy" onerror="this.parentElement.style.background='var(--green-100)'" />
              <div class="galeri-item-overlay">
                <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
                  <span style="font-size: 13.5px; font-weight: 700; color: #fff; line-height: 1.35;">${photo.title}</span>
                  <span style="font-size: 11.5px; color: var(--gold-light); font-weight: 600; display: flex; align-items: center; justify-content: space-between;">
                    <span>Lihat Foto &rarr;</span>
                    ${photo.date ? `<small style="color: rgba(255,255,255,0.7); font-weight: 400;">${photo.date}</small>` : ''}
                  </span>
                </div>
              </div>
            `;
            galeriGrid.appendChild(itemDiv);
          });
          initScrollReveal();
        }

        if (galleryPreviewGrid) {
          galleryPreviewGrid.innerHTML = '';
          const previewPhotos = fullGallery.slice(0, 3);
          previewPhotos.forEach((photo, idx) => {
            const a = document.createElement('a');
            a.href = 'galeri.html';
            a.className = `gallery-preview-item item-${idx + 1}`;
            a.innerHTML = `
              <img src="${photo.image}" alt="${photo.title}" />
              <div class="gallery-overlay">
                <div style="text-align: center; padding: 0 12px;">
                  <span style="display: block; font-weight: 700; font-size: 13.5px; margin-bottom: 2px;">${photo.title}</span>
                  <small style="font-size: 11px; opacity: 0.9; color: var(--gold-light);">Buka di Galeri →</small>
                </div>
              </div>
            `;
            galleryPreviewGrid.appendChild(a);
          });
        }
      }

    } catch (err) {
      console.warn('Dynamic content hydration skipped:', err);
    }
  }

  // Initial hydration on DOM ready
  document.addEventListener('DOMContentLoaded', hydrateCurrentPage);

  // Real-time synchronization when admin saves changes in another tab or same window
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('sako_')) {
      hydrateCurrentPage();
    }
  });

})();
