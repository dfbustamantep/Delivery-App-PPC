const express = require('express');
const path = require('path');
const fs = require('fs');  // Requerir módulo 'fs' para leer el archivo JSON
const cors = require('cors');


const app = express();
const port = 5500;

const RUTAS_FILE = path.join(__dirname, 'rutas.json');

// Middleware para parsear el cuerpo de las solicitudes
app.use(express.json());
app.use(cors());

// Servir archivos estáticos desde la carpeta raíz
app.use(express.static(path.join(__dirname)));

// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para servir el archivo conductores.json
app.get('/conductores.json', (req, res) => {
    const filePath = path.join(__dirname, 'conductores.json');
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el archivo JSON' });
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

// Ruta para manejar la actualización del archivo JSON
app.put('/conductores.json', (req, res) => {
    const filePath = path.join(__dirname, 'conductores.json');
    fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf-8', (err) => {
        if (err) {
            res.status(500).json({ error: 'Error al actualizar el archivo JSON' });
        } else {
            res.status(200).json({ message: 'Archivo JSON actualizado con éxito' });
        }
    });
});


/// Ruta para servir el archivo conductores.json
app.get('/vehiculos.json', (req, res) => {
    const filePath = path.join(__dirname, 'vehiculos.json');
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error al leer el archivo JSON' });
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

function leerRutas() {
  if (!fs.existsSync(RUTAS_FILE)) {
    fs.writeFileSync(RUTAS_FILE, JSON.stringify({})); // Crear el archivo si no existe
  }
  const data = fs.readFileSync(RUTAS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Escribir en el archivo rutas.json
function escribirRutas(rutas) {
  fs.writeFileSync(RUTAS_FILE, JSON.stringify(rutas, null, 2));
}

// Obtener todas las rutas
app.get('/rutas', (req, res) => {
  const rutas = leerRutas();
  res.json(rutas);
});

// Guardar una ruta
app.post('/rutas/guardar', (req, res) => {
  const { matricula, ruta } = req.body;
  if (!matricula || !ruta) {
    return res.status(400).json({ error: 'Matrícula y ruta son obligatorios.' });
  }

  const rutas = leerRutas();
  rutas[matricula] = ruta;
  escribirRutas(rutas);

  res.json({ message: `Ruta guardada para la matrícula "${matricula}".` });
});

// Eliminar una ruta
app.delete('/rutas/eliminar/:matricula', (req, res) => {
  const { matricula } = req.params;
  const rutas = leerRutas();

  if (!rutas[matricula]) {
    return res.status(404).json({ error: `No se encontró una ruta para la matrícula "${matricula}".` });
  }

  delete rutas[matricula];
  escribirRutas(rutas);

  res.json({ message: `Ruta eliminada para la matrícula "${matricula}".` });
});

// Ruta para manejar la actualización del archivo JSON
app.put('/vehiculos.json', (req, res) => {
    const filePath = path.join(__dirname, 'vehiculos.json');
    fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf-8', (err) => {
        if (err) {
            res.status(500).json({ error: 'Error al actualizar el archivo JSON' });
        } else {
            res.status(200).json({ message: 'Archivo JSON actualizado con éxito' });
        }
    });
});

/*app.post('/save-route', (req, res) => {
    const filePath = path.join(__dirname, 'rutas.json');
    fs.writeFile(filePath, JSON.stringify(req.body, null, 2), (err) => {
        if (err) {
            console.error('Error al guardar el archivo:', err);
            return res.status(500).json({ message: 'Error al guardar la ruta' });
        }
        res.json({ message: 'Ruta guardada exitosamente' });
    });
});
*/
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
