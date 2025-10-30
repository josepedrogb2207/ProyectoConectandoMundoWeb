import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapaEventos.css';
import PanelLateral from './PanelLateral';

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Componente para ajustar el mapa cuando cambian los marcadores
function MapBounds({ eventos }) {
  const map = useMap();
  
  useEffect(() => {
    if (eventos && eventos.length > 0) {
      const bounds = eventos
        .filter(e => e.latitude && e.longitude)
        .map(e => [parseFloat(e.latitude), parseFloat(e.longitude)]);
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      }
    }
  }, [eventos, map]);
  
  return null;
}

function MapaEventos() {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(2020);
  const [tiposFiltro, setTiposFiltro] = useState(new Set());
  const [tiposDisponibles, setTiposDisponibles] = useState([]);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);

  useEffect(() => {
    fetchEventos();
  }, [year]);

  // Mapeo de códigos numéricos a nombres de tipos de violencia (según UCDP API)
  // https://ucdp.uu.se/apidocs/
  const mapearTipoViolencia = (codigo) => {
    const mapeo = {
      '1': 'Conflicto estatal',           // State-based conflict
      '2': 'Conflicto no estatal',        // Non-state conflict (carteles, grupos armados)
      '3': 'Violencia unilateral',        // One-sided violence (ataques contra civiles)
      // También aceptar números sin comillas
      1: 'Conflicto estatal',
      2: 'Conflicto no estatal',
      3: 'Violencia unilateral'
    };
    return mapeo[codigo] || `Tipo ${codigo}`;
  };

  // Función helper para obtener el tipo de violencia
  const getTipoViolencia = (evento) => {
    const tipoRaw = evento.type_of_violence || evento.type || evento.event_type;
    
    // Si es un número, mapear al nombre
    if (tipoRaw !== undefined && tipoRaw !== null) {
      const tipoMapeado = mapearTipoViolencia(tipoRaw);
      return tipoMapeado;
    }
    
    return 'Desconocido';
  };

  useEffect(() => {
    // Aplicar filtros usando getTipoViolencia para mapear correctamente
    if (tiposFiltro.size === 0) {
      setEventosFiltrados(eventos);
    } else {
      const filtrados = eventos.filter(e => {
        const tipoMapeado = getTipoViolencia(e);
        return tiposFiltro.has(tipoMapeado);
      });
      setEventosFiltrados(filtrados);
    }
  }, [tiposFiltro, eventos]);

  // Función helper para obtener el total de muertes
  const getTotalMuertes = (evento) => {
    const deaths_a = parseInt(evento.deaths_a) || 0;
    const deaths_b = parseInt(evento.deaths_b) || 0;
    const deaths_civilians = parseInt(evento.deaths_civilians) || 0;
    const deaths_unknown = parseInt(evento.deaths_unknown) || 0;
    return deaths_a + deaths_b + deaths_civilians + deaths_unknown;
  };

  // Función helper para obtener el título del enfrentamiento
  const getTituloEnfrentamiento = (evento) => {
    const sideA = evento.side_a || evento.actor1 || 'Actor desconocido';
    const sideB = evento.side_b || evento.actor2;
    
    if (sideB && sideB !== 'Civilians') {
      return `${sideA} vs ${sideB}`;
    }
    return sideA;
  };

  const fetchEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:3000/api/mexico/rango?startYear=${year}&endYear=${year}`);
      const data = await response.json();
      
      if (data.success) {
        setEventos(data.data);
        
        const todosLosTipos = ['Conflicto estatal', 'Conflicto no estatal', 'Violencia unilateral'];
        setTiposDisponibles(todosLosTipos);
      } else {
        setError('Error al cargar los eventos');
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFiltroTipo = (tipo) => {
    const nuevosFiltros = new Set(tiposFiltro);
    if (nuevosFiltros.has(tipo)) {
      nuevosFiltros.delete(tipo);
    } else {
      nuevosFiltros.add(tipo);
    }
    setTiposFiltro(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setTiposFiltro(new Set());
  };

  const abrirPanelLateral = (ubicacion) => {
    setUbicacionSeleccionada(ubicacion);
    setPanelAbierto(true);
  };

  const cerrarPanelLateral = () => {
    setPanelAbierto(false);
    setUbicacionSeleccionada(null);
  };

  // Centro de México
  const centerMexico = [23.6345, -102.5528];

  // Función para obtener color según tipo
  const getColorForType = (type) => {
    const colors = {
      'Conflicto estatal': '#1e88e5',           // Azul - Gobierno involucrado
      'Conflicto no estatal': '#ff6f00',        // Naranja - Entre carteles/grupos
      'Violencia unilateral': '#e53935'         // Rojo - Ataques contra civiles
    };
    return colors[type] || '#95a5a6'; // Gris por defecto
  };

  // Crear icono personalizado según el tipo de evento
  const getEventIcon = (evento) => {
    const tipoViolencia = getTipoViolencia(evento);
    const color = getColorForType(tipoViolencia);
    const totalMuertes = getTotalMuertes(evento);
    
    // Tamaño del marcador basado en el número de muertes
    let size = 16;
    if (totalMuertes > 10) size = 20;
    if (totalMuertes > 50) size = 24;
    if (totalMuertes > 100) size = 28;
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: ${size > 16 ? '10px' : '8px'}; font-weight: bold;">${totalMuertes > 0 ? totalMuertes : ''}</div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  };

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Panel de control */}
      <div style={{ 
        padding: '15px', 
        background: '#2c3e50', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        flexWrap: 'wrap'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>Eventos de Conflicto en México</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="year">Año:</label>
          <select 
            id="year"
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          {loading ? (
            <span>Cargando...</span>
          ) : (
            <span>
              {eventosFiltrados.length} de {eventos.length} eventos
              {tiposFiltro.size > 0 && ' (filtrados)'}
            </span>
          )}
        </div>
      </div>

      {/* Filtros por tipo */}
      {tiposDisponibles.length > 0 && (
        <div style={{
          padding: '10px 15px',
          background: '#34495e',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          fontSize: '13px'
        }}>
          <strong>Filtrar por tipo:</strong>
          {tiposDisponibles.map(tipo => (
            <button
              key={tipo}
              onClick={() => toggleFiltroTipo(tipo)}
              style={{
                padding: '5px 12px',
                borderRadius: '15px',
                border: '2px solid white',
                background: tiposFiltro.has(tipo) ? getColorForType(tipo) : 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: tiposFiltro.has(tipo) ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {tipo}
            </button>
          ))}
          {tiposFiltro.size > 0 && (
            <button
              onClick={limpiarFiltros}
              style={{
                padding: '5px 12px',
                borderRadius: '15px',
                border: '2px solid #e74c3c',
                background: '#e74c3c',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div style={{ 
          padding: '10px', 
          background: '#e74c3c', 
          color: 'white',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Contenedor del Mapa */}
      <div style={{ flex: 1, width: '100%', position: 'relative', minHeight: '400px' }}>
        <MapContainer 
          center={centerMexico} 
          zoom={5} 
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          scrollWheelZoom={true}
          zoomControl={true}
          preferCanvas={false}
        >
          {/* OpenStreetMap tiles - más confiable */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
            minZoom={3}
          />

          <MapBounds eventos={eventosFiltrados} />

          {eventosFiltrados
            .filter(evento => evento.latitude && evento.longitude)
            .map((evento, index) => (
              <Marker
                key={evento.id || index}
                position={[parseFloat(evento.latitude), parseFloat(evento.longitude)]}
                icon={getEventIcon(evento)}
              >
                <Popup maxWidth={350}>
                  <div style={{ fontSize: '12px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>
                      {getTituloEnfrentamiento(evento)}
                    </h3>
                    
                    {/* Total de Muertes - MUY VISIBLE */}
                    {getTotalMuertes(evento) > 0 && (
                      <div style={{ 
                        background: '#c0392b', 
                        color: 'white', 
                        padding: '8px', 
                        borderRadius: '5px', 
                        margin: '8px 0',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {getTotalMuertes(evento)} MUERTES TOTALES
                      </div>
                    )}

                    <p style={{ margin: '4px 0', fontSize: '11px' }}>
                      <strong>Tipo:</strong> <span style={{ 
                        color: getColorForType(getTipoViolencia(evento)), 
                        fontWeight: 'bold' 
                      }}>
                        {getTipoViolencia(evento)}
                      </span>
                    </p>
                    
                    <p style={{ margin: '4px 0', fontSize: '11px' }}>
                      <strong>Actores:</strong>
                    </p>
                    <p style={{ margin: '2px 0 2px 10px', fontSize: '10px' }}>
                      • Lado A: {evento.side_a || 'N/A'}
                    </p>
                    {evento.side_b && evento.side_b !== 'N/A' && (
                      <p style={{ margin: '2px 0 2px 10px', fontSize: '10px' }}>
                        • Lado B: {evento.side_b}
                      </p>
                    )}
                    
                    <p style={{ margin: '4px 0', fontSize: '11px' }}>
                      <strong>Fecha:</strong> {evento.date_start || evento.event_date || 'N/A'}
                    </p>
                    
                    <p style={{ margin: '4px 0', fontSize: '11px' }}>
                      <strong>Ubicación:</strong> {evento.where_description || evento.location || 'N/A'}
                    </p>
                    
                    <p style={{ margin: '4px 0', fontSize: '11px' }}>
                      <strong>Región:</strong> {evento.region || evento.admin1 || 'N/A'}
                    </p>

                    {/* Botón para ver más información de la zona */}
                    <button
                      onClick={() => abrirPanelLateral(evento.where_description || evento.region || evento.location)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        marginTop: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      Ver información completa de la zona
                    </button>

                    {/* Desglose de víctimas */}
                    {getTotalMuertes(evento) > 0 && (
                      <div style={{ 
                        marginTop: '8px', 
                        paddingTop: '8px', 
                        borderTop: '1px solid #ecf0f1' 
                      }}>
                        <strong style={{ fontSize: '11px', color: '#7f8c8d' }}>Desglose de víctimas:</strong>
                        
                        {evento.deaths_a > 0 && (
                          <p style={{ margin: '3px 0 3px 10px', fontSize: '11px' }}>
                            • {evento.side_a || 'Lado A'}: <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{evento.deaths_a}</span>
                          </p>
                        )}
                        
                        {evento.deaths_b > 0 && (
                          <p style={{ margin: '3px 0 3px 10px', fontSize: '11px' }}>
                            • {evento.side_b || 'Lado B'}: <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{evento.deaths_b}</span>
                          </p>
                        )}
                        
                        {evento.deaths_civilians > 0 && (
                          <p style={{ margin: '3px 0 3px 10px', fontSize: '11px' }}>
                            • Civiles: <span style={{ color: '#c0392b', fontWeight: 'bold' }}>{evento.deaths_civilians}</span>
                          </p>
                        )}
                        
                        {evento.deaths_unknown > 0 && (
                          <p style={{ margin: '3px 0 3px 10px', fontSize: '11px', color: '#95a5a6' }}>
                            • Desconocidas: {evento.deaths_unknown}
                          </p>
                        )}
                      </div>
                    )}

                    {evento.where_description && (
                      <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: '#7f8c8d', fontStyle: 'italic', paddingTop: '8px', borderTop: '1px solid #ecf0f1' }}>
                        {evento.where_description.length > 200 
                          ? evento.where_description.substring(0, 200) + '...' 
                          : evento.where_description}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Leyenda Fija */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          fontSize: '12px',
          zIndex: 1000,
          maxWidth: '250px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#2c3e50' }}>
            Tipos de Eventos
          </h4>
          {[
            { nombre: 'Conflicto estatal', descripcion: 'Gobierno involucrado', tipo: 'Conflicto estatal', color: '#1e88e5' },
            { nombre: 'Conflicto no estatal', descripcion: 'Entre carteles/grupos armados', tipo: 'Conflicto no estatal', color: '#ff6f00' },
            { nombre: 'Violencia unilateral', descripcion: 'Ataques contra civiles', tipo: 'Violencia unilateral', color: '#e53935' }
          ].map((item, i) => {
            const count = eventos.filter(e => getTipoViolencia(e) === item.tipo).length;
            const totalMuertes = eventos
              .filter(e => getTipoViolencia(e) === item.tipo)
              .reduce((sum, e) => sum + getTotalMuertes(e), 0);
            const isFiltered = tiposFiltro.has(item.tipo);
            return (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  margin: '6px 0', 
                  gap: '8px',
                  opacity: (tiposFiltro.size === 0 || isFiltered) ? 1 : 0.3,
                  transition: 'opacity 0.3s'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: item.color,
                  border: '3px solid white',
                  boxShadow: '0 0 6px rgba(0,0,0,0.6)',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1, fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold' }}>{item.nombre}</div>
                  <div style={{ fontSize: '9px', color: '#7f8c8d', fontStyle: 'italic' }}>
                    {item.descripcion}
                  </div>
                  {count > 0 && (
                    <div style={{ fontSize: '9px', color: '#7f8c8d', marginTop: '2px' }}>
                      {count} eventos • {totalMuertes} muertes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel Lateral */}
      {panelAbierto && (
        <PanelLateral
          ubicacion={ubicacionSeleccionada}
          eventos={eventos}
          onClose={cerrarPanelLateral}
          getTipoViolencia={getTipoViolencia}
          getTotalMuertes={getTotalMuertes}
          getColorForType={getColorForType}
        />
      )}
    </div>
  );
}

export default MapaEventos;
