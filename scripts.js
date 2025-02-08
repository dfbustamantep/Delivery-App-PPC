// Función para actualizar los combobox en el iframe de rutas
function actualizarComboboxRutas() {
    const iframe = document.querySelector('#rutas iframe');
    if (iframe && iframe.contentWindow) {
        // Asegurarse de que las funciones estén disponibles antes de llamarlas
        if (typeof iframe.contentWindow.cargarConductores === 'function' &&
            typeof iframe.contentWindow.cargarVehiculos === 'function') {
            iframe.contentWindow.cargarConductores();
            iframe.contentWindow.cargarVehiculos();
        }
    }
}

// Función para mostrar la sección seleccionada y ocultar las demás
function mostrarSeccion(seccion) {
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('section');
    secciones.forEach(sec => sec.classList.add('hidden'));

    // Mostrar la sección seleccionada
    document.getElementById(seccion).classList.remove('hidden');

    // Si la sección es rutas, actualizar los combobox
    if (seccion === 'rutas') {
        // Esperamos un momento para asegurarnos de que el iframe esté cargado
        setTimeout(actualizarComboboxRutas, 100);
    }
}

// Asignar los eventos a los enlaces del menú de navegación
document.getElementById('vehiculos-link').addEventListener('click', () => mostrarSeccion('vehiculos'));
document.getElementById('conductores-link').addEventListener('click', () => mostrarSeccion('conductores'));
document.getElementById('rutas-link').addEventListener('click', () => mostrarSeccion('rutas'));

// Escuchar cambios en localStorage para actualizar los combobox si estamos en la sección de rutas
window.addEventListener('storage', function(e) {
    if ((e.key === 'conductores' || e.key === 'vehiculos') && 
        !document.getElementById('rutas').classList.contains('hidden')) {
        actualizarComboboxRutas();
    }
});

// Mostrar la sección de conductores por defecto al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarSeccion('conductores');
    
    // También configuramos un MutationObserver para detectar cuando el iframe se carga
    const rutasSection = document.getElementById('rutas');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (!rutasSection.classList.contains('hidden')) {
                actualizarComboboxRutas();
            }
        });
    });

    observer.observe(rutasSection, {
        attributes: true,
        attributeFilter: ['class']
    });
});