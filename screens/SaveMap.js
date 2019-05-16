import React, { Component, PropTypes} from 'react';
import {AsyncStorage, Alert, View, Text, Animated, StyleSheet,TouchableOpacity, PanResponder, Dimensions,Image, ScrollView } from 'react-native';
import {
    MapView,

  } from 'expo';

  import MyItem from '../Explore/MyItems'
  import {getSavedLocations,STORAGE_KEY_USER_ROUTERS } from '../Explore/MyStorage.js'

  // const STORAGE_KEY_USER_ROUTERS = 'USER_ROUTERS-storage';
  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;

  const LATITUDE_DELTA = 0.004;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  var id = 0;
  var coordinates = [];
var coordinatess = {
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
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
        }
      };


      async componentWillUpdate(){
        coordinates = await getSavedLocations(STORAGE_KEY_USER_ROUTERS);
        // console.log(coordinates)
      }
      
      async componentDidMount(){
        coordinates = await getSavedLocations(STORAGE_KEY_USER_ROUTERS);
        // console.log(coordinates)

        // if(coordinates.route[0].coordinates){
        //   this.setState((state)=>({ 
        //     coordinatesMy: coordinates.route[0].coordinates ,
        //     exampleRegion:{
        //       latitude: coordinates.route[0].coordinates[0].latitude,
        //       longitude: coordinates.route[0].coordinates[0].longitude,
        //       latitudeDelta: LATITUDE_DELTA,
        //       longitudeDelta: LONGITUDE_DELTA,

        //     }
        //   }));
        // }

        if(coordinates[0].coordinates.length>0){
          // console.log('kghkh')
          this.setState((state)=>({ 
            coordinates: coordinates,
            coordinatesMy: coordinates[0].coordinates ,
            exampleRegion:{
              latitude: coordinates[0].coordinates[0].latitude,
              longitude: coordinates[0].coordinates[0].longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,

            }
          }));
        }



      }

      updateMap = (id) => {
      console.log('id', id);
      const latitude = coordinates[id].coordinates[0].latitude;
      const longitude = coordinates[id].coordinates[0].longitude;
      const latitudeDelta = this.state.exampleRegion.latitudeDelta;
      const longitudeDelta = this.state.exampleRegion.longitudeDelta;

      this.setState(()=>({ 
        coordinatesMy: coordinates[id].coordinates ,
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
      },1000);
     }

     onPressZoomIn() {
      this.region = {
        latitude: this.state.exampleRegion.latitude,
        longitude: this.state.exampleRegion.longitude,
        latitudeDelta: this.state.exampleRegion.latitudeDelta * 2,
        longitudeDelta: this.state.exampleRegion.latitudeDelta * ASPECT_RATIO  * 2
      }
  
      this.setState({
        exampleRegion: {
          latitudeDelta: this.region.latitudeDelta,
          longitudeDelta: this.region.longitudeDelta,
          latitude: this.region.latitude,
          longitude: this.region.longitude
        }
      })
      this.map.animateToRegion(this.region, 100);
    }
  
     onPressZoomOut() {
      region = {
        latitude: this.state.exampleRegion.latitude,
        longitude: this.state.exampleRegion.longitude,
        latitudeDelta: this.state.exampleRegion.latitudeDelta / 2,
        longitudeDelta: this.state.exampleRegion.latitudeDelta * ASPECT_RATIO / 2
      }
  
      this.setState({
        exampleRegion: {
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
          latitude: region.latitude,
          longitude: region.longitude
        }
      })
      this.map.animateToRegion(region, 100);
    }

    onRegionChange(region, lastLat, lastLong) {
      this.setState({
        exampleRegion: region,
           lastLat: lastLat || this.state.lastLat,
           lastLong: lastLong || this.state.lastLong
      });
  }




    render() {

      // console.log('coordinates:', coordinates)
          const {
            coordinatesMy,
            exampleRegion
          } = this.state;
          // console.log('exampleRegion:', exampleRegion)

          // console.log('coordinates1:', coordinates1)
          // console.log('coordinates:', coordinates.route[1].coordinates)
          // console.log('coordinatesMy:', coordinatesMy)
          // console.log('coordinates:', coordinates)



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
                  coordinates.map((currentValue,index ) =>{
                    {/* const latitude = myRoute.coordinates[0].latitude;
                    const longitude = myRoute.coordinates[0].longitude;
                    const latitudeDelta = LATITUDE_DELTA;
                    const longitudeDelta = LONGITUDE_DELTA; */}
                    
                  return (
                  <MyItem imageUri = {require('../assets/logo1.png')}
                        text = {'trasa '+(index + 1 )} myOnPress = { ()=>this.updateMap(index)}  onLongPressButton = { ()=>{Alert.alert('You long-pressed the button! ! '+ index)}} key = {index}

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


            <View style={{ flex: 2, padding:20, paddingBottom:0, margin:0, justifyContent: 'center',}}>
            {!!exampleRegion && (
                <MapView
                style={{ flex: 1}}
                // region={exampleRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                followUserLocation={true}
                onRegionChange={this.onRegionChange.bind(this)}
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
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress = {()=>this.onPressZoomOut()} style={[styles.bubble]} >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress = {()=>this.onPressZoomIn()} style={[styles.bubble]} >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>-</Text>
              </TouchableOpacity>
            </View>
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
    bubble: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      width:50,
      height:50,
      borderRadius: 30,
      marginTop: 10,
      marginLeft: 10,
      alignItems: 'center',
      justifyContent: 'center',
      fontSize:25,
    },



    buttonContainer: {
      flexDirection: 'column',
      marginVertical: 20,
      backgroundColor: 'transparent',
      flex: 1,
      position: 'absolute',
      bottom: 0,
    // left: 0,
    // right: 0,
    // backgroundColor: 'white',
    padding: 20,
    },
  
    
  });
  