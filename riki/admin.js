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
        <div class="form-group">
          <label class="form-label">Nama Bidang Kerja #${idx + 1}</label>
          <input type="text" class="form-input bidang-name" value="${b.name || ''}" />
        </div>
        <div class="form-grid-2">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Ketua Bidang</label>
            <input type="text" class="form-input bidang-ketua" value="${b.ketua || ''}" />
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Anggota Bidang (Pisahkan baris atau koma)</label>
            <input type="text" class="form-input bidang-anggota" value="${(b.anggota || []).join(', ')}" />
          </div>
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

  // Initial Run
  checkAuth();
});
