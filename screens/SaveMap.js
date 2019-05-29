import React, { Component, PropTypes} from 'react';
import {AsyncStorage, Alert, View, Text, Animated, StyleSheet,
  TouchableOpacity, PanResponder, Dimensions,Image, ScrollView, RefreshControl, FlatList , ActivityIndicator } from 'react-native';
import {List, ListItem, SearchBar, } from 'react-native-elements';
import moment from "moment";
import {getSavedLocations,STORAGE_KEY_USER_ROUTERS } from '../Explore/MyStorage.js'
import DialogInput from '../Explore/MyDialogImputs';
import Global from '../globals.js';

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
      isDialogVisible_DeleteSaveRouteDecision: false,
    };
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.navigation.state.params.refreshing) {
      this.handleRefresh();
    }
  }
      
  componentDidMount(){
        const { navigation } = this.props;
        const refreshing = navigation.getParam('refreshing', false);
        if(refreshing){this.handleRefresh()}
        this.fetchData();
      }

  deleteSaveRoute =async () => {
    const {itemToDelete} = this.state;
    if(itemToDelete && itemToDelete != -1){
      let itemToDeleteID = itemToDelete.id;
      if(itemToDeleteID){
        if(Global.user_id !=''){
          let url = `https://agile-mountain-75806.herokuapp.com/api/routes/${itemToDeleteID}`
          let response = await fetch(url, {
            method: 'DELETE',
          });
        }
        else{
          var memory = STORAGE_KEY_USER_ROUTERS+'ghost';
          coordinates = await getSavedLocations(memory);
          const indexToDeleteNumber = coordinates.findIndex((element)=>{
            return element.id == itemToDeleteID;
          });

          if(indexToDeleteNumber >= 0){
            coordinates.splice(indexToDeleteNumber, 1);
            await AsyncStorage.setItem(memory, JSON.stringify(coordinates));
          }
        }
      }
    }
    this.setState(()=>({itemToDelete: -1 }));
    this.showDeleteDialog(false);
    this.handleRefresh();
  }


  showDeleteDialog(isShow, item = -1){
    if(item!=-1){
      this.setState(()=>({itemToDelete: item }));
    }
    this.setState({isDialogVisible_DeleteSaveRouteDecision: isShow});
  }


  updateSearch = search => {
    this.setState({ search });
    
        const newData = coordinates.filter(item =>{
          const itemData = `${item.length} 
          ${item.name.toUpperCase()} 
          ${item.category.toUpperCase()}`;
          const textData = search.toUpperCase();
          return itemData.indexOf(textData) > -1;
        }); 
        
    this.setState({ data: newData}); 
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

      if(Global.user_id != '')
      {
        let data = await fetch('https://agile-mountain-75806.herokuapp.com/api/user/'+Global.user_id+'/routes', {
          method: 'GET',
        });
        let dataJSON = await data.json();
        coordinates = dataJSON.data;
      }else{
        let memory = STORAGE_KEY_USER_ROUTERS+'ghost';
        coordinates = await getSavedLocations(memory);
        // console.log('coordinates:', coordinates)
      }

        this.setState({
          data:coordinates.reverse(),
          refreshing: false,
        });
      }
      

    render() {


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
                data={this.state.data}
                // renderItem={this.renderRow}
                renderItem = {({ item }) => (
                
                <ListItem
                    title = {item.name}
                    rightTitle = {moment(item.end_datetime).format("DD-MM-YYYY")}
                    subtitle = { moment( (new Date(item.end_datetime))-(new Date(item.start_datetime))).format("HH:mm:ss") +' • '+ item.length +' km' }
                    // rightSubtitle = {item.locStart && item.locEnd  ? (item.locStart !== item.locEnd ? item.locStart +" - " + item.locEnd : item.locStart+"") : ""}
                    onPress  = {()=> this.props.navigation.navigate('ViewSaveMap',{name: item.name, item: item,}) }
                    onLongPress ={()=>{this.showDeleteDialog(true,item)}}
                    containerStyle={{borderRadius:0 ,borderWidth: 0, borderColor: '#777777',}}
                    subtitleStyle = {{fontSize:15}}
                    titleStyle = {{fontSize:20}}
                    rightSubtitleStyle = {{fontSize:13, width:screen.width/2, textAlign:'right' }}
                    rightTitleStyle = {{fontSize:15}}
                    chevronColor="black"
                    chevron
          
                    />
                    )}
                keyExtractor = {item => item.id.toString()}
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

    padding: 20,
    },
  
    
  });
  