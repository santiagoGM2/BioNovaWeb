// ============================================================
// BioNova — stats.js  v2.0
// Estadísticas ampliadas: racha best, med más/menos cumplido
// comparativa mensual
// ============================================================

window.BioNovaStats = (function () {

  let barChart = null;
  let lineChart = null;

  function render() {
    const user = BioNovaAuth.getCurrentUser();
    if (!user) return;

    const patient = user.role === 'cuidador'
      ? BioNovaData.getUserById(user.pacienteVinculadoId)
      : user;

    renderKPIs(patient);
    renderBarChart(patient);
    renderLineChart(patient);
    renderHistoryTable(patient);
    renderExtraStats(patient);
  }

  function renderKPIs(patient) {
    const adherPct  = BioNovaData.getAdherencePercent(patient.id, 30);
    const meds      = BioNovaData.getMedicationsByPatient(patient.id).filter(m => m.activo && m.frecuencia !== 'a_demanda');
    const appts     = BioNovaData.getAppointmentsByPatient(patient.id);
    const asistidas = appts.filter(a => a.estado === 'completada').length;
    const streak    = BioNovaData.getCurrentStreak(patient.id);

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('stat-meds-activos', meds.length);
    setText('stat-adherencia-mes', adherPct + '%');
    setText('stat-citas-asistidas', asistidas);
    setText('stat-racha', streak > 0 ? streak + ' d' : '0');

    const adherColor = adherPct >= 80 ? 'var(--color-accent)' : adherPct >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';
    const adherEl = document.getElementById('stat-adherencia-mes');
    if (adherEl) adherEl.style.color = adherColor;

    const streakEl = document.getElementById('stat-racha');
    if (streakEl) {
      streakEl.parentElement.querySelector('.kpi-card-sub').textContent =
        streak > 0 ? 'Días consecutivos al 100%' : 'Sin racha activa — empieza hoy';
    }
  }

  function renderBarChart(patient) {
    const ctx = document.getElementById('chart-stats-bar');
    if (!ctx) return;

    const weekData = BioNovaData.getWeekAdherence(patient.id);
    const labels = weekData.map(d => {
      const dt = new Date(d.date + 'T12:00:00');
      return dt.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit' }).toUpperCase();
    });

    if (barChart) { barChart.destroy(); barChart = null; }
    barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Esperados', data: weekData.map(d => d.total), backgroundColor: 'rgba(27,108,168,0.12)', borderRadius: 5, borderSkipped: false },
          {
            label: 'Tomados',
            data: weekData.map(d => d.taken),
            backgroundColor: weekData.map(d =>
              d.total === 0 ? '#E5E7EB' :
              d.taken >= d.total ? '#0A9396' :
              d.taken / d.total >= 0.6 ? '#D97706' : '#C94040'
            ),
            borderRadius: 5,
            borderSkipped: false
          }
        ]
      },
      options: chartOptions()
    });
  }

  function renderLineChart(patient) {
    const ctx = document.getElementById('chart-stats-line');
    if (!ctx) return;

    const hist = BioNovaData.adherenceHistory[patient.id] || [];
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const slice = hist.slice(i * 7, (i + 1) * 7);
      let total = 0, taken = 0;
      slice.forEach(day => {
        Object.values(day.medications).forEach(v => { total++; if (v) taken++; });
      });
      const pct = total === 0 ? 0 : Math.round((taken / total) * 100);
      weeks.push({ label: `Sem ${i + 1}`, pct });
    }

    if (lineChart) { lineChart.destroy(); lineChart = null; }
    lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weeks.map(w => w.label),
        datasets: [{
          label: 'Adherencia (%)',
          data: weeks.map(w => w.pct),
          borderColor: '#1B6CA8',
          backgroundColor: 'rgba(27,108,168,0.08)',
          pointBackgroundColor: weeks.map(w => w.pct >= 80 ? '#0A9396' : w.pct >= 60 ? '#D97706' : '#C94040'),
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true
        }]
      },
      options: {
        ...chartOptions(),
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(13,27,42,0.05)' }, ticks: { font: { family: 'DM Mono', size: 11 }, color: '#5C6B7A', callback: v => v + '%' } },
          x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 12 }, color: '#5C6B7A' } }
        }
      }
    });
  }

  function renderHistoryTable(patient) {
    const tbody = document.getElementById('stats-history-tbody');
    if (!tbody) return;

    const hist = BioNovaData.adherenceHistory[patient.id] || [];
    const rows = [];

    for (let i = 0; i < 4; i++) {
      const slice = hist.slice(i * 7, (i + 1) * 7);
      if (slice.length === 0) continue;
      let total = 0, taken = 0, daysOk = 0;
      slice.forEach(day => {
        const vals = Object.values(day.medications);
        if (vals.every(Boolean) && vals.length > 0) daysOk++;
        vals.forEach(v => { total++; if (v) taken++; });
      });
      const pct = total === 0 ? 0 : Math.round((taken / total) * 100);
      const start = new Date(slice[0].date + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
      const end   = new Date(slice[slice.length-1].date + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
      const cls = pct >= 80 ? 'var(--color-accent)' : pct >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';

      rows.push(`
        <tr>
          <td>Semana ${i + 1}</td>
          <td>${start} – ${end}</td>
          <td><strong>${daysOk}</strong> de ${slice.length}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="progress-bar-wrap" style="flex:1">
                <div class="progress-bar-fill" style="width:${pct}%;background:${cls}"></div>
              </div>
              <span style="font-family:var(--font-mono);font-size:13px;color:${cls};font-weight:500">${pct}%</span>
            </div>
          </td>
        </tr>`);
    }

    tbody.innerHTML = rows.join('') || '<tr><td colspan="4" style="text-align:center;color:var(--color-text-secondary)">Sin datos suficientes</td></tr>';
  }

  function renderExtraStats(patient) {
    const container = document.getElementById('stats-extra');
    if (!container) return;

    const bestStreak   = BioNovaData.getBestStreak(patient.id);
    const curStreak    = BioNovaData.getCurrentStreak(patient.id);
    const mostMissed   = BioNovaData.getMostMissedMed(patient.id);
    const mostTaken    = BioNovaData.getMostTakenMed(patient.id);

    // Comparative monthly (simulate 3 months)
    const hist = BioNovaData.adherenceHistory[patient.id] || [];
    const months = [];
    // Current month = last 13 days, simulate 3 months with portions of 30-day history
    const segments = [
      { label: 'Feb 2026', slice: hist.slice(0, 10) },
      { label: 'Mar 2026', slice: hist.slice(10, 20) },
      { label: 'Abr 2026', slice: hist.slice(20, 30) }
    ];
    segments.forEach(seg => {
      let total = 0, taken = 0;
      seg.slice.forEach(day => {
        Object.values(day.medications).forEach(v => { total++; if (v) taken++; });
      });
      const esperados = total;
      const tomados = taken;
      const pct = total === 0 ? 0 : Math.round((taken / total) * 100);
      months.push({ label: seg.label, esperados, tomados, pct });
    });

    container.innerHTML = `
      <div class="grid-2 mt-lg" style="gap:16px">
        <!-- Best streak + Most missed/taken -->
        <div class="card">
          <div class="card-header"><div class="card-title">Métricas adicionales</div></div>
          <div style="display:flex;flex-direction:column;gap:16px">
            <div style="display:flex;gap:12px">
              <div class="kpi-card-icon kpi-icon-accent" style="flex-shrink:0">${iconSvg('heart',18)}</div>
              <div>
                <div style="font-size:12px;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:.05em">Mejor racha</div>
                <div style="font-family:var(--font-mono);font-size:24px;font-weight:500">${bestStreak} <span style="font-size:14px">días</span></div>
              </div>
            </div>
            <div class="divider"></div>
            <div>
              <div style="font-size:12px;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Medicamento más incumplido</div>
              ${mostMissed
                ? `<div style="display:flex;align-items:center;gap:8px">
                    <div class="med-color-dot" style="background:var(--color-danger)"></div>
                    <span style="font-weight:600;font-size:13px">${mostMissed.nombre} ${mostMissed.dosis}</span>
                   </div>`
                : '<span style="color:var(--color-text-disabled);font-size:13px">Sin datos</span>'
              }
            </div>
            <div>
              <div style="font-size:12px;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Medicamento más cumplido</div>
              ${mostTaken
                ? `<div style="display:flex;align-items:center;gap:8px">
                    <div class="med-color-dot" style="background:var(--color-accent)"></div>
                    <span style="font-weight:600;font-size:13px">${mostTaken.nombre} ${mostTaken.dosis}</span>
                   </div>`
                : '<span style="color:var(--color-text-disabled);font-size:13px">Sin datos</span>'
              }
            </div>
          </div>
        </div>

        <!-- Monthly comparative table -->
        <div class="card">
          <div class="card-header"><div class="card-title">Comparativa mensual</div></div>
          <div class="table-wrapper" style="border:none;box-shadow:none">
            <table>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Esperados</th>
                  <th>Tomados</th>
                  <th>Adherencia</th>
                </tr>
              </thead>
              <tbody>
                ${months.map(m => {
                  const cls = m.pct >= 80 ? 'var(--color-accent)' : m.pct >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';
                  return `<tr>
                    <td><strong>${m.label}</strong></td>
                    <td style="font-family:var(--font-mono)">${m.esperados}</td>
                    <td style="font-family:var(--font-mono)">${m.tomados}</td>
                    <td>
                      <span style="font-family:var(--font-mono);font-weight:600;color:${cls}">${m.pct}%</span>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  function chartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { family: 'Plus Jakarta Sans', size: 12 }, color: '#5C6B7A', boxWidth: 10, padding: 16 }
        },
        tooltip: {
          backgroundColor: '#0D1B2A',
          titleFont: { family: 'DM Sans', size: 13, weight: '600' },
          bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
          padding: 12, cornerRadius: 8
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#5C6B7A' } },
        y: { beginAtZero: true, grid: { color: 'rgba(13,27,42,0.05)', lineWidth: 0.5 }, ticks: { font: { family: 'DM Mono', size: 11 }, color: '#5C6B7A', precision: 0 } }
      }
    };
  }

  return { render };

})();
