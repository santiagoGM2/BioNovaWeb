// ============================================================
// BioNova — appointments.js  v2.0
// ============================================================
// Este módulo renderiza la lista de citas del paciente.
// Acá incluyo lógicas combinadas de fechas y tipos de cita para mejorar la UX.

window.BioNovaAppointments = (function () {

  function render() {
    const user = BioNovaAuth.getCurrentUser();
    if (!user) return;

    // Si entra el cuidador, busco los datos del paciente que tiene a cargo, si no, es el paciente mismo.
    const patient = user.role === 'cuidador'
      ? BioNovaData.getUserById(user.pacienteVinculadoId)
      : user;

    renderCaregiverBanner(user, patient);
    renderList(patient);
  }

  function renderCaregiverBanner(user, patient) {
    const el = document.getElementById('appts-caregiver-banner');
    if (!el) return;
    el.style.display = user.role === 'cuidador' ? 'flex' : 'none';
    if (user.role === 'cuidador') {
      el.innerHTML = `${iconSvg('user-check',16)} Gestionando a: <strong style="margin-left:4px">${patient.nombre}</strong>`;
    }
  }

  // renderList: Renderiza todas las citas del paciente ordenadas cronológicamente
  function renderList(patient) {
    const container = document.getElementById('appts-list');
    if (!container) return;

    const appts = BioNovaData.getAppointmentsByPatient(patient.id);

    if (appts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${iconSvg('calendar',24)}</div>
          <div class="empty-state-title">Sin citas programadas</div>
          <div class="empty-state-desc">Tu médico creará citas que aparecerán aquí.</div>
        </div>`;
      return;
    }

    // Itero sobre cada cita para construir su tarjeta
    container.innerHTML = appts.map(a => buildApptCard(a)).join('');
  }

  // buildApptCard:
  // Esta función es el corazón del módulo. Aca determino cómo se ve la tarjeta
  // basándome en dos cosas clave: el estado (próxima/completada) y la modalidad (presencial/virtual).
  function buildApptCard(a) {
    // Fijo la hora a T12 para evitar problemas de Timezone en las fechas mostradas (un gotcha clásico de JS)
    const dateObj = new Date(a.fecha + 'T12:00:00');
    const day     = dateObj.toLocaleDateString('es-CO', { day: '2-digit' });
    const month   = dateObj.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase();
    const weekday = capitalize(dateObj.toLocaleDateString('es-CO', { weekday: 'long' }));

    const statusMap = {
      'proxima':    { label: 'Próxima',    cls: 'badge-primary' },
      'completada': { label: 'Completada', cls: 'badge-accent' },
      'cancelada':  { label: 'Cancelada',  cls: 'badge-danger' }
    };
    const st = statusMap[a.estado] || { label: a.estado, cls: 'badge-neutral' };

    // Banderas lógicas para definir qué renderizar
    const isVirtual = a.modalidad === 'virtual';
    const isPresencial = !isVirtual;
    
    // Comparo la fecha de la cita con el TODAY fijado en mockData para saber si activo el meeting
    const isApptToday = BioNovaData.isToday(a.fecha);
    const near2h = isVirtual && isWithin2Hours(a.fecha, a.hora) && a.estado === 'proxima';

    // ── Lógica botones inteligentes ──
    // Aca manejo qué botón mostrarle al usuario. 
    // Si la cita es HOY y es VIRTUAL, muestro un botón animado llamativo "Activo ahora".
    // Si es PRESENCIAL, pinto un botón directo a Google Maps para ayudarlo a llegar.
    let actionBtn = '';
    
    if (isVirtual && a.link && a.estado === 'proxima') {
      if (isApptToday) {
        actionBtn = `
          <a href="${a.link}" target="_blank" rel="noopener"
             class="btn btn-sm btn-accent appt-meet-active"
             style="animation: meetPulse 2s ease-in-out infinite;">
            ${iconSvg('video',14)} Activo ahora
          </a>`;
      } else if (near2h) { // Si falta menos de 2h
        actionBtn = `
          <a href="${a.link}" target="_blank" rel="noopener" class="btn btn-sm btn-accent">
            ${iconSvg('video',14)} Unirse al Meet
          </a>`;
      } else { // Si está lejos (ej. mañana o próxima semana) el botón queda translúcido
        actionBtn = `
          <a href="${a.link}" target="_blank" rel="noopener"
             class="btn btn-sm btn-ghost" style="opacity:0.65">
            ${iconSvg('video',14)} Meet (${day} ${month})
          </a>`;
      }
    }

    if (isPresencial && a.mapsLink && a.estado !== 'cancelada') {
      actionBtn = `
        <a href="${a.mapsLink}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary">
          ${iconSvg('map-pin',14)} Ver en Maps
        </a>`;
    }

    // Lógica para diferenciar ubicación
    // Si es presencial y tiene "centroMedico", muestro la dirección. Lo separo para no enchutar
    // strings vacíos en pantalla si la data falta (programación a la defensiva).
    const locationLine = isPresencial && a.centroMedico
      ? `<div class="appt-location">
           ${iconSvg('map-pin', 12, 'flex-shrink:0;margin-top:1px')}
           <span>${a.centroMedico}${a.direccion ? ' — ' + a.direccion : ''}</span>
         </div>`
      : '';

    return `
      <div class="appt-card mb-sm">
        <div class="appt-date-block">
          <div class="appt-date-day">${day}</div>
          <div class="appt-date-month">${month}</div>
        </div>
        <div class="appt-info">
          <div class="appt-doctor">${a.doctorNombre}</div>
          <div class="appt-specialty">${a.especialidad}</div>
          <div class="appt-meta">
            <span class="appt-time">${weekday} · ${a.hora}</span>
            <span class="badge ${isVirtual ? 'badge-primary' : 'badge-neutral'}">
              ${isVirtual ? iconSvg('video',11) : iconSvg('map-pin',11)}
              ${isVirtual ? 'Virtual' : 'Presencial'}
            </span>
            <span class="badge ${st.cls} badge-dot">${st.label}</span>
          </div>
          ${locationLine}
          ${a.notas ? `<div style="font-size:var(--size-label);color:var(--color-text-secondary);margin-top:6px;font-style:italic;">"${a.notas}"</div>` : ''}
        </div>
        <div class="appt-actions">${actionBtn}</div>
      </div>`;
  }

  function isWithin2Hours(dateStr, timeStr) {
    const apptDate = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    const diff = (apptDate - now) / 3600000;
    return diff >= 0 && diff <= 2;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return { render, buildApptCard };

})();
