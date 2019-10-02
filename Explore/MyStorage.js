import {AsyncStorage} from 'react-native';
import KeepAwake from 'expo-keep-awake';

// import { KeepAwake } from 'expo';

export const STORAGE_KEY_USER_ROUTERS = 'USER_ROUTERS-storage';
export const STORAGE_KEY = 'background-location-storage';
export const STORAGE_KEY_USER_DISTANCE = 'background-location-distance';

export async function getSavedLocations(Key) {
    try {
      const item = await AsyncStorage.getItem(Key);
      return item ? JSON.parse(item) : [];
    } catch (e) {
      return [];
    }
  }

