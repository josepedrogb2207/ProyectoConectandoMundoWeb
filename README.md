# Proyecto: Territorios Fragmentados

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
