import React, { Component } from 'react';
import { View, Text, StyleSheet,Button } from 'react-native';
    
class ProfileScreen extends Component {

        render() {
            return (
                <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text>This is the ProfileScreen22</Text>
                    <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>




<Button title='hfghfghgfhfghf' onPress = {()=> this.props.navigation.navigate('ViewSaveMap',{itemId: "86"}) } />
</View>
                </View>      
            );
        }
    }
    

export default ProfileScreen;