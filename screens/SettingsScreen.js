import React, { Component } from 'react';
import { View, Text, StyleSheet,TouchableOpacity } from 'react-native';
import moment from "moment";

const cordd = [
    {latitude:49.9069983,longitude:19.8103},
    {latitude:49.9069983,longitude:19.8110983},
    {latitude:49.9070983,longitude:19.8114983}
];
let idu = 0;
class SettingsScreen extends Component {



    fetchcos=async() =>{
        let abc = await fetch('https://agile-mountain-75806.herokuapp.com/api/routes', {
            method: 'POST',
            body: JSON.stringify({
              route: {
                user_id: "20101010",
                exam_start: new Date().toISOString(), 
                exam_end: new Date().toISOString(),
                name: 'trackName',
                length: 15.55777.round(3),
                category: "A"
            }
            }),
            headers: {
                'Content-Type': 'application/json',
            },
          })
          let abcd = await abc.json();
          console.log('abc:', abc);
          console.log('abcd:', abcd);
          console.log('id:', abcd.data.id);
        idu =abcd.data.id;

    }

    fetchId = async() =>{
        let abc = await fetch('https://agile-mountain-75806.herokuapp.com/api/points', {
        method: 'POST',
        body: JSON.stringify({
            points: cordd,
            route_id: idu, 
        }),
        headers: {
            'Content-Type': 'application/json',

        },
      })
    }

    getDat= async() =>{
        let abc = await fetch('https://agile-mountain-75806.herokuapp.com/api/user/'+'10101010'+'/routes', {
            method: 'GET',
          });
          let abcd = await abc.json();
          console.log('abc:', abc);
          console.log('abcd:', abcd);
    }

    DeleteDat= async() =>{
        let abc = await fetch('https://agile-mountain-75806.herokuapp.com/api/routes/2', {
            method: 'DELETE',
          });
          
          console.log('abc:', abc);
        //   let abcd = await abc.json();
        //   console.log('abcd:', abcd);
    }


    render() {
        return (
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
                <Text>This is the SettingsScreen</Text>
                <TouchableOpacity onPress = {()=>this.fetchcos()} >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>routes</Text>
              </TouchableOpacity>
              <Text>{'\n'}</Text>
                <TouchableOpacity onPress = {()=>this.fetchId()} >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>points</Text>
              </TouchableOpacity>
              <Text>{'\n'}</Text>
              <TouchableOpacity onPress = {()=>this.getDat()} >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>getDat</Text>
              </TouchableOpacity>
              <Text>{'\n'}</Text>
              <TouchableOpacity onPress = {()=>this.DeleteDat()} >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>DeleteDat</Text>
              </TouchableOpacity>
            </View>      
        );
    }
}

export default SettingsScreen;