import React, { Component} from 'react';
import {Button,AsyncStorage, Alert, View, Text, Animated, StyleSheet,TouchableOpacity, PanResponder, Dimensions,Image, ScrollView, RefreshControl  } from 'react-native';
import {
    MapView,

  } from 'expo';
  import moment from "moment";
  import BottomDrawer from 'rn-bottom-drawer';
  import { DataTable } from 'react-native-paper'
  import { Ionicons} from '@expo/vector-icons';

  import {getSavedLocations,STORAGE_KEY_USER_ROUTERS } from '../Explore/MyStorage.js'
  import DialogInput from '../Explore/MyDialogImputs';


  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;

  const LATITUDE_DELTA = 0.04;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


class ViewSaveMap extends Component {


  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const name = navigation.getParam('name', -1);
    const item = navigation.getParam('item', 0);



    this.state = {
      coordinatesMy:[],
      isDialogVisible_DeleteSaveRouteDecision: false,
      item:item,
      coordinatesMy: (item == [] ? [] : item.coordinates ),
      exampleRegion: {
          latitude: (item == [] ? 50.0713231 : item.coordinates[0].latitude ),
          longitude:(item == [] ? 19.9404102 : item.coordinates[0].longitude ),
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
      },
      refreshing: false,
    };
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

          const {
            exampleRegion,
            coordinatesMy,
          } = this.state;


        return(

        <View style={styles.container}>

        



            <View style={{ flex: 1, padding:0, paddingBottom:0, margin:0, justifyContent: 'center',}}>
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
        <BottomDrawer ref={ref => this.drawer = ref}
        containerHeight={2*screen.height/3 }
        offset={42}
        startUp={false}
        backgroundColor={'#fcf8e3'}
        onExpanded = {() => {this.setState({position:'UpPosition'})}}
        onCollapsed = {() => {this.setState({position:'DownPosition'}) }}
      >
      {this.renderContent()}
      </BottomDrawer>


      </View>
    );
    }



    renderContent = () => {
      const {item} = this.state;
      return (
        <View style={styles.contentContainer}>
        
          
          <View style={{height:50,flexDirection: 'column', alignItems: 'center', padding: 5,marginBottom:5,}}>
            <View style={{flexDirection: 'column', alignItems: 'center', }}>
              <Ionicons name={this.state.position == 'UpPosition' ? "ios-arrow-down" : "ios-arrow-up"} size={22} color={'black'} />
              <Text style={{padding:0,margin:0, fontSize:16,fontWeight:'bold'}}>
                {this.state.position == 'UpPosition' ? 'Hide' : 'Show'} directions to your location 
              </Text>
            </View>
          </View>

          <View style={{flexDirection: 'column',}}>
            <DataTable>
              <DataTable.Row style={{backgroundColor: '#d9edf7'}}>
                <DataTable.Cell>Distance</DataTable.Cell>
                <DataTable.Cell numeric>{item.distance} km</DataTable.Cell>
              </DataTable.Row>

              <DataTable.Row style={{backgroundColor: '#fcf8e3'}}>
                <DataTable.Cell>Duration</DataTable.Cell>
                <DataTable.Cell numeric>{moment(item.timeEnd-item.timeStart).format("HH:mm:ss")}</DataTable.Cell>
              </DataTable.Row>

              <DataTable.Row style={{backgroundColor: '#d9edf7'}}>
                <DataTable.Cell>From</DataTable.Cell>
                <DataTable.Cell numeric>{item.locStart}</DataTable.Cell>
              </DataTable.Row>

              <DataTable.Row style={{backgroundColor: '#fcf8e3', borderBottomWidth:0}}>
                <DataTable.Cell>To</DataTable.Cell>
                <DataTable.Cell  numeric>{item.locEnd}</DataTable.Cell>
              </DataTable.Row>
            </DataTable>

          </View>

        </View>
      )
    }
}


export default ViewSaveMap;


const styles = StyleSheet.create({

    contentContainer: {
      flex:1,

      justifyContent: 'flex-start',
     
    },
    text: {
      paddingHorizontal: 5,
      // padding:10
    },

    container: {
      flex: 1,
      margin: 0,
      
      
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
      marginVertical: 10,
      backgroundColor: 'transparent',
      flex: 1,
      position: 'absolute',
      bottom: 0,
    // left: 0,
    // right: 0,
    // backgroundColor: 'white',
    padding: 10,
    marginBottom:50,
    },
  
    
  });
  