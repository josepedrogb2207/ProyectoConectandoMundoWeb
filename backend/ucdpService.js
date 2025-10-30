const axios = require('axios');

class UCDPService {
  constructor() {
    this.baseUrl = 'https://ucdpapi.pcr.uu.se/api/gedevents/25.1';
    this.mexicoCountryCode = 70;
  }


  async getMexicoEventsByYearRange(startYear, endYear, pagesize = 1000) {
    try {
      const params = { Country: this.mexicoCountryCode, StartDate: startYear + '-01-01', EndDate: endYear + '-12-31', pagesize: Math.min(pagesize, 1000) };
      const response = await axios.get(this.baseUrl, { params: params });
      return { success: true, data: response.data.Result, count: response.data.TotalCount };
    } catch (error) {
      throw new Error('Error: ' + error.message);
    }
  }
}

module.exports = new UCDPService();