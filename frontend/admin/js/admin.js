/**
 * MOVAI Admin Panel - Shared JavaScript
 * API calls, auth, sidebar, toasts, pagination, tables, modals, utilities
 */

const API_BASE = 'http://localhost:3001/api';

// ==================== AUTH ====================
const Auth = {
  getToken() { return localStorage.getItem('movai_token'); },
  setToken(token) { localStorage.setItem('movai_token', token); },
  getUser() {
    const u = localStorage.getItem('movai_user');
    return u ? JSON.parse(u) : null;
  },
  setUser(user) { localStorage.setItem('movai_user', JSON.stringify(user)); },
  isAuthenticated() { return !!this.getToken(); },
  isAdmin() { const u = this.getUser(); return u && u.role === 'admin'; },
  logout() {
    localStorage.removeItem('movai_token');
    localStorage.removeItem('movai_user');
    window.location.href = 'login.html';
  },
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// ==================== API ====================
const Api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (options.isFormData) { delete headers['Content-Type']; }

    try {
      const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers }, });
      if (res.status === 401) { Auth.logout(); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro na requisição');
      return data;
    } catch (err) {
      throw err;
    }
  },
  get(endpoint) { return this.request(endpoint); },
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
  patch(endpoint, body) { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }); },
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); },
  async upload(endpoint, formData) {
    const url = `${API_BASE}${endpoint}`;
    const token = Auth.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method: 'POST', headers, body: formData });
    if (res.status === 401) { Auth.logout(); return; }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro no upload');
    return data;
  }
};

// ==================== TOAST ====================
const Toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info', duration = 4000) {
    this.init();
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${icons[type] || icons.info} toast-icon"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    this.container.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); }
};

// ==================== SIDEBAR ====================
function initSidebar() {
  const user = Auth.getUser();
  if (!user) return;

  // Set user info
  const nameEl = document.querySelector('.sidebar-footer .user-name');
  const roleEl = document.querySelector('.sidebar-footer .user-role');
  const avatarEl = document.querySelector('.sidebar-footer .user-avatar');
  if (nameEl) nameEl.textContent = user.name || 'Usuário';
  if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Administrador' : user.role === 'corretor' ? 'Corretor' : 'Usuário';
  if (avatarEl) avatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();

  // Hide users menu if not admin
  if (user.role !== 'admin') {
    const usersNav = document.querySelector('.nav-item[data-page="users"]');
    if (usersNav) usersNav.style.display = 'none';
  }

  // Active page
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if (item.dataset.page === currentPage) item.classList.add('active');
    else item.classList.remove('active');
  });

  // Sidebar toggle (mobile)
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Logout
  document.querySelectorAll('.logout-btn, .logout-link').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); Auth.logout(); });
  });
}

// ==================== MODAL ====================
const Modal = {
  open(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
  },
  close(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
  },
  init() {
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const overlay = btn.closest('.modal-overlay');
        if (overlay) overlay.classList.remove('active');
      });
    });
  }
};

// ==================== PAGINATION ====================
function renderPagination(container, currentPage, totalPages, onPageChange) {
  if (!container || totalPages <= 1) { if (container) container.innerHTML = ''; return; }
  let html = '';
  html += `<button ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`;

  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  if (start > 1) { html += `<button data-page="1">1</button>`; if (start > 2) html += `<span class="page-info">...</span>`; }
  for (let i = start; i <= end; i++) {
    html += `<button data-page="${i}" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
  }
  if (end < totalPages) { if (end < totalPages - 1) html += `<span class="page-info">...</span>`; html += `<button data-page="${totalPages}">${totalPages}</button>`; }

  html += `<button ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}"><i class="fas fa-chevron-right"></i></button>`;
  container.innerHTML = html;
  container.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => { const p = parseInt(btn.dataset.page); if (p >= 1 && p <= totalPages) onPageChange(p); });
  });
}

// ==================== TABLE SORT ====================
function initTableSort(tableId, onSort) {
  const table = document.getElementById(tableId);
  if (!table) return;
  table.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      const currentDir = th.dataset.dir || 'asc';
      const newDir = currentDir === 'asc' ? 'desc' : 'asc';
      table.querySelectorAll('th[data-sort]').forEach(h => { h.dataset.dir = ''; h.querySelector('.sort-icon')?.classList.remove('fa-sort-up', 'fa-sort-down'); h.querySelector('.sort-icon')?.classList.add('fa-sort'); });
      th.dataset.dir = newDir;
      const icon = th.querySelector('.sort-icon');
      if (icon) { icon.classList.remove('fa-sort'); icon.classList.add(newDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down'); }
      onSort(field, newDir);
    });
  });
}

// ==================== LOADING ====================
function showLoading(container) {
  if (!container) return;
  container.style.position = 'relative';
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = '<div class="spinner"></div>';
  container.appendChild(overlay);
}
function hideLoading(container) {
  if (!container) return;
  const overlay = container.querySelector('.loading-overlay');
  if (overlay) overlay.remove();
}

// ==================== FORMATTERS ====================
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR');
}
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
  return formatDate(dateStr);
}
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ==================== STATUS MAPS ====================
const statusBadge = {
  disponivel: '<span class="badge badge-green">Disponível</span>',
  vendido: '<span class="badge badge-blue">Vendido</span>',
  alugado: '<span class="badge badge-purple">Alugado</span>',
  reservado: '<span class="badge badge-yellow">Reservado</span>',
  inativo: '<span class="badge badge-gray">Inativo</span>',
  novo: '<span class="badge badge-blue">Novo</span>',
  contactado: '<span class="badge badge-yellow">Contactado</span>',
  qualificado: '<span class="badge badge-purple">Qualificado</span>',
  proposta: '<span class="badge badge-yellow">Proposta</span>',
  convertido: '<span class="badge badge-green">Convertido</span>',
  perdido: '<span class="badge badge-red">Perdido</span>',
  pendente: '<span class="badge badge-yellow">Pendente</span>',
  confirmado: '<span class="badge badge-green">Confirmado</span>',
  cancelado: '<span class="badge badge-red">Cancelado</span>',
  realizado: '<span class="badge badge-blue">Realizado</span>',
  ativo: '<span class="badge badge-green">Ativo</span>',
  aberta: '<span class="badge badge-green">Aberta</span>',
  fechada: '<span class="badge badge-gray">Fechada</span>',
};

function getStatusBadge(status) {
  return statusBadge[status] || `<span class="badge badge-gray">${status || '-'}</span>`;
}

// ==================== CSV EXPORT ====================
function exportToCSV(data, filename, columns) {
  if (!data || !data.length) { Toast.warning('Nenhum dado para exportar'); return; }
  const headers = columns.map(c => c.label);
  const rows = data.map(row => columns.map(c => {
    let val = c.getter ? c.getter(row) : row[c.key];
    if (val === null || val === undefined) val = '';
    val = String(val).replace(/"/g, '""');
    return `"${val}"`;
  }));
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  Toast.success('Arquivo CSV exportado!');
}

// ==================== PDF EXPORT (simple) ====================
function exportToPDF(title, tableId) {
  const table = document.getElementById(tableId);
  if (!table) { Toast.warning('Tabela não encontrada'); return; }
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;padding:20px;}h1{color:#0A2342;font-size:18px;margin-bottom:10px;}
    table{width:100%;border-collapse:collapse;font-size:12px;}
    th,td{border:1px solid #ddd;padding:8px;text-align:left;}
    th{background:#0A2342;color:#fff;}</style></head>
    <body><h1>${title}</h1>${table.outerHTML}</body></html>
  `);
  win.document.close();
  setTimeout(() => { win.print(); }, 500);
}

// ==================== FORM VALIDATION ====================
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;
  let valid = true;
  form.querySelectorAll('[required]').forEach(input => {
    const err = input.parentElement.querySelector('.form-error');
    if (!input.value.trim()) {
      input.classList.add('error');
      if (err) err.textContent = 'Campo obrigatório';
      valid = false;
    } else {
      input.classList.remove('error');
      if (err) err.textContent = '';
    }
  });
  form.querySelectorAll('input[type="email"]').forEach(input => {
    if (input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      input.classList.add('error');
      const err = input.parentElement.querySelector('.form-error');
      if (err) err.textContent = 'E-mail inválido';
      valid = false;
    }
  });
  return valid;
}

// ==================== DEBOUNCE ====================
function debounce(fn, delay = 350) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

// ==================== SIDEBAR HTML GENERATOR ====================
function getSidebarHTML() {
  return `
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">MOV<span>AI</span></div>
      <span class="badge">Admin</span>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">Principal</div>
      <a href="dashboard.html" class="nav-item" data-page="dashboard"><i class="fas fa-th-large"></i> Dashboard</a>
      <div class="nav-section">Gestão</div>
      <a href="properties.html" class="nav-item" data-page="properties"><i class="fas fa-building"></i> Imóveis</a>
      <a href="leads.html" class="nav-item" data-page="leads"><i class="fas fa-user-plus"></i> Leads</a>
      <a href="appointments.html" class="nav-item" data-page="appointments"><i class="fas fa-calendar-alt"></i> Agendamentos</a>
      <div class="nav-section">Sistema</div>
      <a href="users.html" class="nav-item" data-page="users"><i class="fas fa-users-cog"></i> Usuários</a>
      <a href="chatbot.html" class="nav-item" data-page="chatbot"><i class="fas fa-robot"></i> Chatbot</a>
      <a href="reports.html" class="nav-item" data-page="reports"><i class="fas fa-chart-bar"></i> Relatórios</a>
    </nav>
    <div class="sidebar-footer">
      <div class="user-avatar">U</div>
      <div class="user-info">
        <div class="user-name">Usuário</div>
        <div class="user-role">Admin</div>
      </div>
      <button class="logout-btn" title="Sair"><i class="fas fa-sign-out-alt"></i></button>
    </div>
  </aside>`;
}

// ==================== TOP HEADER HTML GENERATOR ====================
function getTopHeaderHTML(title) {
  return `
  <header class="top-header">
    <button class="menu-toggle"><i class="fas fa-bars"></i></button>
    <h2 class="page-title">${title}</h2>
    <div class="header-actions">
      <div class="header-search">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Buscar..." id="globalSearch">
      </div>
    </div>
  </header>`;
}

// ==================== INIT ON DOM READY ====================
document.addEventListener('DOMContentLoaded', () => {
  // Skip auth check for login page
  if (!window.location.pathname.includes('login.html')) {
    if (!Auth.requireAuth()) return;
  }
  initSidebar();
  Modal.init();
});
