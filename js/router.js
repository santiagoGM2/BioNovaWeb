// ============================================================
// BioNova — router.js  v2.0
// ============================================================
// Aca armo el enrutador de la SPA (Single Page Application). 
// Elegí hacerlo con Vanilla JS escuchando el evento 'hashchange' en vez de usar 
// un framework pesado como React o Vue, porque para esta entrega académica 
// necesitaba algo ligero que funcionara directamente desde el navegador 
// sin necesidad de instalar dependencias o configurar un empaquetador (Webpack/Vite).

window.BioNovaRouter = (function () {

  // Defino el mapeo entre la URL (#ruta) y el ID de la etiqueta <section> en el HTML.
  const routes = {
    '#login':           'screen-login',
    '#dashboard':       'screen-dashboard',
    '#medications':     'screen-medications',
    '#appointments':    'screen-appointments',
    '#stats':           'screen-stats',
    '#notifications':   'screen-notifications',
    '#doctor-patients': 'screen-doctor-patients',
    '#doctor-global':   'screen-doctor-global',
  };

  // Matriz de permisos. Si un usuario intenta acceder a una ruta que no le corresponde, lo reboto.
  const roleAccess = {
    '#dashboard':       ['paciente', 'cuidador'],
    '#medications':     ['paciente', 'cuidador'],
    '#appointments':    ['paciente', 'cuidador'],
    '#stats':           ['paciente', 'cuidador'],
    '#notifications':   ['paciente', 'cuidador'],
    '#doctor-patients': ['medico'],
    '#doctor-global':   ['medico'],
  };

  let currentHash = '';
  let _spinner = null;

  // showSpinner: 
  // Crea e inyecta un div de carga en el DOM si no existe, y le pone la clase visible.
  // Esto me sirve para dar feedback visual al usuario de que la app está procesando algo.
  function showSpinner() {
    if (!_spinner) {
      _spinner = document.createElement('div');
      _spinner.id = 'route-spinner';
      _spinner.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(_spinner);
    }
    _spinner.classList.add('visible');
  }

  // hideSpinner: 
  // Quita la clase visible del spinner para ocultarlo de la pantalla una vez la vista cargó.
  function hideSpinner() {
    if (_spinner) _spinner.classList.remove('visible');
  }

  // navigate: 
  // Recibe un string (ej: '#dashboard') y fuerza el cambio de hash en la ventana, 
  // lo cual dispara automáticamente el evento 'hashchange'.
  function navigate(hash) {
    window.location.hash = hash;
  }

  // handleRoute: 
  // Es el motor principal. Se ejecuta cada vez que cambia la URL.
  // Comprueba la autenticación, verifica roles, oculta todas las secciones del HTML 
  // y solo hace visible la que corresponde al hash actual.
  function handleRoute() {
    // Si entran a la raíz sin hash, los mando al login por defecto.
    const hash = window.location.hash || '#login';
    if (hash === currentHash) return;
    currentHash = hash;

    // Validación de seguridad: si no están en login, verifico que la sesión exista en localStorage.
    if (hash !== '#login') {
      const user = BioNovaAuth.getCurrentUser();
      // Si no hay usuario, pa' fuera.
      if (!user) { navigate('#login'); return; }
      
      const allowed = roleAccess[hash];
      // Si la ruta tiene protección de roles y el rol del usuario no está ahí, lo devuelvo a su inicio.
      if (allowed && !allowed.includes(user.role)) {
        navigate(user.role === 'medico' ? '#doctor-patients' : '#dashboard');
        return;
      }
    }

    const screenId = routes[hash];
    // Si tipearon una ruta inválida en la barra de direcciones, fallo de forma segura mandándolos al login.
    if (!screenId) { navigate('#login'); return; }

    showSpinner();

    // DOM update: Le quito 'active' a todas las pantallas para ocultarlas.
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // Agrego un setTimeout de 180ms para que la transición no sea tan brusca 
    // y el usuario alcance a ver el spinner. Mejora mucho la percepción subjetiva de fluidez (UX).
    setTimeout(() => {
      const target = document.getElementById(screenId);
      if (target) {
        target.classList.add('active'); // Muestro la pantalla correspondiente
        triggerPageRender(hash);       // Le aviso al módulo de esa página que ya se mostró
      }
      updateSidebarActive(hash);
      hideSpinner();
    }, 180);
  }

  // triggerPageRender: 
  // Actúa como un controlador frontal. Ejecuta la lógica específica de cada módulo 
  // (pintar gráficas, armar tablas con innerHTML) solo para la vista que se acaba de abrir.
  function triggerPageRender(hash) {
    try {
      if (hash === '#login')           BioNovaAuth.renderLogin();
      else if (hash === '#dashboard')  BioNovaDashboard.render();
      else if (hash === '#medications')BioNovaMedications.render();
      else if (hash === '#appointments')BioNovaAppointments.render();
      else if (hash === '#stats')      BioNovaStats.render();
      else if (hash === '#notifications')BioNovaNotifications.render();
      else if (hash === '#doctor-patients')BioNovaDoctorPatients.render();
      else if (hash === '#doctor-global')BioNovaDoctorGlobal.render();
    } catch (e) {
      console.error('[BioNova Router] Error rendering', hash, e);
    }
  }

  // updateSidebarActive: 
  // Pinta y despinta la opción activa del menú lateral basándose en la URL actual.
  function updateSidebarActive(hash) {
    document.querySelectorAll('.nav-item[data-route]').forEach(item => {
      const isActive = item.dataset.route === hash;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-current', isActive ? 'page' : 'false'); // Accesibilidad
    });
    const user = BioNovaAuth?.getCurrentUser?.();
    if (user && window.updateSharedSidebars) updateSharedSidebars(user);
  }

  // init: 
  // Se llama desde el index.html al cargar la app. Pone a escuchar la URL.
  function init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Ejecuto manualmente la primera vez para iniciar el render
  }

  return { init, navigate, handleRoute };

})();
