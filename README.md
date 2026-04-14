# BioNova

Aplicación web de gestión de salud personal que desarrollé como proyecto académico para el curso de Diseño en Ingeniería. BioNova permite a pacientes llevar el control de sus medicamentos y citas médicas, mientras que médicos y cuidadores pueden hacer seguimiento desde sus propios paneles.

## ¿Qué hace?

- Los pacientes registran y controlan sus medicamentos con recordatorios y estadísticas de adherencia
- Los médicos asignan medicamentos, crean citas (presenciales o virtuales) y monitorean la adherencia de cada paciente
- Los cuidadores acceden al perfil del paciente vinculado para gestionar todo en su nombre
- El dashboard global muestra métricas de adherencia, asistencia a citas y alertas por paciente

## Stack

HTML5 + CSS3 + JavaScript vanilla — sin frameworks. Chart.js para las gráficas. SPA simulada con hash routing. Todos los datos son mock (sin backend real), persistencia con localStorage.

## Cómo correrlo

1. Clonar el repositorio
2. Abrir con Live Server en VSCode (o cualquier servidor local)
3. Listo — no requiere instalación ni dependencias

## Credenciales de prueba

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Médico | medico@bionova.co | doctor123 |
| Médico 2 | dra.ospina@bionova.co | doctor123 |
| Paciente / Cuidador | Seleccionar cuenta en el modal de login | — |

## Estructura del proyecto

```text
bionova/
├── index.html
├── css/
│   ├── main.css
│   ├── components.css
│   └── pages.css
├── js/
│   ├── router.js
│   ├── auth.js
│   ├── mockData.js
│   ├── dashboard.js
│   ├── medications.js
│   ├── appointments.js
│   └── notifications.js
└── assets/
```

## Contexto académico

Proyecto desarrollado para el Reto 09 - Arquitectura y Prototipado de la materia de Diseño en Ingeniería, octavo semestre de Ingeniería Informática. El objetivo era construir un prototipo interactivo de alta calidad navegable por usuarios reales para una prueba de usabilidad.
