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
        console.log('response:', response)
        console.log('typeof(response.address.city)', typeof(response.address.city))
        console.log('typeof(response.address.town)', typeof(response.address.town))
        console.log('typeof(response.address.village)', typeof(response.address.village))


        if(typeof(response.address.city) !== "undefined"){
            console.log('city:',response.address.city);
            return response.address.city;
          }
          else if(typeof response.address.town !== "undefined"){
            console.log('town:',response.address.town);
            return response.address.town;
          }
          else if(typeof response.address.village !== "undefined"){
            console.log('village:',response.address.village);
            return response.address.village;
          }
          // else console.log('no name:');
          

        return response.address.display_name;
      }


  }
  
  export default new GeolocationService();
  