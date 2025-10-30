import React, { useState, useEffect } from 'react';
import { obtenerEstadoPorCoordenadas } from '../utils/geoUtils';

// Mapeo simplificado de estados para Wikipedia y aliases (para búsqueda por nombre)
const estadosInfo = {
  'Aguascalientes': { wiki: 'Aguascalientes_(estado)', aliases: ['aguascalientes'] }, // Ciudad: Aguascalientes
  'Baja California': { wiki: 'Baja_California', aliases: ['baja california', 'b.c.', 'bc'] },
  'Baja California Sur': { wiki: 'Baja_California_Sur', aliases: ['baja california sur', 'b.c.s.', 'bcs'] },
  'Campeche': { wiki: 'Campeche_(estado)', aliases: ['campeche'] }, // Ciudad: San Francisco de Campeche
  'Chiapas': { wiki: 'Chiapas', aliases: ['chiapas'] },
  'Chihuahua': { wiki: 'Chihuahua_(estado)', aliases: ['chihuahua'] }, // Ciudad: Chihuahua
  'Coahuila': { wiki: 'Coahuila', aliases: ['coahuila'] },
  'Colima': { wiki: 'Colima_(estado)', aliases: ['colima'] }, // Ciudad: Colima
  'Durango': { wiki: 'Durango_(estado)', aliases: ['durango'] }, // Ciudad: Victoria de Durango
  'Guanajuato': { wiki: 'Guanajuato_(estado)', aliases: ['guanajuato'] }, // Ciudad: Guanajuato
  'Guerrero': { wiki: 'Guerrero_(estado)', aliases: ['guerrero'] },
  'Hidalgo': { wiki: 'Hidalgo_(estado_de_México)', aliases: ['hidalgo'] },
  'Jalisco': { wiki: 'Jalisco', aliases: ['jalisco'] },
  'Mexico': { wiki: 'Estado_de_México', aliases: ['mexico', 'estado de mexico', 'edomex', 'state of mexico'] },
  'Michoacan': { wiki: 'Michoacán', aliases: ['michoacan', 'michoacán'] },
  'Morelos': { wiki: 'Morelos_(estado)', aliases: ['morelos'] },
  'Nayarit': { wiki: 'Nayarit', aliases: ['nayarit'] },
  'Nuevo Leon': { wiki: 'Nuevo_León', aliases: ['nuevo leon', 'nuevo león', 'n.l.', 'nl'] },
  'Oaxaca': { wiki: 'Oaxaca_(estado)', aliases: ['oaxaca'] }, // Ciudad: Oaxaca de Juárez
  'Puebla': { wiki: 'Puebla_(estado)', aliases: ['puebla'] }, // Ciudad: Heroica Puebla de Zaragoza
  'Queretaro': { wiki: 'Querétaro_(estado)', aliases: ['queretaro', 'querétaro'] }, // Ciudad: Santiago de Querétaro
  'Quintana Roo': { wiki: 'Quintana_Roo', aliases: ['quintana roo'] },
  'San Luis Potosi': { wiki: 'San_Luis_Potosí_(estado)', aliases: ['san luis potosi', 'san luis potosí', 's.l.p.', 'slp'] }, // Ciudad: San Luis Potosí
  'Sinaloa': { wiki: 'Sinaloa', aliases: ['sinaloa'] },
  'Sonora': { wiki: 'Sonora', aliases: ['sonora'] },
  'Tabasco': { wiki: 'Tabasco_(estado)', aliases: ['tabasco'] },
  'Tamaulipas': { wiki: 'Tamaulipas', aliases: ['tamaulipas'] },
  'Tlaxcala': { wiki: 'Tlaxcala_(estado)', aliases: ['tlaxcala'] }, // Ciudad: Tlaxcala de Xicohténcatl
  'Veracruz': { wiki: 'Veracruz_(estado)', aliases: ['veracruz'] }, // Ciudad: Veracruz (puerto)
  'Yucatan': { wiki: 'Yucatán', aliases: ['yucatan', 'yucatán'] },
  'Zacatecas': { wiki: 'Zacatecas_(estado)', aliases: ['zacatecas'] }, // Ciudad: Zacatecas
  'Ciudad de Mexico': { wiki: 'Ciudad_de_México', aliases: ['ciudad de mexico', 'ciudad de méxico', 'cdmx', 'mexico city', 'df', 'd.f.'] }
};

// Datos básicos de los estados (capital y población)
const datosEstados = {
  'Aguascalientes': { capital: 'Aguascalientes', poblacion: '1,425,607' },
  'Baja California': { capital: 'Mexicali', poblacion: '3,769,020' },
  'Baja California Sur': { capital: 'La Paz', poblacion: '798,447' },
  'Campeche': { capital: 'San Francisco de Campeche', poblacion: '928,363' },
  'Chiapas': { capital: 'Tuxtla Gutiérrez', poblacion: '5,543,828' },
  'Chihuahua': { capital: 'Chihuahua', poblacion: '3,741,869' },
  'Coahuila': { capital: 'Saltillo', poblacion: '3,146,771' },
  'Colima': { capital: 'Colima', poblacion: '731,391' },
  'Durango': { capital: 'Victoria de Durango', poblacion: '1,832,650' },
  'Guanajuato': { capital: 'Guanajuato', poblacion: '6,166,934' },
  'Guerrero': { capital: 'Chilpancingo de los Bravo', poblacion: '3,540,685' },
  'Hidalgo': { capital: 'Pachuca de Soto', poblacion: '3,082,841' },
  'Jalisco': { capital: 'Guadalajara', poblacion: '8,348,151' },
  'Mexico': { capital: 'Toluca de Lerdo', poblacion: '16,992,418' },
  'Michoacan': { capital: 'Morelia', poblacion: '4,748,846' },
  'Morelos': { capital: 'Cuernavaca', poblacion: '1,971,520' },
  'Nayarit': { capital: 'Tepic', poblacion: '1,235,456' },
  'Nuevo Leon': { capital: 'Monterrey', poblacion: '5,784,442' },
  'Oaxaca': { capital: 'Oaxaca de Juárez', poblacion: '4,132,148' },
  'Puebla': { capital: 'Heroica Puebla de Zaragoza', poblacion: '6,583,278' },
  'Queretaro': { capital: 'Santiago de Querétaro', poblacion: '2,368,467' },
  'Quintana Roo': { capital: 'Chetumal', poblacion: '1,857,985' },
  'San Luis Potosi': { capital: 'San Luis Potosí', poblacion: '2,822,255' },
  'Sinaloa': { capital: 'Culiacán', poblacion: '3,026,943' },
  'Sonora': { capital: 'Hermosillo', poblacion: '2,944,840' },
  'Tabasco': { capital: 'Villahermosa', poblacion: '2,402,598' },
  'Tamaulipas': { capital: 'Ciudad Victoria', poblacion: '3,527,735' },
  'Tlaxcala': { capital: 'Tlaxcala de Xicohténcatl', poblacion: '1,342,977' },
  'Veracruz': { capital: 'Xalapa-Enríquez', poblacion: '8,062,579' },
  'Yucatan': { capital: 'Mérida', poblacion: '2,320,898' },
  'Zacatecas': { capital: 'Zacatecas', poblacion: '1,622,138' },
  'Ciudad de Mexico': { capital: 'Ciudad de México', poblacion: '9,209,944' }
};

function PanelLateral({ ubicacion, eventos, onClose, getTipoViolencia, getTotalMuertes, getColorForType }) {
  const [infoWikipedia, setInfoWikipedia] = useState(null);
  const [cargandoWiki, setCargandoWiki] = useState(false);
  const [estadoEncontrado, setEstadoEncontrado] = useState(null);
  const [cargandoEstado, setCargandoEstado] = useState(false);
  
  // Función mejorada para encontrar el evento correspondiente con coordenadas
  const encontrarEvento = () => {
    if (!ubicacion || !eventos || eventos.length === 0) return null;
    
    // Buscar evento que coincida con la ubicación
    return eventos.find(e => 
      e.where_description === ubicacion ||
      e.where_description?.includes(ubicacion) ||
      ubicacion?.includes(e.where_description)
    );
  };

  const eventoActual = encontrarEvento();

  // Obtener el estado usando la API de Nominatim cuando se abre el panel
  useEffect(() => {
    const obtenerEstado = async () => {
      if (!eventoActual || !eventoActual.latitude || !eventoActual.longitude) {
        setEstadoEncontrado(null);
        return;
      }

      setCargandoEstado(true);
      try {
        const lat = parseFloat(eventoActual.latitude);
        const lon = parseFloat(eventoActual.longitude);
        
        const estado = await obtenerEstadoPorCoordenadas(lat, lon);
        setEstadoEncontrado(estado);
      } catch (error) {
        setEstadoEncontrado(null);
      } finally {
        setCargandoEstado(false);
      }
    };

    obtenerEstado();
  }, [ubicacion, eventoActual]);

  // Obtener informacion de Wikipedia
  useEffect(() => {
    const fetchWikipedia = async () => {
      if (!estadoEncontrado) return;
      
      setCargandoWiki(true);
      try {
        const nombreWiki = estadosInfo[estadoEncontrado].wiki;
        const response = await fetch(
          `https://es.wikipedia.org/api/rest_v1/page/summary/${nombreWiki}`
        );
        const data = await response.json();
        
        setInfoWikipedia({
          titulo: data.title,
          extracto: data.extract,
          descripcion: data.description,
          thumbnail: data.thumbnail?.source
        });
      } catch (error) {
        setInfoWikipedia(null);
      } finally {
        setCargandoWiki(false);
      }
    };

    fetchWikipedia();
  }, [estadoEncontrado]);

  if (!ubicacion) return null;

  //filtrar eventos del estado
  const eventosUbicacion = estadoEncontrado ? eventos.filter(e => {
    //usar nombre del estado para filtrar eventos
    if (estadosInfo[estadoEncontrado]) {
      const aliases = estadosInfo[estadoEncontrado].aliases;
      
      for (let alias of aliases) {
        if (e.where_description?.toLowerCase().includes(alias) ||
            e.region?.toLowerCase().includes(alias) ||
            e.location?.toLowerCase().includes(alias) ||
            e.admin1?.toLowerCase().includes(alias)) {
          return true;
        }
      }
    }
    
    return false;
  }) : [];

  const totalEventos = eventosUbicacion.length;
  const totalMuertes = eventosUbicacion.reduce((sum, e) => sum + getTotalMuertes(e), 0);
  
  // Agrupar por tipo
  const eventosPorTipo = {};
  eventosUbicacion.forEach(e => {
    const tipo = getTipoViolencia(e);
    if (!eventosPorTipo[tipo]) {
      eventosPorTipo[tipo] = { count: 0, muertes: 0 };
    }
    eventosPorTipo[tipo].count++;
    eventosPorTipo[tipo].muertes += getTotalMuertes(e);
  });

  // Obtener actores principales
  const actores = {};
  eventosUbicacion.forEach(e => {
    if (e.side_a && e.side_a !== 'N/A') {
      actores[e.side_a] = (actores[e.side_a] || 0) + 1;
    }
    if (e.side_b && e.side_b !== 'N/A' && e.side_b !== 'Civilians') {
      actores[e.side_b] = (actores[e.side_b] || 0) + 1;
    }
  });
  const actoresPrincipales = Object.entries(actores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);


  // Obtener año único presente en los eventos (debería ser solo uno si filtramos por año)
  const año = eventosUbicacion.length > 0 
    ? new Date(eventosUbicacion[0].date_start).getFullYear()
    : null;

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      />
      
      {/* Panel lateral */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '450px',
        maxWidth: '90vw',
        background: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
        zIndex: 2001,
        overflowY: 'auto',
        animation: 'slideInRight 0.3s ease-out',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '25px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            ×
          </button>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            {ubicacion}
          </h2>
        </div>

        {/* Contenido */}
        <div style={{ padding: '20px' }}>
            {/* Información de Wikipedia */}
          {infoWikipedia && (
            <div style={{
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                {infoWikipedia.thumbnail && (
                  <img 
                    src={infoWikipedia.thumbnail} 
                    alt={infoWikipedia.titulo}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {infoWikipedia.titulo}
                  </h3>
                  {infoWikipedia.descripcion && (
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#7f8c8d', fontStyle: 'italic' }}>
                      {infoWikipedia.descripcion}
                    </p>
                  )}
                  {estadoEncontrado && datosEstados[estadoEncontrado] && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#34495e' }}>
                      <p style={{ margin: '3px 0' }}>
                        <strong>Capital:</strong> {datosEstados[estadoEncontrado].capital}
                      </p>
                      <p style={{ margin: '3px 0' }}>
                        <strong>Población:</strong> {datosEstados[estadoEncontrado].poblacion} habitantes
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <p style={{ 
                margin: '15px 0 0 0', 
                fontSize: '13px', 
                color: '#34495e', 
                lineHeight: '1.6',
                textAlign: 'justify'
              }}>
                {infoWikipedia.extracto}
              </p>
              
              <a 
                href={`https://es.wikipedia.org/wiki/${estadosInfo[estadoEncontrado].wiki}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  fontSize: '11px',
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Leer más en Wikipedia →
              </a>
            </div>
          )}

          {/* Estadísticas generales */}
          <div style={{
            background: '#fff',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Estadísticas de Conflictos
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '15px',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalEventos}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Eventos</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                padding: '15px',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff0000' }}>{totalMuertes}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Muertes Totales</div>
              </div>
            </div>

            {año && (
              <div style={{ 
                fontSize: '14px', 
                color: '#7f8c8d', 
                textAlign: 'center',
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '6px',
                fontWeight: '600'
              }}>
                Año: {año}
              </div>
            )}
          </div>

          {/* Tipos de conflicto */}
          {Object.keys(eventosPorTipo).length > 0 && (
            <div style={{
              background: '#fff',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Tipos de Conflicto
              </h3>
              {Object.entries(eventosPorTipo).map(([tipo, datos]) => (
                <div key={tipo} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: getColorForType(tipo),
                        display: 'inline-block'
                      }}></span>
                      {tipo}
                    </span>
                    <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                      {datos.count} eventos • <span style={{ color: '#ff0000', fontWeight: 'bold' }}>{datos.muertes} muertes</span>
                    </span>
                  </div>
                  <div style={{ 
                    background: '#f0f0f0', 
                    height: '8px', 
                    borderRadius: '4px', 
                    overflow: 'hidden' 
                  }}>
                    <div style={{
                      background: getColorForType(tipo),
                      height: '100%',
                      width: `${(datos.count / totalEventos) * 100}%`,
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actores principales */}
          {actoresPrincipales.length > 0 && (
            <div style={{
              background: '#fff',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Actores Principales
              </h3>
              {actoresPrincipales.map(([actor, count], index) => (
                <div key={actor} style={{
                  padding: '10px',
                  background: index % 2 === 0 ? '#f8f9fa' : 'white',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '13px', color: '#2c3e50' }}>
                    <strong>{index + 1}.</strong> {actor}
                  </span>
                  <span style={{
                    background: '#667eea',
                    color: 'white',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {count} eventos
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

        <style>{`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </>
  );
}

export default PanelLateral;
