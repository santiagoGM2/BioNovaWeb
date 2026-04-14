// ============================================================
// BioNova — auth.js  v2.0
// ============================================================
// Acá manejo toda la lógica de sesión del usuario.
// El flujo es simple: según el botón que toquen (Paciente, Medico, Cuidador),
// les abro un modal u otro formulario. 
// Uso sessionStorage para mantener el usuario activo mientras la pestaña esté abierta.
// Si recargan, siguen logueados, pero si cierran el navegador, se borra. 
// Para el registro de cuentas nuevas uso localStorage (vía mockData) porque quiero 
// que esos usuarios "creados" persistan incluso si apago el compu y vuelvo mañana.

window.BioNovaAuth = (function () {

  const SESSION_KEY = 'bionova_session';
  let _currentUser = null;

  // getCurrentUser: Revisa si hay alguien en memoria, y si no, busca en el sessionStorage.
  function getCurrentUser() {
    if (_currentUser) return _currentUser;
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) { _currentUser = JSON.parse(raw); return _currentUser; }
    return null;
  }

  // login: Guarda todo en sesión usando stringify (session solo guarda texto)
  // Luego rutea al usuario a su dashboard correspondiente según si es médico o no.
  function login(user) {
    _currentUser = user;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    updateGlobalUI(user);
    if (window.updateSharedSidebars) updateSharedSidebars(user);
    const dest = user.role === 'medico' ? '#doctor-patients' : '#dashboard';
    BioNovaRouter.navigate(dest);
  }

  // logout: Limpia la sesión y cierra a las malas todos los modales/drawers que hayan quedado abiertos.
  function logout() {
    _currentUser = null;
    sessionStorage.clear();
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModalEl(m));
    document.querySelectorAll('.drawer.open').forEach(d => d.classList.remove('open'));
    // Hide logout confirm modal too
    const lc = document.getElementById('modal-logout-overlay');
    if (lc) closeModalEl(lc);
    BioNovaRouter.navigate('#login');
  }

  function askLogout() {
    const overlay = document.getElementById('modal-logout-overlay');
    if (overlay) openModalEl(overlay);
    else logout(); // fallback
  }

  function updateGlobalUI(user) {
    if (!user) return;
    const initials = user.nombre.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
    const el      = document.getElementById('sidebar-user-name');
    const elRole  = document.getElementById('sidebar-user-role');
    const elAvatar= document.getElementById('sidebar-avatar');
    if (el) el.textContent = user.nombre;
    if (elRole) elRole.textContent = roleLabel(user.role);
    if (elAvatar) elAvatar.textContent = initials;

    document.querySelectorAll('.nav-item[data-roles]').forEach(item => {
      const roles = item.dataset.roles.split(',');
      item.style.display = roles.includes(user.role) ? '' : 'none';
    });
  }

  function roleLabel(role) {
    return { 'paciente': 'Paciente', 'medico': 'Médico', 'cuidador': 'Cuidador' }[role] || role;
  }

  // ─── LOGIN RENDER ──────────────────────────────────────────
  function renderLogin() {
    const df = document.getElementById('doctor-login-form');
    if (df) df.classList.remove('visible');
    const errEl = document.getElementById('doctor-login-error');
    if (errEl) errEl.textContent = '';
  }

  // ─── LOGIN HANDLERS ────────────────────────────────────────
  function initLoginHandlers() {
    document.getElementById('btn-login-patient')?.addEventListener('click', () => openGoogleModal('paciente'));
    document.getElementById('btn-login-caregiver')?.addEventListener('click', () => openGoogleModal('cuidador'));

    // Doctor toggle
    document.getElementById('btn-login-doctor')?.addEventListener('click', () => {
      const form = document.getElementById('doctor-login-form');
      form.classList.toggle('visible');
      if (form.classList.contains('visible')) document.getElementById('doctor-email').focus();
      const errEl = document.getElementById('doctor-login-error');
      if (errEl) errEl.textContent = '';
    });

    // Doctor submit
    document.getElementById('doctor-login-submit')?.addEventListener('click', () => {
      const email = document.getElementById('doctor-email').value.trim();
      const pass  = document.getElementById('doctor-password').value;
      const errEl = document.getElementById('doctor-login-error');

      const doctor = BioNovaData.users.find(u => u.role === 'medico' && u.email === email && u.password === pass);
      if (doctor) { errEl.textContent = ''; login(doctor); }
      else errEl.textContent = 'Credenciales incorrectas. Intente de nuevo.';
    });

    document.getElementById('doctor-password')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('doctor-login-submit').click();
    });

    // Logout buttons — all point to askLogout
    document.addEventListener('click', e => {
      if (e.target.closest('#btn-logout, #btn-logout-shared, #btn-logout-global')) {
        askLogout();
      }
    });

    // Logout confirm modal buttons
    document.getElementById('btn-logout-confirm')?.addEventListener('click', logout);
    document.getElementById('btn-logout-cancel')?.addEventListener('click', () => {
      closeModalEl(document.getElementById('modal-logout-overlay'));
    });

    // Mobile sidebar toggle (dashboard screen only)
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.getElementById('main-sidebar')?.classList.toggle('mobile-open');
    });
  }

  // ─── GOOGLE MODAL ──────────────────────────────────────────
  function openGoogleModal(role) {
    const modal = document.getElementById('modal-google');
    const list  = document.getElementById('google-account-list');
    if (!modal || !list) return;

    _currentModalRole = role;
    renderAccountList(role, list);

    // Hide new-account form if open
    const newForm = document.getElementById('google-new-account-form');
    const mainView = document.getElementById('google-main-view');
    if (newForm) newForm.style.display = 'none';
    if (mainView) mainView.style.display = '';

    openModalEl(modal);
  }

  let _currentModalRole = 'paciente';

  function renderAccountList(role, list) {
    const accounts = BioNovaData.getAllGoogleAccounts(role);

    list.innerHTML = accounts.map(acc => `
      <div class="google-account-item" data-user-id="${acc.id}" tabindex="0" role="button"
           aria-label="Ingresar como ${acc.nombre}">
        <div class="google-avatar" style="${acc.isCustom ? 'background:var(--color-accent)' : ''}">${acc.nombre.split(' ').slice(0,2).map(n=>n[0]).join('')}</div>
        <div>
          <div class="google-account-name">${acc.nombre}${acc.isCustom ? ' <span style="font-size:10px;color:var(--color-accent);font-weight:600">NUEVA</span>' : ''}</div>
          <div class="google-account-email">${acc.email}</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:auto;color:var(--color-text-disabled)"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    `).join('') + `
      <div class="google-account-item" id="btn-add-new-account" tabindex="0" role="button"
           style="border-top:0.5px solid var(--color-separator);margin-top:4px;padding-top:12px;color:var(--color-primary)">
        <div style="width:40px;height:40px;border-radius:50%;border:1.5px dashed var(--color-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <div style="font-weight:600;font-size:14px;color:var(--color-primary)">Agregar nueva cuenta</div>
      </div>`;

    // Bind account clicks
    list.querySelectorAll('.google-account-item[data-user-id]').forEach(item => {
      const select = () => {
        const userId = item.dataset.userId;
        // Could be a custom user
        let user = BioNovaData.getUserById(userId);
        if (!user) {
          const customs = BioNovaData.getCustomUsers();
          user = customs.find(u => u.id === userId);
        }
        if (user) { closeModalEl(document.getElementById('modal-google')); login(user); }
      };
      item.addEventListener('click', select);
      item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') select(); });
    });

    // Add new account button
    list.querySelector('#btn-add-new-account')?.addEventListener('click', () => showNewAccountForm());
  }

  function showNewAccountForm() {
    const mainView = document.getElementById('google-main-view');
    const newForm  = document.getElementById('google-new-account-form');
    if (mainView) mainView.style.display = 'none';
    if (newForm) {
      newForm.style.display = '';
      // Clear form
      ['new-acc-nombre','new-acc-email','new-acc-pass','new-acc-passconfirm'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      document.getElementById('new-acc-error').textContent = '';
      document.getElementById('new-acc-nombre').focus();
    }
  }

  function hideNewAccountForm() {
    const mainView = document.getElementById('google-main-view');
    const newForm  = document.getElementById('google-new-account-form');
    if (mainView) mainView.style.display = '';
    if (newForm) newForm.style.display = 'none';
  }

  // submitNewAccount: Aca manejo la validación frontend del formulario de registro.
  // Valido sintaxis de email tipo regex, tamaño de pass y que las claves coincidan antes de guardarlo.
  // Lo hago del lado del cliente porque no tenemos backend.
  function submitNewAccount() {
    const nombre  = document.getElementById('new-acc-nombre').value.trim();
    const email   = document.getElementById('new-acc-email').value.trim();
    const pass    = document.getElementById('new-acc-pass').value;
    const confirm = document.getElementById('new-acc-passconfirm').value;
    const errEl   = document.getElementById('new-acc-error');

    // Validations
    if (!nombre || !email || !pass || !confirm) {
      errEl.textContent = 'Todos los campos son obligatorios.'; return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errEl.textContent = 'El correo electrónico no tiene un formato válido.'; return;
    }
    if (pass.length < 6) {
      errEl.textContent = 'La contraseña debe tener al menos 6 caracteres.'; return;
    }
    if (pass !== confirm) {
      errEl.textContent = 'Las contraseñas no coinciden.'; return;
    }

    errEl.textContent = '';
    // Guardo el nuevo usuario en localStorage (dentro de BioNovaData.addCustomUser)
    const newUser = BioNovaData.addCustomUser({ nombre, email, password: pass });

    // Refresco la lista de cuentas para que aparezca el recién creado
    const list = document.getElementById('google-account-list');
    if (list) renderAccountList(_currentModalRole, list);
    hideNewAccountForm();
  }

  // ─── MODAL HELPERS ─────────────────────────────────────────
  function openModalEl(overlay) {
    overlay.classList.add('open');
    document.addEventListener('keydown', escClose);
    overlay.addEventListener('click', outsideClose);
  }

  function closeModalEl(overlay) {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.removeEventListener('click', outsideClose);
    document.removeEventListener('keydown', escClose);
  }

  function outsideClose(e) {
    if (e.target === e.currentTarget) closeModalEl(e.currentTarget);
  }

  function escClose(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => closeModalEl(m));
    }
  }

  function init() {
    const user = getCurrentUser();
    if (user) updateGlobalUI(user);
    initLoginHandlers();

    // Expose new-account form helpers globally for onclick handlers
    window._bionovaAuth = { submitNewAccount, hideNewAccountForm };
  }

  window.BioNovaModal = { open: openModalEl, close: closeModalEl };

  return { init, getCurrentUser, login, logout, askLogout, renderLogin, updateGlobalUI };

})();
