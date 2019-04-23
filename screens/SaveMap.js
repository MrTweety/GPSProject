import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
    MapView,
    Constants,
    Permissions,
    Location,
    Marker,
  } from 'expo';


class HomeScreen extends Component {

    render() {
        const exampleRegion = {
            latitude: 50.0713231,
            longitude: 19.9404102,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };

          state = {

            coordinates1: [
              { latitude: 50.0713231, longitude: 19.9404102 },
              { latitude: 50.0709, longitude: 19.9415 },
              { latitude: 50.07205, longitude: 19.9429 },
              { latitude: 50.0729, longitude: 19.94308 },
              { latitude: 50.0532, longitude: 19.9619 },
            ],
        
            coordinates2: [
              { latitude: 50.0813231, longitude: 19.9504102 },
              { latitude: 50.0809, longitude: 19.9515 },
              { latitude: 50.07205, longitude: 19.9429 },
              { latitude: 50.0729, longitude: 19.94308 },
              { latitude: 50.0632, longitude: 19.9719 },
            ],
        
                coordinates3: [
              { latitude: 50.0813231, longitude: 19.9504102 },
              { latitude: 50.0909, longitude: 19.9615 },
              { latitude: 50.07205, longitude: 19.9429 },
              { latitude: 50.0729, longitude: 19.94308 },
              { latitude: 50.0732, longitude: 19.9819 },
            ],
          };


        return  (
        <View style={styles.container}>
        {!!exampleRegion && (
            <MapView
            style={{ flex: 1 }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            initialRegion={exampleRegion}
            provider="google"
            >
            


          </MapView>
        )}


      </View>
    );
    }
}


export default HomeScreen;


const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  
    
  });
  