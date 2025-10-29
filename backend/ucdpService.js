const axios = require('axios');

class UCDPService {
  constructor() {
    // UCDP tiene múltiples endpoints disponibles
    this.baseUrl = 'https://ucdpapi.pcr.uu.se/api';
    // No requiere autenticación para datos públicos
  }

  /**
   * Obtiene eventos de conflicto georeferenciados (GED)
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} - Datos de UCDP
   */
  async getGeoEvents(params = {}) {
    try {
      const url = `${this.baseUrl}/gedevents/24.1`; // versión 24.1
      
      console.log('Haciendo peticion a UCDP GED...');
      console.log('URL:', url);
      console.log('Parametros:', params);

      const response = await axios.get(url, {
        params: params
      });

      console.log('Respuesta recibida. Status:', response.status);
      console.log('Total de eventos:', response.data.TotalCount);

      return {
        success: true,
        data: response.data.Result,
        count: response.data.TotalCount,
        nextPage: response.data.NextPageUrl
      };
    } catch (error) {
      console.error('Error fetching UCDP data:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.message);
      throw new Error(`Error al obtener datos de UCDP: ${error.message}`);
    }
  }

  /**
   * Obtiene conflictos activos
   * @param {Object} params - Parámetros de consulta
   */
  async getConflicts(params = {}) {
    try {
      const url = `${this.baseUrl}/ucdpprioconflict/24.1`;
      
      console.log('Haciendo peticion a UCDP Conflicts...');
      console.log('URL:', url);
      console.log('Parametros:', params);

      const response = await axios.get(url, {
        params: params
      });

      console.log('Respuesta recibida. Status:', response.status);
      console.log('Total de conflictos:', response.data.TotalCount);

      return {
        success: true,
        data: response.data.Result,
        count: response.data.TotalCount
      };
    } catch (error) {
      console.error('Error fetching UCDP conflicts:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.message);
      throw new Error(`Error al obtener conflictos de UCDP: ${error.message}`);
    }
  }

  /**
   * Obtiene eventos por país y año
   * @param {string} country - Nombre del país
   * @param {number} year - Año
   * @param {number} pagesize - Cantidad de resultados por página (max 1000)
   */
  async getEventsByCountryAndYear(country, year, pagesize = 1000) {
    return await this.getGeoEvents({
      country: country,
      year: year,
      pagesize: pagesize
    });
  }

  /**
   * Obtiene eventos por rango de años
   * @param {number} startYear - Año inicial
   * @param {number} endYear - Año final
   * @param {number} pagesize - Cantidad de resultados
   */
  async getEventsByYearRange(startYear, endYear, pagesize = 1000) {
    return await this.getGeoEvents({
      StartDate: `${startYear}-01-01`,
      EndDate: `${endYear}-12-31`,
      pagesize: pagesize
    });
  }

  /**
   * Obtiene eventos recientes (últimos años disponibles)
   */
  async getRecentEvents(pagesize = 100) {
    const currentYear = new Date().getFullYear();
    return await this.getGeoEvents({
      year: currentYear - 1, // Año anterior (datos más recientes completos)
      pagesize: pagesize
    });
  }

  /**
   * Obtiene eventos por región geográfica
   * @param {number} region - ID de región (1=Europa, 2=Medio Oriente, 3=Asia, 4=África, 5=Américas)
   */
  async getEventsByRegion(region, year, pagesize = 1000) {
    return await this.getGeoEvents({
      region: region,
      year: year,
      pagesize: pagesize
    });
  }

  /**
   * Función de prueba con países de ejemplo
   */
  async testMexicoColombia() {
    try {
      console.log('Prueba con Mexico y Colombia');
      
      const year = 2023;
      
      // Obtener eventos de México
      const mexicoData = await this.getEventsByCountryAndYear('Mexico', year, 100);
      
      console.log('Eventos en Mexico:', mexicoData.count);

      return mexicoData;
    } catch (error) {
      console.error('Error en prueba:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      throw error;
    }
  }
}

// Exportar una instancia única (Singleton)
module.exports = new UCDPService();
