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
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;

const LATITUDE_DELTA = 0.004;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// import geolocationService from './services/geolocationService';
const STORAGE_KEY = 'background-location-storage';
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

export default class MapScreen extends React.Component {
  static navigationOptions = {
    title: 'Background location',
  };

  mapViewRef = React.createRef();

  state = {
    accuracy: Location.Accuracy.Highest,
    isTracking: false,
    showsBackgroundLocationIndicator: false,
    savedLocations: [],
    geofencingRegions: [],
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
        const savedLocations = await getSavedLocations();
        const accuracy = (task && task.options.accuracy) || this.state.accuracy;

        this.eventSubscription = locationEventsEmitter.addListener(
          taskEventName,
          locations => {
            this.setState({ savedLocations: locations });
          }
        );

        if (!isTracking) {
          alert('Click `Start tracking` to start getting location updates.');
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
      showsBackgroundLocationIndicator: this.state
        .showsBackgroundLocationIndicator,
      deferredUpdatesInterval: 60 * 1000, // 1 minute
      deferredUpdatesDistance: 100, // 100 meters
      foregroundService: {
        notificationTitle: 'expo-location-demo',
        notificationBody: 'Background location is running...',
        notificationColor: '#4630ec',
      },
    });
    if (!this.state.isTracking) {
      alert(
        // tslint:disable-next-line max-line-length
        'Now you can send app to the background, go somewhere and come back here! You can even terminate the app and it will be woken up when the new significant location change comes out.'
      );
    }
    this.setState({ isTracking: true });
  }

  async stopLocationUpdates() {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    this.setState({ isTracking: false });
  }

  clearLocations = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    this.setState({ savedLocations: [] });
  };

  toggleTracking = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);

    if (this.state.isTracking) {
      await this.stopLocationUpdates();
    } else {
      await this.startLocationUpdates();
    }
    this.setState({ savedLocations: [] }); //TODO: wywalić?
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

  render() {


    return (
      <View style={styles.container}>
        {this.state.error ? (
          <Text style={styles.errorText}>{this.state.error}</Text>
        ) : null}

        {!!exampleRegion && (
          <MapView
            style={{ flex: 1 }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            ref={this.mapViewRef}
            initialRegion={this.state.initialRegion}
            provider="google">
            {this.renderPolyline()}
          </MapView>
        )}

        <View style={styles.buttons} pointerEvents="box-none">
          <View style={styles.topButtons}>
            <View style={styles.buttonsColumn}>
              {Platform.OS === 'android' ? null : (

                <Button
                style={styles.button}
                onPress={this.onCenterMap}
                icon={{ name: 'location-arrow',type: 'font-awesome', size: 18, color: 'white' }}
                iconLeft
                title={(!this.state.showsBackgroundLocationIndicator
                      ? 'Hide'
                      : 'Show') + ' background indicator'}
              />

  

              )}
              <Button
                title={`Accuracy: ${Location.Accuracy[this.state.accuracy].toString()}`}
                style={styles.button}
                onPress={this.onAccuracyChange}
              />
            </View>
            <View style={styles.buttonsColumn}>
              <Button
                style={styles.button}
                onPress={this.onCenterMap}
                icon={{ name: 'my-location', size: 18, color: 'white' }}
                iconLeft
              />
            </View>
          </View>

          <View style={styles.bottomButtons}>
            <Button
              title="Clear Locations"
              style={styles.button}
              onPress={this.clearLocations}
            />
            <Button
              title={(this.state.isTracking
                ? 'Stop tracking'
                : 'Start tracking'
              ).toString()}
              style={styles.button}
              onPress={this.toggleTracking}
            />
          </View>
        </View>
      </View>
    );
  }
}

async function getSavedLocations() {
  try {
    const item = await AsyncStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (e) {
    return [];
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
      const savedLocations = await getSavedLocations();
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
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  buttonsColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  errorText: {
    fontSize: 15,
    color: 'rgba(0,0,0,0.7)',
    margin: 20,
  },
});
