import React, { Component, PropTypes} from 'react';
import {AsyncStorage, Alert, View, Text, Animated, StyleSheet,
  TouchableOpacity, PanResponder, Dimensions,Image, ScrollView, RefreshControl, FlatList , ActivityIndicator } from 'react-native';
import {List, ListItem, SearchBar, } from 'react-native-elements';
import {
    MapView,

  } from 'expo';
  import moment from "moment";
 
  import MyItem from '../Explore/MyItems'
  import {getSavedLocations,STORAGE_KEY_USER_ROUTERS } from '../Explore/MyStorage.js'
  import DialogInput from '../Explore/MyDialogImputs';
// import { ActivityIndicator } from 'react-native-paper';
  // const STORAGE_KEY_USER_ROUTERS = 'USER_ROUTERS-storage';
  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;

  const LATITUDE_DELTA = 0.004;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


  var coordinates = [];


class SaveMap extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      data: [],
      loading:true,
      refreshing: false,
      search: '',


      coordinatesMy:coordinates,
      isDialogVisible_DeleteSaveRouteDecision: false,
      exampleRegion: {
          latitude: 50.0713231,
          longitude: 19.9404102,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
      },
      
    };

    //this.fetchData();
  }




      async componentWillUpdate(){
        // coordinates = await getSavedLocations(STORAGE_KEY_USER_ROUTERS);
        // this.setState({data:coordinates,})
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
            data:coordinates,
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



  deleteSaveRoute =async () => {

    coordinates = await getSavedLocations(STORAGE_KEY_USER_ROUTERS);
    // console.log('coordinates:', coordinates)
    console.log('coordinates.length:', coordinates.length)
    const {indexToDelete} = this.state;//distaje TimeEND
    console.log('indexToDelete:', indexToDelete)

    const indexToDeleteNumber = coordinates.findIndex((element)=>{
      console.log('element',element)
      return element.timeEnd == indexToDelete.timeEnd;
    });
    console.log('indexToDeleteNumber:', indexToDeleteNumber)

    if(indexToDeleteNumber >= 0){
      coordinates.splice(indexToDeleteNumber, 1);
      console.log('coordinates.length:', coordinates.length)
      await AsyncStorage.setItem(STORAGE_KEY_USER_ROUTERS, JSON.stringify(coordinates)).then(() => {
        this.showDeleteDialog(false);
        this.setState(()=>({indexToDelete: -1 }));
      }); 
    }
 
    this.handleRefresh();
    //Alert.alert('You long-pressed the button! ! '+ id);
    //this.showDeleteDialog(false);
    //this.setState(()=>({indexToDelete: -1 }));
  }


  showDeleteDialog(isShow, index = -1){
    console.log("showDeleteDialog",isShow,index);
    if(index!=-1){

      this.setState(()=>({indexToDelete: index }));
    }
    this.setState({isDialogVisible_DeleteSaveRouteDecision: isShow});

  }


  updateSearch = search => {
    this.setState({ search });
    
        const newData = coordinates.filter(item =>{
          console.log(item);
          const itemData = `${item.distance} 
          ${item.trackName.toUpperCase()} 
          ${item.category.toUpperCase()}`;
          const textData = search.toUpperCase();
          return itemData.indexOf(textData) > -1;
        }); 
        
    this.setState({ data: newData }); 
  };



      renderSeparator = () => {
        return(
          <View style={{height:1, width:'86%', backgroundColor:'#CED0CD', marginLeft:'7%'}}/>
        );
      };

      renderHeader = () => {
        return(<SearchBar placeholder = "Type here..." onChangeText={this.updateSearch}
        value={this.state.search} autoCorrect={false}  lightTheme round/>

        );
      };

      renderFooter =() => {
        if(this.state.loading)return null
        return(
          <View style={{paddingVertical:20,borderTopWidth:1, borderTopColor:'#CED0CD'}}>
            <ActivityIndicator animating size='large'/>
          </View>
        );
      };



      handleRefresh = () =>{
        this.setState({
          refreshing: true,
        },() => {
          this.fetchData();
        });
      }

     async fetchData(){
        //for(let i =0;i<10000;)++i;
        coordinates = await getSavedLocations(STORAGE_KEY_USER_ROUTERS);
        
        this.setState({
          data:coordinates,
          refreshing: false,
        });
      }

    render() {


          const {
            coordinatesMy,
            exampleRegion
          } = this.state;



          return (

            <View style={styles.container}>
              <DialogInput 
                isDialogVisible={this.state.isDialogVisible_DeleteSaveRouteDecision}
                title={"Do you want to delete this track?"}
                message={""}
                textInputVisible = {false}
                submitInput={ () => {this.deleteSaveRoute()} }
                closeDialog={ () => {this.showDeleteDialog(false)}}
                submitText={"Delete"}>
              </DialogInput>

              <FlatList
                data={this.state.data.reverse()}
                // renderItem={this.renderRow}
                renderItem = {({ item }) => (
                
                <ListItem
                    title = {item.trackName}
                    rightTitle = {moment(item.timeEnd).format("DD-MM-YYYY")}
                    rightSubtitle = { moment(item.timeEnd-item.timeStart).format("HH:mm:ss") +', '+ item.distance +' km' }
                    subtitle = {item.locStart && item.locEnd  ? (item.locStart !== item.locEnd ? item.locStart +" - " + item.locEnd : item.locStart+"") : ""}
                    onPress  = {()=> this.props.navigation.navigate('ViewSaveMap',{name: item.trackName, item: item}) }
                    onLongPress ={()=>{console.log("ala"); this.showDeleteDialog(true,item)}}
                    containerStyle={{borderRadius:0 ,borderWidth: 0, borderColor: '#777777',}}
                    subtitleStyle = {{fontSize:13}}
                    // titleStyle = {{fontSize:15}}
                    rightSubtitleStyle = {{fontSize:13, width:screen.width/2, textAlign:'right' }}
                    rightTitleStyle = {{fontSize:15}}
                    chevronColor="black"
                    chevron
          
                    />
                    )}
                keyExtractor = {item => item.timeEnd.toString(8)}
                ItemSeparatorComponent = {this.renderSeparator}
                ListHeaderComponent = {this.renderHeader}
                ListFooterComponent = {this.renderFooter}
                showsScroll = {false}
                refreshControl={
                            <RefreshControl
                              refreshing={this.state.refreshing}
                              onRefresh={this.handleRefresh}
                            />
                          }
              />
              </View>

            
          );
    }
}


export default SaveMap;






const styles = StyleSheet.create({
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
  