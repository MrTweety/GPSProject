import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';


class LoginScreen extends Component {
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

}


export default LoginScreen;