// ============================================================
// BioNova — medications.js
// ============================================================
// Acá armo el CRUD (Create, Read, Update, Delete) de los medicamentos.
// Es uno de los módulos más grandes porque maneja filtros, historial transversal y modales.

window.BioNovaMedications = (function () {

  // Variables de estado del módulo
  let currentFilter = 'todos';
  let editingMedId = null;

  function render() {
    const user = BioNovaAuth.getCurrentUser();
    if (!user) return;

    // Lógica dual: si es cuidador, renderiza los meds del paciente a cargo, no los del cuidador.
    const patient = user.role === 'cuidador'
      ? BioNovaData.getUserById(user.pacienteVinculadoId)
      : user;

    renderCaregiverBanner(user, patient);
    renderTable(patient);
    renderHistory(patient);
    bindEvents(patient);
  }

  function renderCaregiverBanner(user, patient) {
    const el = document.getElementById('meds-caregiver-banner');
    if (!el) return;
    if (user.role === 'cuidador') {
      el.style.display = 'flex';
      el.innerHTML = `${iconSvg('user-check',16)} Gestionando a: <strong style="margin-left:4px">${patient.nombre}</strong>`;
    } else {
      el.style.display = 'none';
    }
  }

  // renderTable: Construye el listado principal de medicamentos y aplica los filtros.
  function renderTable(patient) {
    const meds = BioNovaData.getMedicationsByPatient(patient.id);
    const taken = BioNovaData.getTodayTakenStatus();
    const tbody = document.getElementById('meds-tbody');
    if (!tbody) return;

    // Aca filtro los medicamentos. Nota importante:
    // Los de frecuencia "a_demanda" (ej. paracetamol para el dolor) los considero especiales.
    // Si filtro por "pendientes", NUNCA muestro los de a demanda porque no es obligatorio tomarlos.
    let filtered = meds;
    if (currentFilter === 'tomados') {
      filtered = meds.filter(m => taken[m.id] || m.frecuencia === 'a_demanda');
    } else if (currentFilter === 'pendientes') {
      filtered = meds.filter(m => !taken[m.id] && m.frecuencia !== 'a_demanda');
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">${iconSvg('pill',24)}</div>
            <div class="empty-state-title">Sin medicamentos</div>
            <div class="empty-state-desc">No hay medicamentos en este filtro.</div>
          </div>
        </td></tr>`;
      return;
    }

    // Armo el HTML sumando badges según si ya lo tomó o no
    tbody.innerHTML = filtered.map(med => {
      const isTaken = taken[med.id];
      const statusBadge = med.frecuencia === 'a_demanda'
        ? `<span class="badge badge-neutral">A demanda</span>`
        : isTaken
          ? `<span class="badge badge-accent badge-dot">Tomado hoy</span>`
          : `<span class="badge badge-warning badge-dot">Pendiente</span>`;

      return `
        <tr>
          <td>
            <div class="med-name-cell">
              <div class="med-color-dot" style="background:${med.color}"></div>
              <strong>${med.nombre}</strong>
            </div>
          </td>
          <td>${med.dosis}</td>
          <td>${BioNovaData.formatFrecuencia(med.frecuencia)}</td>
          <td>
            <span style="font-family:var(--font-mono);font-size:13px;color:var(--color-text-secondary)">
              ${med.horarios.length > 0 ? med.horarios.join(' / ') : '—'}
            </span>
          </td>
          <td>${statusBadge}</td>
          <td>
            <div class="flex gap-sm">
              <button class="btn btn-ghost btn-sm" onclick="BioNovaMedications.openEdit('${med.id}')">
                ${iconSvg('edit-2',14)} Editar
              </button>
              <button class="btn btn-danger btn-sm" onclick="BioNovaMedications.confirmDelete('${med.id}','${escapeHtml(med.nombre)}')">
                ${iconSvg('trash-2',14)} Eliminar
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  // renderHistory: Muestra los últimos 7 días. Excluye los "a_demanda" para no sesgar la métrica.
  function renderHistory(patient) {
    const meds = BioNovaData.getMedicationsByPatient(patient.id)
      .filter(m => m.frecuencia !== 'a_demanda');
    const hist = BioNovaData.adherenceHistory[patient.id] || [];
    const last7 = hist.slice(-7);
    const container = document.getElementById('meds-history-body');
    if (!container) return;

    container.innerHTML = meds.map(med => {
      const days = last7.map(day => {
        const dt = new Date(day.date + 'T12:00:00');
        const label = dt.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
        const taken = day.medications[med.id];
        return `<div class="day-dot ${taken ? 'taken' : 'missed'}" title="${label}: ${taken ? 'Tomado' : 'No tomado'}">
          <span style="font-size:8px">${dt.getDate()}</span>
          ${taken ? iconSvg('check', 8) : iconSvg('x', 8)}
        </div>`;
      }).join('');

      return `
        <div class="history-med-block">
          <div class="med-name-cell">
            <div class="med-color-dot" style="background:${med.color}"></div>
            <div class="history-med-name">${med.nombre} ${med.dosis}</div>
          </div>
          <div class="history-days">${days}</div>
        </div>`;
    }).join('');
  }

  function bindEvents(patient) {
    // Filtros de tabla
    document.querySelectorAll('#meds-filters .filter-chip').forEach(chip => {
      chip.onclick = () => {
        currentFilter = chip.dataset.filter;
        document.querySelectorAll('#meds-filters .filter-chip').forEach(c => c.classList.toggle('active', c === chip));
        renderTable(patient);
      };
    });

    const addBtn = document.getElementById('btn-add-med');
    if (addBtn) addBtn.onclick = () => openModal(null, patient);

    const saveBtn = document.getElementById('btn-save-med');
    if (saveBtn) saveBtn.onclick = () => saveMedication(patient);

    const histHeader = document.getElementById('history-header');
    if (histHeader) {
      histHeader.onclick = () => {
        histHeader.classList.toggle('open');
        document.getElementById('history-body').classList.toggle('open');
      };
    }

    document.querySelectorAll('#modal-med .modal-close').forEach(btn => {
      btn.onclick = () => BioNovaModal.close(document.getElementById('modal-med-overlay'));
    });

    document.getElementById('btn-delete-confirm')?.addEventListener('click', () => {
      if (editingMedId) {
        BioNovaData.deleteMedication(editingMedId);
        editingMedId = null;
        BioNovaModal.close(document.getElementById('modal-delete-overlay'));
        renderTable(patient);
        renderHistory(patient);
      }
    });

    document.querySelectorAll('#modal-delete .modal-close, #btn-delete-cancel').forEach(btn => {
      btn.onclick = () => BioNovaModal.close(document.getElementById('modal-delete-overlay'));
    });
  }

  // openModal: Uso el MISMO modal para crear y para editar. 
  // Lo diferencio pasando un 'medId'. Si lo tiene, relleno los campos. Si es null, lo blanqueo.
  function openModal(medId, patient) {
    editingMedId = medId;
    const overlay = document.getElementById('modal-med-overlay');
    const titleEl = document.getElementById('modal-med-title');

    if (medId) {
      const med = BioNovaData.medications.find(m => m.id === medId);
      if (!med) return;
      titleEl.textContent = 'Editar medicamento';
      document.getElementById('med-form-nombre').value     = med.nombre;
      document.getElementById('med-form-dosis').value      = med.dosis;
      document.getElementById('med-form-frecuencia').value = med.frecuencia;
      document.getElementById('med-form-horario').value    = med.horarios.join(', ');
      document.getElementById('med-form-notas').value      = med.notas || '';
    } else {
      titleEl.textContent = 'Agregar medicamento';
      document.getElementById('med-form-nombre').value     = '';
      document.getElementById('med-form-dosis').value      = '';
      document.getElementById('med-form-frecuencia').value = 'cada_24h';
      document.getElementById('med-form-horario').value    = '';
      document.getElementById('med-form-notas').value      = '';
    }

    document.getElementById('med-form-error').textContent = '';
    BioNovaModal.open(overlay);
    document.getElementById('med-form-nombre').focus();
  }

  function openEdit(medId) {
    const user = BioNovaAuth.getCurrentUser();
    const patient = user.role === 'cuidador'
      ? BioNovaData.getUserById(user.pacienteVinculadoId) : user;
    openModal(medId, patient);
  }

  // saveMedication: Guarda la info. Si editingMedId no es nulo actualiza (update), si es nulo crea (insert).
  function saveMedication(patient) {
    const nombre    = document.getElementById('med-form-nombre').value.trim();
    const dosis     = document.getElementById('med-form-dosis').value.trim();
    const frecuencia = document.getElementById('med-form-frecuencia').value;
    const horarioRaw = document.getElementById('med-form-horario').value.trim();
    const notas     = document.getElementById('med-form-notas').value.trim();
    const errEl     = document.getElementById('med-form-error');

    if (!nombre || !dosis) {
      errEl.textContent = 'El nombre y la dosis son obligatorios.';
      return;
    }

    const horarios = horarioRaw ? horarioRaw.split(',').map(h => h.trim()).filter(Boolean) : [];
    const medData = { nombre, dosis, frecuencia, horarios, notas, pacienteId: patient.id, activo: true, color: '#1B6CA8' };

    if (editingMedId) {
      BioNovaData.updateMedication(editingMedId, medData);
    } else {
      BioNovaData.addMedication({ ...medData, fechaInicio: new Date().toISOString().split('T')[0] });
    }

    BioNovaModal.close(document.getElementById('modal-med-overlay'));
    renderTable(patient);
    renderHistory(patient);
    editingMedId = null;
  }

  function confirmDelete(medId, medName) {
    editingMedId = medId;
    const nameEl = document.getElementById('delete-med-name');
    if (nameEl) nameEl.textContent = medName;
    BioNovaModal.open(document.getElementById('modal-delete-overlay'));
  }

  // escapeHtml: Evita inyecciones XSS al renderizar nombres ingresados por usuario
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  return { render, openEdit, confirmDelete };

})();
