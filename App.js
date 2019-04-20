import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { createSwitchNavigator,createStackNavigator, createBottomTabNavigator, createDrawerNavigator, createAppContainer } from 'react-navigation';
import Icon from '@expo/vector-icons/Ionicons';


import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';



class App extends Component {
  render() {
    return <AppContainer />;
  }
};

export default App;



class MapScreen2 extends Component {

  render() {
      return (
          <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
              <Text>This is the MapScreen2</Text>
          </View>   
      );
  }
}

const DashboardTabNavigator = createBottomTabNavigator({
  Home:  {
    screen: HomeScreen,
        navigationOptions: {
        tabBarLabel:"Home",
        tabBarIcon: ({ tintColor }) => <Icon name={"ios-home"} size={26} color={tintColor} />
    }},
    Map2: {
      screen: MapScreen2,
          navigationOptions: {
          tabBarLabel:"SaveMap",
          tabBarIcon: ({ tintColor }) => <Icon name={"md-car"} size={26} color={tintColor} />
      }}, 
    Map: {
      screen: MapScreen,
          navigationOptions: {
          tabBarLabel:"Map",
          tabBarIcon: ({ tintColor }) => <Icon name={"md-car"} size={26} color={tintColor} />
      }}, 
  Profile: {
    screen: ProfileScreen,
        navigationOptions: {
        tabBarLabel:"Profile",
        tabBarIcon: ({ tintColor }) => <Icon name={"md-car"} size={26} color={tintColor} />
    }}, 
    Settings: {
      screen: SettingsScreen,
          navigationOptions: {
          tabBarLabel:"Settings",
          tabBarIcon: ({ tintColor }) => <Icon name={"md-car"} size={26} color={tintColor} />
      }}, 
},{
  navigationOptions: ({navigation})=>{
    const {routeName} = navigation.state.routes [navigation.state.index];
    return{
      headerTitle: routeName
    };
  },

  
  tabBarOptions: {
      activeTintColor: '#222',
      showIcon: true,
      style: {
        height:54,
        margin:0,
        pading:0,
        alignItems: 'center',
        justifyContent: 'center',
      },
      tabStyle: {
        padding: 0, 
        marginHorizontal: 10,   
      },
      labelStyle: { 
        padding: 0, 
        marginBottom:5, 
        fontSize:14,
      },

  }
});

const DashboardStackNavigator = createStackNavigator({
  DashboardTabNavigator: DashboardTabNavigator
},{
  headerLayoutPreset: 'center',
  defaultNavigationOptions:({navigation})=>{
    return{
      headerRight:(
        <Icon style = {{paddingRight: 10}}
        onPress={()=>navigation.openDrawer()}
        name="md-menu" size={30} />
      )
    }
  }
});


const AppDrawerNavigator = createDrawerNavigator({
  Welcome : {screen: LoginScreen},
  Dashboard : {screen: DashboardStackNavigator},
},{
  drawerPosition: 'right', //Default is left
});


const AppSwitchNavigator = createSwitchNavigator({
  Welcome : {screen: LoginScreen},
  Dashboard : {screen: AppDrawerNavigator},
});

const AppContainer = createAppContainer(AppSwitchNavigator);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
