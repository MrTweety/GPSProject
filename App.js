import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Image, Dimensions, ScrollView,SafeAreaViewRN, TouchableOpacity} from 'react-native';
import {DrawerActions , createSwitchNavigator,createStackNavigator, createBottomTabNavigator, createDrawerNavigator, createAppContainer,DrawerItems, SafeAreaView  } from 'react-navigation';
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";

import { Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';


import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import MapScreen from './screens/MapScreen';
import SaveMapScreen from './screens/SaveMap';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoadingScreen from './screens/LoadingScreen';
import ViewSaveMapScreen from './screens/ViewSaveMap';

import firebase  from  'firebase';
import {firebaseConfig} from './config';

import Global from './globals.js';
// import { GoogleAuthData } from 'expo-google-sign-in';

firebase.initializeApp(firebaseConfig);
const{width} = Dimensions.get('window');

const clientId = '173882404308-rn3heh5858h3563ig1dehccm54ueeo4m.apps.googleusercontent.com';

class App extends Component {
  render() {
    // return <AppContainer />;
    return(
        <AppContainer />
    )
  }
};

export default App;

_log_out = async () => {
  try{
    if(Global.user_id != '')
    {
      firebase.auth().signOut();
      Global.clear_all();
    }
  }catch({message}){
    console.error('Logout: error: '+ message);
  }
}

const CustomDrawerContentComponent  = (props) => (
  <SafeAreaView style = {{flex: 1}}>
    <View 
    style={{ height:160, paddingTop:10, backgroundColor: '#6b52ae', justifyContent:'center', alignItems:'center' }}>
      <Image onPress={()=>this.props.navigation.navigate('DrawerClose')}
          source={require('./assets/logo2_2.png')} 
          style ={{marginTop:30, marginBottom:20, height: 120, borderRadius:30,backgroundColor:'white' }}
           />
    </View>
    {Global.user_id != '' &&
      <View style={{paddingTop: 5, justifyContent:'center', alignItems:'center'}}>
        <Image  
          source = {{
            uri: Global.user_photo.toString(),
            method: 'POST',
            headers: {Pragma: 'no-cache' },
            body: 'elo',
          }}
          style ={{width: 60, height: 60, borderRadius: 60 / 2}}
        />
        <Text>{Global.user_name}</Text>
      </View>
    }
    <ScrollView>
      <DrawerItems {...props}/>
        <View style={{alignItems: 'center', paddingTop: 10}}>
        { Global.user_id ? 
          <TouchableOpacity onPress = { () => this._log_out()} style={styles.my_button} activeOpacity = {0.8}>
            <Text style={{color: "white"}}>Log out</Text> 
          </TouchableOpacity> :
          <TouchableOpacity onPress = {()=> props.navigation.navigate('LoginScreen')}  style={styles.my_button} activeOpacity = {0.8}>
            <Text style={{color: "white"}}>Log in</Text> 
          </TouchableOpacity>  }
        </View>
        <View style={{alignItems: 'center', paddingTop: 10}}>
          <TouchableOpacity  onPress={()=>props.navigation.navigate('SaveMap')}  style={[styles.my_button, {backgroundColor: '#841584'}]} activeOpacity = {0.8}>
            <Text style={{color: "white"}}>Learn More</Text> 
          </TouchableOpacity>
        </View>
    </ScrollView>
  </SafeAreaView>
);

/**************************************************************************/
const SaveMapStack = createStackNavigator({
  SaveMap:{screen: SaveMapScreen,
    navigationOptions:({navigation})=>{
      return{
        headerTitle : "Recorded tracks",
        headerRight:(
          <Ionicons style = {{paddingRight: 10}}
          onPress={()=>navigation.openDrawer()}
          name="md-menu" size={30} />
        ),
      }
    },
    },
  ViewSaveMap:{screen: ViewSaveMapScreen,
    navigationOptions:({navigation})=>{
      return{
        //  headerTitle : navigation.state.params.name || null,
        headerTitle: `${navigation.getParam('name', '')}`,
        headerRight:(
          <Ionicons style = {{paddingRight: 10}}
          onPress={()=>navigation.openDrawer()}
          name="md-menu" size={30} />
        ),
      }
    },
  
  },

},
{
  initialRouteName: 'SaveMap',
  headerLayoutPreset: 'center',
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: '#6b52ae',
      height: 40,
      // justifyContent: 'center'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  },
}

);

/**************************************************************************/

const DashboardTabNavigator = createMaterialBottomTabNavigator({
  Home:  {
    screen: HomeScreen,
        navigationOptions: {
        tabBarLabel:"Home",
        tabBarColor: '#842655',
        tabBarIcon: ({ tintColor }) => <Ionicons name={"ios-home"} size={26} color={tintColor} />
    }},
    SaveMap: {
      screen: SaveMapStack,
          navigationOptions: {
          tabBarLabel:"SaveMap",
          tabBarColor: '#1e1e1d',
          tabBarIcon: ({ tintColor }) => <MaterialCommunityIcons name={"map-search"} size={26} color={tintColor} />
      }}, 
    Map: {
      screen: MapScreen,
          navigationOptions: {
          tabBarLabel:"Map",
          tabBarColor: '#ff3838',
          tabBarIcon: ({ tintColor }) => <Ionicons name={"md-map"} size={26} color={tintColor} />
      }}, 
  Profile: {
    screen: ProfileScreen,
        navigationOptions: {
        tabBarLabel:"Profile",
        tabBarColor: 'yellow',
        tabBarIcon: ({ tintColor }) => <Ionicons name={"md-person"} size={26} color={tintColor} />
    }}, 
    Settings: {
      screen: SettingsScreen,
          navigationOptions: {
          tabBarLabel:"Settings",
          tabBarColor: '#00ff38',
          tabBarIcon: ({ tintColor }) => <Ionicons name={"ios-settings"} size={26} color={tintColor} />
      }}, 
},{
  initialRouteName: 'Map',
  navigationOptions: ({navigation})=>{
    const {routeName} = navigation.state.routes [navigation.state.index];
    return{
      header:null,
      headerTitle: routeName
    };
  },
  shifting: false, //Color for the tab bar when the tab corresponding to the screen is active. Used for the ripple effect. This is only supported when shifting is true.
  labeled: true,
   activeColor: '#222',
   inactiveColor: 'grey',
   barStyle: { 
    backgroundColor: '#f2f2f2', 
    height:54,
   },

});

const DashboardStackNavigator = createStackNavigator({
  Dashboard: DashboardTabNavigator
},{
  headerLayoutPreset: 'center',
  defaultNavigationOptions:({navigation})=>{
    return{
      headerRight:(
        <Ionicons style = {{paddingRight: 10}}
        onPress={()=>navigation.openDrawer()}
        name="md-menu" size={30} />
      )
    }
  }
});

const AppDrawerNavigator = createDrawerNavigator({
  // LoginScreen : {
  //   screen: LoginScreen,
  //   navigationOptions: {
  //     drawerLabel:"Login Screen",
  //     drawerIcon: ({ tintColor }) => <Entypo name={"login"} size={26} color={tintColor} />
  //   }
  // },
  Dashboard : {
    screen: DashboardStackNavigator,
    navigationOptions: {
      drawerLabel:"Dashboard",
      drawerIcon: ({ tintColor }) => <Entypo name={"map"} size={26} color={tintColor} />
    }
  }
},{
  drawerPosition: 'right', //Default is left
  contentComponent: CustomDrawerContentComponent,
  drawerWidth: (4*width/5),
  // drawerLockMode:"locked-closed",
  edgeWidth: 20-width, // 20-width : 20 or whatever value you want to use as edgeWidth
  hideStatusBar: false,
});


const AppSwitchNavigator = createSwitchNavigator({
  LoadingScreen : {screen: LoadingScreen},
  LoginScreen : {screen: LoginScreen},
  HomeScreen:  {screen: HomeScreen},
  Dashboard : AppDrawerNavigator,
});

const AppContainer = createAppContainer(AppSwitchNavigator);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  my_button:{
    backgroundColor: '#d95333',
    justifyContent:'center',
    alignItems: 'center',
    width: '95%',
    borderRadius: 3,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height:5 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5
  }
});
