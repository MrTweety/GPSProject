//https://github.com/expo/expo/blob/master/apps/native-component-list/src/components/Button.tsx

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ActivityIndicator,
  TouchableHighlightProps,
  ViewStyle,
} from 'react-native';


const Button = ({
  disabled,
  loading,
  title,
  onPress,
  onPressIn,
  style,
  buttonStyle,
  children,
  img
}) => (
  <View style={[styles.container, style]}>
    <TouchableHighlight
      style={[styles.button, disabled && styles.disabledButton, buttonStyle]}
      disabled={disabled || loading}
      onPressIn={onPressIn}
      onPress={onPress}
      underlayColor={'#5944ed'}
    >
      {children || loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={styles.label}>{title}</Text>
      )}

      


    </TouchableHighlight>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#4630ec',
  },
  disabledButton: {
    backgroundColor: '#bbbbbb',
  },
  label: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default Button;