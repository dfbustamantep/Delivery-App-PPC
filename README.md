# Delivery App
### Acerca de la aplicación
- Nombre de la aplicación: Delivery-App-PPC
- Tipo de aplicación: Aplicación web con Back-end y Front-end
- Endpoint o link de acceso: http://localhost:5500
- Puerto: 5500
- Descripción:
  -	Aplicación para la gestión de conductores, vehículos y rutas para un servicio de entrega
  -	Aplicación basada en Node.js y Express para el back-end y archivos JSON con información de conductres,vechiculos y rutas.
  -	Aplicación con un front-end estático con HTML,CSS y JavaScript 

### Endpoints

|Método	        |Endpoint	        |Descripción    |
|:-------------:|:---------------:|:-------------:|
|GET	          |/	                        |Devuelve el index.html|
|GET	          |/conductores.json          |Obtiene la lista de conductores desde el JSON|
|PUT	          |/conductores.json          |Actualiza el conductores.json|
|GET	          |/vehiculos.json	          |Obtiene la lista de vechiculos desde el JSON|
|PUT	          |/vehiculos.json	          |Actualiza el vehiculos.json|
|GET	          |/rutas	Obtiene             |Obtiene las rutas almacenadas en rutas.json|
|POST	          |/rutas/guardar	            |Gurada una ruta|
|DELETE         |/rutas/eiminar/:matricula	|Elimina una ruta|

### Configuración e instalacion
- Tener instalado Node.js 
- Clonar el repositorio
- Instalar las dependencias
  ```
    npm install
  ```
- Iniciar el servidor
  ```
    node server.js
  ```
- Acceder a la aplicación desde el navegador en: http://localhost:5500


