// Este archivo JS incluye las funciones necesarias para gestionar los conductores

const rutaArchivoJSON = 'conductores.json';

// Función para cargar todos los conductores
function cargarConductores() {
    fetch(rutaArchivoJSON)
        .then(response => response.json())
        .then(data => {
            const tabla = document.querySelector('#tabla-conductores tbody');
            tabla.innerHTML = ''; // Limpiar tabla antes de llenarla

            data.forEach(conductor => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${conductor.id}</td>
                    <td>${conductor.nombres}</td>
                    <td>${conductor.apellidos}</td>
                    <td>${conductor.numeroLicencia}</td>
                    <td>${conductor.telefono}</td>
                    <td>${conductor.correo}</td>
                `;
                tabla.appendChild(fila);
            });
        })
        .catch(error => console.error('Error al cargar los conductores:', error));
}

// Función para registrar un nuevo conductor
// Función para registrar un nuevo conductor
function registrarConductor() {
    const id = document.getElementById('id').value;
    const nombres = document.getElementById('nombres').value;
    const apellidos = document.getElementById('apellidos').value;
    const numeroLicencia = document.getElementById('numeroLicencia').value;
    const telefono = document.getElementById('telefono').value;
    const correo = document.getElementById('correo').value;

    fetch('conductores.json')
        .then(response => response.json())
        .then(conductores => {
            const nuevoConductor = { id, nombres, apellidos, numeroLicencia, telefono, correo };
            
            if (validarConductor(nuevoConductor, conductores)) {
                conductores.push(nuevoConductor);
                actualizarJSON(conductores);
                cargarConductores();
            } else {
                alert('Datos del conductor inválidos o duplicados.');
            }
        })
        .catch(error => console.error('Error al registrar el conductor:', error));
}


// Función para actualizar el archivo JSON con nuevos datos
function actualizarJSON(data) {
    fetch(rutaArchivoJSON, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .catch(error => console.error('Error al actualizar el archivo JSON:', error));
}

// Función para eliminar un conductor
function eliminarConductor() {
    const id = document.getElementById('idBuscar').value;
    if (!id) {
        alert('Por favor, ingrese un ID para eliminar');
        return;
    }

    if (confirm('¿Estás seguro de eliminar este conductor?')) {
        fetch(rutaArchivoJSON)
            .then(response => response.json())
            .then(data => {
                const index = data.findIndex(c => c.id === id);
                if (index !== -1) {
                    data.splice(index, 1);
                    actualizarJSON(data);
                    cargarConductores();
                    limpiarFormulario();
                } else {
                    alert('Conductor no encontrado');
                }
            })
            .catch(error => console.error('Error al eliminar el conductor:', error));
    }
}

// Función para editar un conductor
function editarConductor() {
    const id = document.getElementById('id').value;
    if (!id) {
        alert('Por favor, ingrese un ID para editar');
        return;
    }

    const nombres = document.getElementById('nombres').value;
    const apellidos = document.getElementById('apellidos').value;
    const numeroLicencia = document.getElementById('numeroLicencia').value;
    const telefono = document.getElementById('telefono').value;
    const correo = document.getElementById('correo').value;

    const conductorActualizado = { id, nombres, apellidos, numeroLicencia, telefono, correo };

    fetch(rutaArchivoJSON)
        .then(response => response.json())
        .then(data => {
            const index = data.findIndex(c => c.id === id);
            if (index !== -1) {
                data[index] = conductorActualizado; // Actualizamos el conductor
                actualizarJSON(data);
                cargarConductores();
                limpiarFormulario();
            } else {
                alert('Conductor no encontrado');
            }
        })
        .catch(error => console.error('Error al actualizar el conductor:', error));
}

// Función para limpiar el formulario
function limpiarFormulario() {
    document.getElementById('id').value = '';
    document.getElementById('nombres').value = '';
    document.getElementById('apellidos').value = '';
    document.getElementById('numeroLicencia').value = '';
    document.getElementById('telefono').value = '';
    document.getElementById('correo').value = '';
}

// Función para buscar conductor por ID
function buscarPorID() {
    const id = document.getElementById('idBuscar').value;
    if (!id) {
        alert('Por favor, ingrese un ID');
        return;
    }

    fetch(rutaArchivoJSON)
        .then(response => response.json())
        .then(data => {
            const conductor = data.find(c => c.id === id);
            const tabla = document.querySelector('#tabla-conductores tbody');
            tabla.innerHTML = ''; // Limpiar tabla antes de llenarla

            if (conductor) {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${conductor.id}</td>
                    <td>${conductor.nombres}</td>
                    <td>${conductor.apellidos}</td>
                    <td>${conductor.numeroLicencia}</td>
                    <td>${conductor.telefono}</td>
                    <td>${conductor.correo}</td>
                `;
                tabla.appendChild(fila);
            } else {
                alert('Conductor no encontrado');
            }
        })
        .catch(error => console.error('Error al buscar el conductor:', error));
}

// Función para consultar todos los conductores
function consultarTodos() {
    cargarConductores();
}

// Función para mostrar la sección seleccionada y ocultar las demás
function mostrarSeccion(seccion) {
    const secciones = ['vehiculos', 'conductores', 'rutas'];
    secciones.forEach(id => {
        const element = document.getElementById(id);
        if (id === seccion) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
}

// Validaciones para conductores
function validarConductor(conductor, conductores) {
    const idValido = /^[0-9]+$/.test(conductor.id);
    const nombreValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(conductor.nombres);
    const apellidoValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(conductor.apellidos);
    const licenciaUnica = !conductores.some(c => c.numeroLicencia === conductor.numeroLicencia);
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(conductor.correo);

    return idValido && nombreValido && apellidoValido && licenciaUnica && correoValido;
}

// Validación para vehículos (placa en formato ABC-123 o ABC123)
function validarPlaca(placa) {
    return /^[A-Z]{3}-?[0-9]{3}$/.test(placa);
}



// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarConductores();
    mostrarSeccion('conductores'); // Mostrar la sección de conductores por defecto
});
