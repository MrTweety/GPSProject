import React, { Component } from 'react';
import { View, Text, Animated, StyleSheet,Image,ScrollView, TouchableOpacity,Alert } from 'react-native';
import {
    MapView,

  } from 'expo';

class MyItems extends Component {
    render() {

        return (
            <TouchableOpacity onPress= {this.props.myOnPress}  >
                <View key = {this.props.mykey} style = {{height:130, width:130, marginLeft:20, borderWidth:0.5,borderColor:'#dddddd'}}>
                    <View style = {{flex:2}}>
                        <Image source={this.props.imageUri}
                            style = {{flex:1, width: null, height: null, resizeMode:'cover'}}
                        />
            {/* {!!this.props.myExampleRegion && (
                <MapView
                style={{ flex: 1 }}
                showsUserLocation={false}
                showsMyLocationButton={false}
                pitchEnabled={false}
                scrollEnabled={false}
                rotateEnabled={false}
                zoomControlEnabled={false}
                zoomTapEnabled={false}
                zoomEnabled={false}


                
                initialRegion={this.props.myExampleRegion}
                provider="google"
                ref={map => {
                  this.map = map;
                }}
                >
                            {this.props.myCoordinates.length > 1 ? (
              <MapView.Polyline
                coordinates={this.props.myCoordinates}
                strokeColor="blue" 
                strokeWidth={4}
              />
            ) : (
              false
            )}
                

            </MapView>
            )} */}


                    </View>
                    <View style = {{flex: 1}}>
                        <Text style={{ fontSize:14, fontWeight: '700', paddingHorizontal: 20, paddingTop:10}} >
                            {this.props.text}
                        </Text>
                    </View>
                </View> 
            </TouchableOpacity>
        );
    }
}

export default MyItems;