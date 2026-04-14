// ============================================================
// BioNova — dashboard.js
// ============================================================
// Este módulo controla la vista principal del paciente y cuidador.
// Aca defino la lógica para pintar las gráficas (usando Chart.js), las tarjetas 
// de la próxima cita y los medicamentos del día.

window.BioNovaDashboard = (function () {

  let weekChart = null;

  function render() {
    const user = BioNovaAuth.getCurrentUser();
    if (!user) return;

    const targetPatient = user.role === 'cuidador'
      ? BioNovaData.getUserById(user.pacienteVinculadoId)
      : user;

    renderHero(user, targetPatient);
    renderCaregiverBanner(user, targetPatient);
    renderTodayMeds(targetPatient);
    renderNextAppointment(targetPatient);
    renderWeekChart(targetPatient);
    renderTip();
    updateNotifBadge(user);
  }

  function renderHero(user, patient) {
    const el = document.getElementById('dash-welcome');
    if (!el) return;
    const today = new Date().toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const displayName = user.role === 'cuidador' ? user.nombre : patient.nombre;
    const roleLabel = { 'paciente': 'Paciente', 'cuidador': 'Cuidador' }[user.role] || user.role;

    el.innerHTML = `
      <div>
        <div class="hero-welcome">Bienvenido, ${displayName.split(' ')[0]}</div>
        <div class="hero-date">${capitalize(today)}</div>
      </div>
      <div class="flex items-center gap-sm">
        <span class="badge badge-primary badge-dot" style="font-size:12px">${roleLabel}</span>
      </div>
    `;
  }

  // renderCaregiverBanner: Si quien hizo login fue un cuidador (c1), le muestro
  // una franja en la parte de arriba avisándole qué paciente está gestionando.
  // Es útil para que no se confundan si manejan varios abuelos.
  function renderCaregiverBanner(user, patient) {
    const el = document.getElementById('caregiver-banner');
    if (!el) return;
    if (user.role === 'cuidador') {
      el.style.display = 'flex';
      el.innerHTML = `
        ${iconSvg('user-check', 16)}
        Gestionando a: <strong style="margin-left:4px">${patient.nombre}</strong>
      `;
    } else {
      el.style.display = 'none';
    }
  }

  function renderTodayMeds(patient) {
    const container = document.getElementById('dash-meds-today');
    if (!container) return;

    const meds = BioNovaData.getTodaysMedications(patient.id);
    const taken = BioNovaData.getTodayTakenStatus();

    if (meds.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${iconSvg('check-circle', 24)}</div>
          <div class="empty-state-title">Sin medicamentos registrados</div>
          <div class="empty-state-desc">Cuando el médico asigne medicamentos aparecerán aquí.</div>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="meds-today-grid">
        ${meds.map(med => {
          const isTaken = taken[med.id];
          return `
            <div class="med-today-card ${isTaken ? 'taken' : ''}" id="medcard-${med.id}">
              <div class="med-color-dot" style="background:${med.color}"></div>
              <div class="med-today-info">
                <div class="med-today-name">${med.nombre}</div>
                <div class="med-today-meta">${med.dosis} &nbsp;·&nbsp; ${med.horarios.join(', ')}</div>
              </div>
              ${isTaken
                ? `<span class="badge badge-accent">${iconSvg('check',12)} Tomado</span>`
                : `<button class="btn btn-sm btn-secondary" onclick="BioNovaDashboard.markTaken('${med.id}')">Marcar tomado</button>`
              }
            </div>`;
        }).join('')}
      </div>`;
  }

  function markTaken(medId) {
    BioNovaData.markMedicationTaken(medId);
    const card = document.getElementById(`medcard-${medId}`);
    if (card) {
      card.className = 'med-today-card taken';
      const btn = card.querySelector('button');
      if (btn) btn.outerHTML = `<span class="badge badge-accent">${iconSvg('check',12)} Tomado</span>`;
    }
  }

  function renderNextAppointment(patient) {
    const el = document.getElementById('dash-next-appt');
    if (!el) return;

    const appts = BioNovaData.getAppointmentsByPatient(patient.id);
    const upcoming = appts.find(a => a.estado === 'proxima');

    if (!upcoming) {
      el.innerHTML = `
        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:20px 24px;color:var(--color-text-secondary);font-size:var(--size-body);">
          <div style="font-weight:600;color:var(--color-text-primary);margin-bottom:4px;">Próxima cita</div>
          No hay citas programadas próximamente.
        </div>`;
      return;
    }

    const dateObj = new Date(upcoming.fecha + 'T12:00:00');
    const day   = dateObj.toLocaleDateString('es-CO', { day: '2-digit' });
    const month = dateObj.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase();
    const weekday = dateObj.toLocaleDateString('es-CO', { weekday: 'long' });
    const isVirtual = upcoming.modalidad === 'virtual';

    const nearbyHours = isVirtual && isWithin2Hours(upcoming.fecha, upcoming.hora);

    el.innerHTML = `
      <div class="next-appt-card">
        <div style="flex:1">
          <div class="next-appt-label">Próxima cita</div>
          <div class="next-appt-doctor">${upcoming.doctorNombre}</div>
          <div class="next-appt-meta">
            ${iconSvg('stethoscope',14, 'display:inline-block;vertical-align:middle;margin-right:4px')}
            ${upcoming.especialidad} &nbsp;·&nbsp;
            ${capitalize(weekday)}, ${day} ${month} &nbsp;·&nbsp; ${upcoming.hora}
            &nbsp;·&nbsp; ${isVirtual ? 'Virtual' : 'Presencial'}
          </div>
        </div>
        ${isVirtual
          ? `<a href="${upcoming.link}" target="_blank" rel="noopener" class="btn-join ${!nearbyHours ? 'btn-join-disabled' : ''}">
              ${iconSvg('video', 16, 'display:inline-block;vertical-align:middle;margin-right:6px')}
              Unirse
             </a>`
          : ''
        }
      </div>`;
  }

  // renderWeekChart: 
  // Esta función usa el CDN de Chart.js para dibujar la gráfica de la semana.
  // Nota técnica: en SPAs, si no destruyo la gráfica anterior (weekChart.destroy), 
  // cuando cambio la pestaña y vuelvo, Chart.js explota tirando un error de canvas context.
  function renderWeekChart(patient) {
    const ctx = document.getElementById('chart-week-adherence');
    if (!ctx) return;

    const weekData = BioNovaData.getWeekAdherence(patient.id);
    const labels = weekData.map(d => {
      const dt = new Date(d.date + 'T12:00:00');
      return dt.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.','').toUpperCase();
    });
    const esperados = weekData.map(d => d.total);
    const tomados   = weekData.map(d => d.taken);

    // Destruyo la instancia anterior si existe para evitar solapamiento de canvas
    if (weekChart) weekChart.destroy();
    weekChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Esperados',
            data: esperados,
            backgroundColor: 'rgba(27, 108, 168, 0.12)',
            borderRadius: 4,
            borderSkipped: false
          },
          {
            label: 'Tomados',
            data: tomados,
            backgroundColor: '#1B6CA8',
            borderRadius: 4,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Plus Jakarta Sans', size: 12 },
              color: '#5C6B7A',
              boxWidth: 10,
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#0D1B2A',
            titleFont: { family: 'DM Sans', size: 13, weight: '600' },
            bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: items => 'Día: ' + items[0].label
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#5C6B7A' }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(13,27,42,0.05)', lineWidth: 0.5 },
            ticks: { font: { family: 'DM Mono', size: 11 }, color: '#5C6B7A', precision: 0 }
          }
        }
      }
    });
  }

  function renderTip() {
    const el = document.getElementById('dash-tip');
    if (!el) return;
    const tip = BioNovaData.getDailyTip();
    el.innerHTML = `
      <div class="tips-card">
        <div class="tips-icon">${iconSvg('lightbulb', 18)}</div>
        <div>
          <div class="tips-title">${tip.titulo}</div>
          <div class="tips-body">${tip.contenido}</div>
          <span class="tips-cat">${tip.categoria}</span>
        </div>
      </div>`;
  }

  function updateNotifBadge(user) {
    const count = BioNovaData.getUnreadCount(user.id);
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  // ─── HELPERS ───────────────────────────────────────────────
  function isWithin2Hours(dateStr, timeStr) {
    const apptDate = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    const diff = (apptDate - now) / 3600000;
    return diff >= 0 && diff <= 2;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return { render, markTaken, updateNotifBadge };

})();
