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
    message: 'Backend - Conectando Mundos (Mexico)',
    api: 'UCDP (Uppsala Conflict Data Program)',
    info: 'API publica, no requiere autenticacion',
    pais: 'Mexico',
    endpoints: {
      '/api/mexico/eventos': 'GET - Todos los eventos en México (?year=XXXX opcional)',
      '/api/mexico/recientes': 'GET - Eventos recientes (últimos 5 años)',
      '/api/mexico/rango': 'GET - Eventos por rango de años (?startYear=XXXX&endYear=XXXX)'
    }
  });
});

// Ruta para obtener eventos de México
app.get('/api/mexico/eventos', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : null;
    const maxResults = req.query.limit ? parseInt(req.query.limit) : 1000;
    
    const result = await ucdpService.getMexicoEvents(year, maxResults);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener eventos de México',
      details: error.message 
    });
  }
});

// Ruta para obtener eventos recientes de México
app.get('/api/mexico/recientes', async (req, res) => {
  try {
    const maxResults = req.query.limit ? parseInt(req.query.limit) : 1000;
    
    const result = await ucdpService.getRecentMexicoEvents(maxResults);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener eventos recientes',
      details: error.message 
    });
  }
});

// Ruta para obtener eventos por rango de años
app.get('/api/mexico/rango', async (req, res) => {
  try {
    const { startYear, endYear } = req.query;
    const maxResults = req.query.limit ? parseInt(req.query.limit) : 1000;
    
    if (!startYear || !endYear) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requieren los parámetros startYear y endYear',
        example: '/api/mexico/rango?startYear=2020&endYear=2023'
      });
    }

    const result = await ucdpService.getMexicoEventsByYearRange(
      parseInt(startYear), 
      parseInt(endYear),
      maxResults
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener eventos por rango',
      details: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`UCDP API - Datos de conflictos en Mexico`);
});
