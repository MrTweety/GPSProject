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
  PixelRatio,
  TouchableOpacity,
  Picker,

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
  KeepAwake
} from 'expo';
import { EventEmitter, EventSubscription } from 'fbemitter';
import { NavigationEvents } from 'react-navigation';
import { FontAwesome, MaterialIcons,Entypo } from '@expo/vector-icons';
import moment from "moment";
import DialogInput from '../Explore/MyDialogImputs';
import geolocationService from '../Explore/geolocationService';


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

import {getSavedLocations, STORAGE_KEY_USER_ROUTERS, STORAGE_KEY, STORAGE_KEY_USER_DISTANCE } from '../Explore/MyStorage.js'
import haversine from '../Explore/MyHaversine'




const LOCATION_TASK_NAME = 'background-location-task';
const taskEventName = 'task-update';

const locationEventsEmitter = new EventEmitter();
const distanceEventsEmitter = new EventEmitter();

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

  Number.prototype.round = function(place) {
    return +(Math.round(this+"e+" + place)+ "e-" + place);
}



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
    distance: 0,
    isDialogVisible_StopDecision: false,
    isDialogVisible_DiscardDecision:false,
    trackName: "Track name",
    category: "B",
    translateX: new Animated.Value(screen.width-140),
    fadeAnim: new Animated.Value(0),
  };

  


  keepAwakeActivate = () => {
    KeepAwake.activate();
  }

  keepAwakeDeactivate = () => {
    // KeepAwake.deactivate();//TODO:odkomentowac to w finalnej wersji :D 
  }
  
  componentDidMount() {
    this.getLocationAsync();
    this.keepAwakeActivate();//TODO: wywalić w finalnej wersji :D
    this.keepAwakeDeactivate();
  }

 eventSubscription ;
 eventSubscriptionDistance ;

  getLocationAsync = async () => {
    const response = await Permissions.askAsync(Permissions.LOCATION).then(
      r => r.status
    );

    if (response !== 'granted') {
      AppState.addEventListener('change', this.handleAppStateChange);
      this.setState({

        error:
          'Location permissions are required in order to use this feature. You can manually enable them at any time in the "Location Services" section of the Settings app.',
      });

      return;
    } else {
      this.setState({ error: undefined });
    }
    var count = 0;
    const getLoc = setInterval(async () => {
      const locationStatus = await Location.getProviderStatusAsync({
        accuracy: this.state.accuracy,
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

        this.eventSubscriptionDistance = distanceEventsEmitter.addListener(
          taskEventName,
          distance => {
            this.setState({ distance: distance });
          }
        );


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
    this.keepAwakeActivate();
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy,
      showsBackgroundLocationIndicator: this.state.showsBackgroundLocationIndicator,
      timeInterval: 2500,
      distanceInterval: 5,
      foregroundService: {
        notificationTitle: 'expo-location-demo',
        notificationBody: 'Background location is running...',
        notificationColor: '#463',
      }
    });

    this.startTimer();
  }

  async stopLocationUpdates() {
    this.keepAwakeDeactivate();
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    this.stopTimer();
  }

  async stopLocationSave() {
    const {savedLocations, timerStart, trackName, distance, category } = this.state;

    if(savedLocations && savedLocations.length>1){

    const savedRouters = await getSavedLocations(STORAGE_KEY_USER_ROUTERS);

    //TODO:zapis serwer




    if(savedLocations){
      console.log('savedLocations:', savedLocations)
      
      const locStart = await geolocationService.fetchNameInfo(savedLocations[0]);
      let index = savedLocations[savedLocations.length-1];

      const locEnd = await geolocationService.fetchNameInfo(index);

      savedRouters.push(...[
        {
          coordinates: savedLocations,
          timeStart: timerStart , 
          timeEnd: new Date().getTime(),
          trackName: trackName,
          distance: (distance).round(3),
          category: category,
          locStart: locStart,
          locEnd: locEnd,

        }]);

    }

    await AsyncStorage.setItem(STORAGE_KEY_USER_ROUTERS, JSON.stringify(savedRouters));
  }
  }




  clearLocations = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    this.setState({ savedLocations: [] });
  };

  showSaveDialog(isShow){
    this.setState({isDialogVisible_StopDecision: isShow});
  }

  stopAndSaveDialog(inputText){
    this.setState({isDialogVisible_StopDecision: false,
      trackName:inputText});
      this.stopTracking(true);
  }


  showDiscard(isShow){
    this.setState({isDialogVisible_StopDecision: false});
    this.setState({isDialogVisible_DiscardDecision: isShow});
  }

  discard(){
    // console.log("discard");
    this.stopTracking(false);
    this.setState({isDialogVisible_DiscardDecision: false});
  }

  


  stopTracking = async (save = true) => {

    await this.stopLocationUpdates();
    this.setState({ isTracking: false });
    this.animatedToggleTracking();
    if(save)
      this.stopLocationSave();
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(STORAGE_KEY_USER_DISTANCE);
    this.setState({ savedLocations: [], 
      timerDuration: 0 }); 
    

  };

  toggleTracking = async () => {


    if (this.state.isTracking) {
      if(this.state.savedLocations && this.state.savedLocations.length>1){
        this.showSaveDialog(true);
        
      }else{
        this.stopTracking(false);
        
      }


    } else {
      await this.startLocationUpdates();
      this.setState({ isTracking: true });
    }


    this.animatedToggleTracking();
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
      this.setState({ timerNow: new Date().getTime() })
  },1000)
}
stopTimer = () =>{
  clearInterval(this.timer);
}

  render() {

    var timer = 0;
    this.state.isPause 
    ? timer = this.state.timerNow - this.state.timerStart + this.state.timerDuration
    : timer = this.state.timerNow - this.state.timerStart + this.state.timerDurationNew

    this.state.isTracking ? this.animatedToggleTracking() : null;

    const translateX = this.state.translateX;
    return (
      <View style={styles.container}>
        {this.state.error ? (
          <Text style={styles.errorText}>{this.state.error}</Text>
        ) : null}
        
        {!!exampleRegion && (
          <MapView
            style={{ flex: 1 }}
            legalLabelInsets={{bottom:200}}
            showsUserLocation={true}
            showsMyLocationButton={false}
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
                <Text style={{ color:'white', fontSize:18, textAlign:'center'}}>{(this.state.distance).round(3)}km</Text>
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

      <DialogInput 
        isDialogVisible={this.state.isDialogVisible_StopDecision}
        title={"Stop and save"}
        message={"Track name"}
        hintInput ={"Track name"}
        initValueTextInput={"Track name"}
        submitInput={ (inputText) => {this.stopAndSaveDialog(inputText)} }
        closeDialog={ () => {this.showSaveDialog(false)}}
        opcionalAction ={ () => {this.showDiscard(true)}}
        opcionalTextVisible = {true}
        cancelText={"Cancel"}
        submitText={"SAVE"}
        opcionalText={"DISCARD"}>
          <Text 
            style={{
              fontSize: 16,
              ...Platform.select({
                ios: {
                  textAlign:'center',
                  marginBottom: 10,
                },
                android: {
                  textAlign:'left',
                  marginTop: 0
                },
              })
          }}
          >
            Track category:
          </Text>
          <Picker
            selectedValue={this.state.category}
            style={{padding:10}}
            onValueChange={(itemValue, itemIndex) =>
              this.setState({category: itemValue})
            }>
            <Picker.Item label="A" value="A" />
            <Picker.Item label="B" value="B" />
            <Picker.Item label="B1" value="B1" />
            <Picker.Item label="B2" value="B2" />
            <Picker.Item label="C" value="C" />
            <Picker.Item label="T" value="T" />
            <Picker.Item label="A1" value="A1" />
          </Picker>
      </DialogInput>

      <DialogInput isDialogVisible={this.state.isDialogVisible_DiscardDecision}
        title={"Do you want to discard this track?"}
        message={"Recording will be stopped."}
        textInputVisible = {false}
        submitInput={ () => {this.discard()} }
        closeDialog={ () => {this.showDiscard(false)}}
        submitText={"DISCARD"}>
      </DialogInput>

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

      endElement = savedLocations[savedLocations.length - 1];

      savedLocations.push(...newLocations);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedLocations));  
      locationEventsEmitter.emit(taskEventName, savedLocations);

      const savedDistance= await getSavedLocations(STORAGE_KEY_USER_DISTANCE);

      if(savedDistance == null || savedDistance.length == 0){
        
        distance = 0;
      }
      else
      {
        console.log('myhaversine: ',haversine(endElement,newLocations[0],{unit:'km'}));

        distance = parseFloat(savedDistance) + haversine(endElement,newLocations[0],{unit:'km'});
      }
      await AsyncStorage.setItem(STORAGE_KEY_USER_DISTANCE, JSON.stringify(distance));  
      distanceEventsEmitter.emit(taskEventName, distance);      
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
