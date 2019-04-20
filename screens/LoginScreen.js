import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { CreateStackNavigator } from 'react-navigation';
import HomeScreen from './HomeScreen'

class LoginScreen extends Component {
    render() {
        return (
            <View>
                <Text>This is the login Screen</Text>
                <Button onPress={()=>this.props.navigation.navigate('HomeScreen')} title="Go to the home screen" /> 
            </View>
        );
    }

}

// const LoginScreenStackNavigator = CreateStackNavigator({
//     LoginScreen: {
//         screen: LoginScreen,
//       },
//     HomeScreen: {
//         screen: HomeScreen,
//       },
// })

export default LoginScreen;