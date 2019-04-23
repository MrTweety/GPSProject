import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';

 import firebase  from  'firebase';

class LoadingScreen extends Component {
    componentDidMount(){
        this.checkIfLoggedIn();
    }

    checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged(
            function(user){
            if(user){
                console.log('userelo 320');
                this.props.navigation.navigate('Map') ;
            }
            else{
                this.props.navigation.navigate('LoginScreen');
            }
        }.bind(this)
        );
    };


    render() {
        return (
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size='large' />
            </View>
            
          );
    }

}


export default LoadingScreen;