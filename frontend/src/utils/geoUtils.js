/**
 * Utilidades para trabajar con geocodificación
 * Usa la API de Nominatim de OpenStreetMap
 */

/**
 * Mapeo de nombres de estados de Nominatim a nombres usados en la app
 * Nominatim puede devolver nombres con tildes o variaciones
 */
const estadosNormalizados = {
  'Aguascalientes': 'Aguascalientes',
  'Baja California': 'Baja California',
  'Baja California Sur': 'Baja California Sur',
  'Campeche': 'Campeche',
  'Chiapas': 'Chiapas',
  'Chihuahua': 'Chihuahua',
  'Coahuila': 'Coahuila',
  'Coahuila de Zaragoza': 'Coahuila',
  'Colima': 'Colima',
  'Durango': 'Durango',
  'Guanajuato': 'Guanajuato',
  'Guerrero': 'Guerrero',
  'Hidalgo': 'Hidalgo',
  'Jalisco': 'Jalisco',
  'México': 'Mexico', 
  'Estado de México': 'Mexico',
  'Mexico': 'Mexico',
  'Michoacán': 'Michoacan',
  'Michoacan': 'Michoacan',
  'Michoacán de Ocampo': 'Michoacan',
  'Morelos': 'Morelos',
  'Nayarit': 'Nayarit',
  'Nuevo León': 'Nuevo Leon',
  'Nuevo Leon': 'Nuevo Leon',
  'Oaxaca': 'Oaxaca',
  'Puebla': 'Puebla',
  'Querétaro': 'Queretaro',
  'Queretaro': 'Queretaro',
  'Querétaro de Arteaga': 'Queretaro',
  'Quintana Roo': 'Quintana Roo',
  'San Luis Potosí': 'San Luis Potosi',
  'San Luis Potosi': 'San Luis Potosi',
  'Sinaloa': 'Sinaloa',
  'Sonora': 'Sonora',
  'Tabasco': 'Tabasco',
  'Tamaulipas': 'Tamaulipas',
  'Tlaxcala': 'Tlaxcala',
  'Veracruz': 'Veracruz',
  'Veracruz de Ignacio de la Llave': 'Veracruz',
  'Yucatán': 'Yucatan',
  'Yucatan': 'Yucatan',
  'Zacatecas': 'Zacatecas',
  'Ciudad de México': 'Ciudad de Mexico',
  'Ciudad de Mexico': 'Ciudad de Mexico'
};

/**
 * Normaliza el nombre del estado de Nominatim al formato usado en la app
 * @param {string} estadoNominatim - Nombre del estado devuelto por Nominatim
 * @returns {string} - Nombre normalizado
 */
function normalizarEstado(estadoNominatim) {
  if (!estadoNominatim) return null;
  
  // Si está en el mapeo, usar el valor normalizado
  if (estadosNormalizados[estadoNominatim]) {
    return estadosNormalizados[estadoNominatim];
  }
  
  // Si no está en el mapeo, devolver tal cual
  return estadoNominatim;
}

/**
 * Obtiene el estado mexicano desde coordenadas usando Nominatim Reverse Geocoding
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {Promise<string|null>} - Nombre del estado o null si falla
 */
export async function obtenerEstadoPorCoordenadas(lat, lon) {
  if (!lat || !lon) {
    return null;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=6`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ProyectoConectandoMundoWeb/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const estadoRaw = data.address?.state || null;
    
    if (estadoRaw) {
      const estadoNormalizado = normalizarEstado(estadoRaw);
      return estadoNormalizado;
    } else {
      return null;
    }
    
  } catch (error) {
    return null;
  }
}

/**
 * Obtiene información completa de ubicación desde Nominatim
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {Promise<Object|null>} - Información completa o null si falla
 */
export async function obtenerInfoUbicacion(lat, lon) {
  if (!lat || !lon) {
    return null;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=6`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ProyectoConectandoMundoWeb/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      estado: data.address?.state || null,
      pais: data.address?.country || null,
      displayName: data.display_name || null,
      lat: data.lat,
      lon: data.lon
    };
    
  } catch (error) {
    return null;
  }
}
