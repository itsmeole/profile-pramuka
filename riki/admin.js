/**
 * SAKO Ma'arif NU Jawa Barat – Admin Portal Logic
 * Controls authentication, tab navigation, responsive mobile drawer, and CRUD operations.
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // DOM Elements
  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');
  const loginForm = document.getElementById('loginForm');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const loginAlert = document.getElementById('loginAlert');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const eyeIconOpen = document.getElementById('eyeIconOpen');
  const eyeIconClosed = document.getElementById('eyeIconClosed');
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutModal = document.getElementById('logoutModal');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const adminSidebar = document.getElementById('adminSidebar');
  const pageTitleText = document.getElementById('pageTitleText');
  const cloudStatusBadge = document.getElementById('cloudStatusBadge');
  const cloudStatusText = document.getElementById('cloudStatusText');
  const toastContainer = document.getElementById('toastContainer');

  // --- MOBILE SIDEBAR DRAWER OVERLAY ---
  let sidebarOverlay = document.querySelector('.sidebar-overlay');
  if (!sidebarOverlay) {
    sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);
  }

  function setSidebarOpen(isOpen) {
    if (adminSidebar) adminSidebar.classList.toggle('open', isOpen);
    if (sidebarOverlay) sidebarOverlay.classList.toggle('active', isOpen);
    if (window.innerWidth <= 1024) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentlyOpen = adminSidebar && adminSidebar.classList.contains('open');
      setSidebarOpen(!currentlyOpen);
    });
  }

  sidebarOverlay.addEventListener('click', () => setSidebarOpen(false));

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) setSidebarOpen(false);
    });
  });

  // --- TOAST NOTIFICATION (NO EMOJIS, CLEAN SVGS) ---
  window.showToast = function (message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconSvg = type === 'success'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
      : type === 'error'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    
    toast.innerHTML = `<span class="toast-icon">${iconSvg}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  };

  // --- AUTH CHECK ---
  function checkAuth() {
    if (window.SakoDB.isAuthenticated()) {
      loginView.style.display = 'none';
      dashboardView.style.display = 'flex';
      const user = window.SakoDB.getCurrentUser();
      if (user) {
        document.getElementById('sidebarUserName').textContent = user.name || user.username || 'Admin';
        document.getElementById('sidebarAvatar').textContent = (user.name || user.username || 'A')[0].toUpperCase();
      }
      updateCloudStatusBadge();
      loadAllDashboardData();
    } else {
      loginView.style.display = 'flex';
      dashboardView.style.display = 'none';
    }
  }

  // Toggle Password Visibility
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      loginPassword.setAttribute('type', type);
      if (eyeIconOpen && eyeIconClosed) {
        eyeIconOpen.style.display = type === 'password' ? 'block' : 'none';
        eyeIconClosed.style.display = type === 'password' ? 'none' : 'block';
      }
    });
  }

  // Handle Login Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginAlert.style.display = 'none';
    const user = loginUsername.value.trim();
    const pass = loginPassword.value.trim();

    const result = await window.SakoDB.login(user, pass);
    if (result.success) {
      showToast('Selamat datang kembali, Admin!', 'success');
      checkAuth();
    } else {
      loginAlert.textContent = result.message || 'Login gagal! Periksa username & password.';
      loginAlert.style.display = 'block';
    }
  });

  // --- LOGOUT LOGIC ---
  function openLogoutModal() {
    if (logoutModal) logoutModal.style.display = 'flex';
    else executeLogout();
  }

  function closeLogoutModal() {
    if (logoutModal) logoutModal.style.display = 'none';
  }

  function executeLogout() {
    closeLogoutModal();
    try {
      if (window.SakoDB && typeof window.SakoDB.logout === 'function') {
        window.SakoDB.logout();
      }
    } catch (e) {
      console.warn('Error during SakoDB.logout:', e);
    }
    sessionStorage.clear();
    loginPassword.value = '';
    if (loginAlert) loginAlert.style.display = 'none';
    showToast('Berhasil keluar dari panel pengelola.', 'info');
    checkAuth();
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openLogoutModal();
    });
  }

  if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeLogoutModal();
    });
  }

  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeLogout();
    });
  }

  // --- TAB NAVIGATION ---
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const adminSections = document.querySelectorAll('.admin-section');

  const tabTitles = {
    'tab-overview': 'Ringkasan Dashboard',
    'tab-berita': 'Manajemen Berita & Kegiatan',
    'tab-berita-editor': 'Tulis Berita Baru',
    'tab-slideshow': 'Pengaturan Slideshow Hero',
    'tab-tentang': 'Informasi Tentang Kami',
    'tab-visimisi': 'Visi, Misi & Tujuan',
    'tab-kepengurusan': 'Susunan Kepengurusan',
    'tab-security': 'Pengaturan Akun & Keamanan'
  };

  window.switchTab = function (tabId) {
    adminSections.forEach(sec => sec.classList.remove('active'));
    sidebarLinks.forEach(link => link.classList.remove('active'));

    const targetSection = document.getElementById(tabId);
    if (targetSection) targetSection.classList.add('active');

    const activeLink = document.querySelector(`.sidebar-link[data-tab="${tabId}"]`);
    if (activeLink) activeLink.classList.add('active');

    pageTitleText.textContent = tabTitles[tabId] || 'Portal Admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load data for specific tab
    if (tabId === 'tab-overview') loadOverviewStats();
    if (tabId === 'tab-berita') loadBeritaTab();
    if (tabId === 'tab-slideshow') loadSlideshowTab();
    if (tabId === 'tab-tentang') loadTentangTab();
    if (tabId === 'tab-visimisi') loadVisiMisiTab();
    if (tabId === 'tab-kepengurusan') loadKepengurusanTab();
    if (tabId === 'tab-security') loadSecurityTab();
  };

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Update Status Badge
  function updateCloudStatusBadge() {
    const isCloud = window.SakoDB.isCloudConnected();
    if (isCloud) {
      cloudStatusBadge.className = 'badge-db-status cloud';
      cloudStatusText.textContent = 'Cloud Terhubung';
    } else {
      cloudStatusBadge.className = 'badge-db-status local';
      cloudStatusText.textContent = 'Local Storage';
    }
  }

  // Initial Load All Data
  async function loadAllDashboardData() {
    loadOverviewStats();
    loadBeritaTab();
  }

  // --- 1. OVERVIEW STATS ---
  async function loadOverviewStats() {
    const news = await window.SakoDB.getBerita();
    const tentang = await window.SakoDB.getTentang();

    document.getElementById('statTotalBerita').textContent = news ? news.length : '0';
    document.getElementById('statTotalPengurus').textContent = tentang?.stats?.pengurus || '60+';
    document.getElementById('statTotalBidang').textContent = tentang?.stats?.bidang || '8';
  }

  // --- 2. BERITA & KEGIATAN ---
  const newsTableBody = document.getElementById('newsTableBody');
  const openAddNewsModalBtn = document.getElementById('openAddNewsModalBtn');
  const saveNewsSubmitBtn = document.getElementById('saveNewsSubmitBtn');
  const saveNewsSubmitBtnBottom = document.getElementById('saveNewsSubmitBtnBottom');
  const newsImageFileInput = document.getElementById('newsImageFileInput');
  const newsImageInput = document.getElementById('newsImageInput');
  const imagePreviewBox = document.getElementById('imagePreviewBox');
  const imagePreviewEl = document.getElementById('imagePreviewEl');
  const resetImageBtn = document.getElementById('resetImageBtn');
  const fileSizeIndicator = document.getElementById('fileSizeIndicator');

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB limit in bytes

  async function loadBeritaTab() {
    const newsList = await window.SakoDB.getBerita();
    newsTableBody.innerHTML = '';

    if (!newsList || newsList.length === 0) {
      newsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 36px;">Belum ada berita. Klik "+ Tambah Berita Baru" untuk menerbitkan artikel pertama.</td></tr>`;
      return;
    }

    newsList.forEach(item => {
      const tr = document.createElement('tr');
      const imgPath = item.image ? (item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `../${item.image}`) : '../assets/images/kemah1.png';
      tr.innerHTML = `
        <td><img src="${imgPath}" class="table-img" onerror="this.src='../assets/images/logo.png'" alt="${item.title}" /></td>
        <td>
          <strong style="color: var(--text-main); display: block; font-size: 13.5px; line-height: 1.35;">${item.title}</strong>
          ${item.featured ? '<span class="badge-tag" style="margin-top: 5px; background: rgba(230,180,34,0.12); color: var(--gold-400); border-color: rgba(230,180,34,0.3);">Utama</span>' : ''}
        </td>
        <td><span class="badge-tag">${item.category || 'Berita'}</span></td>
        <td style="color: var(--text-muted); font-size: 12px;">${item.dateFormatted || item.date || '-'}</td>
        <td style="color: var(--text-muted); font-size: 12px;">${item.author || 'Admin'}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button type="button" class="btn-table-action edit" onclick="editNewsItem('${item.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Edit</span>
          </button>
          <button type="button" class="btn-table-action delete" onclick="deleteNewsItem('${item.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Hapus</span>
          </button>
        </td>
      `;
      newsTableBody.appendChild(tr);
    });
  }

  // --- DEDICATED FULL-PAGE EDITOR LOGIC ---
  window.openNewsEditor = function (id = null) {
    const isEdit = !!id;
    document.getElementById('editNewsId').value = id || '';
    document.getElementById('newsEditorHeading').textContent = isEdit ? 'Edit Berita' : 'Tulis Berita Baru';
    document.getElementById('newsEditorSubheading').textContent = isEdit 
      ? 'Perbarui informasi dan naskah artikel berita.' 
      : 'Isi formulir di bawah ini untuk menerbitkan artikel berita resmi SAKO Ma\'arif NU Jawa Barat.';

    if (fileSizeIndicator) fileSizeIndicator.style.display = 'none';
    if (resetImageBtn) resetImageBtn.style.display = 'none';
    if (newsImageFileInput) newsImageFileInput.value = '';

    if (!isEdit) {
      document.getElementById('newsTitleInput').value = '';
      document.getElementById('newsCategoryInput').value = 'Kemah';
      document.getElementById('newsAuthorInput').value = 'SAKOMA';
      document.getElementById('newsImageInput').value = 'assets/images/kemah1.png';
      document.getElementById('newsExcerptInput').value = '';
      document.getElementById('newsContentInput').value = '';
      document.getElementById('newsFeaturedInput').checked = false;
      const heroCheck = document.getElementById('newsHeroSlideshowInput');
      if (heroCheck) heroCheck.checked = true;
      imagePreviewBox.style.display = 'block';
      imagePreviewEl.src = '../assets/images/kemah1.png';
    }

    switchTab('tab-berita-editor');
    pageTitleText.textContent = isEdit ? 'Edit Berita' : 'Tulis Berita Baru';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.closeNewsEditor = function () {
    switchTab('tab-berita');
  };

  if (openAddNewsModalBtn) {
    openAddNewsModalBtn.addEventListener('click', () => openNewsEditor(null));
  }

  // File Upload & Preview Handler with strict <= 2MB Check
  if (newsImageFileInput) {
    newsImageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > MAX_IMAGE_SIZE) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        alert(`Peringatan Ukuran File:\nUkuran file gambar adalah ${sizeMb} MB, melebihi batas maksimum 2 MB.\n\nSilakan pilih gambar dengan ukuran di bawah 2 MB agar performa website tetap optimal.`);
        newsImageFileInput.value = '';
        fileSizeIndicator.style.display = 'none';
        return;
      }

      const sizeKb = Math.round(file.size / 1024);
      if (fileSizeIndicator) {
        fileSizeIndicator.textContent = `Foto siap diunggah: ${sizeKb} KB (Valid < 2 MB)`;
        fileSizeIndicator.style.display = 'inline-block';
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        newsImageInput.value = base64Data;
        imagePreviewEl.src = base64Data;
        imagePreviewBox.style.display = 'block';
        if (resetImageBtn) resetImageBtn.style.display = 'inline-block';
      };
      reader.readAsDataURL(file);
    });
  }

  // Manual URL image preview listener
  if (newsImageInput) {
    newsImageInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val) {
        const fullSrc = val.startsWith('http') || val.startsWith('data:') ? val : (val.startsWith('../') ? val : `../${val}`);
        imagePreviewEl.src = fullSrc;
        imagePreviewBox.style.display = 'block';
      } else {
        imagePreviewBox.style.display = 'none';
      }
    });
  }

  // Reset uploaded image
  if (resetImageBtn) {
    resetImageBtn.addEventListener('click', () => {
      newsImageFileInput.value = '';
      newsImageInput.value = 'assets/images/kemah1.png';
      imagePreviewEl.src = '../assets/images/kemah1.png';
      resetImageBtn.style.display = 'none';
      if (fileSizeIndicator) fileSizeIndicator.style.display = 'none';
    });
  }

  // Edit News Function
  window.editNewsItem = async function (id) {
    const newsList = await window.SakoDB.getBerita();
    const item = newsList.find(b => b.id === id);
    if (!item) return;

    openNewsEditor(id);

    document.getElementById('newsTitleInput').value = item.title || '';
    document.getElementById('newsCategoryInput').value = item.category || 'Kemah';
    document.getElementById('newsAuthorInput').value = item.author || 'SAKOMA';
    document.getElementById('newsImageInput').value = item.image || 'assets/images/kemah1.png';
    document.getElementById('newsExcerptInput').value = item.excerpt || '';
    document.getElementById('newsContentInput').value = item.content || '';
    document.getElementById('newsFeaturedInput').checked = !!item.featured;

    const heroCfg = (await window.SakoDB.getHeroSlideshow()) || { selectedNewsIds: [] };
    const inHero = heroCfg.selectedNewsIds && heroCfg.selectedNewsIds.includes(String(id));
    const heroCheck = document.getElementById('newsHeroSlideshowInput');
    if (heroCheck) heroCheck.checked = !!inHero;

    const imgVal = item.image || 'assets/images/kemah1.png';
    imagePreviewEl.src = imgVal.startsWith('http') || imgVal.startsWith('data:') ? imgVal : (imgVal.startsWith('../') ? imgVal : `../${imgVal}`);
    imagePreviewBox.style.display = 'block';
  };

  // Delete News Modal & Execution
  const deleteNewsModal = document.getElementById('deleteNewsModal');
  const cancelDeleteNewsBtn = document.getElementById('cancelDeleteNewsBtn');
  const confirmDeleteNewsBtn = document.getElementById('confirmDeleteNewsBtn');
  let newsIdToDelete = null;

  window.deleteNewsItem = function (id) {
    newsIdToDelete = id;
    if (deleteNewsModal) {
      deleteNewsModal.style.display = 'flex';
    } else {
      if (confirm('Apakah Anda yakin ingin menghapus artikel berita ini?')) {
        executeDeleteNews(id);
      }
    }
  };

  async function executeDeleteNews(id) {
    if (!id) return;
    try {
      await window.SakoDB.deleteBeritaItem(id);
      showToast('Berita berhasil dihapus!', 'success');
      loadBeritaTab();
      loadOverviewStats();
    } catch (err) {
      showToast('Gagal menghapus berita: ' + err.message, 'error');
    } finally {
      if (deleteNewsModal) deleteNewsModal.style.display = 'none';
      newsIdToDelete = null;
    }
  }

  if (cancelDeleteNewsBtn) {
    cancelDeleteNewsBtn.addEventListener('click', () => {
      if (deleteNewsModal) deleteNewsModal.style.display = 'none';
      newsIdToDelete = null;
    });
  }

  if (confirmDeleteNewsBtn) {
    confirmDeleteNewsBtn.addEventListener('click', () => {
      if (newsIdToDelete) {
        executeDeleteNews(newsIdToDelete);
      }
    });
  }

  if (deleteNewsModal) {
    deleteNewsModal.addEventListener('click', (e) => {
      if (e.target === deleteNewsModal) {
        deleteNewsModal.style.display = 'none';
        newsIdToDelete = null;
      }
    });
  }

  // Submit Save News Handler
  async function handleSaveNews() {
    const title = document.getElementById('newsTitleInput').value.trim();
    if (!title) {
      alert('Judul berita tidak boleh kosong!');
      document.getElementById('newsTitleInput').focus();
      return;
    }

    const content = document.getElementById('newsContentInput').value.trim();
    if (!content) {
      alert('Isi artikel berita tidak boleh kosong!');
      document.getElementById('newsContentInput').focus();
      return;
    }

    const id = document.getElementById('editNewsId').value.trim() || 'news-' + Date.now();
    const item = {
      id: id,
      title: title,
      category: document.getElementById('newsCategoryInput').value,
      author: document.getElementById('newsAuthorInput').value.trim() || 'SAKOMA',
      image: document.getElementById('newsImageInput').value.trim() || 'assets/images/kemah1.png',
      excerpt: document.getElementById('newsExcerptInput').value.trim() || (content.substring(0, 160) + '...'),
      content: content,
      featured: document.getElementById('newsFeaturedInput').checked,
      date: new Date().toISOString().split('T')[0]
    };

    await window.SakoDB.saveBeritaItem(item);

    // Sync hero slideshow selection for this article
    const inHeroSlideshow = document.getElementById('newsHeroSlideshowInput')?.checked;
    if (inHeroSlideshow !== undefined) {
      try {
        const heroCfg = (await window.SakoDB.getHeroSlideshow()) || { enabled: true, interval: 5000, selectedNewsIds: [] };
        let ids = Array.isArray(heroCfg.selectedNewsIds) ? [...heroCfg.selectedNewsIds] : [];
        if (inHeroSlideshow) {
          if (!ids.includes(String(id))) ids.push(String(id));
        } else {
          ids = ids.filter(i => String(i) !== String(id));
        }
        heroCfg.selectedNewsIds = ids;
        await window.SakoDB.saveHeroSlideshow(heroCfg);
      } catch (err) {
        console.warn('Hero slideshow sync warning:', err);
      }
    }

    showToast('Berita berhasil disimpan!', 'success');
    closeNewsEditor();
    loadBeritaTab();
    loadOverviewStats();
  }

  if (saveNewsSubmitBtn) {
    saveNewsSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSaveNews();
    });
  }

  if (saveNewsSubmitBtnBottom) {
    saveNewsSubmitBtnBottom.addEventListener('click', (e) => {
      e.preventDefault();
      handleSaveNews();
    });
  }

  // --- 2.B HERO SLIDESHOW TAB LOGIC ---
  let adminSlideshowTimer = null;
  let adminSlideIndex = 0;

  async function loadSlideshowTab() {
    const newsList = (await window.SakoDB.getBerita()) || [];
    const cfg = (await window.SakoDB.getHeroSlideshow()) || { enabled: true, interval: 5000, selectedNewsIds: [] };

    const statusSelect = document.getElementById('slideshowStatusSelect');
    const intervalSelect = document.getElementById('slideshowIntervalSelect');
    const activeCountEl = document.getElementById('slideshowActiveCount');
    const grid = document.getElementById('slideshowNewsGrid');

    if (statusSelect) statusSelect.value = cfg.enabled ? 'true' : 'false';
    if (intervalSelect) intervalSelect.value = String(cfg.interval || 5000);

    const newsWithPhotos = newsList.filter(item => item.image && String(item.image).trim() !== '');

    if (!newsWithPhotos.length) {
      if (grid) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: var(--admin-surface-2); border-radius: var(--radius-sm);">
            Belum ada berita dengan gambar. Silakan buat atau tambahkan foto pada artikel berita terlebih dahulu.
          </div>
        `;
      }
      if (activeCountEl) activeCountEl.textContent = '0 foto aktif';
      renderAdminSlideshowPreview([]);
      return;
    }

    let selectedIds = Array.isArray(cfg.selectedNewsIds) && cfg.selectedNewsIds.length > 0
      ? cfg.selectedNewsIds.map(String)
      : newsWithPhotos.map(item => String(item.id));

    if (grid) {
      grid.innerHTML = '';
      newsWithPhotos.forEach(item => {
        const isChecked = selectedIds.includes(String(item.id));
        const imgSrc = item.image.startsWith('http') || item.image.startsWith('data:')
          ? item.image
          : (item.image.startsWith('../') ? item.image : `../${item.image}`);

        const card = document.createElement('div');
        card.className = `slideshow-item-card ${isChecked ? 'selected' : ''}`;
        card.style.background = 'var(--admin-surface-2)';
        card.style.border = isChecked ? '1px solid var(--gold-400)' : '1px solid var(--admin-border)';
        card.style.borderRadius = 'var(--radius-sm)';
        card.style.overflow = 'hidden';
        card.style.transition = 'all var(--transition)';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';

        card.innerHTML = `
          <div style="position: relative; width: 100%; aspect-ratio: 16/10; overflow: hidden; background: #000;">
            <img src="${imgSrc}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../assets/images/logo.png'" />
            <span style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); color: var(--gold-300); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; text-transform: uppercase;">
              ${item.category || 'Berita'}
            </span>
            <span class="slide-badge-status" style="position: absolute; top: 10px; right: 10px; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; ${isChecked ? 'background: rgba(30,120,50,0.9); color: #fff;' : 'background: rgba(80,80,80,0.85); color: #ccc;'}">
              ${isChecked ? 'Aktif di Hero' : 'Tidak Aktif'}
            </span>
          </div>
          <div style="padding: 14px 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
            <div>
              <h4 style="font-size: 14px; font-weight: 700; color: var(--text-main); line-height: 1.4; margin: 0 0 4px;">
                ${item.title}
              </h4>
              <p style="font-size: 12px; color: var(--text-muted); margin: 0;">${item.dateFormatted || item.date || ''}</p>
            </div>
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 10px 12px; border-radius: var(--radius-xs); background: ${isChecked ? 'rgba(230,180,34,0.12)' : 'var(--admin-surface)'}; border: 1px solid ${isChecked ? 'rgba(230,180,34,0.35)' : 'var(--admin-border)'};">
              <input type="checkbox" class="slideshow-toggle-checkbox" data-id="${item.id}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--gold-primary); cursor: pointer;" />
              <span style="font-size: 13px; font-weight: 600; color: ${isChecked ? 'var(--gold-400)' : 'var(--text-main)'};">Tampilkan di Slideshow</span>
            </label>
          </div>
        `;

        const checkbox = card.querySelector('.slideshow-toggle-checkbox');
        checkbox.addEventListener('change', () => {
          const checked = checkbox.checked;
          const statusBadge = card.querySelector('.slide-badge-status');
          const labelSpan = card.querySelector('label span');
          const labelWrap = card.querySelector('label');

          card.classList.toggle('selected', checked);
          card.style.border = checked ? '1px solid var(--gold-400)' : '1px solid var(--admin-border)';
          if (statusBadge) {
            statusBadge.textContent = checked ? 'Aktif di Hero' : 'Tidak Aktif';
            statusBadge.style.background = checked ? 'rgba(30,120,50,0.9)' : 'rgba(80,80,80,0.85)';
            statusBadge.style.color = checked ? '#fff' : '#ccc';
          }
          if (labelSpan) {
            labelSpan.style.color = checked ? 'var(--gold-400)' : 'var(--text-main)';
          }
          if (labelWrap) {
            labelWrap.style.background = checked ? 'rgba(230,180,34,0.12)' : 'var(--admin-surface)';
            labelWrap.style.borderColor = checked ? 'rgba(230,180,34,0.35)' : 'var(--admin-border)';
          }
          updateSlideshowActiveCount();
          updateAdminSlideshowPreviewFromDOM(newsWithPhotos);
        });

        grid.appendChild(card);
      });
    }

    updateSlideshowActiveCount();
    updateAdminSlideshowPreviewFromDOM(newsWithPhotos);
  }

  function updateSlideshowActiveCount() {
    const checkboxes = document.querySelectorAll('.slideshow-toggle-checkbox');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;
    const activeCountEl = document.getElementById('slideshowActiveCount');
    if (activeCountEl) {
      activeCountEl.textContent = `${checkedCount} dari ${totalCount} Foto Aktif`;
    }
  }

  function updateAdminSlideshowPreviewFromDOM(newsList) {
    const checkedIds = Array.from(document.querySelectorAll('.slideshow-toggle-checkbox:checked')).map(cb => String(cb.dataset.id));
    const activeItems = newsList.filter(item => checkedIds.includes(String(item.id)));
    renderAdminSlideshowPreview(activeItems);
  }

  function renderAdminSlideshowPreview(items) {
    const previewWrapper = document.getElementById('adminSlideshowPreviewWrapper');
    const previewDots = document.getElementById('adminPreviewDots');
    if (!previewWrapper) return;

    if (adminSlideshowTimer) {
      clearInterval(adminSlideshowTimer);
      adminSlideshowTimer = null;
    }

    if (!items || !items.length) {
      previewWrapper.innerHTML = `
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: #111; color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px;">
          Tidak ada foto aktif yang dipilih untuk slideshow.
        </div>
      `;
      if (previewDots) previewDots.innerHTML = '';
      return;
    }

    previewWrapper.innerHTML = '';
    if (previewDots) previewDots.innerHTML = '';

    items.forEach((item, idx) => {
      const slide = document.createElement('div');
      slide.className = `admin-preview-slide ${idx === 0 ? 'active' : ''}`;
      slide.style.position = 'absolute';
      slide.style.inset = '0';
      slide.style.opacity = idx === 0 ? '1' : '0';
      slide.style.transition = 'opacity 0.6s ease';
      slide.style.pointerEvents = 'none';

      const imgSrc = item.image.startsWith('http') || item.image.startsWith('data:')
        ? item.image
        : (item.image.startsWith('../') ? item.image : `../${item.image}`);

      slide.innerHTML = `
        <img src="${imgSrc}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../assets/images/logo.png'" />
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);"></div>
        <div style="position: absolute; left: 16px; right: 16px; bottom: 14px;">
          <span style="font-size: 10px; font-weight: 700; color: var(--gold-300); text-transform: uppercase; background: rgba(230,180,34,0.2); padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(230,180,34,0.3);">
            ${item.category || 'Berita'}
          </span>
          <h4 style="font-size: 14px; font-weight: 700; color: #fff; margin: 4px 0 0; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${item.title}
          </h4>
        </div>
      `;
      previewWrapper.appendChild(slide);

      if (previewDots) {
        const dot = document.createElement('span');
        dot.style.width = idx === 0 ? '16px' : '6px';
        dot.style.height = '6px';
        dot.style.borderRadius = '999px';
        dot.style.background = idx === 0 ? 'var(--gold-400)' : 'rgba(255,255,255,0.4)';
        dot.style.transition = 'all 0.3s ease';
        previewDots.appendChild(dot);
      }
    });

    const slides = previewWrapper.querySelectorAll('.admin-preview-slide');
    const dots = previewDots ? previewDots.children : [];
    adminSlideIndex = 0;

    if (slides.length > 1) {
      adminSlideshowTimer = setInterval(() => {
        adminSlideIndex = (adminSlideIndex + 1) % slides.length;
        slides.forEach((s, i) => s.style.opacity = i === adminSlideIndex ? '1' : '0');
        if (dots) {
          Array.from(dots).forEach((d, i) => {
            d.style.width = i === adminSlideIndex ? '16px' : '6px';
            d.style.background = i === adminSlideIndex ? 'var(--gold-400)' : 'rgba(255,255,255,0.4)';
          });
        }
      }, 3500);
    }
  }

  // Save Slideshow Button Listener
  const saveSlideshowBtn = document.getElementById('saveSlideshowBtn');
  if (saveSlideshowBtn) {
    saveSlideshowBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const checkboxes = document.querySelectorAll('.slideshow-toggle-checkbox:checked');
      const selectedIds = Array.from(checkboxes).map(cb => String(cb.dataset.id));
      const isEnabled = document.getElementById('slideshowStatusSelect')?.value === 'true';
      const intervalVal = parseInt(document.getElementById('slideshowIntervalSelect')?.value, 10) || 5000;

      const cfg = {
        enabled: isEnabled,
        interval: intervalVal,
        selectedNewsIds: selectedIds
      };

      await window.SakoDB.saveHeroSlideshow(cfg);
      showToast('Pengaturan Slideshow Hero berhasil disimpan dan disinkronkan!', 'success');
    });
  }

  // Select / Deselect All Buttons
  const selectAllSlidesBtn = document.getElementById('selectAllSlidesBtn');
  if (selectAllSlidesBtn) {
    selectAllSlidesBtn.addEventListener('click', () => {
      document.querySelectorAll('.slideshow-toggle-checkbox').forEach(cb => {
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
      });
    });
  }

  const deselectAllSlidesBtn = document.getElementById('deselectAllSlidesBtn');
  if (deselectAllSlidesBtn) {
    deselectAllSlidesBtn.addEventListener('click', () => {
      document.querySelectorAll('.slideshow-toggle-checkbox').forEach(cb => {
        cb.checked = false;
        cb.dispatchEvent(new Event('change'));
      });
    });
  }

  // --- 3. TENTANG KAMI ---
  async function loadTentangTab() {
    const data = await window.SakoDB.getTentang();
    document.getElementById('tentangIntroHeading').value = data.introHeading || '';
    document.getElementById('tentangLeadParagraph').value = data.leadParagraph || '';
    document.getElementById('tentangParagraph1').value = data.paragraphs?.[0] || '';
    document.getElementById('tentangParagraph2').value = data.paragraphs?.[1] || '';

    document.getElementById('tentangStatTahun').value = data.stats?.tahun || '2026';
    document.getElementById('tentangStatBidang').value = data.stats?.bidang || '8';
    document.getElementById('tentangStatPengurus').value = data.stats?.pengurus || '60+';

    const pillarsContainer = document.getElementById('pillarsContainer');
    pillarsContainer.innerHTML = '';
    (data.pillars || []).forEach(p => addPillarRow(p.icon, p.title, p.desc));
  }

  function addPillarRow(icon = '', title = '', desc = '') {
    const card = document.createElement('div');
    card.className = 'pillar-card';
    card.style.background = 'var(--admin-surface-2)';
    card.style.border = '1px solid var(--admin-border)';
    card.style.borderRadius = 'var(--radius-sm)';
    card.style.padding = '18px 20px';
    card.style.marginBottom = '16px';
    card.style.transition = 'var(--transition)';

    const iconVal = icon && !/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u.test(icon) ? icon : '';

    card.innerHTML = `
      <div style="display: flex; gap: 14px; align-items: flex-end; margin-bottom: 12px; flex-wrap: wrap;">
        <div style="width: 140px; flex-shrink: 0;">
          <label class="form-label" style="font-size: 12px; margin-bottom: 6px;">Kode / Label Ikon</label>
          <input type="text" class="form-input pillar-icon" value="${iconVal.replace(/"/g, '&quot;')}" placeholder="Nilai Dasar" />
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label" style="font-size: 12px; margin-bottom: 6px;">Nama Pilar</label>
          <input type="text" class="form-input pillar-title" value="${title.replace(/"/g, '&quot;')}" placeholder="Contoh: Edukatif, Religius, Mandiri..." />
        </div>
        <button type="button" class="btn-table-action delete" style="height: 42px; padding: 0 14px; flex-shrink: 0;" onclick="this.closest('.pillar-card').remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          <span>Hapus</span>
        </button>
      </div>
      <div>
        <label class="form-label" style="font-size: 12px; margin-bottom: 6px;">Deskripsi Pilar</label>
        <textarea class="form-textarea pillar-desc" rows="2" placeholder="Tuliskan penjelasan nilai kepramukaan ini...">${desc}</textarea>
      </div>
    `;
    document.getElementById('pillarsContainer').appendChild(card);
  }

  const addPillarBtn = document.getElementById('addPillarBtn');
  if (addPillarBtn) {
    addPillarBtn.addEventListener('click', () => {
      addPillarRow('', '', '');
      const newCard = document.querySelector('#pillarsContainer .pillar-card:last-child');
      if (newCard) {
        const titleInput = newCard.querySelector('.pillar-title');
        if (titleInput) titleInput.focus();
      }
    });
  }

  document.getElementById('saveTentangBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const pillarCards = document.querySelectorAll('#pillarsContainer .pillar-card');
    const pillars = [];
    pillarCards.forEach(card => {
      const ic = card.querySelector('.pillar-icon').value.trim();
      const ti = card.querySelector('.pillar-title').value.trim();
      const de = card.querySelector('.pillar-desc').value.trim();
      if (ti || de) {
        pillars.push({
          icon: ic || '',
          title: ti,
          desc: de
        });
      }
    });

    const data = {
      introHeading: document.getElementById('tentangIntroHeading').value.trim(),
      leadParagraph: document.getElementById('tentangLeadParagraph').value.trim(),
      paragraphs: [
        document.getElementById('tentangParagraph1').value.trim(),
        document.getElementById('tentangParagraph2').value.trim()
      ],
      stats: {
        tahun: document.getElementById('tentangStatTahun').value.trim(),
        bidang: document.getElementById('tentangStatBidang').value.trim(),
        pengurus: document.getElementById('tentangStatPengurus').value.trim()
      },
      pillars: pillars
    };

    await window.SakoDB.saveTentang(data);
    showToast('Data Tentang Kami berhasil diperbarui!', 'success');
  });

  // --- 4. VISI, MISI & TUJUAN ---
  const misiListContainer = document.getElementById('misiListContainer');
  const tujuanListContainer = document.getElementById('tujuanListContainer');

  async function loadVisiMisiTab() {
    const data = await window.SakoDB.getVisiMisi();
    document.getElementById('visiText').value = data.visi || '';

    // Render Misi
    misiListContainer.innerHTML = '';
    (data.misi || []).forEach((m, idx) => addMisiRow(m, idx + 1));

    // Render Tujuan
    tujuanListContainer.innerHTML = '';
    (data.tujuan || []).forEach((t, idx) => addTujuanRow(t, idx + 1));
  }

  function addMisiRow(text = '', num = null) {
    const count = num || (misiListContainer.children.length + 1);
    const row = document.createElement('div');
    row.className = 'dynamic-item-row';
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.style.alignItems = 'center';
    row.style.marginBottom = '10px';
    row.innerHTML = `
      <span style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: var(--admin-surface-2); border: 1px solid var(--admin-border); font-size: 12px; font-weight: 800; color: var(--gold-400); flex-shrink: 0;">${count}</span>
      <input type="text" class="form-input misi-input" value="${text.replace(/"/g, '&quot;')}" placeholder="Ketik butir misi..." />
      <button type="button" class="btn-table-action delete" style="padding: 10px 12px; flex-shrink: 0;" onclick="this.parentElement.remove()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        <span>Hapus</span>
      </button>
    `;
    misiListContainer.appendChild(row);
  }

  function addTujuanRow(text = '', num = null) {
    const count = num || (tujuanListContainer.children.length + 1);
    const row = document.createElement('div');
    row.className = 'dynamic-item-row';
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.style.alignItems = 'center';
    row.style.marginBottom = '10px';
    row.innerHTML = `
      <span style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: var(--admin-surface-2); border: 1px solid var(--admin-border); font-size: 12px; font-weight: 800; color: var(--green-300); flex-shrink: 0;">${count}</span>
      <input type="text" class="form-input tujuan-input" value="${text.replace(/"/g, '&quot;')}" placeholder="Ketik butir tujuan..." />
      <button type="button" class="btn-table-action delete" style="padding: 10px 12px; flex-shrink: 0;" onclick="this.parentElement.remove()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        <span>Hapus</span>
      </button>
    `;
    tujuanListContainer.appendChild(row);
  }

  document.getElementById('addMisiItemBtn').addEventListener('click', () => addMisiRow());
  document.getElementById('addTujuanItemBtn').addEventListener('click', () => addTujuanRow());

  document.getElementById('saveVisiMisiBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const misiInputs = document.querySelectorAll('.misi-input');
    const misi = [];
    misiInputs.forEach(inp => {
      const v = inp.value.trim();
      if (v) misi.push(v);
    });

    const tujuanInputs = document.querySelectorAll('.tujuan-input');
    const tujuan = [];
    tujuanInputs.forEach(inp => {
      const v = inp.value.trim();
      if (v) tujuan.push(v);
    });

    const data = {
      visi: document.getElementById('visiText').value.trim(),
      misi: misi,
      tujuan: tujuan
    };

    await window.SakoDB.saveVisiMisi(data);
    showToast('Visi, Misi & Tujuan berhasil disimpan!', 'success');
  });

  // --- 5. KEPENGURUSAN ---
  const bidangContainer = document.getElementById('bidangContainer');

  async function loadKepengurusanTab() {
    const data = await window.SakoDB.getKepengurusan();

    // Mabisako
    document.getElementById('mabiKetua').value = data.mabisako?.ketua?.name || '';
    document.getElementById('mabiWakil').value = (data.mabisako?.wakilKetua || []).join('\n');
    document.getElementById('mabiSekretaris').value = (data.mabisako?.sekretaris || []).join('\n');
    document.getElementById('mabiAnggota').value = (data.mabisako?.anggota || []).join('\n');

    // Pimpinan
    document.getElementById('pimpinanKetua').value = data.pimpinan?.ketua?.name || '';
    document.getElementById('pimpinanWakil').value = (data.pimpinan?.wakilKetua || []).join('\n');
    document.getElementById('pimpinanSekretaris').value = (data.pimpinan?.sekretaris || []).join('\n');
    document.getElementById('pimpinanBendahara').value = (data.pimpinan?.bendahara || []).join('\n');

    // 8 Bidang
    bidangContainer.innerHTML = '';
    (data.bidang || []).forEach((b, idx) => {
      const card = document.createElement('div');
      card.style.background = 'var(--admin-surface-2)';
      card.style.border = '1px solid var(--admin-border)';
      card.style.borderRadius = 'var(--radius-sm)';
      card.style.padding = '18px';
      card.style.marginBottom = '16px';
      card.innerHTML = `
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Nama Bidang Kerja #${idx + 1}</label>
            <input type="text" class="form-input bidang-name" value="${(b.name || '').replace(/"/g, '&quot;')}" />
          </div>
          <div class="form-group">
            <label class="form-label">Ketua Bidang</label>
            <input type="text" class="form-input bidang-ketua" value="${(b.ketua || '').replace(/"/g, '&quot;')}" />
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Anggota Bidang (Pisahkan tiap nama dengan baris baru atau koma)</label>
          <textarea class="form-textarea bidang-anggota" rows="3" placeholder="Tulis nama anggota, pisahkan dengan baris baru..." style="resize: vertical; min-height: 80px;">${(b.anggota || []).join('\n')}</textarea>
        </div>
      `;
      bidangContainer.appendChild(card);
    });
  }

  document.getElementById('saveKepengurusanBtn').addEventListener('click', async (e) => {
    e.preventDefault();

    const parseLines = (val) => val.split(/[\n,]/).map(s => s.trim()).filter(Boolean);

    const mabisako = {
      ketua: { name: document.getElementById('mabiKetua').value.trim(), role: 'Ketua Majelis Pembimbing Sako' },
      wakilKetua: parseLines(document.getElementById('mabiWakil').value),
      sekretaris: parseLines(document.getElementById('mabiSekretaris').value),
      anggota: parseLines(document.getElementById('mabiAnggota').value)
    };

    const pimpinan = {
      ketua: { name: document.getElementById('pimpinanKetua').value.trim(), role: 'Ketua Sako Pandu Ma\'arif NU Jawa Barat' },
      wakilKetua: parseLines(document.getElementById('pimpinanWakil').value),
      sekretaris: parseLines(document.getElementById('pimpinanSekretaris').value),
      bendahara: parseLines(document.getElementById('pimpinanBendahara').value)
    };

    const names = document.querySelectorAll('.bidang-name');
    const ketuas = document.querySelectorAll('.bidang-ketua');
    const anggotas = document.querySelectorAll('.bidang-anggota');
    const bidang = [];
    names.forEach((nm, idx) => {
      bidang.push({
        id: 'bidang-' + (idx + 1),
        name: nm.value.trim(),
        ketua: ketuas[idx].value.trim(),
        anggota: parseLines(anggotas[idx].value)
      });
    });

    const data = { mabisako, pimpinan, bidang };
    await window.SakoDB.saveKepengurusan(data);
    showToast('Susunan kepengurusan berhasil diperbarui!', 'success');
  });

  // --- KEAMANAN AKUN ---
  function loadSecurityTab() {
    const creds = window.SakoDB.getAdminCredentials();
    document.getElementById('adminDisplayName').value = creds.name || 'Riki (Admin)';
    document.getElementById('adminNewUsername').value = creds.username || 'riki';
  }

  document.getElementById('securityForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('adminDisplayName').value.trim();
    const user = document.getElementById('adminNewUsername').value.trim();
    const pass = document.getElementById('adminNewPassword').value.trim();

    if (!user) {
      alert('Username tidak boleh kosong!');
      return;
    }

    const currentCreds = window.SakoDB.getAdminCredentials();
    const newCreds = {
      username: user,
      name: name || user,
      password: pass && pass.length >= 6 ? pass : currentCreds.password
    };

    window.SakoDB.saveAdminCredentials(newCreds);
    showToast('Kredensial admin berhasil diperbarui!', 'success');
    document.getElementById('sidebarUserName').textContent = newCreds.name;
    document.getElementById('adminNewPassword').value = '';
  });

  // --- PENCADANGAN & MIGRASI DATA ---
  const exportBtn = document.getElementById('exportDataBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const payload = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          tentang: await window.SakoDB.getTentang(),
          visimisi: await window.SakoDB.getVisiMisi(),
          kepengurusan: await window.SakoDB.getKepengurusan(),
          berita: await window.SakoDB.getBerita(),
          heroSlideshow: await window.SakoDB.getHeroSlideshow()
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `backup-sako-pramuka-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Data berhasil diekspor sebagai file JSON!', 'success');
      } catch (err) {
        console.error('Gagal mengekspor data:', err);
        showToast('Gagal mengekspor data!', 'error');
      }
    });
  }

  const importInput = document.getElementById('importDataInput');
  if (importInput) {
    importInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const fileName = (file.name || '').toLowerCase();
      if (fileName.endsWith('.sql')) {
        showToast('File ini adalah file SQL. Untuk file database.sql, silakan impor melalui menu phpMyAdmin di cPanel. Tombol ini khusus file cadangan .json.', 'error');
        e.target.value = '';
        return;
      }
      if (fileName.endsWith('.zip')) {
        showToast('File ini berformat ZIP. Tombol ini khusus untuk file cadangan .json.', 'error');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        let imported;
        try {
          const rawText = String(event.target.result || '').trim().replace(/^\uFEFF/, '');
          imported = JSON.parse(rawText);
        } catch (jsonErr) {
          console.error('JSON parse error:', jsonErr);
          showToast('File JSON tidak valid atau struktur teks rusak.', 'error');
          e.target.value = '';
          return;
        }

        if (!imported || typeof imported !== 'object') {
          showToast('Isi file cadangan tidak valid.', 'error');
          e.target.value = '';
          return;
        }

        try {
          if (imported.tentang) await window.SakoDB.saveTentang(imported.tentang);
          if (imported.visimisi) await window.SakoDB.saveVisiMisi(imported.visimisi);
          if (imported.kepengurusan) await window.SakoDB.saveKepengurusan(imported.kepengurusan);
          if (imported.heroSlideshow) await window.SakoDB.saveHeroSlideshow(imported.heroSlideshow);

          if (Array.isArray(imported.berita)) {
            for (const item of imported.berita) {
              if (window.SakoDB.saveBeritaItem) {
                await window.SakoDB.saveBeritaItem(item);
              } else if (window.SakoDB.saveBerita) {
                await window.SakoDB.saveBerita(item);
              }
            }
          }

          // Sinkronkan langsung ke database server MySQL jika API aktif
          if (typeof window.SakoDB.syncAllToCloud === 'function') {
            await window.SakoDB.syncAllToCloud();
          }

          showToast('Data berhasil dipulihkan & disinkronkan ke database!', 'success');
          setTimeout(() => window.location.reload(), 1200);
        } catch (syncErr) {
          console.error('Gagal memproses data cadangan:', syncErr);
          showToast('Gagal memproses data: ' + syncErr.message, 'error');
        } finally {
          e.target.value = '';
        }
      };
      reader.readAsText(file);
    });
  }

  // Initial Run
  checkAuth();
});
