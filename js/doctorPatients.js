// ============================================================
// BioNova — doctorPatients.js  v2.0
// ============================================================
// Este módulo controla el panel principal del médico.
// Aquí se lista a los pacientes asignados, se muestra su estado de adherencia
// y se despliega un "Drawer" lateral para ver estadísticas profundas y crear nuevas citas.

window.BioNovaDoctorPatients = (function () {

  let selectedPatientId = null;
  let drawerMiniChart   = null;

  function render() {
    const user = BioNovaAuth.getCurrentUser();
    if (!user || user.role !== 'medico') return;

    const nameEl = document.getElementById('doctor-name-header');
    if (nameEl) nameEl.textContent = user.nombre;

    renderPatientTable(user);
    bindEvents(user);
    initApptModalLogic();
  }

  // ─── TABLE ────────────────────────────────────────────────
  function renderPatientTable(doctor) {
    const tbody = document.getElementById('patients-tbody');
    if (!tbody) return;

    const patients = BioNovaData.users.filter(u => (doctor.pacientes || []).includes(u.id));

    if (patients.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--color-text-secondary)">Sin pacientes asignados</td></tr>`;
      return;
    }

    tbody.innerHTML = patients.map(p => {
      const adh    = BioNovaData.getAdherencePercent(p.id, 30);
      const hist   = BioNovaData.adherenceHistory[p.id];
      const lastDay = hist && hist.length > 0 ? hist[hist.length - 1].date : null;
      const relTime = lastDay ? BioNovaData.getRelativeTime(lastDay) : '—';
      const adhColor = adh >= 80 ? 'var(--color-accent)' : adh >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';
      const initials = p.nombre.split(' ').slice(0,2).map(n => n[0]).join('');
      const alertBadge = adh < 60
        ? `<span class="badge badge-danger" style="margin-left:6px;font-size:10px">Alerta</span>`
        : '';

      return `
        <tr class="patient-row-tr" data-patient-id="${p.id}" style="cursor:pointer" title="Ver detalle">
          <td>
            <div style="display:flex;align-items:center;gap:12px">
              <div class="patient-avatar">${initials}</div>
              <div>
                <div style="font-weight:600;font-size:14px">${p.nombre}${alertBadge}</div>
                <div style="font-size:12px;color:var(--color-text-secondary)">${p.email}</div>
              </div>
            </div>
          </td>
          <td><span style="font-family:var(--font-mono);font-size:13px">${p.edad ? p.edad + ' años' : '—'}</span></td>
          <td style="max-width:160px;font-size:13px">${p.condicion}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="progress-bar-wrap" style="flex:1;min-width:80px">
                <div class="progress-bar-fill" style="width:${adh}%;background:${adhColor}"></div>
              </div>
              <span style="font-family:var(--font-mono);font-size:12px;color:${adhColor};font-weight:600;flex-shrink:0">${adh}%</span>
            </div>
          </td>
          <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--color-text-secondary)">${relTime}</span></td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();BioNovaDoctorPatients.openDrawer('${p.id}')">
              ${iconSvg('chevron-right', 15)} Ver detalle
            </button>
          </td>
        </tr>`;
    }).join('');

    tbody.querySelectorAll('.patient-row-tr').forEach(row => {
      row.addEventListener('click', e => {
        if (!e.target.closest('button')) openDrawer(row.dataset.patientId);
      });
    });
  }

  // ─── DRAWER (Panel Lateral) ─────────────────────────────────────────────
  // openDrawer: 
  // Esta vista reemplaza la necesidad de cargar una página completa para cada paciente.
  // Inyecto los datos dinámicamente en el sidebar flotante basándome en el ID del paciente seleccionado.
  function openDrawer(patientId) {
    selectedPatientId = patientId;
    const patient = BioNovaData.getUserById(patientId);
    if (!patient) return;

    const drawer  = document.getElementById('patient-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (!drawer || !overlay) return;

    const initials = patient.nombre.split(' ').slice(0,2).map(n => n[0]).join('');
    document.getElementById('drawer-patient-name').textContent = patient.nombre;
    document.getElementById('drawer-patient-meta').textContent = `${patient.edad ? patient.edad + ' años · ' : ''}${patient.condicion}`;
    document.getElementById('drawer-patient-initials').textContent = initials;

    // Adherence bar
    const adh      = BioNovaData.getAdherencePercent(patientId, 30);
    const adhColor = adh >= 80 ? 'var(--color-accent)' : adh >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';
    const adhEl    = document.getElementById('drawer-adherence');
    if (adhEl) adhEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <div class="progress-bar-wrap" style="flex:1">
          <div class="progress-bar-fill" style="width:${adh}%;background:${adhColor}"></div>
        </div>
        <span style="font-family:var(--font-mono);font-size:16px;font-weight:700;color:${adhColor}">${adh}%</span>
      </div>
      <div style="font-size:12px;color:var(--color-text-secondary);margin-top:4px">Últimos 30 días</div>
      <div style="margin-top:12px">
        <div style="font-size:11px;color:var(--color-text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">Últimos 14 días</div>
        <div style="height:60px"><canvas id="drawer-mini-chart"></canvas></div>
      </div>`;

    // Render mini chart after DOM is ready
    requestAnimationFrame(() => renderMiniChart(patientId));

    // Medications
    const meds   = BioNovaData.getMedicationsByPatient(patientId);
    const medsEl = document.getElementById('drawer-meds');
    if (medsEl) medsEl.innerHTML = meds.length === 0
      ? '<div style="color:var(--color-text-disabled);font-size:13px">Sin medicamentos asignados</div>'
      : meds.map(m => `
          <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:0.5px solid var(--color-separator)">
            <div class="med-color-dot" style="background:${m.color}"></div>
            <div style="flex:1">
              <div style="font-weight:600;font-size:13px">${m.nombre} <span style="font-weight:400">${m.dosis}</span></div>
              <div style="font-size:11px;color:var(--color-text-secondary)">${BioNovaData.formatFrecuencia(m.frecuencia)}${m.horarios.length ? ' · ' + m.horarios.join(', ') : ''}</div>
            </div>
          </div>`).join('');

    // Appointments (last 4)
    const appts   = BioNovaData.getAppointmentsByPatient(patientId);
    const apptsEl = document.getElementById('drawer-appts');
    if (apptsEl) apptsEl.innerHTML = appts.length === 0
      ? '<div style="color:var(--color-text-disabled);font-size:13px">Sin citas registradas</div>'
      : appts.slice(0, 4).map(a => {
          const stMap = { 'proxima': 'badge-primary', 'completada': 'badge-accent', 'cancelada': 'badge-danger' };
          const isVirtual = a.modalidad === 'virtual';
          return `
            <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:0.5px solid var(--color-separator)">
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600">${BioNovaData.formatDateShort(a.fecha)} · ${a.hora}</div>
                <div style="font-size:11px;color:var(--color-text-secondary)">${a.especialidad} · ${isVirtual ? 'Virtual' : 'Presencial'}</div>
              </div>
              <span class="badge ${stMap[a.estado] || 'badge-neutral'} badge-dot" style="font-size:10px">${a.estado}</span>
            </div>`;
        }).join('');

    // Timeline
    renderTimeline(patientId);

    drawer.classList.add('open');
    overlay.classList.add('open');
  }

  // renderMiniChart:
  // Renderiza un gráfico de barras pequeño para el Drawer. Sirve como "Sparkline"
  // para dar un vistazo rapidísimo a las tendencias sin ocupar mucho espacio visual.
  function renderMiniChart(patientId) {
    const ctx = document.getElementById('drawer-mini-chart');
    if (!ctx) return;
    if (drawerMiniChart) { drawerMiniChart.destroy(); drawerMiniChart = null; }

    const hist   = BioNovaData.adherenceHistory[patientId] || [];
    const last14 = hist.slice(-14);
    const labels = last14.map(d => {
      const dt = new Date(d.date + 'T12:00:00');
      return dt.toLocaleDateString('es-CO', { day: '2-digit' });
    });
    const data = last14.map(day => {
      const meds = Object.values(day.medications);
      return meds.length === 0 ? 0 : Math.round((meds.filter(Boolean).length / meds.length) * 100);
    });

    drawerMiniChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: data.map(v => v >= 80 ? '#0A9396' : v >= 60 ? '#D97706' : '#C94040'),
          borderRadius: 2,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: i => i.raw + '%' } } },
        scales: {
          x: { display: false },
          y: { display: false, beginAtZero: true, max: 100 }
        }
      }
    });
  }

  function renderTimeline(patientId) {
    const el = document.getElementById('drawer-timeline');
    if (!el) return;

    const hist = (BioNovaData.adherenceHistory[patientId] || []).slice(-5).reverse();
    const meds = BioNovaData.getMedicationsByPatient(patientId).filter(m => m.frecuencia !== 'a_demanda');
    const appts = BioNovaData.getAppointmentsByPatient(patientId);

    const events = [];

    hist.forEach(day => {
      const dateStr = day.date;
      const rel = BioNovaData.getRelativeTime(dateStr);
      meds.forEach(med => {
        const taken = day.medications[med.id];
        if (taken !== undefined) {
          events.push({
            date: dateStr,
            rel,
            icon: taken ? 'check-circle' : 'alert-triangle',
            color: taken ? 'var(--color-accent)' : 'var(--color-warning)',
            text: taken
              ? `Tomó ${med.nombre} ${med.dosis}`
              : `Saltó ${med.nombre} ${med.dosis}`,
            time: med.horarios[0] || ''
          });
        }
      });
    });

    // Add completed appointment events
    appts.filter(a => a.estado === 'completada').slice(0, 3).forEach(a => {
      events.push({
        date: a.fecha,
        rel: BioNovaData.getRelativeTime(a.fecha),
        icon: 'calendar',
        color: 'var(--color-primary)',
        text: `Asistió a cita: ${a.especialidad}`,
        time: a.hora
      });
    });

    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    const top10 = events.slice(0, 10);

    el.innerHTML = top10.length === 0
      ? '<div style="color:var(--color-text-disabled);font-size:13px">Sin actividad registrada</div>'
      : `<div class="timeline-list">
          ${top10.map(ev => `
            <div class="timeline-item">
              <div class="timeline-dot" style="color:${ev.color}">${iconSvg(ev.icon, 14)}</div>
              <div class="timeline-body">
                <div class="timeline-text">${ev.text}${ev.time ? ' <span class="timeline-time">' + ev.time + '</span>' : ''}</div>
                <div class="timeline-date">${ev.rel}</div>
              </div>
            </div>`).join('')}
        </div>`;
  }

  function closeDrawer() {
    document.getElementById('patient-drawer')?.classList.remove('open');
    document.getElementById('drawer-overlay')?.classList.remove('open');
    if (drawerMiniChart) { drawerMiniChart.destroy(); drawerMiniChart = null; }
    selectedPatientId = null;
  }

  // ─── EVENTS ───────────────────────────────────────────────
  function bindEvents(doctor) {
    document.getElementById('btn-close-drawer')?.addEventListener('click', closeDrawer);
    document.getElementById('drawer-overlay')?.addEventListener('click', closeDrawer);

    document.getElementById('btn-assign-med')?.addEventListener('click', () => {
      if (!selectedPatientId) return;
      clearMedForm();
      BioNovaModal.open(document.getElementById('modal-doc-med-overlay'));
    });

    document.getElementById('btn-create-appt')?.addEventListener('click', () => {
      if (!selectedPatientId) return;
      clearApptForm();
      BioNovaModal.open(document.getElementById('modal-doc-appt-overlay'));
    });

    document.getElementById('btn-save-doc-med')?.addEventListener('click', () => saveMedication(doctor));
    document.getElementById('btn-save-doc-appt')?.addEventListener('click', () => saveAppointment(doctor));

    document.querySelectorAll('#modal-doc-med .modal-close').forEach(b => {
      b.onclick = () => BioNovaModal.close(document.getElementById('modal-doc-med-overlay'));
    });
    document.querySelectorAll('#modal-doc-appt .modal-close').forEach(b => {
      b.onclick = () => BioNovaModal.close(document.getElementById('modal-doc-appt-overlay'));
    });
  }

  // ─── MODAL NUEVA CITA ─────────────────────────────────────────────
  // initApptModalLogic:
  // Configuro todos los event listeners necesarios para el modal de agendamiento.
  // Usurpamos la logica de si eligieron virtual para desplegar/ocultar el input del link de Meet
  // y si es presencial, el de centro médico / maps.
  function initApptModalLogic() {
    const tipoSel = document.getElementById('doc-appt-tipo');
    if (!tipoSel || tipoSel._bound) return;
    tipoSel._bound = true;
    tipoSel.addEventListener('change', updateApptModalFields);
    updateApptModalFields();
  }

  function updateApptModalFields() {
    const tipo    = document.getElementById('doc-appt-tipo')?.value || 'virtual';
    const linkRow = document.getElementById('doc-appt-link-row');
    const presRow = document.getElementById('doc-appt-pres-row');
    if (linkRow) linkRow.style.display = tipo === 'virtual' ? '' : 'none';
    if (presRow) presRow.style.display = tipo === 'presencial' ? '' : 'none';
    if (tipo === 'virtual') {
      const linkEl = document.getElementById('doc-appt-link');
      if (linkEl && !linkEl.value) linkEl.value = 'https://meet.google.com/kpw-tvfq-tqd';
    }
  }

  function clearMedForm() {
    ['doc-med-nombre','doc-med-dosis','doc-med-horario','doc-med-notas'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    const freq = document.getElementById('doc-med-frecuencia');
    if (freq) freq.value = 'cada_24h';
    const err = document.getElementById('doc-med-error');
    if (err) err.textContent = '';
  }

  function clearApptForm() {
    const ids = ['doc-appt-fecha','doc-appt-hora','doc-appt-link','doc-appt-notas','doc-appt-centro','doc-appt-direccion'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const tipo = document.getElementById('doc-appt-tipo');
    if (tipo) tipo.value = 'virtual';
    const err = document.getElementById('doc-appt-error');
    if (err) err.textContent = '';
    updateApptModalFields();
  }

  function saveMedication(doctor) {
    const nombre     = document.getElementById('doc-med-nombre').value.trim();
    const dosis      = document.getElementById('doc-med-dosis').value.trim();
    const frecuencia = document.getElementById('doc-med-frecuencia').value;
    const horarioRaw = document.getElementById('doc-med-horario').value.trim();
    const notas      = document.getElementById('doc-med-notas').value.trim();
    const errEl      = document.getElementById('doc-med-error');

    if (!nombre || !dosis) { if (errEl) errEl.textContent = 'Nombre y dosis son obligatorios.'; return; }

    const horarios = horarioRaw ? horarioRaw.split(',').map(h => h.trim()).filter(Boolean) : [];
    BioNovaData.addMedication({
      nombre, dosis, frecuencia, horarios, notas,
      pacienteId: selectedPatientId,
      activo: true, color: '#1B6CA8',
      fechaInicio: new Date().toISOString().split('T')[0]
    });
    BioNovaModal.close(document.getElementById('modal-doc-med-overlay'));
    openDrawer(selectedPatientId);
    renderPatientTable(doctor);
  }

  function saveAppointment(doctor) {
    const fecha    = document.getElementById('doc-appt-fecha').value;
    const hora     = document.getElementById('doc-appt-hora').value;
    const tipo     = document.getElementById('doc-appt-tipo').value;
    const link     = document.getElementById('doc-appt-link')?.value.trim();
    const centro   = document.getElementById('doc-appt-centro')?.value.trim();
    const direccion= document.getElementById('doc-appt-direccion')?.value.trim();
    const notas    = document.getElementById('doc-appt-notas').value.trim();
    const errEl    = document.getElementById('doc-appt-error');

    if (!fecha || !hora) { if (errEl) errEl.textContent = 'Fecha y hora son obligatorias.'; return; }

    BioNovaData.addAppointment({
      pacienteId: selectedPatientId,
      doctorId: doctor.id,
      doctorNombre: doctor.nombre,
      especialidad: doctor.especialidad,
      fecha, hora, modalidad: tipo,
      link: tipo === 'virtual' ? (link || 'https://meet.google.com/kpw-tvfq-tqd') : null,
      centroMedico: tipo === 'presencial' ? centro : null,
      direccion:    tipo === 'presencial' ? direccion : null,
      mapsLink:     null,
      estado: 'proxima', notas
    });

    BioNovaModal.close(document.getElementById('modal-doc-appt-overlay'));
    openDrawer(selectedPatientId);
    renderPatientTable(doctor);
  }

  return { render, openDrawer };

})();
