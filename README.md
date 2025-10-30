# Proyecto: Territorio Fragmentados

Visualización interactiva de eventos de conflicto en México utilizando datos del Uppsala Conflict Data Program (UCDP).

## Descripción

Este proyecto es una aplicación web que permite visualizar y analizar eventos de conflicto ocurridos en México entre 2010 y 2024. Utiliza datos del UCDP para mostrar en un mapa interactivo información detallada sobre cada evento, incluyendo ubicación, tipo de violencia, actores involucrados y número de muertes.

## Características

- Visualización de eventos en mapa interactivo con Leaflet
- Filtrado de eventos por año
- Filtrado por tipo de violencia (Violencia Estatal, Violencia No Estatal, Violencia Unilateral)
- Panel lateral con información detallada de cada estado
- Estadísticas por ubicación (total de eventos, muertes, muertes por evento)
- Geocodificación inversa para detectar el estado de cada evento
- Integración con Wikipedia para información de estados

## Tecnologías Utilizadas

### Backend
- Node.js
- Express
- Axios

### Frontend
- React
- React-Leaflet
- Leaflet
- Axios

## APIs Utilizadas

### UCDP API
El proyecto utiliza el Uppsala Conflict Data Program API v25.1 para obtener datos de eventos de conflicto:
- Endpoint principal: `https://ucdpapi.pcr.uu.se/api/gedevents/25.1`
- Tipos de violencia soportados:
  - Tipo 1: Violencia Estatal
  - Tipo 2: Violencia No Estatal
  - Tipo 3: Violencia Unilateral

### Nominatim API
Sistema de geocodificación inversa de OpenStreetMap para detección precisa de estados:
- Endpoint: `https://nominatim.openstreetmap.org/reverse`
- Parámetros utilizados: `format=jsonv2`, `zoom=6` (nivel estatal)
- Respeta límites de uso con 1 llamada por apertura de panel
- User-Agent: `ProyectoConectandoMundoWeb/1.0`

### Wikipedia API
API REST de Wikipedia para información complementaria de estados:
- Endpoint: `https://es.wikipedia.org/api/rest_v1/page/summary/`
- Incluye manejo de páginas de desambiguación

## Estructura del Proyecto

```
ProyectoConectandoMundoWeb/
├── backend/
│   ├── server.js              # Servidor Express
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── MapaEventos.js        # Componente principal del mapa
    │   │   └── PanelLateral.js       # Panel de información lateral
    │   ├── utils/
    │   │   └── geoUtils.js           # Utilidades de geocodificación
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

## Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm

### Pasos de Instalación

1. Clonar el repositorio

2. Instalar dependencias del backend:
```bash
cd backend
npm install
```

3. Instalar dependencias del frontend:
```bash
cd frontend
npm install
```

## Uso

### Iniciar el Backend
```bash
cd backend
node server.js
```
El servidor se iniciará en http://localhost:3000

### Iniciar el Frontend
```bash
cd frontend
npm start
```
La aplicación se abrirá en http://localhost:3001

## Endpoints del Backend

### Obtener eventos por tipo de violencia
```
GET /api/ucdp/:tipo
```
Parámetros:
- `tipo`: Tipo de violencia (1, 2, o 3)

Ejemplo:
```
http://localhost:3000/api/ucdp/1
```

### Obtener eventos de México
```
GET /api/mexico
```
Retorna todos los eventos de conflicto en México

### Obtener eventos por rango de años
```
GET /api/mexico/rango?startYear=2020&endYear=2020
```
Parámetros de consulta:
- `startYear`: Año de inicio (2010-2024)
- `endYear`: Año de fin (2010-2024)

Ejemplo para filtrar por un año específico:
```
http://localhost:3000/api/mexico/rango?startYear=2020&endYear=2020
```

### Obtener información de Wikipedia
```
GET /api/wikipedia/:estado
```
Parámetros:
- `estado`: Nombre del estado mexicano

Ejemplo:
```
http://localhost:3000/api/wikipedia/Jalisco
```

## Funcionalidades Principales

### Mapa Interactivo
- Visualización de eventos con marcadores en el mapa
- Marcadores personalizados por tipo de violencia
- Zoom y navegación libre por el mapa

### Filtrado de Datos
- Filtrado por año (2010-2024)
- Filtrado por tipo de violencia
- Visualización de múltiples tipos simultáneamente

### Panel de Información
- Detección automática del estado usando Nominatim
- Estadísticas de eventos por ubicación
- Información del estado desde Wikipedia
- Listado de eventos en la ubicación seleccionada

### Geocodificación
- Uso de Nominatim API para geocodificación inversa precisa
- Normalización de nombres de estados para compatibilidad
- Detección a nivel estatal (zoom=6)

## Datos

Los datos provienen del Uppsala Conflict Data Program (UCDP), que proporciona información detallada sobre eventos de conflicto a nivel mundial. Para este proyecto, se filtran específicamente los eventos ocurridos en México entre 2010 y 2024.

Cada evento incluye:
- Coordenadas geográficas (latitud y longitud)
- Tipo de violencia
- Actores involucidos
- Número de muertes
- Fecha del evento
- Ubicación específica

## Limitaciones

- La API de UCDP limita las respuestas a 1000 eventos por consulta
- Se recomienda usar filtros de año para obtener datos más específicos
- La geocodificación con Nominatim respeta límites de uso (1 consulta por apertura de panel)
