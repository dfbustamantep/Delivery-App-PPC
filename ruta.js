// Coordenadas de la bodega
var bodega = [4.757786586246297, -74.04488664305592];

// Array para almacenar los puntos de entrega
var puntosEntrega = [];

// Array para almacenar las rutas programadas
var rutasProgramadas = [];

// Variable para almacenar el índice de la ruta que se está editando
var indiceRutaEditando = null;

// Variable para mantener track del input activo
var activeInputs = null;

// Inicializar el mapa
var map = L.map('map').setView(bodega, 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Añadir marcador inicial de la bodega
L.marker(bodega).addTo(map)
    .bindPopup('Bodega de carga de paquetes.');

// Crear el control de geocodificación con Nominatim
var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false,
    placeholder: 'Buscar dirección...',
    geocoder: L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
            countrycodes: 'co',
            limit: 5
        }
    })
}).addTo(map);

// Manejar el evento de selección de ubicación
geocoder.on('markgeocode', function (e) {
    var result = e.geocode;
    var latlng = result.center;

    if (activeInputs) {
        activeInputs.lat.value = latlng.lat.toFixed(6);
        activeInputs.lng.value = latlng.lng.toFixed(6);

        if (activeInputs.marker) {
            activeInputs.marker.setLatLng(latlng);
        } else {
            activeInputs.marker = L.marker(latlng).addTo(map)
                .bindPopup(result.name || 'Punto de entrega seleccionado');
        }

        map.setView(latlng, 15);
    }
});

// Función para agregar coordenada
function agregarCoordenada() {
    var contenedor = document.getElementById('inputs-coordenadas');
    var nuevoInput = document.createElement('div');
    nuevoInput.className = 'input-coordenada';
    nuevoInput.innerHTML = `
                <label>Latitud:</label>
                <input type="text" class="lat" placeholder="Ej: 4.760000">
                <label>Longitud:</label>
                <input type="text" class="lng" placeholder="Ej: -74.050000">
                <button class="btn-buscar-ubicacion">Buscar en mapa</button>
            `;
    contenedor.appendChild(nuevoInput);
    addSearchButtonListener(nuevoInput);
}

// Función para añadir el evento a los botones de búsqueda
function addSearchButtonListener(container) {
    var button = container.querySelector('.btn-buscar-ubicacion');
    var latInput = container.querySelector('.lat');
    var lngInput = container.querySelector('.lng');
    var marker = null;

    button.addEventListener('click', function () {
        activeInputs = {
            lat: latInput,
            lng: lngInput,
            marker: marker
        };

        var searchInput = document.querySelector('.leaflet-control-geocoder-form input');
        if (searchInput) {
            searchInput.focus();
        }
    });

    latInput.addEventListener('change', updateMarkerFromInputs);
    lngInput.addEventListener('change', updateMarkerFromInputs);

    function updateMarkerFromInputs() {
        var lat = parseFloat(latInput.value);
        var lng = parseFloat(lngInput.value);

        if (!isNaN(lat) && !isNaN(lng)) {
            if (marker) {
                marker.setLatLng([lat, lng]);
            } else {
                marker = L.marker([lat, lng]).addTo(map)
                    .bindPopup('Punto de entrega');
            }
            map.setView([lat, lng], 15);
        }
    }
}

// Función para calcular y dibujar la ruta
function calcularRuta() {
    puntosEntrega = [];
    var inputs = document.querySelectorAll('.input-coordenada');
    inputs.forEach(function (input) {
        var lat = parseFloat(input.querySelector('.lat').value);
        var lng = parseFloat(input.querySelector('.lng').value);
        if (!isNaN(lat) && !isNaN(lng)) {
            puntosEntrega.push([lat, lng]);
        }
    });

    if (puntosEntrega.length === 0) {
        alert('Por favor, ingresa al menos un punto de entrega.');
        return;
    }

    map.eachLayer(function (layer) {
        if (layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });

    var coordenadas = [bodega].concat(puntosEntrega).map(c => c[1] + ',' + c[0]).join(';');
    var url = `https://router.project-osrm.org/route/v1/driving/${coordenadas}?overview=full&geometries=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                var ruta = data.routes[0].geometry.coordinates;
                var geojsonRuta = {
                    type: 'LineString',
                    coordinates: ruta
                };

                L.geoJSON(geojsonRuta, {
                    style: { color: 'blue', weight: 5 }
                }).addTo(map);

                var bounds = L.geoJSON(geojsonRuta).getBounds();
                map.fitBounds(bounds);

                puntosEntrega.forEach(function (punto, index) {
                    L.marker(punto).addTo(map)
                        .bindPopup('Punto de entrega ' + (index + 1));
                });
            }
        })
        .catch(error => console.error('Error al calcular la ruta:', error));
}

// Función para guardar la ruta
function guardarRuta() {
    var conductor = document.getElementById('conductor').value;
    var vehiculo = document.getElementById('vehiculo').value;
    var fecha = document.getElementById('fecha').value;

    if (!conductor || !vehiculo || !fecha || puntosEntrega.length === 0) {
        alert('Por favor, completa todos los campos y calcula la ruta antes de guardar.');
        return;
    }

    var ruta = {
        conductor: conductor,
        vehiculo: vehiculo,
        fecha: fecha,
        bodega: { lat: bodega[0], lng: bodega[1] },
        puntosEntrega: puntosEntrega.map(p => { return { lat: p[0], lng: p[1] }; }),
        detalles: [] // Nuevo array para almacenar detalles de cada parada
    };

    if (indiceRutaEditando !== null) {
        rutasProgramadas[indiceRutaEditando] = ruta;
        indiceRutaEditando = null;
    } else {
        rutasProgramadas.push(ruta);
    }

    actualizarListaRutas();
    limpiarFormulario();
    guardarRutasEnLocalStorage();
}
// Función para guardar rutas en localStorage
function guardarRutasEnLocalStorage() {
    localStorage.setItem('rutasProgramadas', JSON.stringify(rutasProgramadas));
    alert('Rutas guardadas correctamente.');
}

// Función para cargar rutas desde localStorage
function cargarRutasDesdeLocalStorage() {
    var rutasGuardadas = localStorage.getItem('rutasProgramadas');
    if (rutasGuardadas) {
        rutasProgramadas = JSON.parse(rutasGuardadas);
        actualizarListaRutas();
    }
}

// Función para descargar JSON
function descargarJSON() {
    if (rutasProgramadas.length === 0) {
        alert('No hay rutas programadas para descargar.');
        return;
    }

    var jsonString = JSON.stringify(rutasProgramadas, null, 2);
    var blob = new Blob([jsonString], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'rutas_programadas.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Función para limpiar el formulario
function limpiarFormulario() {
    document.getElementById('conductor').value = '';
    document.getElementById('vehiculo').value = '';
    document.getElementById('fecha').value = '';
    document.getElementById('inputs-coordenadas').innerHTML = `
                <div class="input-coordenada">
                    <label>Latitud:</label>
                    <input type="text" class="lat" placeholder="Ej: 4.760000">
                    <label>Longitud:</label>
                    <input type="text" class="lng" placeholder="Ej: -74.050000">
                    <button class="btn-buscar-ubicacion">Buscar en mapa</button>
                </div>
            `;
    addSearchButtonListener(document.querySelector('.input-coordenada'));
    puntosEntrega = [];
}

// Función para limpiar el formulario y el mapa
function limpiarFormularioYMapa() {
    // Limpiar el formulario
    limpiarFormulario();

    // Limpiar el mapa
    map.eachLayer(function (layer) {
        // Remover todas las capas excepto el tile layer (mapa base) y el marcador de la bodega
        if (layer instanceof L.Polyline ||
            (layer instanceof L.Marker && (!layer._popup || layer._popup.getContent() !== 'Bodega de carga de paquetes.'))) {
            map.removeLayer(layer);
        }
    });

    // Asegurar que el marcador de la bodega esté presente
    var bodegaPresente = false;
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker && layer._popup && layer._popup.getContent() === 'Bodega de carga de paquetes.') {
            bodegaPresente = true;
        }
    });

    // Si no está el marcador de la bodega, lo agregamos
    if (!bodegaPresente) {
        L.marker(bodega).addTo(map)
            .bindPopup('Bodega de carga de paquetes.');
    }

    // Restablecer la vista del mapa a la bodega
    map.setView(bodega, 13);
}


// Función para limpiar filtros
function limpiarFiltros() {
    document.getElementById('filtroConductor').value = '';
    document.getElementById('filtroVehiculo').value = '';
    document.getElementById('filtroFecha').value = '';
    actualizarListaRutas(rutasProgramadas);
}

// Función para editar ruta
function editarRuta(index) {
    var ruta = rutasProgramadas[index];
    document.getElementById('conductor').value = ruta.conductor;
    document.getElementById('vehiculo').value = ruta.vehiculo;
    document.getElementById('fecha').value = ruta.fecha;

    var contenedor = document.getElementById('inputs-coordenadas');
    contenedor.innerHTML = '';

    ruta.puntosEntrega.forEach(function (punto) {
        var nuevoInput = document.createElement('div');
        nuevoInput.className = 'input-coordenada';
        nuevoInput.innerHTML = `
                    <label>Latitud:</label>
                    <input type="text" class="lat" value="${punto.lat}">
                    <label>Longitud:</label>
                    <input type="text" class="lng" value="${punto.lng}">
                    <button class="btn-buscar-ubicacion">Buscar en mapa</button>
                `;
        contenedor.appendChild(nuevoInput);
        addSearchButtonListener(nuevoInput);
    });

    indiceRutaEditando = index;

    puntosEntrega = ruta.puntosEntrega.map(p => [p.lat, p.lng]);
    calcularRuta();
}

function mostrarDetallesRuta(index) {
    var ruta = rutasProgramadas[index];
    var contenido = document.getElementById('detalles-contenido');
    contenido.innerHTML = '';

    ruta.puntosEntrega.forEach(function (punto, i) {
        var detalleParada = document.createElement('div');
        detalleParada.className = 'detalle-parada';
        detalleParada.innerHTML = `
                    <strong>Parada ${i + 1}:</strong><br>
                    Latitud: ${punto.lat}<br>
                    Longitud: ${punto.lng}<br>
                    <label>Dirección:</label>
                    <input type="text" id="direccion-${i}" value="${punto.direccion || ''}"><br>
                    <label>Número de paquetes:</label>
                    <input type="number" id="paquetes-${i}" value="${punto.paquetes || 0}"><br>
                `;
        contenido.appendChild(detalleParada);
    });

    var botonGuardar = document.createElement('button');
    botonGuardar.textContent = 'Guardar Detalles';
    botonGuardar.onclick = function () {
        guardarDetallesRuta(index);
    };
    contenido.appendChild(botonGuardar);
}

function guardarDetallesRuta(index) {
    var ruta = rutasProgramadas[index];
    ruta.puntosEntrega.forEach(function (punto, i) {
        punto.direccion = document.getElementById(`direccion-${i}`).value;
        punto.paquetes = parseInt(document.getElementById(`paquetes-${i}`).value);
    });

    actualizarListaRutas();
    guardarRutasEnLocalStorage();
    alert('Detalles guardados correctamente.');
}

// Función para actualizar la lista de rutas
function actualizarListaRutas(rutas = rutasProgramadas) {
    var listaRutas = document.getElementById('lista-rutas');
    listaRutas.innerHTML = '';

    rutas.forEach(function (ruta, index) {
        var rutaItem = document.createElement('div');
        rutaItem.className = 'ruta-item';
        rutaItem.innerHTML = `
                    <strong>Ruta ${index + 1}:</strong><br>
                    Conductor: ${ruta.conductor}<br>
                    Vehículo: ${ruta.vehiculo}<br>
                    Fecha: ${ruta.fecha}<br>
                    Puntos de entrega: ${ruta.puntosEntrega.length}
                    <button onclick="editarRuta(${index})">Editar</button>
                    <button onclick="mostrarDetallesRuta(${index})">Detalles</button>
                `;
        listaRutas.appendChild(rutaItem);
    });
}

// Inicializar los eventos para los botones existentes
document.querySelectorAll('.input-coordenada').forEach(addSearchButtonListener);

// Cargar rutas al iniciar la página
cargarRutasDesdeLocalStorage();