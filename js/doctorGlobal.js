// ============================================================
// BioNova — doctorGlobal.js  v2.0
// ============================================================
// Panel analítico global para el médico. 
// Aca condenso todas las métricas de los pacientes asignados al doctor
// en indicadores clave de rendimiento (KPIs), tendencias usando Chart.js y
// alertas automáticas para intervenir en pacientes con baja adherencia.

window.BioNovaDoctorGlobal = (function () {

  let barGlobalChart = null;
  let donutChart     = null;
  let trendChart     = null;

  function render() {
    const user = BioNovaAuth.getCurrentUser();
    if (!user || user.role !== 'medico') return;

    const patients = BioNovaData.users.filter(u => (user.pacientes || []).includes(u.id));

    renderKPIs(user, patients);
    renderBarChart(patients);
    renderDonutChart(user);
    renderTrendChart(patients);
    renderTimeline(patients);
    renderAlerts(patients);
    renderHighlights(patients);
    renderWeekAppointments(user);
  }

  // ─── KPIs ─────────────────────────────────────────────────
  function renderKPIs(doctor, patients) {
    const avgAdh   = patients.length === 0 ? 0
      : Math.round(patients.reduce((s, p) => s + BioNovaData.getAdherencePercent(p.id, 30), 0) / patients.length);

    const allAppts = BioNovaData.appointments.filter(a => a.doctorId === doctor.id);
    const today  = new Date(BioNovaData.TODAY);
    const citasSemana = allAppts.filter(a => {
      const d = new Date(a.fecha + 'T12:00:00');
      const diff = (d - today) / 86400000;
      return diff >= 0 && diff <= 7;
    }).length;

    const alertas = patients.filter(p => BioNovaData.getAdherencePercent(p.id, 30) < 60).length;

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('global-pacientes', patients.length);
    setText('global-adherencia', avgAdh + '%');
    setText('global-citas-semana', citasSemana);
    setText('global-alertas', alertas);

    const adhEl = document.getElementById('global-adherencia');
    if (adhEl) adhEl.style.color = avgAdh >= 80 ? 'var(--color-accent)' : avgAdh >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';
  }

  // ─── BAR CHART (adherencia por paciente) ──────────────────
  function renderBarChart(patients) {
    const ctx = document.getElementById('chart-global-bar');
    if (!ctx) return;

    const labels = patients.map(p => p.nombre.split(' ').slice(0,2).join(' '));
    const data   = patients.map(p => BioNovaData.getAdherencePercent(p.id, 30));
    const colors = data.map(v => v >= 80 ? '#0A9396' : v >= 60 ? '#D97706' : '#C94040');

    if (barGlobalChart) { barGlobalChart.destroy(); barGlobalChart = null; }
    barGlobalChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Adherencia (%)', data, backgroundColor: colors, borderRadius: 6, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0D1B2A',
            titleFont: { family: 'DM Sans', size: 13, weight: '600' },
            bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
            padding: 12, cornerRadius: 8,
            callbacks: { label: item => `Adherencia: ${item.raw}%` }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 12 }, color: '#5C6B7A' } },
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(13,27,42,0.05)' }, ticks: { font: { family: 'DM Mono', size: 11 }, color: '#5C6B7A', callback: v => v + '%' } }
        }
      }
    });
  }

  // ─── DONUT (distribución citas) ───────────────────────────
  function renderDonutChart(doctor) {
    const ctx = document.getElementById('chart-global-donut');
    if (!ctx) return;

    const allAppts    = BioNovaData.appointments.filter(a => a.doctorId === doctor.id);
    const proximas    = allAppts.filter(a => a.estado === 'proxima').length;
    const completadas = allAppts.filter(a => a.estado === 'completada').length;
    const canceladas  = allAppts.filter(a => a.estado === 'cancelada').length;

    if (donutChart) { donutChart.destroy(); donutChart = null; }
    donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Próximas', 'Completadas', 'Canceladas'],
        datasets: [{ data: [proximas, completadas, canceladas], backgroundColor: ['#1B6CA8', '#0A9396', '#C94040'], borderWidth: 0, hoverOffset: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', size: 12 }, color: '#5C6B7A', boxWidth: 10, padding: 16 } },
          tooltip: { backgroundColor: '#0D1B2A', titleFont: { family: 'DM Sans', size: 13 }, bodyFont: { family: 'Plus Jakarta Sans', size: 12 }, padding: 12, cornerRadius: 8 }
        }
      }
    });
  }

  // ─── TREND LINE (adherencia global por semana) ─────────────
  // renderTrendChart:
  // Dibujamos el gráfico lineal con los datos proyectados en el último mes.
  // Permite observar a gran escala cómo está evolucionando la adherencia general de nuestra población.
  function renderTrendChart(patients) {
    const ctx = document.getElementById('chart-global-trend');
    if (!ctx) return;

    // Compute global adherence per week over 4 weeks
    const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    const data  = weeks.map((_, wi) => {
      let total = 0, taken = 0;
      patients.forEach(p => {
        const hist = BioNovaData.adherenceHistory[p.id] || [];
        const slice = hist.slice(wi * 7, (wi + 1) * 7);
        slice.forEach(day => {
          Object.values(day.medications).forEach(v => { total++; if (v) taken++; });
        });
      });
      return total === 0 ? 0 : Math.round((taken / total) * 100);
    });

    if (trendChart) { trendChart.destroy(); trendChart = null; }
    trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weeks,
        datasets: [{
          label: 'Adherencia global (%)',
          data,
          borderColor: '#1B6CA8',
          backgroundColor: 'rgba(27,108,168,0.08)',
          pointBackgroundColor: '#1B6CA8',
          pointRadius: 5, pointHoverRadius: 7,
          borderWidth: 2.5, tension: 0.35, fill: true
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#0D1B2A', bodyFont: { family: 'Plus Jakarta Sans', size: 12 }, padding: 12, cornerRadius: 8, callbacks: { label: i => i.raw + '%' } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 12 }, color: '#5C6B7A' } },
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(13,27,42,0.05)' }, ticks: { font: { family: 'DM Mono', size: 11 }, color: '#5C6B7A', callback: v => v + '%' } }
        }
      }
    });
  }

  // ─── HIGHLIGHTS (most adherent / most at risk) ─────────────
  function renderHighlights(patients) {
    const el = document.getElementById('global-highlights');
    if (!el) return;

    if (patients.length === 0) { el.innerHTML = ''; return; }

    const withAdh = patients.map(p => ({ p, adh: BioNovaData.getAdherencePercent(p.id, 30) }));
    const best = withAdh.reduce((a, b) => a.adh >= b.adh ? a : b);
    const worst = withAdh.reduce((a, b) => a.adh <= b.adh ? a : b);

    el.innerHTML = `
      <div class="global-highlights-row">
        <div class="kpi-card highlight-card" style="border-left:3px solid var(--color-accent)">
          <div class="kpi-card-icon kpi-icon-accent">${iconSvg('user-check', 18)}</div>
          <div>
            <div class="kpi-card-label">Paciente más adherente</div>
            <div class="kpi-card-value" style="font-size:18px;color:var(--color-accent)">${best.adh}%</div>
            <div class="kpi-card-sub">${best.p.nombre}</div>
          </div>
        </div>
        <div class="kpi-card highlight-card" style="border-left:3px solid var(--color-danger)">
          <div class="kpi-card-icon kpi-icon-danger">${iconSvg('alert-triangle', 18)}</div>
          <div>
            <div class="kpi-card-label">Mayor riesgo (baja adherencia)</div>
            <div class="kpi-card-value" style="font-size:18px;color:var(--color-danger)">${worst.adh}%</div>
            <div class="kpi-card-sub">${worst.p.nombre}</div>
          </div>
        </div>
      </div>`;
  }

  // ─── TIMELINE ─────────────────────────────────────────────
  function renderTimeline(patients) {
    const container = document.getElementById('global-timeline');
    if (!container) return;

    const events = [];
    patients.forEach(p => {
      const hist = BioNovaData.adherenceHistory[p.id] || [];
      hist.slice(-3).forEach(day => {
        const meds = Object.values(day.medications);
        const taken = meds.filter(Boolean).length;
        if (meds.length > 0) events.push({ ts: day.date, text: `${p.nombre.split(' ')[0]} — ${taken}/${meds.length} medicamentos`, date: day.date });
      });
      BioNovaData.getAppointmentsByPatient(p.id).filter(a => a.estado === 'completada').slice(0,2).forEach(a => {
        events.push({ ts: a.fecha, text: `Cita completada: ${p.nombre.split(' ')[0]} — ${a.especialidad}`, date: a.fecha });
      });
    });

    events.sort((a,b) => b.ts.localeCompare(a.ts));
    container.innerHTML = events.slice(0, 8).map(e => `
      <div class="timeline-item">
        <div class="timeline-dot" style="color:var(--color-primary)">${iconSvg('activity', 13)}</div>
        <div class="timeline-body">
          <div class="timeline-text">${e.text}</div>
          <div class="timeline-date">${new Date(e.date + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</div>
        </div>
      </div>`).join('');
  }

  // ─── ALERTS TABLE ─────────────────────────────────────────
  function renderAlerts(patients) {
    const tbody = document.getElementById('alerts-tbody');
    if (!tbody) return;

    const alertList = patients.filter(p => BioNovaData.getAdherencePercent(p.id, 30) < 60);

    if (alertList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--color-text-secondary);padding:24px">
        Sin alertas activas. Todos cumplen el umbral de adherencia.</td></tr>`;
      return;
    }

    tbody.innerHTML = alertList.map(p => {
      const adh = BioNovaData.getAdherencePercent(p.id, 30);
      return `
        <tr>
          <td><strong>${p.nombre}</strong></td>
          <td style="font-size:12px">${p.condicion}</td>
          <td><span style="font-family:var(--font-mono);font-size:13px;color:var(--color-danger);font-weight:700">${adh}%</span></td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="BioNovaDoctorPatients.openDrawer('${p.id}')">
              ${iconSvg('chevron-right', 13)} Ver paciente
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  // ─── WEEK APPOINTMENTS ────────────────────────────────────
  function renderWeekAppointments(doctor) {
    const el = document.getElementById('global-week-appts');
    if (!el) return;

    const today = new Date(BioNovaData.TODAY);
    const allAppts = BioNovaData.appointments.filter(a => {
      const d = new Date(a.fecha + 'T12:00:00');
      const diff = (d - today) / 86400000;
      return diff >= 0 && diff <= 7 && a.doctorId === doctor.id;
    }).sort((a,b) => new Date(a.fecha) - new Date(b.fecha));

    if (allAppts.length === 0) {
      el.innerHTML = `<div class="empty-state" style="padding:24px">
        <div class="empty-state-icon">${iconSvg('calendar', 20)}</div>
        <div class="empty-state-title" style="font-size:14px">Sin citas esta semana</div>
      </div>`;
      return;
    }

    el.innerHTML = `<div class="table-wrapper">
      <table>
        <thead><tr><th>Paciente</th><th>Fecha</th><th>Especialidad</th><th>Modalidad</th><th>Estado</th><th>Acción</th></tr></thead>
        <tbody>
          ${allAppts.map(a => {
            const patient = BioNovaData.users.find(u => u.id === a.pacienteId);
            const stMap = { proxima: 'badge-primary', completada: 'badge-accent', cancelada: 'badge-danger' };
            const isVirtual = a.modalidad === 'virtual';
            return `<tr>
              <td style="font-weight:600">${patient ? patient.nombre.split(' ').slice(0,2).join(' ') : '—'}</td>
              <td style="font-family:var(--font-mono);font-size:12px">${BioNovaData.formatDateShort(a.fecha)} ${a.hora}</td>
              <td style="font-size:13px">${a.especialidad}</td>
              <td>
                <span class="badge ${isVirtual ? 'badge-primary' : 'badge-neutral'}">
                  ${isVirtual ? iconSvg('video',11) : iconSvg('map-pin',11)} ${a.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
                </span>
              </td>
              <td><span class="badge ${stMap[a.estado] || 'badge-neutral'} badge-dot" style="font-size:10px">${a.estado}</span></td>
              <td>
                ${isVirtual && a.link
                  ? `<a href="${a.link}" target="_blank" rel="noopener" class="btn btn-sm btn-accent">${iconSvg('video',12)} Unirse</a>`
                  : a.centroMedico && a.mapsLink
                    ? `<a href="${a.mapsLink}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary">${iconSvg('map-pin',12)} Maps</a>`
                    : '<span style="color:var(--color-text-disabled);font-size:12px">—</span>'
                }
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  }

  return { render };

})();
