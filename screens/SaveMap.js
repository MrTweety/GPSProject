import React, { Component, PropTypes} from 'react';
import {Alert, View, Text, Animated, StyleSheet,TouchableOpacity, PanResponder, Dimensions,Image, ScrollView } from 'react-native';
import {
    MapView,

  } from 'expo';

  import MyItem from '../Explore/MyItems'



  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;

  const LATITUDE_DELTA = 0.0922;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

var coordinates = {
  route: [
    {  id: 0,
      coordinates: [
      { latitude: 50.0513231, longitude: 19.9504102 },
      { latitude: 50.0709, longitude: 19.9415 },
      { latitude: 50.07205, longitude: 19.9429 },
      { latitude: 50.0729, longitude: 19.94308 },
      { latitude: 50.0532, longitude: 19.9619 },
    ]},
    {  id: 1,
      coordinates: [
      { latitude: 50.0113231, longitude: 19.9504102 },
      { latitude: 50.0709, longitude: 19.9415 },
      { latitude: 50.07205, longitude: 19.9429 },
      { latitude: 50.0729, longitude: 19.94308 },
      { latitude: 50.0532, longitude: 19.9619 },
    ]},
    {  id: 2,
      coordinates: [
      { latitude: 50.0113231, longitude: 19.9504102 },
      { latitude: 50.0709, longitude: 19.9415 },
      { latitude: 50.07205, longitude: 19.9429 },
      { latitude: 50.0729, longitude: 19.94308 },
      { latitude: 50.0532, longitude: 19.9619 },
    ]},
    {  id: 3,
      coordinates: [
      { latitude: 50.0113231, longitude: 19.9504102 },
      { latitude: 50.0709, longitude: 19.9415 },
      { latitude: 50.07205, longitude: 19.9429 },
      { latitude: 50.0729, longitude: 19.94308 },
      { latitude: 50.0532, longitude: 19.9619 },
    ]},
    {  id: 4,
      coordinates: [
      { latitude: 50.0113231, longitude: 19.9504102 },
      { latitude: 50.0709, longitude: 19.9415 },
      { latitude: 50.07205, longitude: 19.9429 },
      { latitude: 50.0729, longitude: 19.94308 },
      { latitude: 50.0532, longitude: 19.9619 },
    ]},
    {  id: 5,
      coordinates: [
      { latitude: 51.0113231, longitude: 20.9504102 },
      { latitude: 50.0709, longitude: 19.9415 },
      { latitude: 50.07205, longitude: 19.9429 },
      { latitude: 50.0729, longitude: 19.94308 },
      { latitude: 50.0532, longitude: 19.9619 },
    ]}
  ]
};



class MapScreen2 extends Component {
    state = {
        coordinatesMy:[],

        exampleRegion: {
          latitude: 50.0713231,
          longitude: 19.9404102,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }
      };

      componentDidMount(){

        if(coordinates.route[0].coordinates){
          this.setState((state)=>({ 
            coordinatesMy: coordinates.route[0].coordinates ,
            exampleRegion:{
              latitude: coordinates.route[0].coordinates[0].latitude,
              longitude: coordinates.route[0].coordinates[0].longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,

            }
          }));
        }

      }

      updateMap = (id) => {
      // console.log('id', id);
      const latitude = coordinates.route[id].coordinates[0].latitude;
      const longitude = coordinates.route[id].coordinates[0].longitude;
      const latitudeDelta = this.state.exampleRegion.latitudeDelta;
      const longitudeDelta = this.state.exampleRegion.longitudeDelta;

      this.setState(()=>({ 
        coordinatesMy: coordinates.route[id].coordinates ,
        exampleRegion:{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
        }
      }));
      this.map.animateToRegion({
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
      });
     }

    render() {


          const {
            coordinatesMy,
            exampleRegion
          } = this.state;
          // console.log('exampleRegion:', exampleRegion)

          // console.log('coordinates1:', coordinates1)
          // console.log('coordinates:', coordinates.route[1].coordinates)
          // console.log('coordinatesMy:', coordinatesMy)



        return(

        <View style={styles.container}>
        <View style = {{flex:1, backgroundColor:'white', paddingTop:20, margin: 0}}>
            <Text style={{ fontSize:18, fontWeight: '700', paddingHorizontal: 20}}>
            Twoje Trasy:
            </Text>
            <View style = {{height:130, marginTop:20}}>
                <ScrollView 
                horizontal = {true}
                showsHorizontalScrollIndicator = {false}>

                {
                  coordinates.route.map((myRoute) =>{
                    {/* const latitude = myRoute.coordinates[0].latitude;
                    const longitude = myRoute.coordinates[0].longitude;
                    const latitudeDelta = LATITUDE_DELTA;
                    const longitudeDelta = LONGITUDE_DELTA; */}
                    
                  return (
                  <MyItem imageUri = {require('../assets/logo1.png')}
                        text = {'trasa '+(myRoute.id + 1)} myOnPress = { ()=>this.updateMap(myRoute.id)}  key = {myRoute.id}

                        // myExampleRegion = {{
                        //   latitude: latitude,
                        //   longitude:longitude,
                        //   latitudeDelta: latitudeDelta,
                        //   longitudeDelta: longitudeDelta
                        // }} 
                        // myCoordinates = {myRoute.coordinates}
                        />
                  ); 

                  })
                  }

                </ScrollView>
            </View>


            <View style={{ flex: 2, borderRadius:20, padding:20, margin:0}}>
            {!!exampleRegion && (
                <MapView
                style={{ flex: 1 }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                initialRegion={exampleRegion}
                provider="google"
                ref={map => {
                  this.map = map;
                }}
                >
                            {coordinatesMy.length > 1 ? (
              <MapView.Polyline
                coordinates={coordinatesMy}
                strokeColor="red" 
                strokeWidth={4}
              />
            ) : (
              false
            )}
                

            </MapView>
            )}
        </View>
        </View>
      </View>
    );
    }
}


export default MapScreen2;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      margin: 0,
      backgroundColor:'blue',
    },
  
    
  });
  