import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { createSwitchNavigator,createStackNavigator, createBottomTabNavigator, createDrawerNavigator, createAppContainer } from 'react-navigation';
import Icon from '@expo/vector-icons/Ionicons';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';


// const MainStack = createStackNavigator(
//   {
//     LoginScreen: {
//       screen: LoginScreen,
//     },
//     HomeScreen: {
//       screen: HomeScreen,
//     },
//   },
//   {
//     initialRouteName: 'LoginScreen',
//   }
// );
// const AppContainer = createAppContainer(MainStack);

class App extends Component {
  render() {
    return <AppContainer />;
  }
};

export default App;


class WelcomeScreen extends Component {
  render() {
    return (
      <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>
          WelcomeScreen:
        </Text>
        <Button title='Login' onPress = {()=> this.props.navigation.navigate('Dashboard') } />
        <Button title='Sing Up' onPress = {()=> this.props.navigation.navigate('Dashboard') } />
      </View>
      
    );
  }
};

class DashboardScreen extends Component {
  render() {
    return (
      <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>

      <Text>
        DashboardScreen
      </Text>
    </View>
    );
  }
};

class Home extends Component {
  render() {
    return (
      <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>

      <Text>
        Feed
      </Text>
    </View>
    );
  }
};

class Settings extends Component {
  render() {
    return (
      <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>
        Settings
      </Text>
    </View>
    );
  }
};

class Profile extends Component {
  state = {  }
  render() {
    return (
      <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>
        Profile
      </Text>
    </View>
    );
  }
};





const DashboardTabNavigator = createBottomTabNavigator({
  Home:  {
    screen: Home,
        navigationOptions: {
        title: "Nagraj trase",
        tabBarLabel:"Home",
        tabBarIcon: ({ tintColor }) => <Icon name={"ios-home"} size={26} color={tintColor} />
    }},
  Profile: {
    screen: Profile,
        navigationOptions: {
        title: "Nagraj trase",
        tabBarLabel:"Profile",
        tabBarIcon: ({ tintColor }) => <Icon name={"md-car"} size={26} color={tintColor} />
    }}, 
  Settings,
},{
  navigationOptions: ({navigation})=>{
    const {routeName} = navigation.state.routes [navigation.state.index];
    return{
      headerTitle: routeName
    };
  },

  
  tabBarOptions: {
      activeTintColor: '#222',
      // activeBackgroundColor :'yellow',  
      showIcon: true,
      style: {
        // backgroundColor: 'blue',
        // bottom:10,
        // leftt:0,
        // right:0,
        height:54,
        margin:0,
        pading:0,
        alignItems: 'center',
        justifyContent: 'center',
      },
      tabStyle: {
        // backgroundColor: 'red',
        padding: 0, 
        marginHorizontal: 10,   //top,right,bottom,left
      },
      labelStyle: { 
        // backgroundColor: 'green',
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
  Welcome : {screen: WelcomeScreen},
  Dashboard : {screen: DashboardStackNavigator},
  LoginScreen: {screen: LoginScreen},
},{
  drawerPosition: 'right', //Default is left
});


const AppSwitchNavigator = createSwitchNavigator({
  Welcome : {screen: WelcomeScreen},
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
