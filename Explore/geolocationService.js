class GeolocationService {
    API_URL = 'https://nominatim.openstreetmap.org/';
    format = 'jsonv2';
    zoom = 18;
  
    constructor(config) {}
  
    async fetchInfo(location) {
      const { latitude, longitude } = location;
      const { API_URL, format, zoom } = this;
  
      const url = `${API_URL}reverse?format=${format}&lat=${latitude}&lon=${longitude}&zoom=${zoom}&addressdetails=1`;
  
      const rawResponse = await fetch(url);
      return await rawResponse.json();
    }

    async fetchNameInfo(location) {
        const { latitude, longitude } = location;
        const { API_URL, format, zoom } = this;
    
        const url = `${API_URL}reverse?format=${format}&lat=${latitude}&lon=${longitude}&zoom=${zoom}&addressdetails=1`;
        const rawResponse = await fetch(url)
        const response =  await rawResponse.json();

        if(typeof(response.address.city) !== "undefined"){
            return response.address.city;
          }
          else if(typeof response.address.town !== "undefined"){
            return response.address.town;
          }
          else if(typeof response.address.village !== "undefined"){
            return response.address.village;
          }
        return response.address.display_name;
      }
  }
  
  export default new GeolocationService();
  