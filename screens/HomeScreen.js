import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import {createDrawerNavigator} from 'react-navigation';
import firebase from 'firebase';
import LoginScreen from '../screens/LoginScreen'




class HomeScreen extends Component {
    
    render() {
        return (
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
                <Text>This is the home Screen</Text>
                <Button title='Sign out' onPress={()=> firebase.auth().signOut()} />

            </View>
        );
    }
}


export default HomeScreen;
