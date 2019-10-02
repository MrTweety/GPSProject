import React, { Component } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import {createDrawerNavigator} from 'react-navigation';

import LoginScreen from '../screens/LoginScreen'
import Global from '../globals.js';



class HomeScreen extends Component {
    
    render() {
        return (
            <ImageBackground source ={require('../assets/road_1.jpg')} style={{width:'100%', height:'100%'}}>
            <View style={{flex:1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <View style={{flex: 1, width:'100%', alignItems: 'center', paddingTop: 40, height: 30}}>
                    {Global.user_id ?
                    <Text style={{fontSize: 20, fontWeight: 'bold', paddingBottom:20}}>
                        Welcome {Global.user_name}!
                    </Text>:
                    <Text style={{fontSize: 20, fontWeight: 'bold', paddingBottom:20}}>
                    Welcome in Driving Test!
                    </Text>
                    }<View style={{paddingTop: 40}}>
                        <Text style={styles.mytext}>
                        Our app is created to share your driving licence exams with others! Before your exam, simply turn on 'recording route' and put your phone into a pocket. After your struggle with examination, you can post your route and help other!
                        </Text>
                    </View>
                </View>
            </View>
            
            </ImageBackground>
        );
    }
}


export default HomeScreen;

const styles = StyleSheet.create({

    mytext:{
      textAlign: 'center',
      padding: 10, 
      fontSize: 16, 
      textShadowColor: 'black', 
      color: 'white',
      textShadowOffset: {width: 5, height:5 },
      textShadowRadius: 6,
    }
  
  });