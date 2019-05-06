import React from 'react';
import {
  Platform,
  StyleSheet,
  Dimensions,
  Text,
  View,
  Animated,
  ScrollView,
  Alert,
  AsyncStorage,
  AppState,
  PixelRatio
} from 'react-native';
import { Button } from 'react-native-elements';
import {
  IntentLauncherAndroid,
  MapView,
  Constants,
  Permissions,
  Location,
  Marker,
  TaskManager,
} from 'expo';
import { EventEmitter, EventSubscription } from 'fbemitter';
import { NavigationEvents } from 'react-navigation';
import { FontAwesome, MaterialIcons,Entypo } from '@expo/vector-icons';
import moment from "moment";

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const mapPaddingBottom = screen.height * 0.55;
const mapPaddingTop = screen.height * 0.1;

const LATITUDE_DELTA = 0.004;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const COLOR_BUTTON_TEXT = 'rgba(0,0,0,0.7)';

// import geolocationService from './services/geolocationService';
// const STORAGE_KEY = 'background-location-storage';
// const STORAGE_KEY_USER_ROUTERS = 'USER_ROUTERS-storage';

import {getSavedLocations, STORAGE_KEY_USER_ROUTERS, STORAGE_KEY  } from '../Explore/MyStorage.js'


const LOCATION_TASK_NAME = 'background-location-task';
const taskEventName = 'task-update';

const locationEventsEmitter = new EventEmitter();

const locationAccuracyStates = {
  [Location.Accuracy.Lowest]: Location.Accuracy.Low,
  [Location.Accuracy.Low]: Location.Accuracy.Balanced,
  [Location.Accuracy.Balanced]: Location.Accuracy.High,
  [Location.Accuracy.High]: Location.Accuracy.Highest,
  [Location.Accuracy.Highest]: Location.Accuracy.BestForNavigation,
  [Location.Accuracy.BestForNavigation]: Location.Accuracy.Lowest,
};

const exampleRegion = {
  latitude: 50.0713231,
  longitude: 19.9404102,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

function Timer(props){
  const duration = moment.duration(props.interval);
  return (
    <Text style={props.myStyleText}>
      {duration.hours() > 9 ? duration.hours() : '0' + duration.hours()}:
      {duration.minutes() > 9 ? duration.minutes() : '0' + duration.minutes()}:
      {duration.seconds() > 9 ? duration.seconds() : '0' + duration.seconds()}
    </Text>
  );}

export default class MapScreen extends React.Component {
  static navigationOptions = {
    title: 'Background location',
  };

  mapViewRef = React.createRef();

  state = {
    accuracy: Location.Accuracy.Highest,
    isTracking: false,
    isPause: false,
    showsBackgroundLocationIndicator: false,
    savedLocations: [],
    geofencingRegions: [],
    timerStart: 0,
    timerNow: 0,
    timerDuration: 0,
    timerDurationNew: 0,
    translateX: new Animated.Value(screen.width-140),
    fadeAnim: new Animated.Value(0),
  };

  componentDidMount() {
    this.getLocationAsync();
  }

  eventSubscription;

  getLocationAsync = async () => {
    const response = await Permissions.askAsync(Permissions.LOCATION).then(
      r => r.status
    );

    if (response !== 'granted') {
      AppState.addEventListener('change', this.handleAppStateChange);
      this.setState({
        // tslint:disable-next-line max-line-length
        error:
          'Location permissions are required in order to use this feature. You can manually enable them at any time in the "Location Services" section of the Settings app.',
      });

      // alert('error: Location permissions are required in order to use this feature. You can manually enable them at any time in the "Location Services" section of the Settings app.',
      // );
      return;
    } else {
      this.setState({ error: undefined });
    }
    var count = 0;
    const getLoc = setInterval(async () => {
      const locationStatus = await Location.getProviderStatusAsync({
        accuracy: 5,
      });
      if (Platform.OS !== 'android' || locationStatus.networkAvailable) {
        clearInterval(getLoc);

        const { coords } = await Location.getCurrentPositionAsync();
        const isTracking = await Location.hasStartedLocationUpdatesAsync(
          LOCATION_TASK_NAME
        );
        const task = (await TaskManager.getRegisteredTasksAsync()).find(
          ({ taskName }) => taskName === LOCATION_TASK_NAME
        );
        const savedLocations = await getSavedLocations(STORAGE_KEY);
        const accuracy = (task && task.options.accuracy) || this.state.accuracy;

        this.eventSubscription = locationEventsEmitter.addListener(
          taskEventName,
          locations => {
            this.setState({ savedLocations: locations });
          }
        );

        if (!isTracking) {
          // alert('Click `Start tracking` to start getting location updates.');
        }

        this.setState({
          accuracy,
          isTracking,
          showsBackgroundLocationIndicator:
            task && task.options.showsBackgroundLocationIndicator,
          savedLocations,
          initialRegion: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          },
        });
      } else {
        ++count;
        if (count > 3) {
          clearInterval(getLoc);
          Alert.alert(
            'Location',
            'Please set Location method to High Accuracy!',
            [{ text: 'OK', onPress: () => this.openLocationMenu() }],
            { cancelable: false }
          );
          this.setState({
            error: 'Please set Location method to High Accuracy!',
          });
        } else {
          this.openLocationMenu();
          this.setState({
            error: 'Please set Location method to High Accuracy!',
          });
        }
      }
    }, 1000);
  };

  handleAppStateChange = nextAppState => {
    if (nextAppState !== 'active') {
      return;
    }

    if (this.state.initialRegion) {
      AppState.removeEventListener('change', this.handleAppStateChange);
      return;
    }

    this.getLocationAsync();
  };

  componentWillUnmount() {
    if (this.eventSubscription) {
      this.eventSubscription.remove();
    }
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  async startLocationUpdates(accuracy = this.state.accuracy) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy,
      showsBackgroundLocationIndicator: this.state.showsBackgroundLocationIndicator,
      deferredUpdatesInterval: 30 * 1000, // 30sec
      deferredUpdatesDistance: 10, // 10 meters
      foregroundService: {
        notificationTitle: 'expo-location-demo',
        notificationBody: 'Background location is running...',
        notificationColor: '#463',
      },
    });
    // if (!this.state.isTracking) {
    //   alert(
    //     // tslint:disable-next-line max-line-length
    //     'Now you can send app to the background, go somewhere and come back here! You can even terminate the app and it will be woken up when the new significant location change comes out.'
    //   );
    // }
    // this.setState({ isTracking: true });
    this.startTimer();
  }

  async stopLocationUpdates() {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    // this.setState({ isTracking: false });
    this.stopTimer();
  }

  async stopLocationSave() {
    // await AsyncStorage.removeItem(STORAGE_KEY_USER_ROUTERS);

    if(this.state.savedLocations && this.state.savedLocations.length>1){

    const savedRouters = await getSavedLocations(STORAGE_KEY_USER_ROUTERS);
    console.log('savedRouters:', savedRouters)

    savedRouters.push(...[
      {
        coordinates: this.state.savedLocations,
        timeStart:this.state.timerStart , 
        timeEnd: new Date().getTime()
      }]);
    console.log('savedRouters:', savedRouters)
    // console.log('savedLocations:', this.state.savedLocations)
    await AsyncStorage.setItem(STORAGE_KEY_USER_ROUTERS, JSON.stringify(savedRouters));
  }
  }




  clearLocations = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    this.setState({ savedLocations: [] });
  };

  toggleTracking = async () => {


    if (this.state.isTracking) {
      await this.stopLocationUpdates();
      this.setState({ isTracking: false });
      this.stopLocationSave();
      await AsyncStorage.removeItem(STORAGE_KEY);

    } else {
      await this.startLocationUpdates();
      this.setState({ isTracking: true });
    }


    this.animatedToggleTracking();
    this.setState({ savedLocations: [], //TODO: czy na pewno czycić tu? 
      timerDuration: 0 }); 
  };




  animatedToggleTracking = () => {
    Animated.spring(this.state.translateX, {
      toValue: !this.state.isTracking ? screen.width-140 : 0,
      velocity: 3,
    }).start();
    Animated.spring(this.state.fadeAnim, {
      toValue: !this.state.isTracking ? 0 : 1,
      velocity: 3,
    }).start(); 
  }

  togglePause = async () => {

    if (!this.state.isPause) {  
      await this.stopLocationUpdates();
      const timerDuration = this.state.timerDurationNew;
      const timerDurationNew = this.state.timerNow - this.state.timerStart + this.state.timerDurationNew;
      this.setState({ isPause: true,
        timerDuration: timerDuration,
        timerDurationNew: timerDurationNew,
      });
      
    } else {
      await this.startLocationUpdates();
      this.setState({ isPause: false });
    }
  };

  onAccuracyChange = () => {
    //TODO: czy na pewno potrzebne?
    const accuracy = locationAccuracyStates[this.state.accuracy];

    this.setState({ accuracy });

    if (this.state.isTracking) {
      // Restart background task with the new accuracy.
      this.startLocationUpdates(accuracy);
    }
  };

  toggleLocationIndicator = async () => {
    const showsBackgroundLocationIndicator = !this.state
      .showsBackgroundLocationIndicator;

    this.setState({ showsBackgroundLocationIndicator }, async () => {
      if (this.state.isTracking) {
        await this.startLocationUpdates();
      }
    });
  };

  onCenterMap = async () => {
    let response = await Permissions.askAsync(Permissions.LOCATION).then(
      r => r.status
    );
    if (response !== 'granted') {
      this.setState({
        errors: 'Please grant location permission in the system settings!',
      });
      return;
    }

    var count = 0;

    const getLoc = setInterval(async () => {
      const locationStatus = await Location.getProviderStatusAsync({
        accuracy: this.state.accuracy,
      });
      if (Platform.OS !== 'android' || locationStatus.networkAvailable) {
        clearInterval(getLoc);
        const { coords } = await Location.getCurrentPositionAsync();
        const mapView = this.mapViewRef.current;
        //TODO: obecna latitudeDelta i longitudeDelta
        if (mapView) {
          mapView.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
        }
      } else {
        ++count;
        if (count > 3) {
          clearInterval(getLoc);
          Alert.alert(
            'Location',
            'Please set Location method to High Accuracy!',
            [{ text: 'OK', onPress: () => this.openLocationMenu() }],
            { cancelable: false }
          );
          this.setState({
            error: 'Please set Location method to High Accuracy!',
          });
        } else {
          this.openLocationMenu();
          this.setState({
            error: 'Please set Location method to High Accuracy!',
          });
        }
      }
    }, 1000);
  };

  openLocationMenu = () => {
    // Open location settings
    if (Platform.OS === 'android')
      IntentLauncherAndroid.startActivityAsync(
        IntentLauncherAndroid.ACTION_LOCATION_SOURCE_SETTINGS
      ).then(async () => {
        const locationStatus = await Location.getProviderStatusAsync({
          accuracy: this.state.accuracy,
        });
        if (Platform.OS !== 'android' || locationStatus.networkAvailable) {
          this.setState({
            error: '',
          });
        }
      });
  };

  renderPolyline() {
    const { savedLocations } = this.state;

    if (savedLocations.length === 0) {
      return null;
    }
    this.onCenterMap();
    return (
      // @ts-ignore
      <MapView.Polyline
        coordinates={savedLocations}
        strokeWidth={3}
        strokeColor={'#4630ec'}
      />
    );
  }

  setMapPadding = () => {
    const iosEdgePadding = { top: mapPaddingTop * 0.5, right: 0, bottom: mapPaddingBottom * 0.95, left: 0 };
    const androidEdgePadding = { top: PixelRatio.getPixelSizeForLayoutSize(screen.height * 0), right: 0, bottom: PixelRatio.getPixelSizeForLayoutSize(screen.height * 0.17), left: 0 };
    const edgePadding = (Platform.OS === 'android') ? androidEdgePadding : iosEdgePadding;
    return edgePadding;
}

startTimer = () =>{
  const timerNow = new Date().getTime();
  this.setState({
    timerStart: timerNow,
    timerNow: timerNow,
  });
  this.timer = setInterval(()=> {
    // if(this.state.isTracking)
      this.setState({ timerNow: new Date().getTime() })
  },1000)
}
stopTimer = () =>{
  // this.setState({
  //   timerStart: 0,
  //   timerNow: 0,
  // });
  clearInterval(this.timer);
}

  render() {
    var timer = 0;
    this.state.isPause 
    ? timer = this.state.timerNow - this.state.timerStart + this.state.timerDuration
    : timer = this.state.timerNow - this.state.timerStart + this.state.timerDurationNew

    this.state.isTracking ? this.animatedToggleTracking() : null;
    // this.animatedToggleTracking() ;

    const translateX = this.state.translateX;
    return (
      <View style={styles.container}>
        {this.state.error ? (
          <Text style={styles.errorText}>{this.state.error}</Text>
        ) : null}

        {!!exampleRegion && (
          <MapView
            style={{ flex: 1 }}
            // mapPadding={this.setMapPadding()} //Goolge label 
            legalLabelInsets={{bottom:200}}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsScale={true}
            ref={this.mapViewRef}
            initialRegion={this.state.initialRegion}
            provider="google"
            >

            {this.renderPolyline()}
          </MapView>
        )}

        <View style={styles.buttons} pointerEvents="box-none">
          <View style={styles.topButtons}>
            <View style={styles.buttonsColumn}>
              {Platform.OS === 'android' ? null : (

                <Button
                buttonStyle={[styles.bubble, styles.button]}
                titleStyle ={{color: COLOR_BUTTON_TEXT}}
                onPress={this.onCenterMap}
                icon={{ name: 'location-arrow',type: 'font-awesome', size: 18, color: COLOR_BUTTON_TEXT }}
                iconLeft
                title={(!this.state.showsBackgroundLocationIndicator
                      ? 'Hide'
                      : 'Show') + ' background indicator'}
              />

  

              )}
              <Button
                title={`Accuracy: ${Location.Accuracy[this.state.accuracy].toString()}`}
                style={styles.bubble}
                onPress={this.onAccuracyChange}
              />
            </View>
          </View>
          <View style={styles.buttonsColumn}>
            <View style={styles.bottomButtons}>
              <Button
              buttonStyle={[ styles.circleButton]}
                onPress={this.onCenterMap}
                icon={{ name: 'my-location', size: 25, color: COLOR_BUTTON_TEXT }}
                iconLeft
              />
            </View>
          

          <View style={styles.bottomButtons}>
            {/* <Button
              title="Clear Locations"
              buttonStyle={[styles.bubble]}
              titleStyle ={{color: COLOR_BUTTON_TEXT}}
              onPress={this.clearLocations}
            /> */}
            {this.state.isTracking || 1
            ?
            <Animated.View style={{flexDirection: 'row',opacity: this.state.fadeAnim, transform: [{translateX}]}}>
            <View style={{backgroundColor:COLOR_BUTTON_TEXT, width:screen.width-140, height:50, borderRadius:50, 
                flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20}}>
              <View >
                <Timer interval = {timer} myStyleText={{color:'white', fontSize:18, textAlign:'center'}} />  
                <Text style={{ fontSize:14, textAlign:'center'}}>duration</Text>
              </View>
              <View>
                <Text style={{ color:'white', fontSize:18, textAlign:'center'}}>24.33 km</Text>
                <Text style={{ fontSize:14, textAlign:'center'}}>distance</Text>
              </View>
              
            </View>

            <Button
              buttonStyle={[ styles.circleButton]}
              onPress={this.onCenterMap}
              icon={(!this.state.isPause
              ? {name: 'controller-paus', type: 'entypo', size: 25, color: COLOR_BUTTON_TEXT}
              : {name: 'controller-play', type: 'entypo', size: 25, color: COLOR_BUTTON_TEXT})}
              iconLeft
              onPress={this.togglePause}
            />
            </Animated.View>
            : null
            }
            <Button
              buttonStyle={[ styles.circleButton]}
              onPress={this.onCenterMap}
              icon={(!this.state.isTracking
                ? { name: 'controller-play', type: 'entypo', size: 25, color: 'green'}
                :{ name: 'controller-stop', type: 'entypo', size: 25, color: 'red'})}
              iconLeft
              onPress={this.toggleTracking}
            />

          </View>
        </View>
      </View>
      <View style={styles.mapDrawerOverlay} />
    </View>
    );
  }
}






TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data: { locations }, error }) => {
    if (error) {
      // Error occurred - check `error.message` for more details.
      Alert.alert(error.message);
      return;
    }
    if (locations && locations.length > 0) {
      const savedLocations = await getSavedLocations(STORAGE_KEY);
      const newLocations = locations.map(({ coords }) => ({
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));

      console.log(`Received new locations at ${new Date()}:`, locations);
      savedLocations.push(...newLocations);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedLocations));
      locationEventsEmitter.emit(taskEventName, savedLocations);

    }
  }
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttons: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomButtons: {

    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom:10,
  },
  buttonsColumn: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom:10,
    
  },

  errorText: {
    fontSize: 15,
    color: 'rgba(0,0,0,0.7)',
    margin: 20,
  },

  mapDrawerOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    opacity: 0.0,
    height: Dimensions.get('window').height,
    width: 20,
  },

  circleButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width:50,
    height:50,
    borderRadius: 50,
    marginLeft:10,
    padding: 0,
 
  },
});
