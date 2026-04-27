// ============================================================
// BioNova — mockData.js  v2.0
// ============================================================
// Acá centralizo todos los datos simulados (mock data) del sistema.
// Como no tenemos base de datos real para el prototipo, organizo todo en arrays de objetos JSON.
// Esto me permite iterarlos fácil en el frontend y simular relaciones (ej: pacienteId une medicamentos con usuarios).

window.BioNovaData = (function () {

  // Fijo la fecha actual estática para que las comparaciones de citas ("hoy" vs "pasadas") y rachas siempre funcionen bien en las demos.
  const TODAY = "2026-04-13";

  // ─── USUARIOS ────────────────────────────────────────────
  // Acá defino todos los roles (paciente, medico, cuidador).
  // Nota: si agrego un nuevo usuario en la interfaz, se guarda en localStorage aparte, no afecta este array base.
  const users = [
    // ── PACIENTES ──
    {
      id: "u1",
      role: "paciente",
      nombre: "Valentina Torres",
      email: "valentina.torres@gmail.com",
      edad: 34,
      condicion: "Hipertensión / Diabetes tipo 2",
      avatar: null,
      cuidadorId: "c1"
    },
    {
      id: "u2",
      role: "paciente",
      nombre: "Andrés Felipe Martínez",
      email: "andres.martinez@gmail.com",
      edad: 52,
      condicion: "Asma leve / Rinitis alérgica",
      avatar: null,
      cuidadorId: null
    },
    {
      id: "u3",
      role: "paciente",
      nombre: "Camila Ríos Herrera",
      email: "camila.rios@gmail.com",
      edad: 28,
      condicion: "Ansiedad generalizada / Hipotiroidismo",
      avatar: null,
      cuidadorId: null
    },
    {
      id: "u4",
      role: "paciente",
      nombre: "Roberto Salcedo Peña",
      email: "roberto.salcedo@gmail.com",
      edad: 47,
      condicion: "Post-operatorio rodilla derecha / Hipertensión",
      avatar: null,
      cuidadorId: "c2"
    },
    {
      id: "u5",
      role: "paciente",
      nombre: "Sofía Guzmán Álvarez",
      email: "sofia.guzman@gmail.com",
      edad: 31,
      condicion: "Migraña crónica con aura",
      avatar: null,
      cuidadorId: "c3"
    },

    {
      id: "u6",
      role: "paciente",
      nombre: "María de los Ángeles Molano",
      email: "maria.molano@gmail.com",
      edad: 67,
      condicion: "Diabetes tipo 2 / Hipertensión arterial",
      avatar: null,
      cuidadorId: null
    },

    // ── MÉDICOS ──
    {
      id: "m1",
      role: "medico",
      nombre: "Dr. Alejandro Mendoza",
      email: "medico@bionova.co",
      password: "doctor123",
      especialidad: "Medicina Interna",
      licencia: "RM-2048-COL",
      avatar: null,
      pacientes: ["u6", "u1", "u2", "u4"]
    },
    {
      id: "m2",
      role: "medico",
      nombre: "Dra. Carolina Ospina",
      email: "dra.ospina@bionova.co",
      password: "doctor123",
      especialidad: "Neurología y Psiquiatría",
      licencia: "RM-3156-COL",
      avatar: null,
      pacientes: ["u3", "u5"]
    },

    // ── CUIDADORES ──
    {
      id: "c1",
      role: "cuidador",
      nombre: "María Fernanda Torres",
      email: "mafe.torres@gmail.com",
      pacienteVinculadoId: "u1",
      avatar: null,
      relacion: "Madre"
    },
    {
      id: "c2",
      role: "cuidador",
      nombre: "Jorge Salcedo",
      email: "jorge.salcedo@gmail.com",
      pacienteVinculadoId: "u4",
      avatar: null,
      relacion: "Esposo"
    },
    {
      id: "c3",
      role: "cuidador",
      nombre: "Lucía Guzmán",
      email: "lucia.guzman@gmail.com",
      pacienteVinculadoId: "u5",
      avatar: null,
      relacion: "Hermana"
    }
  ];

  // ─── MEDICAMENTOS ─────────────────────────────────────────
  // Estructuro los medicamentos con un id único y los vinculo al paciente usando pacienteId.
  // Guardo colores hexadecimales para que cada pastilla se vea distinta en la interfaz, ayudando a la UX.
  const medications = [
    // ── Valentina Torres (u1) — 4 meds ──
    {
      id: "med1", pacienteId: "u1", nombre: "Metformina", dosis: "500 mg",
      frecuencia: "cada_12h", horarios: ["07:30", "19:30"],
      notas: "Tomar con el desayuno y la cena para reducir molestias gástricas",
      activo: true, fechaInicio: "2025-11-05", color: "#0A9396"
    },
    {
      id: "med2", pacienteId: "u1", nombre: "Losartán", dosis: "50 mg",
      frecuencia: "cada_24h", horarios: ["07:30"],
      notas: "Tomar en la mañana con el desayuno",
      activo: true, fechaInicio: "2026-01-10", color: "#1B6CA8"
    },
    {
      id: "med3", pacienteId: "u1", nombre: "Aspirina", dosis: "100 mg",
      frecuencia: "cada_24h", horarios: ["13:00"],
      notas: "Tomar con el almuerzo",
      activo: true, fechaInicio: "2026-01-10", color: "#D97706"
    },
    {
      id: "med4", pacienteId: "u1", nombre: "Atorvastatina", dosis: "20 mg",
      frecuencia: "cada_24h", horarios: ["21:00"],
      notas: "Tomar en la noche antes de dormir",
      activo: true, fechaInicio: "2026-02-01", color: "#C94040"
    },

    // ── Andrés Martínez (u2) — 2 meds ──
    {
      id: "med5", pacienteId: "u2", nombre: "Salbutamol (inhalador)", dosis: "100 mcg / 2 puffs",
      frecuencia: "a_demanda", horarios: [],
      notas: "Solo en crisis. Máximo 4 veces al día",
      activo: true, fechaInicio: "2025-09-15", color: "#C94040"
    },
    {
      id: "med6", pacienteId: "u2", nombre: "Montelukast", dosis: "10 mg",
      frecuencia: "cada_24h", horarios: ["21:00"],
      notas: "Tomar en la noche. Puede causar somnolencia",
      activo: true, fechaInicio: "2025-10-01", color: "#1B6CA8"
    },

    // ── Camila Ríos (u3) — 3 meds ──
    {
      id: "med7", pacienteId: "u3", nombre: "Levotiroxina", dosis: "50 mcg",
      frecuencia: "cada_24h", horarios: ["06:30"],
      notas: "Tomar en ayunas, 30 minutos antes del desayuno. No tomar con calcio ni hierro",
      activo: true, fechaInicio: "2025-08-12", color: "#0A9396"
    },
    {
      id: "med8", pacienteId: "u3", nombre: "Escitalopram", dosis: "10 mg",
      frecuencia: "cada_24h", horarios: ["08:00"],
      notas: "Tomar con el desayuno. No suspender abruptamente",
      activo: true, fechaInicio: "2025-10-20", color: "#1B6CA8"
    },
    {
      id: "med9", pacienteId: "u3", nombre: "Clonazepam", dosis: "0.5 mg",
      frecuencia: "a_demanda", horarios: [],
      notas: "Solo en crisis de ansiedad severa. Máximo 3 veces por semana. No conducir después de tomar",
      activo: true, fechaInicio: "2025-10-20", color: "#D97706"
    },

    // ── Roberto Salcedo (u4) — 5 meds ──
    {
      id: "med10", pacienteId: "u4", nombre: "Celecoxib", dosis: "200 mg",
      frecuencia: "cada_12h", horarios: ["08:00", "20:00"],
      notas: "Tomar con comida. No tomar en ayunas",
      activo: true, fechaInicio: "2026-03-01", color: "#C94040"
    },
    {
      id: "med11", pacienteId: "u4", nombre: "Omeprazol", dosis: "20 mg",
      frecuencia: "cada_24h", horarios: ["07:30"],
      notas: "Tomar 30 minutos antes del desayuno",
      activo: true, fechaInicio: "2026-03-01", color: "#1B6CA8"
    },
    {
      id: "med12", pacienteId: "u4", nombre: "Losartán", dosis: "50 mg",
      frecuencia: "cada_24h", horarios: ["08:00"],
      notas: "Para control de presión arterial",
      activo: true, fechaInicio: "2025-06-15", color: "#0A9396"
    },
    {
      id: "med13", pacienteId: "u4", nombre: "Calcio + Vitamina D", dosis: "600 mg / 400 UI",
      frecuencia: "cada_24h", horarios: ["13:00"],
      notas: "Tomar con el almuerzo. Esperar 4h antes de tomar Levotiroxina si aplica",
      activo: true, fechaInicio: "2026-03-01", color: "#D97706"
    },
    {
      id: "med14", pacienteId: "u4", nombre: "Ácido fólico", dosis: "5 mg",
      frecuencia: "cada_24h", horarios: ["21:00"],
      notas: "Tomar en la noche",
      activo: true, fechaInicio: "2026-03-01", color: "#5C6B7A"
    },

    // ── María de los Ángeles Molano (u6) — 4 meds ──
    {
      id: "med17", pacienteId: "u6", nombre: "Metformina", dosis: "850 mg",
      frecuencia: "cada_12h", horarios: ["07:30", "19:30"],
      notas: "Tomar con el desayuno y la cena para reducir molestias gástricas",
      activo: true, fechaInicio: "2025-06-15", color: "#0A9396"
    },
    {
      id: "med18", pacienteId: "u6", nombre: "Losartán", dosis: "100 mg",
      frecuencia: "cada_24h", horarios: ["08:00"],
      notas: "Tomar en la mañana. Control de presión arterial",
      activo: true, fechaInicio: "2025-08-01", color: "#1B6CA8"
    },
    {
      id: "med19", pacienteId: "u6", nombre: "Glibenclamida", dosis: "5 mg",
      frecuencia: "cada_24h", horarios: ["07:30"],
      notas: "Tomar antes del desayuno. Vigilar síntomas de hipoglucemia",
      activo: true, fechaInicio: "2025-06-15", color: "#D97706"
    },
    {
      id: "med20", pacienteId: "u6", nombre: "Omeprazol", dosis: "20 mg",
      frecuencia: "cada_24h", horarios: ["07:00"],
      notas: "Tomar 30 minutos antes del desayuno",
      activo: true, fechaInicio: "2025-06-15", color: "#C94040"
    },

    // ── Sofía Guzmán (u5) — 2 meds ──
    {
      id: "med15", pacienteId: "u5", nombre: "Topiramato", dosis: "25 mg",
      frecuencia: "cada_24h", horarios: ["21:00"],
      notas: "Preventivo para migraña. Tomar en la noche. Puede causar confusión al inicio del tratamiento",
      activo: true, fechaInicio: "2026-01-15", color: "#1B6CA8"
    },
    {
      id: "med16", pacienteId: "u5", nombre: "Ibuprofeno", dosis: "400 mg",
      frecuencia: "a_demanda", horarios: [],
      notas: "Solo en crisis de migraña. Máximo 3 días consecutivos. No usar más de 10 días al mes",
      activo: true, fechaInicio: "2026-01-15", color: "#D97706"
    }
  ];

  // ─── CITAS MÉDICAS ────────────────────────────────────────
  // Aca manejo las citas. Agrego modalidad (virtual/presencial) porque si es virtual
  // necesito renderizar el botón de Meet y si es presencial el de Maps.
  // Nota: Dejo una cita sin 'link' y otra con 'mapsLink' para probar estos casos en la UI.
  const appointments = [
    // ── Valentina Torres (u1) ──
    {
      id: "a1", pacienteId: "u1", doctorId: "m1",
      doctorNombre: "Dr. Alejandro Mendoza", especialidad: "Medicina Interna",
      fecha: "2026-04-18", hora: "10:00", modalidad: "virtual",
      link: "https://meet.google.com/kpw-tvfq-tqd", estado: "proxima",
      notas: "Control trimestral de presión arterial y glucemia"
    },
    {
      id: "a2", pacienteId: "u1", doctorId: "m1",
      doctorNombre: "Dr. Alejandro Mendoza", especialidad: "Medicina Interna",
      fecha: "2026-03-10", hora: "09:30", modalidad: "presencial",
      link: null, estado: "completada",
      centroMedico: "Clínica Versalles",
      direccion: "Av. 5a Nte. #23N-46/57, San Vicente, Cali",
      mapsLink: "https://www.google.com/maps/dir//Cl%C3%ADnica+Versalles,+Av.+5a+Nte.+%2323N-46%2F57,+San+Vicente,+Cali,+Valle+del+Cauca",
      notas: "Ajuste de dosis de Metformina — buena respuesta"
    },
    {
      id: "a3", pacienteId: "u1", doctorId: "m1",
      doctorNombre: "Dr. Alejandro Mendoza", especialidad: "Medicina Interna",
      fecha: "2026-02-05", hora: "11:00", modalidad: "presencial",
      link: null, estado: "cancelada",
      centroMedico: "Clínica Versalles",
      direccion: "Av. 5a Nte. #23N-46/57, San Vicente, Cali",
      mapsLink: "https://www.google.com/maps/dir//Cl%C3%ADnica+Versalles",
      notas: "Paciente reportó indisposición"
    },

    // ── Andrés Martínez (u2) ──
    {
      id: "a4", pacienteId: "u2", doctorId: "m1",
      doctorNombre: "Dr. Alejandro Mendoza", especialidad: "Medicina Interna",
      fecha: "2026-04-25", hora: "14:00", modalidad: "presencial",
      link: null, estado: "proxima",
      centroMedico: "Clínica Imbanaco — Sede Principal",
      direccion: "Cra. 38 Bis #5B2-04, Santa Isabel, Cali",
      mapsLink: "https://www.google.com/maps/dir//Cl%C3%ADnica+Imbanaco+%7C+Sede+Principal,+Cra.+38+Bis+%235B2-04,+Santa+Isabel,+Cali,+Valle+del+Cauca",
      notas: "Control de asma y revisión de Montelukast"
    },

    // ── Camila Ríos (u3) — todas virtuales ──
    {
      id: "a5", pacienteId: "u3", doctorId: "m2",
      doctorNombre: "Dra. Carolina Ospina", especialidad: "Psiquiatría",
      fecha: "2026-04-20", hora: "11:00", modalidad: "virtual",
      link: "https://meet.google.com/kpw-tvfq-tqd", estado: "proxima",
      notas: "Evaluación mensual de ansiedad post-tratamiento"
    },
    {
      id: "a6", pacienteId: "u3", doctorId: "m2",
      doctorNombre: "Dra. Carolina Ospina", especialidad: "Endocrinología",
      fecha: "2026-05-05", hora: "10:00", modalidad: "virtual",
      link: "https://meet.google.com/kpw-tvfq-tqd", estado: "proxima",
      notas: "Seguimiento niveles de TSH y ajuste de dosis"
    },
    {
      id: "a7", pacienteId: "u3", doctorId: "m2",
      doctorNombre: "Dra. Carolina Ospina", especialidad: "Medicina General",
      fecha: "2026-03-15", hora: "09:00", modalidad: "virtual",
      link: "https://meet.google.com/kpw-tvfq-tqd", estado: "completada",
      notas: "Chequeo general trimestral"
    },

    // ── Roberto Salcedo (u4) ──
    {
      id: "a8", pacienteId: "u4", doctorId: "m1",
      doctorNombre: "Dr. Alejandro Mendoza", especialidad: "Ortopedia",
      fecha: "2026-04-16", hora: "09:00", modalidad: "presencial",
      link: null, estado: "proxima",
      centroMedico: "Clínica Imbanaco — Sede Principal",
      direccion: "Cra. 38 Bis #5B2-04, Santa Isabel, Cali",
      mapsLink: "https://www.google.com/maps/dir//Cl%C3%ADnica+Imbanaco+%7C+Sede+Principal,+Cra.+38+Bis+%235B2-04,+Santa+Isabel,+Cali,+Valle+del+Cauca/@3.4263339,-76.6771163,12z",
      notas: "Control post-operatorio semana 6"
    },
    {
      id: "a9", pacienteId: "u4", doctorId: "m1",
      doctorNombre: "Dr. Alejandro Mendoza", especialidad: "Cardiología",
      fecha: "2026-04-28", hora: "16:00", modalidad: "presencial",
      link: null, estado: "proxima",
      centroMedico: "Clínica Versalles",
      direccion: "Av. 5a Nte. #23N-46/57, San Vicente, Cali",
      mapsLink: "https://www.google.com/maps/dir//Cl%C3%ADnica+Versalles,+Av.+5a+Nte.+%2323N-46%2F57,+San+Vicente,+Cali,+Valle+del+Cauca",
      notas: "Control de presión arterial mensual"
    },
    {
      id: "a10", pacienteId: "u4", doctorId: "m1",
      doctorNombre: "Dr. Alejandro Mendoza", especialidad: "Fisioterapia",
      fecha: "2026-04-15", hora: "14:00", modalidad: "virtual",
      link: "https://meet.google.com/kpw-tvfq-tqd", estado: "proxima",
      notas: "Sesión de rehabilitación semana 6"
    },

    // ── María de los Ángeles Molano (u6) ──
    {
      id: "a14", pacienteId: "u6", doctorId: "m1",
      doctorNombre: "Dr. Alejandro Mendoza", especialidad: "Medicina Interna",
      fecha: "2026-04-22", hora: "09:00", modalidad: "presencial",
      link: null, estado: "proxima",
      centroMedico: "Clínica Versalles",
      direccion: "Av. 5a Nte. #23N-46/57, San Vicente, Cali",
      mapsLink: "https://www.google.com/maps/dir//Cl%C3%ADnica+Versalles,+Av.+5a+Nte.+%2323N-46%2F57,+San+Vicente,+Cali,+Valle+del+Cauca",
      notas: "Control trimestral de diabetes e hipertensión. Traer glucómetro y registro de presión."
    },
    {
      id: "a15", pacienteId: "u6", doctorId: "m1",
      doctorNombre: "Dr. Alejandro Mendoza", especialidad: "Medicina Interna",
      fecha: "2026-03-05", hora: "10:30", modalidad: "presencial",
      link: null, estado: "completada",
      centroMedico: "Clínica Versalles",
      direccion: "Av. 5a Nte. #23N-46/57, San Vicente, Cali",
      mapsLink: "https://www.google.com/maps/dir//Cl%C3%ADnica+Versalles",
      notas: "Revisión de HbA1c — resultado 7.2%, en rango. Continuar tratamiento."
    },

    // ── Sofía Guzmán (u5) ──
    {
      id: "a11", pacienteId: "u5", doctorId: "m2",
      doctorNombre: "Dra. Carolina Ospina", especialidad: "Neurología",
      fecha: "2026-04-22", hora: "10:30", modalidad: "presencial",
      link: null, estado: "proxima",
      centroMedico: "Fundación Valle del Lili",
      direccion: "Cra. 98 #18-49, Comuna 17, Cali",
      mapsLink: "https://www.google.com/maps/dir//clinica+valle+del+lili+cali,+Cra.+98+%2318-49,+Comuna+17,+Cali,+Valle+del+Cauca",
      notas: "Evaluación de frecuencia e intensidad de episodios"
    },
    {
      id: "a12", pacienteId: "u5", doctorId: "m2",
      doctorNombre: "Dra. Carolina Ospina", especialidad: "Psicología",
      fecha: "2026-05-10", hora: "15:00", modalidad: "virtual",
      link: "https://meet.google.com/kpw-tvfq-tqd", estado: "proxima",
      notas: "Manejo de estrés como disparador de migraña"
    },
    {
      id: "a13", pacienteId: "u5", doctorId: "m2",
      doctorNombre: "Dra. Carolina Ospina", especialidad: "Neurología",
      fecha: "2026-02-18", hora: "10:30", modalidad: "presencial",
      link: null, estado: "completada",
      centroMedico: "Fundación Valle del Lili",
      direccion: "Cra. 98 #18-49, Comuna 17, Cali",
      mapsLink: "https://www.google.com/maps/dir//clinica+valle+del+lili+cali",
      notas: "Inicio de tratamiento preventivo con Topiramato"
    }
  ];

  // ─── HISTORIAL DE ACTIVIDAD (TIMELINE) ─────────────────────
  // Este array simula los eventos recientes del paciente que luego consumo en el 'drawer' del médico.
  // Uso descripciones genéricas pero realistas para la prueba de usabilidad.
  // Aca manejo el caso donde un paciente se salta una dosis (ej: evento crítico).
  const activityLog = [
    {
      id: "ev1",
      pacienteId: "u1",
      tipo: "toma_med",
      descripcion: "Tomó Metformina (500 mg)",
      estado: "success",
      fechaHora: "2026-04-13T07:35:00Z"
    },
    {
      id: "ev2",
      pacienteId: "u1",
      tipo: "cita_asistida",
      descripcion: "Asistió a control de Medicina Interna",
      estado: "success",
      fechaHora: "2026-03-10T09:30:00Z"
    },
    {
      id: "ev3",
      pacienteId: "u1",
      tipo: "toma_perdida",
      descripcion: "No registró toma de Atorvastatina",
      estado: "danger",
      fechaHora: "2026-04-12T21:00:00Z"
    },
    {
      id: "ev4",
      pacienteId: "u4",
      tipo: "toma_med",
      descripcion: "Tomó Losartán (50 mg)",
      estado: "success",
      fechaHora: "2026-04-13T08:05:00Z"
    },
    {
      id: "ev5",
      pacienteId: "u6",
      tipo: "toma_med",
      descripcion: "Tomó Metformina (850 mg)",
      estado: "success",
      fechaHora: "2026-04-13T07:38:00Z"
    },
    {
      id: "ev6",
      pacienteId: "u6",
      tipo: "toma_perdida",
      descripcion: "No registró toma de Glibenclamida",
      estado: "danger",
      fechaHora: "2026-04-12T07:30:00Z"
    }
  ];

  // ─── HISTORIAL DE ADHERENCIA (30 días) ───────────────────
  // Estructura de datos longitudinal que registra el cumplimiento terapéutico diario.
  // Permite el cálculo de métricas de adherencia y la identificación de patrones de omisión.
  function generateAdherenceHistory() {
    const history = {};
    const today = new Date(TODAY);

    // Target adherence rates per patient
    const targetRates = {
      "u1": 0.72, "u2": 0.58, "u3": 0.94, "u4": 0.81, "u5": 0.66, "u6": 0.76
    };

    ["u1","u2","u3","u4","u5","u6"].forEach(uid => {
      const meds = medications.filter(m => m.pacienteId === uid && m.frecuencia !== "a_demanda");
      history[uid] = [];
      const rate = targetRates[uid] || 0.75;

      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayRecord = { date: dateStr, medications: {} };
        meds.forEach(med => {
          // Use seeded-like variation for consistency
          const rand = Math.random();
          dayRecord.medications[med.id] = rand < rate;
        });
        history[uid].push(dayRecord);
      }
    });

    return history;
  }

  const adherenceHistory = generateAdherenceHistory();

  // ─── NOTIFICACIONES ───────────────────────────────────────
  // Registro de alertas, recordatorios y comunicaciones dirigidas al paciente.
  // Clasificadas por tipo para facilitar el filtrado y la priorización en la interfaz.
  const notifications = [
    // Valentina (u1)
    { id: "n1", usuarioId: "u1", tipo: "recordatorio", titulo: "Tomar Metformina 500 mg", descripcion: "Corresponde la dosis de las 07:30. Tómala con el desayuno.", timestamp: new Date("2026-04-13T07:30:00").toISOString(), leida: false },
    { id: "n2", usuarioId: "u1", tipo: "cita", titulo: "Cita médica en 5 días", descripcion: "Tienes una cita virtual con el Dr. Alejandro Mendoza el 18 de abril a las 10:00 AM.", timestamp: new Date("2026-04-13T08:00:00").toISOString(), leida: false },
    { id: "n3", usuarioId: "u1", tipo: "tip", titulo: "Consejo del día", descripcion: "Medir tu presión arterial a la misma hora cada día, preferiblemente en la mañana antes de levantarte, da lecturas más consistentes.", timestamp: new Date("2026-04-13T09:00:00").toISOString(), leida: false },
    { id: "n4", usuarioId: "u1", tipo: "alerta", titulo: "Dosis no registrada", descripcion: "No se registró la toma de Losartán 50 mg en la dosis de las 07:30 del día de ayer.", timestamp: new Date("2026-04-12T20:00:00").toISOString(), leida: true },
    { id: "n5", usuarioId: "u1", tipo: "recordatorio", titulo: "Tomar Atorvastatina 20 mg", descripcion: "Corresponde la dosis nocturna de las 21:00. Tómala antes de dormir.", timestamp: new Date("2026-04-13T19:30:00").toISOString(), leida: false },

    // Andrés (u2)
    { id: "n6", usuarioId: "u2", tipo: "cita", titulo: "Cita médica programada", descripcion: "Cita presencial con Dr. Alejandro Mendoza el 25 de abril a las 2:00 PM en Clínica Imbanaco.", timestamp: new Date("2026-04-13T10:00:00").toISOString(), leida: false },
    { id: "n7", usuarioId: "u2", tipo: "alerta", titulo: "Adherencia por debajo del objetivo", descripcion: "Tu cumplimiento esta semana fue del 58%. El objetivo recomendado es del 80%.", timestamp: new Date("2026-04-12T08:00:00").toISOString(), leida: false },

    // Camila (u3)
    { id: "n8", usuarioId: "u3", tipo: "recordatorio", titulo: "Tomar Levotiroxina 50 mcg", descripcion: "Tómala ahora en ayunas. Espera 30 minutos antes del desayuno.", timestamp: new Date("2026-04-13T06:30:00").toISOString(), leida: true },
    { id: "n9", usuarioId: "u3", tipo: "cita", titulo: "Cita virtual en 7 días", descripcion: "Consulta de Psiquiatría con Dra. Carolina Ospina el 20 de abril a las 11:00 AM.", timestamp: new Date("2026-04-13T08:00:00").toISOString(), leida: false },
    { id: "n10", usuarioId: "u3", tipo: "tip", titulo: "Excelente adherencia", descripcion: "Has mantenido más del 90% de cumplimiento este mes. Tu médico podrá revisar si es posible ajustar el plan en la próxima cita.", timestamp: new Date("2026-04-13T09:00:00").toISOString(), leida: false },

    // Roberto (u4)
    { id: "n11", usuarioId: "u4", tipo: "cita", titulo: "Cita mañana — Fisioterapia", descripcion: "Sesión virtual de rehabilitación mañana 15 de abril a las 2:00 PM. Revisa tu conexión a internet.", timestamp: new Date("2026-04-13T10:00:00").toISOString(), leida: false },
    { id: "n12", usuarioId: "u4", tipo: "recordatorio", titulo: "Tomar Celecoxib 200 mg", descripcion: "Dosis de las 20:00. Recuerda tomarlo con comida para proteger el estómago.", timestamp: new Date("2026-04-13T19:45:00").toISOString(), leida: false },

    // María de los Ángeles Molano (u6)
    { id: "n15", usuarioId: "u6", tipo: "recordatorio", titulo: "Tomar Metformina 850 mg", descripcion: "Corresponde la dosis de las 07:30. Tómala con el desayuno.", timestamp: new Date("2026-04-13T07:30:00").toISOString(), leida: false },
    { id: "n16", usuarioId: "u6", tipo: "cita", titulo: "Cita médica en 9 días", descripcion: "Cita presencial con el Dr. Alejandro Mendoza el 22 de abril a las 9:00 AM en Clínica Versalles.", timestamp: new Date("2026-04-13T08:00:00").toISOString(), leida: false },
    { id: "n17", usuarioId: "u6", tipo: "alerta", titulo: "Glucosa en ayunas elevada", descripcion: "El registro de ayer muestra glucosa en 145 mg/dL. Recuerda tomar Glibenclamida antes del desayuno.", timestamp: new Date("2026-04-12T09:00:00").toISOString(), leida: false },

    // Sofía (u5)
    { id: "n13", usuarioId: "u5", tipo: "alerta", titulo: "Posible crisis de migraña", descripcion: "Llevas 2 días sin registrar el Topiramato. Saltarse el preventivo aumenta la frecuencia de episodios.", timestamp: new Date("2026-04-12T09:00:00").toISOString(), leida: false },
    { id: "n14", usuarioId: "u5", tipo: "cita", titulo: "Cita de Neurología en 9 días", descripcion: "Cita presencial con Dra. Carolina Ospina el 22 de abril a las 10:30 AM en Fundación Valle del Lili.", timestamp: new Date("2026-04-13T08:00:00").toISOString(), leida: false }
  ];

  // ─── MOCK STATS DASHBOARD ───────────────────────────────
  // Estos datos los usaré en la vista de estadísticas para cada paciente.
  // Para los charts (Chart.js) necesito arrays de números (dataSemanal) que paso directo.
  // En rachas mantengo el valor para el hero card.
  const stats = {
    "u1": { medsActivos: 4, adherenciaMes: "85%", citasAsistidas: 12, rachaActual: "5 días", mejorRacha: "14 días", masOlvidado: "Atorvastatina", dataSemanal: [75, 80, 82, 85] },
    "u2": { medsActivos: 2, adherenciaMes: "92%", citasAsistidas: 4, rachaActual: "12 días", mejorRacha: "20 días", masOlvidado: "Montelukast", dataSemanal: [88, 90, 92, 92] },
    "u3": { medsActivos: 3, adherenciaMes: "95%", citasAsistidas: 8, rachaActual: "21 días", mejorRacha: "21 días", masOlvidado: "Ninguno", dataSemanal: [90, 95, 95, 95] },
    "u4": { medsActivos: 5, adherenciaMes: "58%", citasAsistidas: 15, rachaActual: "0 días", mejorRacha: "5 días", masOlvidado: "Celecoxib", dataSemanal: [65, 60, 55, 58] },
    "u5": { medsActivos: 2, adherenciaMes: "78%", citasAsistidas: 3, rachaActual: "2 días", mejorRacha: "10 días", masOlvidado: "Topiramato", dataSemanal: [80, 75, 78, 78] },
    "u6": { medsActivos: 4, adherenciaMes: "76%", citasAsistidas: 8, rachaActual: "4 días", mejorRacha: "12 días", masOlvidado: "Glibenclamida", dataSemanal: [72, 74, 78, 76] }
  };

  // ─── TIPS DE SALUD (15) ───────────────────────────────────
  // Repositorio de recomendaciones educativas basadas en evidencia para fomentar el autocuidado.
  const tips = [
    { id: "t1",  titulo: "Horarios consistentes",        contenido: "Tomar los medicamentos a la misma hora cada día mejora su efectividad y reduce el riesgo de olvidar dosis. Usa alarmas en tu teléfono como recordatorio.", categoria: "Adherencia" },
    { id: "t2",  titulo: "Dosis olvidada",               contenido: "Si olvidaste una dosis, tómala tan pronto como recuerdes — excepto si ya es casi la hora de la siguiente. Nunca dupliques la dosis.", categoria: "Seguridad" },
    { id: "t3",  titulo: "Registro de medicamentos",     contenido: "Mantener un registro escrito o digital de tus medicamentos facilita la comunicación con tu médico en cada consulta.", categoria: "Organización" },
    { id: "t4",  titulo: "Hidratación y medicamentos",   contenido: "Beber al menos 8 vasos de agua al día mejora la absorción de muchos medicamentos y mantiene los riñones funcionando correctamente.", categoria: "Nutrición" },
    { id: "t5",  titulo: "Toronja e interacciones",      contenido: "Algunos medicamentos no deben tomarse con jugo de toronja — siempre revisa las indicaciones del prospecto o pregunta a tu médico.", categoria: "Seguridad" },
    { id: "t6",  titulo: "Medición de presión arterial", contenido: "Medir tu presión arterial a la misma hora cada día, preferiblemente en la mañana antes de levantarte, da lecturas más consistentes.", categoria: "Hipertensión" },
    { id: "t7",  titulo: "Ejercicio y presión arterial", contenido: "El ejercicio moderado de 30 minutos cinco días a la semana puede reducir la presión arterial sistólica entre 5 y 8 mmHg.", categoria: "Cardiovascular" },
    { id: "t8",  titulo: "Sueño y salud",                contenido: "Dormir menos de 6 horas por noche aumenta los niveles de cortisol y puede elevar la presión arterial y el azúcar en sangre.", categoria: "Bienestar" },
    { id: "t9",  titulo: "Almacenamiento correcto",      contenido: "Guardar los medicamentos en un lugar fresco, seco y alejado de la luz solar directa preserva su efectividad hasta la fecha de vencimiento.", categoria: "Seguridad" },
    { id: "t10", titulo: "Medicamentos de venta libre",  contenido: "Antes de tomar cualquier medicamento de venta libre, verifica que no interactúe con tus medicamentos recetados actuales.", categoria: "Seguridad" },
    { id: "t11", titulo: "Importancia de la adherencia", contenido: "La adherencia al tratamiento es el factor individual más importante en el control de enfermedades crónicas como la hipertensión y la diabetes.", categoria: "Adherencia" },
    { id: "t12", titulo: "Lista de medicamentos",        contenido: "Llevar una lista de todos tus medicamentos a cada cita médica — nombre, dosis y frecuencia — evita errores en la prescripción.", categoria: "Organización" },
    { id: "t13", titulo: "Estrés y salud crónica",       contenido: "El estrés crónico eleva la presión arterial y el azúcar en sangre. Técnicas de respiración diafragmática pueden ayudar a regularlo.", categoria: "Bienestar" },
    { id: "t14", titulo: "Comprende tu tratamiento",     contenido: "Los pacientes que entienden para qué sirve cada medicamento tienen un 40% más de adherencia que quienes solo saben cuándo tomarlo.", categoria: "Adherencia" },
    { id: "t15", titulo: "No suspendas sin consultar",   contenido: "Suspender un medicamento sin consultar al médico, incluso si te sientes bien, puede causar un rebote o recaída del cuadro clínico.", categoria: "Seguridad" }
  ];

  // ─── CUENTAS GOOGLE MOCK ──────────────────────────────────
  const googleAccounts = {
    paciente: [
      { id: "u6", nombre: "María de los Ángeles Molano", email: "maria.molano@gmail.com" },
      { id: "u1", nombre: "Valentina Torres",       email: "valentina.torres@gmail.com" },
      { id: "u2", nombre: "Andrés Felipe Martínez", email: "andres.martinez@gmail.com" },
      { id: "u3", nombre: "Camila Ríos Herrera",    email: "camila.rios@gmail.com" },
      { id: "u4", nombre: "Roberto Salcedo Peña",   email: "roberto.salcedo@gmail.com" },
      { id: "u5", nombre: "Sofía Guzmán Álvarez",   email: "sofia.guzman@gmail.com" }
    ],
    cuidador: [
      { id: "c1", nombre: "María Fernanda Torres", email: "mafe.torres@gmail.com" },
      { id: "c2", nombre: "Jorge Salcedo",          email: "jorge.salcedo@gmail.com" },
      { id: "c3", nombre: "Lucía Guzmán",           email: "lucia.guzman@gmail.com" }
    ]
  };

  // ─── HELPERS ──────────────────────────────────────────────
  function getAdherencePercent(userId, days = 30) {
    const hist = adherenceHistory[userId];
    if (!hist) return 0;
    const slice = hist.slice(-days);
    let total = 0, taken = 0;
    slice.forEach(day => {
      Object.values(day.medications).forEach(v => { total++; if (v) taken++; });
    });
    return total === 0 ? 0 : Math.round((taken / total) * 100);
  }

  function getWeekAdherence(userId) {
    const hist = adherenceHistory[userId];
    if (!hist) return [];
    const last7 = hist.slice(-7);
    return last7.map(day => {
      const meds = Object.values(day.medications);
      const taken = meds.filter(Boolean).length;
      return { date: day.date, total: meds.length, taken };
    });
  }

  function getCurrentStreak(userId) {
    const hist = adherenceHistory[userId];
    if (!hist) return 0;
    let streak = 0;
    for (let i = hist.length - 1; i >= 0; i--) {
      const meds = Object.values(hist[i].medications);
      if (meds.length === 0) break;
      if (meds.every(Boolean)) streak++;
      else break;
    }
    return streak;
  }

  function getBestStreak(userId) {
    const hist = adherenceHistory[userId];
    if (!hist) return 0;
    let best = 0, cur = 0;
    hist.forEach(day => {
      const meds = Object.values(day.medications);
      if (meds.length > 0 && meds.every(Boolean)) { cur++; best = Math.max(best, cur); }
      else cur = 0;
    });
    return best;
  }

  function getMostMissedMed(userId) {
    const meds = medications.filter(m => m.pacienteId === userId && m.frecuencia !== 'a_demanda');
    const hist  = (adherenceHistory[userId] || []).slice(-30);
    let worst = null, worstMisses = -1;
    meds.forEach(med => {
      const misses = hist.filter(d => d.medications[med.id] === false).length;
      if (misses > worstMisses) { worstMisses = misses; worst = med; }
    });
    return worst;
  }

  function getMostTakenMed(userId) {
    const meds = medications.filter(m => m.pacienteId === userId && m.frecuencia !== 'a_demanda');
    const hist  = (adherenceHistory[userId] || []).slice(-30);
    let best = null, bestTaken = -1;
    meds.forEach(med => {
      const taken = hist.filter(d => d.medications[med.id] === true).length;
      if (taken > bestTaken) { bestTaken = taken; best = med; }
    });
    return best;
  }

  function getTodaysMedications(userId) {
    return medications.filter(m => m.pacienteId === userId && m.activo && m.frecuencia !== "a_demanda");
  }

  function getUserById(id) {
    // Check custom users from localStorage too
    const custom = getCustomUsers();
    return users.find(u => u.id === id) || custom.find(u => u.id === id) || null;
  }

  function getMedicationsByPatient(patientId) {
    return medications.filter(m => m.pacienteId === patientId);
  }

  function getAppointmentsByPatient(patientId) {
    return appointments
      .filter(a => a.pacienteId === patientId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  function getNotificationsByUser(userId) {
    return notifications
      .filter(n => n.usuarioId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  function getUnreadCount(userId) {
    return notifications.filter(n => n.usuarioId === userId && !n.leida).length;
  }

  function markNotificationRead(notifId) {
    const n = notifications.find(n => n.id === notifId);
    if (n) n.leida = true;
  }

  function markAllRead(userId) {
    notifications.filter(n => n.usuarioId === userId).forEach(n => n.leida = true);
  }

  function addMedication(med) {
    med.id = "med" + Date.now();
    medications.push(med);
    return med;
  }

  function updateMedication(id, data) {
    const idx = medications.findIndex(m => m.id === id);
    if (idx !== -1) medications[idx] = { ...medications[idx], ...data };
  }

  function deleteMedication(id) {
    const idx = medications.findIndex(m => m.id === id);
    if (idx !== -1) medications.splice(idx, 1);
  }

  function addAppointment(appt) {
    appt.id = "a" + Date.now();
    appointments.push(appt);
    return appt;
  }

  function getDailyTip() {
    const idx = new Date().getDate() % tips.length;
    return tips[idx];
  }

  function formatFrecuencia(freq) {
    const map = {
      "cada_8h":  "Cada 8 horas",
      "cada_12h": "Cada 12 horas",
      "cada_24h": "Una vez al día",
      "a_demanda": "A demanda"
    };
    return map[freq] || freq;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }

  function formatDateShort(dateStr) {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  }

  function isToday(dateStr) {
    return dateStr === TODAY;
  }

  function getRelativeTime(dateStr) {
    const diff = Math.round((new Date(TODAY) - new Date(dateStr + "T12:00:00")) / 86400000);
    if (diff === 0) return "hoy";
    if (diff === 1) return "hace 1 día";
    if (diff > 1 && diff < 8) return `hace ${diff} días`;
    return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  }

  // Simulate today's taken status (stored in sessionStorage)
  function getTodayTakenStatus() {
    const key = "bionova_taken_today";
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  }

  function markMedicationTaken(medId) {
    const status = getTodayTakenStatus();
    status[medId] = true;
    sessionStorage.setItem("bionova_taken_today", JSON.stringify(status));
  }

  // ─── CUSTOM USERS (localStorage) ─────────────────────────
  function getCustomUsers() {
    try {
      return JSON.parse(localStorage.getItem("bionova_custom_users") || "[]");
    } catch { return []; }
  }

  function saveCustomUsers(arr) {
    localStorage.setItem("bionova_custom_users", JSON.stringify(arr));
  }

  function addCustomUser(userData) {
    const arr = getCustomUsers();
    const newUser = {
      id: "cu_" + Date.now(),
      role: "paciente",
      nombre: userData.nombre,
      email: userData.email,
      _password: userData.password, // kept for reference only, not used for auth
      edad: null,
      condicion: "Sin condición registrada",
      avatar: null,
      cuidadorId: null,
      isCustom: true
    };
    arr.push(newUser);
    saveCustomUsers(arr);
    return newUser;
  }

  function getAllGoogleAccounts(role) {
    const base = googleAccounts[role] || [];
    if (role === 'paciente') {
      const custom = getCustomUsers().map(u => ({ id: u.id, nombre: u.nombre, email: u.email, isCustom: true }));
      return [...base, ...custom];
    }
    return base;
  }

  // Expose public API
  return {
    users, medications, appointments, adherenceHistory, notifications, tips, googleAccounts,
    TODAY,
    getAdherencePercent, getWeekAdherence, getCurrentStreak, getBestStreak,
    getMostMissedMed, getMostTakenMed,
    getTodaysMedications, getUserById, getMedicationsByPatient,
    getAppointmentsByPatient, getNotificationsByUser,
    getUnreadCount, markNotificationRead, markAllRead,
    addMedication, updateMedication, deleteMedication, addAppointment,
    getDailyTip, formatFrecuencia, formatDate, formatDateShort,
    isToday, getRelativeTime, getTodayTakenStatus, markMedicationTaken,
    getCustomUsers, saveCustomUsers, addCustomUser, getAllGoogleAccounts
  };

})();
