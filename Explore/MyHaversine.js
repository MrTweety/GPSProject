export default function haversine(startCoordinates, endCoordinates, options){
    var earthRadius= {
        km:    6371,
        mile:  3960,
        meter: 6371000,
    };

      //  to radians
    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    }



    option = options || {};
    Radius = option.unit in earthRadius ? earthRadius[option.unit] : earthRadius.km;
    // console.log('Radius:', Radius)
    // console.log('startCoordinates:', startCoordinates)
    // console.log('endCoordinates:', endCoordinates)

    var start = startCoordinates;
    var end = endCoordinates;

    var x1 = end.latitude-start.latitude;
    var dLat = x1.toRad();
    var x2 = end.longitude-start.longitude;
    var dLon = x2.toRad();
    lat1 = (start.latitude).toRad();
    lat2 = (end.latitude).toRad();
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                Math.cos(lat1) * Math.cos(lat2) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);  

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = Radius * c;                 


return d;

}