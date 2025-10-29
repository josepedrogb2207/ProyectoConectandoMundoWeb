require('dotenv').config();
const express = require('express');
const ucdpService = require('./ucdpService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para CORS (permite peticiones desde el frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenido al backend de Conectando Mundos',
    api: 'UCDP (Uppsala Conflict Data Program)',
    info: 'API publica, no requiere autenticacion',
    endpoints: {
      '/api/ucdp/events': 'GET - Obtener eventos georeferenciados recientes',
      '/api/ucdp/country/:country': 'GET - Eventos por país y año (requiere ?year=XXXX)',
      '/api/ucdp/conflicts': 'GET - Conflictos activos',
      '/api/ucdp/test': 'GET - Prueba con México 2023'
    }
  });
});

// Ruta para obtener eventos recientes
app.get('/api/ucdp/events', async (req, res) => {
  try {
    const pagesize = req.query.pagesize || 100;
    
    const result = await ucdpService.getRecentEvents(pagesize);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener eventos de UCDP',
      details: error.message 
    });
  }
});

// Ruta para obtener eventos por país y año
app.get('/api/ucdp/country/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const { year, pagesize } = req.query;
    
    if (!year) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requiere el parámetro "year"',
        example: '/api/ucdp/country/Mexico?year=2023'
      });
    }

    const result = await ucdpService.getEventsByCountryAndYear(
      country, 
      parseInt(year), 
      pagesize ? parseInt(pagesize) : 1000
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener eventos por país',
      details: error.message 
    });
  }
});

// Ruta para obtener conflictos activos
app.get('/api/ucdp/conflicts', async (req, res) => {
  try {
    const params = req.query;
    const result = await ucdpService.getConflicts(params);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener conflictos',
      details: error.message 
    });
  }
});

// Ruta de prueba con México
app.get('/api/ucdp/test', async (req, res) => {
  try {
    const result = await ucdpService.testMexicoColombia();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error en test',
      details: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`UCDP API integrada - Sin autenticacion requerida`);
});
