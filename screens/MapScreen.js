import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import {AsyncStorage} from 'react-native';
import {
  IntentLauncherAndroid,
  MapView,
  Constants,
  Permissions,
  Location,
  Marker,
  TaskManager,
} from 'expo';
import { EventEmitter } from 'fbemitter';



// import geolocationService from './services/geolocationService';

const LOCATION_TASK_NAME = 'background-location-task';
const taskEventName = 'task-update';
const eventEmitter = new EventEmitter();

const exampleRegion = {
  latitude: 50.0713231,
  longitude: 19.9404102,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const ADDRESS_HEIGHT = 200; // tutaj ustaw tyle żeby zmieściły się dane adresowe
var abc;

export default class MapScreen extends React.Component {
  state = {
    taskData: null,
    isAddressVisible: false,
    translateY: new Animated.Value(ADDRESS_HEIGHT),
    coordinates2: [
      { latitude: 50.0713231, longitude: 19.9404102 },
      { latitude: 50.0709, longitude: 19.9415 },
      // { latitude: 50.07205, longitude: 19.9429 },
      // { latitude: 50.0729, longitude: 19.94308 },
      // { latitude: 50.0532, longitude: 19.9619 },
    ],

    coordinates3: [
      { latitude: 50.0813231, longitude: 19.9504102 },
      { latitude: 50.0809, longitude: 19.9515 },
      // { latitude: 50.07205, longitude: 19.9429 },
      // { latitude: 50.0729, longitude: 19.94308 },
      // { latitude: 50.0532, longitude: 19.9619 },
    ],

        coordinates4: [
      { latitude: 50.0813231, longitude: 19.9504102 },
      { latitude: 50.0909, longitude: 19.9615 },
      // { latitude: 50.07205, longitude: 19.9429 },
      // { latitude: 50.0729, longitude: 19.94308 },
      // { latitude: 50.0532, longitude: 19.9619 },
    ],
  };

  componentDidMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      Alert.alert(
        'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
      );
      this.getLocationAsync();
      this.fetchLocation();
      this.getLocationAsyncUpdate();
      this.eventSubscription = eventEmitter.addListener(taskEventName, data => {
        this.setState({ taskData: data });
      });
    } else {
      this.getLocationAsync();
      this.fetchLocation();
      this.getLocationAsyncUpdate();
      this.eventSubscription = eventEmitter.addListener(taskEventName, data => {
        this.setState({ taskData: data });
        console.log('data2:', data)
        this.addLocationToArray4(data);

        
      });
      
    }
  }
  componentWillUnmount() {
    this.eventSubscription.remove();
  }



  getLocationAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      this.setState({
        location: exampleRegion,
      });
    } else {
      const { coords } = await Location.getCurrentPositionAsync({});
      const latitude = coords.latitude;
      const longitude = coords.longitude;
      const latitudeDelta = 0.0922;
      const longitudeDelta = 0.0421;
      //console.log(coords);

      this.setState({
        location: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        mapTitle: null,
        mapDescription: coords.latitude + ', ' + coords.longitude,
      });
      this.map.animateToRegion({
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
      });
    }
  };


    getLocationAsyncUpdate = async () => {
    const location = await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Highest,
      
    });
  };

  async fetchLocation() {
    let response = await Permissions.askAsync(Permissions.LOCATION).then(
      r => r.status
    );
    if (response !== 'granted') {
      this.setState({
        errors: 'Please grant location permission in the system settings!',
      });
      return;
    }
    const getLoc = setInterval(async () => {
      const locationStatus = await Location.getProviderStatusAsync({
        accuracy: 5,
      });
      if (Platform.OS !== 'android' || locationStatus.networkAvailable) {
        clearInterval(getLoc);
        this.setState({ errors: '' });
        setInterval(async () => {
          const location = await Location.getCurrentPositionAsync({});
          if (location !== this.location) {
            this.addLocationToArray(location.coords);

            this.location = location;
            this.setState({
              locationGet: location,
              location: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              },
            });
          }
        }, 500);
        Location.watchPositionAsync(
          {
            accuracy: 5,
            distanceInterval: 1,
            enableHighAccuracy: true,
          },
          location => {
            this.setState({ locationWatch: location });
            this.addLocationToArrayWATCH(location.coords);
          }
        );
      } else {
        this.setState({
          errors: 'Please set Location method to High Accuracy!',
        });
        // Open location settings
        if (Platform.OS === 'android')
          IntentLauncherAndroid.startActivityAsync(
            IntentLauncherAndroid.ACTION_LOCATION_SOURCE_SETTINGS
          );
      }
    }, 1000);
  }

  addLocationToArray(location) {
    
    const { coordinates2 } = this.state;

    var a = coordinates2.length;
    //console.log(coordinates2[0].latitude)
    if (
      coordinates2[a - 1].latitude == location.latitude &&
      coordinates2[a - 1].longitude == location.longitude
    ) {
      return;
    }
    // console.log('location:', location)
    var joined = this.state.coordinates2.concat([
      {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    ]);
    this.setState({ coordinates2: joined });
  }

  addLocationToArrayWATCH(location) {
    const { coordinates3 } = this.state;

    var a = coordinates3.length;
    //console.log(coordinates2[0].latitude)
    if (
      coordinates3[a - 1].latitude == location.latitude &&
      coordinates3[a - 1].longitude == location.longitude
    ) {
      return;
    }

    var joined = this.state.coordinates3.concat([
      {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    ]);
    this.setState({ coordinates3: joined });
  }

    addLocationToArray4(location) {
    const { coordinates4 } = this.state;

    var a = coordinates4.length;
   // console.log(coordinates4[0].latitude)
    if (
      coordinates4[a - 1].latitude == location.latitude &&
      coordinates4[a - 1].longitude == location.longitude
    ) {
      return;
    }

    var joined = this.state.coordinates4.concat([
      {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    ]);
    this.setState({ coordinates4: joined });
  }

  handleMapPress = e => {
    const { coordinate } = e.nativeEvent;

    this.setState({
      location: coordinate,
      info: null,
      isAddressVisible: false,
      mapDescription: coordinate.latitude + ', ' + coordinate.longitude,
    });
  };

  handleMarkerPress = async e => {
    e.stopPropagation(); // to po to żeby nie wywołało się też this.handleMapPress
    const { info, location, isAddressVisible, mapTitle } = this.state;

    Animated.spring(this.state.translateY, {
      toValue: isAddressVisible ? ADDRESS_HEIGHT : 0,
      velocity: 3,
    }).start();

    if (!info && location) {
    //   const response = await geolocationService.fetchInfo(location);
      this.setState({
        info: response,
        mapTitle: response.address.city,
      });
      //console.log(response);
    }

    this.setState({
      isAddressVisible: !isAddressVisible,
    });
    this.marker.title = 'aaa';
  };

  renderInfoEntry(key, value) {
    return (
      <View key={key} style={styles.addressItem}>
        <Text style={styles.addressItemName}>{key}</Text>
        <Text>{value}</Text>
      </View>
    );
  }

  renderInfo() {
    const { info, translateY } = this.state;
    if (!info) {
      return null;
    }

    const { name, address, category, type } = info;
    return (
      <ScrollView>
        <Text style={styles.header}>{name}</Text>
        {Object.entries(address).map(([key, value]) =>
          this.renderInfoEntry(key, value)
        )}
        {this.renderInfoEntry('Category', category)}
        {this.renderInfoEntry('Type', type)}
      </ScrollView>
    );
  }

  stringifyLocation(location) {
    if (location)
      return location.coords.latitude + ' ' + location.coords.longitude;
  }

  render() {
    const {
      location,
      info,
      translateY,
      mapTitle,
      mapDescription,
      coordinates2,
      coordinates3,
      coordinates4,
      locationWatch,
      taskData,
      
    } = this.state;
    const coordinates = JSON.stringify(locationWatch);
    console.log('locationWatch:', locationWatch)
    console.log('taskData:', taskData)

    // console.log(location);
    _onMapReady=() =>{
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
          .then(granted => {
            this.setState({ paddingTop: 0 });
          });
      }

    return (
      <View style={styles.container}>
        {!!location && (
            <MapView
            style={{ flex: 1 }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onMapReady={this._onMapReady}
            ref={map => {
              this.map = map;
            }}
            onPress={this.handleMapPress}
            initialRegion={location}
            provider="google"
            >
            
            <MapView.Marker
              coordinate={location}
              title={this.state.info ? mapTitle : null}
              description={mapDescription}
              onPress={this.handleMarkerPress}
              draggable={true}
              onDragStart={this.handleMapPress}
              onDrag={this.handleMapPress}
              onDragEnd={this.handleMapPress}
              ref={marker => (this.marker = marker)}
            />
            {coordinates2.length > 1 ? (
              <MapView.Polyline
                coordinates={coordinates2}
                strokeColor="#63A0FF" 

                strokeWidth={8}
              />
            ) : (
              false
            )}

            {coordinates3.length > 1 ? (
              <MapView.Polyline
                coordinates={coordinates3}
                strokeColor="red" 
                strokeWidth={4}
              />
            ) : (
              false
            )}

{coordinates4.length > 1 ? (
              <MapView.Polyline
                coordinates={coordinates4}
                strokeColor="green" 
                strokeWidth={2}
              />
            ) : (
              false
            )}
          </MapView>
        )}

        <Text style={styles.cord}>
          {coordinates3 == 'b' ?  JSON.stringify(coordinates4) : false}
        </Text>

        <Text style={styles.cordd}>
          Location-Watch: {this.stringifyLocation(this.state.locationWatch)}
          {'\n'}
          Location-get: {this.stringifyLocation(this.state.locationGet)}
          {'\n'}
          
        </Text>

        {!!info && (
          <Animated.View
            style={[styles.address, { transform: [{ translateY }] }]}>
            <Text style={styles.text}>{info.display_name}</Text>
            {this.renderInfo()}
          </Animated.View>
        )}
      </View>
    );
  }
}

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }
  if (data) {
    const { locations } = data;
    const {coords} = locations[0];
    
    
    // console.log('locations1:', data)
    eventEmitter.emit(taskEventName, coords);
    // console.log('locations2:', locations[0].coords)
    // console.log('coords:', coords)

  }
});


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  address: {
    flex: 1,
    position: 'absolute',
    height: ADDRESS_HEIGHT,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
  },

  text: {
    flex: 1,
    color: 'blue',
  },
  cord: {
    flex: 1,
    left: 0,
    right: 0,
    position: 'absolute',
    top: 20,
    padding: 20,
    color: 'blue',
    backgroundColor: 'white',
    fontSize: 10,
  },

  cordd: {
    flex: 1,
    left: 0,
    right: 0,
    position: 'absolute',
    top: 80,
    padding: 20,
    color: 'red',
    backgroundColor: 'yellow',
    fontSize: 10,
  },

  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addressItem: {
    paddingVertical: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
  },
  addressItemName: {
    fontWeight: 'bold',
  },
});
