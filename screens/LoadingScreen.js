import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';

import firebase  from  'firebase';

import Global from '../globals.js';

class LoadingScreen extends Component {
    componentDidMount(){
        this.checkIfLoggedIn();
    }

    checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged(
            function(user){
            if(user){
                console.log('userelo 320');
                const MyexampleRegion = {
                    latitude: 50.0713231,
                    longitude: 19.9404102,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,

                  };
                  console.log('Loading Screen user data:', user);
                  Global.user_id = user.providerData[0].uid;
                  Global.user_name = user.providerData[0].displayName;
                //   Global.user_accessToken = user.accessToken;
                this.props.navigation.navigate('Map') ;
                // console.log('user', user)
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