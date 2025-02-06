const rutaArchivoJSONVehiculos = 'vehiculos.json';

// Función para cargar todos los vehículos
function cargarVehiculos() {
    fetch(rutaArchivoJSONVehiculos)
        .then(response => response.json())
        .then(data => {
            const tabla = document.querySelector('#tabla-vehiculos tbody');
            tabla.innerHTML = ''; // Limpiar tabla antes de llenarla

            data.forEach(vehiculo => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${vehiculo.placa}</td>
                    <td>${vehiculo.modelo}</td>
                    <td>${vehiculo.color}</td>
                    <td>${vehiculo.marca}</td>
                    <td>${vehiculo.capacidadCarga}</td>
                `;
                tabla.appendChild(fila);
            });
        })
        .catch(error => console.error('Error al cargar los vehículos:', error));
}

// Validación para vehículos (placa en formato ABC-123 o ABC123 y única)
function validarVehiculo(vehiculo, vehiculos) {
    const placaValida = /^[A-Z]{3}-?[0-9]{3}$/.test(vehiculo.placa);
    const placaUnica = !vehiculos.some(v => v.placa.toUpperCase() === vehiculo.placa.toUpperCase());
    const capacidadValida = /^[0-9]+(\.[0-9]+)?$/.test(vehiculo.capacidadCarga); // Solo números o decimales
    return placaValida && placaUnica && capacidadValida;
}

// Función para registrar un nuevo vehículo
function registrarVehiculo() {
    const placa = document.getElementById('placa').value.trim().toUpperCase();
    const modelo = document.getElementById('modelo').value.trim();
    const color = document.getElementById('color').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const capacidadCarga = document.getElementById('capacidadCarga').value.trim();

    if (!placa || !modelo || !color || !marca || !capacidadCarga) {
        alert('Todos los campos son obligatorios.');
        return;
    }

    fetch('vehiculos.json')
        .then(response => response.json())
        .then(vehiculos => {
            const nuevoVehiculo = { placa, modelo, color, marca, capacidadCarga };
            
            if (validarVehiculo(nuevoVehiculo, vehiculos)) {
                vehiculos.push(nuevoVehiculo);
                actualizarJSONVehiculos(vehiculos);
                cargarVehiculos();
                alert('Vehículo registrado correctamente.');
            } else {
                alert('Placa inválida, duplicada o capacidad de carga incorrecta.');
            }
        })
        .catch(error => console.error('Error al registrar el vehículo:', error));
}



// Función para actualizar el archivo JSON con nuevos datos
function actualizarJSONVehiculos(data) {
    fetch(rutaArchivoJSONVehiculos, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .catch(error => console.error('Error al actualizar el archivo JSON de vehículos:', error));
}

// Función para eliminar un vehículo
function eliminarVehiculo() {
    const placa = document.getElementById('placaBuscar').value;
    if (!placa) {
        alert('Por favor, ingrese una placa para eliminar');
        return;
    }

    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
        fetch(rutaArchivoJSONVehiculos)
            .then(response => response.json())
            .then(data => {
                const index = data.findIndex(v => v.placa === placa);
                if (index !== -1) {
                    data.splice(index, 1);
                    actualizarJSONVehiculos(data);
                    cargarVehiculos();
                    limpiarFormularioVehiculo();
                } else {
                    alert('Vehículo no encontrado');
                }
            })
            .catch(error => console.error('Error al eliminar el vehículo:', error));
    }
}

// Función para editar un vehículo
function editarVehiculo() {
    const placa = document.getElementById('placa').value;
    if (!placa) {
        alert('Por favor, ingrese una placa para editar');
        return;
    }

    const modelo = document.getElementById('modelo').value;
    const color = document.getElementById('color').value;
    const marca = document.getElementById('marca').value;
    const capacidadCarga = document.getElementById('capacidadCarga').value;

    const vehiculoActualizado = { placa, modelo, color, marca, capacidadCarga };

    fetch(rutaArchivoJSONVehiculos)
        .then(response => response.json())
        .then(data => {
            const index = data.findIndex(v => v.placa === placa);
            if (index !== -1) {
                data[index] = vehiculoActualizado; // Actualizamos el vehículo
                actualizarJSONVehiculos(data);
                cargarVehiculos();
                limpiarFormularioVehiculo();
            } else {
                alert('Vehículo no encontrado');
            }
        })
        .catch(error => console.error('Error al actualizar el vehículo:', error));
}

// Función para limpiar el formulario de vehículos
function limpiarFormularioVehiculo() {
    document.getElementById('placa').value = '';
    document.getElementById('modelo').value = '';
    document.getElementById('color').value = '';
    document.getElementById('marca').value = '';
    document.getElementById('capacidadCarga').value = '';
}

// Función para buscar vehículo por placa
function buscarPorPlaca() {
    const placa = document.getElementById('placaBuscar').value;
    if (!placa) {
        alert('Por favor, ingrese una placa');
        return;
    }

    fetch(rutaArchivoJSONVehiculos)
        .then(response => response.json())
        .then(data => {
            const vehiculo = data.find(v => v.placa === placa);
            const tabla = document.querySelector('#tabla-vehiculos tbody');
            tabla.innerHTML = ''; // Limpiar tabla antes de llenarla

            if (vehiculo) {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${vehiculo.placa}</td>
                    <td>${vehiculo.modelo}</td>
                    <td>${vehiculo.color}</td>
                    <td>${vehiculo.marca}</td>
                    <td>${vehiculo.capacidadCarga}</td>
                `;
                tabla.appendChild(fila);
            } else {
                alert('Vehículo no encontrado');
            }
        })
        .catch(error => console.error('Error al buscar el vehículo:', error));
}


// Función para consultar todos los vehículos
function consultarTodosVehiculos() {
    cargarVehiculos();
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarVehiculos();
    mostrarSeccion('vehiculos'); // Mostrar la sección de vehículos por defecto
});
