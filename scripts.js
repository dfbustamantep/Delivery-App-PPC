// Función para mostrar la sección seleccionada y ocultar las demás
function mostrarSeccion(seccion) {
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('section');
    secciones.forEach(sec => sec.classList.add('hidden'));

    // Mostrar la sección seleccionada
    document.getElementById(seccion).classList.remove('hidden');
}

// Asignar los eventos a los enlaces del menú de navegación
document.getElementById('vehiculos-link').addEventListener('click', () => mostrarSeccion('vehiculos'));
document.getElementById('conductores-link').addEventListener('click', () => mostrarSeccion('conductores'));
document.getElementById('rutas-link').addEventListener('click', () => mostrarSeccion('rutas'));

// Mostrar la sección de conductores por defecto al cargar la página
document.addEventListener('DOMContentLoaded', () => mostrarSeccion('conductores'));
