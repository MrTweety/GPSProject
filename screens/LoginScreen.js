import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, Image, TouchableOpacity } from 'react-native';
import firebase from '@firebase/app';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Google from 'expo-google-app-auth';

import Global from '../globals.js';

const clientId = '173882404308-rn3heh5858h3563ig1dehccm54ueeo4m.apps.googleusercontent.com';

class LoginScreen extends Component { 

     isUserEqual = (googleUser, firebaseUser) => {
        if (firebaseUser) {
          var providerData = firebaseUser.providerData;
          for (var i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.default.auth.GoogleAuthProvider.PROVIDER_ID &&
                providerData[i].uid === googleUser.getBasicProfile().getId()) {
              // We don't need to reauth the Firebase connection.
              return true;
            }
          }
        }
        return false;
      }


     onSignIn = googleUser => {
        console.log('Google Auth Response', googleUser);
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase.default.auth().onAuthStateChanged(function(firebaseUser) {
          unsubscribe();
          // Check if we are already signed-in Firebase with the correct user.
          if (!this.isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            var credential = firebase.default.auth.GoogleAuthProvider.credential(
                googleUser.idToken,
                googleUser.accessToken,
                );
            // Sign in with credential from the Google user.
            firebase.default.auth().signInAndRetrieveDataWithCredential(credential)
            .then(
                function(result){
                console.log('user signed in');
                if(result.additionalUserInfo.isNewUser)
                {
                  firebase.database().ref('/users/'+ result.user.uid).set({
                    gmail: result.user.email,
                    profilPicture: result.additionalUserInfo.profile.picture,
                    locale: result.additionalUserInfo.profile.locale,
                    firstName: result.additionalUserInfo.profile.given_name,
                    lastName: result.additionalUserInfo.profile.family_name,
                    createdAt: Date.now(),
                  })
                  .then(function(snapshor){
                    //
                  })
                }else{
                  firebase.database().ref('/users/'+ result.user.uid).update({
                    lastLoggedIn: Date.now()
                  })
                }

                Global.user_id = googleUser.user.id;
                Global.user_name = googleUser.user.name;
                Global.user_accessToken = googleUser.accessToken;
                Global.user_photo = googleUser.user.photoUrl;
            })
            .catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // The email of the user's account used.
              var email = error.email;
              // The firebase.auth.AuthCredential type that was used.
              var credential = error.credential;
              // ...
            });
          } else {
            console.log('User already signed-in Firebase.');
          }
        }.bind(this));
      };

     signInWithGoogleAsync = async ()=>{
        try{
            
            // const clientId = '173882404308-rn3heh5858h3563ig1dehccm54ueeo4m.apps.googleusercontent.com';//isoClientId

             //const clientId = '173882404308-tsu3puci6ncdl08e9q4poqj6f0at0nv3.apps.googleusercontent.com'; //web
            const result = await Google.logInAsync({ clientId });
            if (result.type === 'success') {
                clientId2 =clientId;

                this.onSignIn(result);
                console.log(result.user);
                console.log('accessToken:', result.accessToken);
                console.log('type:', result.type);
                return result.accessToken;
                /* Log-Out */
                // await Expo.Google.logOutAsync({ clientId, accessToken });
                /* `accessToken` is now invalid and cannot be used to get data from the Google API with HTTP requests */
              }
              else{
                console.log('type:', type)
                  return {cancelled:true};

              }
        }
        catch(e){
            return {error:true};
        }
    }

    render() {
        return (
            <View style={{flex:1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>

              <View style ={styles.login_screen_view_header}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  Welcome in Driving Test!
                </Text>

                <View style ={{alignItems: 'center', justifyContent: 'center', paddingTop: 100}}>
                  <Image source={require('../assets/logo2_3.png')}  />
                </View>

              </View>

              <View style ={styles.login_screen_view}>
                <View style={{padding: 10}}>
                  <TouchableOpacity onPress = {()=> this.signInWithGoogleAsync()} style={styles.my_button} activeOpacity = {0.8}>
                    <Text style={{color: "white"}}>Login with Google </Text>
                    <MaterialCommunityIcons name={"google-plus"} size={30} color="white" />  
                  </TouchableOpacity> 
                </View>

                <View style = {{padding: 10}}>
                  <TouchableOpacity onPress = {()=> this.props.navigation.navigate('Dashboard') } style={[styles.my_button,{backgroundColor: "#4d9ceb"}]} activeOpacity = {0.8}>
                    <Text style={{color: "white"}}>Continue without logging</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
            </View>
            
          );
    }

}


export default LoginScreen;

const styles = StyleSheet.create({

  login_screen_view_header:{
    padding: 1,
    flex: 1,
    paddingTop: 40,
    height: 200,
  },
  login_screen_view:{
    flex: 1,
    paddingTop: 30,
    width: '100%',
  },
  my_button:{
    backgroundColor: '#d95333',
    justifyContent:'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 3,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height:5 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5
  }

});