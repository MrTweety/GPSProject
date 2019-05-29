import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import {createDrawerNavigator} from 'react-navigation';
import firebase from 'firebase';
import LoginScreen from '../screens/LoginScreen'
import Global from '../globals.js';



class HomeScreen extends Component {
    
    render() {
        return (
            <View style={{flex:1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <View style={{flex: 1, width:'100%', alignItems: 'center', paddingTop: 40, height: 30}}>
                    {Global.user_id ?
                    <Text style={{fontSize: 20, fontWeight: 'bold', paddingBottom:20}}>
                        Welcome {Global.user_name}!
                    </Text>:
                    <Text style={{fontSize: 20, fontWeight: 'bold', paddingBottom:20}}>
                    Welcome in Driving Test!
                    </Text>
                    }<View style ={styles.block}>
                        <Text style={{textAlign: 'center', padding: 10, fontSize: 16}}>
                        Our app is created to share your driving licence exams with others! Before your exam, simply turn on 'recording route' and put your phone into a pocket. After your struggle with examination, you can post your route and help other!
                        </Text>
                    </View>
                </View>
                {/* <Text>elo</Text> */}
            </View>
        );
    }
}


export default HomeScreen;

const styles = StyleSheet.create({

    block:{
      padding: 1,
      width: '90%',
      height: 150,
      backgroundColor: '#4ec4ea',
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height:5 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
      elevation: 5
    }
  
  });