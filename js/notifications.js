// ============================================================
// BioNova — notifications.js
// ============================================================
// Módulo de gestión de notificaciones.
// Maneja el renderizado de alertas, tips y recordatorios en el panel del usuario,
// incluyendo la lógica para marcar como leído y actualizar los contadores rojos del menú lateral.

window.BioNovaNotifications = (function () {

  function render() {
    const user = BioNovaAuth.getCurrentUser();
    if (!user) return;
    renderList(user);
  }

  // renderList: Construye la bandeja de entrada de notificaciones
  function renderList(user) {
    const container = document.getElementById('notif-list');
    if (!container) return;

    const notifs = BioNovaData.getNotificationsByUser(user.id);

    // Renderizado condicional si no hay notificaciones (UX defensiva)
    if (notifs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${iconSvg('bell',24)}</div>
          <div class="empty-state-title">Sin notificaciones</div>
          <div class="empty-state-desc">Cuando tengas recordatorios o actualizaciones aparecerán aquí.</div>
        </div>`;
      return;
    }

    container.innerHTML = notifs.map(n => buildItem(n)).join('');

    // Aca engancho los eventos para el botón "Marcar como leído" de cada ítem
    container.querySelectorAll('[data-notif-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nid = btn.dataset.notifId;
        BioNovaData.markNotificationRead(nid);
        
        // Actualizo el DOM directamente en vez de re-renderizar toda la lista 
        // para mejorar el performance percibido
        const item = document.getElementById(`notif-item-${nid}`);
        if (item) {
          item.classList.remove('unread');
          btn.remove(); // Desaparezco el botón para que no le puedan volver a hacer click
        }
        updateBadges(user.id);
      });
    });

    // Evento para el botón global "Marcar todas como leídas"
    const markAllBtn = document.getElementById('btn-mark-all-read');
    if (markAllBtn) {
      markAllBtn.onclick = () => {
        BioNovaData.markAllRead(user.id);
        renderList(user); // Acá si re-renderizo todo porque cambiaron todas a la vez
        updateBadges(user.id);
      };
    }

    updateBadges(user.id);
  }

  // buildItem: Genera el HTML para una sola notificación dependiendo de su tipo
  function buildItem(n) {
    // Configuración visual según la severidad/tipo de notificación
    const typeConfig = {
      recordatorio: { icon: 'clock', cls: 'kpi-icon-primary', notifCls: 'unread' },
      cita:         { icon: 'calendar', cls: 'kpi-icon-accent', notifCls: '' },
      tip:          { icon: 'lightbulb', cls: 'kpi-icon-accent', notifCls: '' },
      alerta:       { icon: 'alert-triangle', cls: 'kpi-icon-danger', notifCls: '' }
    };
    const cfg = typeConfig[n.tipo] || { icon: 'bell', cls: 'kpi-icon-primary', notifCls: '' };

    const ts = new Date(n.timestamp);
    const tsStr = ts.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
      + ' · ' + ts.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="notif-item ${n.leida ? '' : 'unread'}" id="notif-item-${n.id}">
        <div class="notif-icon ${cfg.cls}">
          ${iconSvg(cfg.icon, 18)}
        </div>
        <div class="notif-content">
          <div class="notif-title">${n.titulo}</div>
          <div class="notif-desc">${n.descripcion}</div>
          <div class="notif-ts">${tsStr}</div>
        </div>
        ${!n.leida
          ? `<button class="btn btn-ghost btn-sm" data-notif-id="${n.id}" style="align-self:flex-start;flex-shrink:0">
              ${iconSvg('check',13)} Leído
             </button>`
          : '<span style="color:var(--color-text-disabled);font-size:11px;align-self:flex-start;flex-shrink:0;padding-top:2px">Leída</span>'
        }
      </div>`;
  }

  // updateBadges: Refresca el pill rojo con el contador de no leídas en el menú lateral
  function updateBadges(userId) {
    const count = BioNovaData.getUnreadCount(userId);
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    
    // Solo muestro el "puntito rojo" si el contador es mayor a 0
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }

    const pageCount = document.getElementById('notif-unread-count');
    if (pageCount) pageCount.textContent = count > 0 ? `${count} sin leer` : 'Todas leídas';
  }

  return { render };

})();
