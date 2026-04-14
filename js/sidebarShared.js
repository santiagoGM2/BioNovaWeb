// ============================================================
// BioNova — sidebarShared.js
// Injects shared sidebar nav into all patient/cuidador screens
// ============================================================
(function () {

  const patientNav = `
    <div class="sidebar-logo">
      <div class="brand-name">BioNova</div>
      <div class="brand-tagline">Tu salud, siempre presente</div>
    </div>
    <nav class="sidebar-nav" role="navigation" aria-label="Navegación principal">
      <span class="nav-section-label">Principal</span>
      <div class="nav-item" data-route="#dashboard" tabindex="0" role="link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard
      </div>
      <div class="nav-item" data-route="#medications" tabindex="0" role="link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07L10.5 6.36"/><path d="M13.5 3.5L20.5 10.5a5 5 0 0 1-7.07 7.07L13.5 17.64"/><line x1="8" y1="16" x2="16" y2="8"/></svg>
        Medicamentos
      </div>
      <div class="nav-item" data-route="#appointments" tabindex="0" role="link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Citas médicas
      </div>
      <div class="nav-item" data-route="#stats" tabindex="0" role="link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Estadísticas
      </div>
      <div class="nav-item" data-route="#notifications" tabindex="0" role="link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        Notificaciones
        <span class="nav-badge" id="notif-badge-sidebar" style="display:none">0</span>
      </div>
    </nav>
    <div class="sidebar-user">
      <div class="user-avatar-small" id="sidebar-user-avatar-shared">--</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name" id="sidebar-user-name-shared">—</div>
        <div class="sidebar-user-role" id="sidebar-user-role-shared">—</div>
      </div>
      <button class="btn-logout" id="btn-logout-shared" title="Cerrar sesión" aria-label="Cerrar sesión">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>`;

  const doctorNav = `
    <div class="sidebar-logo">
      <div class="brand-name">BioNova</div>
      <div class="brand-tagline">Panel médico</div>
    </div>
    <nav class="sidebar-nav" role="navigation" aria-label="Navegación médica">
      <span class="nav-section-label">Médico</span>
      <div class="nav-item" data-route="#doctor-patients" tabindex="0" role="link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Mis pacientes
      </div>
      <div class="nav-item" data-route="#doctor-global" tabindex="0" role="link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Dashboard global
      </div>
    </nav>
    <div class="sidebar-user">
      <div class="user-avatar-small">DR</div>
      <div class="sidebar-user-info">
        <div style="font-size:13px;font-weight:600;color:var(--color-text-primary)" id="sidebar-doc-name">Dr. —</div>
        <div style="font-size:11px;color:var(--color-text-secondary)">Médico</div>
      </div>
      <button class="btn-logout" onclick="BioNovaAuth.logout()" title="Cerrar sesión" aria-label="Cerrar sesión">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>`;

  // Inject into each screen's sidebar placeholder
  const patientScreens = ['screen-medications', 'screen-appointments', 'screen-stats', 'screen-notifications'];
  const doctorScreens  = ['screen-doctor-patients', 'screen-doctor-global'];

  patientScreens.forEach(id => {
    const screen = document.getElementById(id);
    if (!screen) return;
    const sidebar = screen.querySelector('.sidebar[role="navigation"]');
    if (sidebar && sidebar.children.length === 0) {
      sidebar.innerHTML = patientNav;
    }
  });

  doctorScreens.forEach(id => {
    const screen = document.getElementById(id);
    if (!screen) return;
    const sidebars = screen.querySelectorAll('.sidebar[role="navigation"]');
    sidebars.forEach(sidebar => {
      if (sidebar.children.length === 0) {
        sidebar.innerHTML = doctorNav;
      }
    });
  });

  // Bind shared logout
  document.addEventListener('click', e => {
    if (e.target.closest('#btn-logout-shared')) {
      BioNovaAuth.logout();
    }
    // Mobile sidebar toggle for all screens
    if (e.target.closest('.mobile-menu-btn')) {
      // Find sidebar in active screen
      const activeScreen = document.querySelector('.screen.active');
      if (activeScreen) {
        const sidebar = activeScreen.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('mobile-open');
      }
    }
    // Close sidebar on outside click (mobile)
    if (window.innerWidth <= 768) {
      const activeScreen = document.querySelector('.screen.active');
      if (!activeScreen) return;
      const sidebar = activeScreen.querySelector('.sidebar');
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && !e.target.closest('.mobile-menu-btn')) {
          sidebar.classList.remove('mobile-open');
        }
      }
    }
  });

  // Update shared sidebar user info
  window.updateSharedSidebars = function (user) {
    if (!user) return;
    const initials = user.nombre.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
    const roleLabel = { 'paciente': 'Paciente', 'cuidador': 'Cuidador', 'medico': 'Médico' }[user.role] || '';

    // Patient/caregiver sidebars
    document.querySelectorAll('#sidebar-user-avatar-shared').forEach(el => el.textContent = initials);
    document.querySelectorAll('#sidebar-user-name-shared').forEach(el => el.textContent = user.nombre);
    document.querySelectorAll('#sidebar-user-role-shared').forEach(el => el.textContent = roleLabel);

    // Also update the dashboard screen's own sidebar (has different IDs)
    const dashAvatar = document.getElementById('sidebar-avatar');
    const dashName   = document.getElementById('sidebar-user-name');
    const dashRole   = document.getElementById('sidebar-user-role');
    if (dashAvatar) dashAvatar.textContent = initials;
    if (dashName) dashName.textContent = user.nombre;
    if (dashRole) dashRole.textContent = roleLabel;

    // Doctor name in doctor screens
    document.querySelectorAll('#sidebar-doc-name, #doctor-name-header').forEach(el => el.textContent = user.nombre);
    // Fix doctor sidebar avatar
    document.querySelectorAll('#screen-doctor-patients .user-avatar-small, #screen-doctor-global .user-avatar-small').forEach(el => {
      if (!el.id) el.textContent = initials;
    });

    // Update notif badges
    const count = BioNovaData.getUnreadCount(user.id);
    document.querySelectorAll('#notif-badge, #notif-badge-sidebar').forEach(badge => {
      if (count > 0) { badge.textContent = count; badge.style.display = ''; }
      else badge.style.display = 'none';
    });
  };

})();
