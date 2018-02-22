
import React from 'react';
import { AsyncStorage } from 'react-native';

export var ASYNC_STORAGE_USER_KEY = '@TeaserLeague:username';
export var ASYNC_STORAGE_TOKEN_KEY = '@TeaserLeague:id_token';
export var ASYNC_STORAGE_DEV_MODE_KEY = '@TeaserLeague:dev_mode';

export async function loadUser() {
    try {
      const value = await AsyncStorage.getItem(ASYNC_STORAGE_USER_KEY);
      this.setState({user: value})
      if (value !== null){
        // We have data!!
        void(0);
      }
      else {
        // Null user...
        void(0);
      }
    } catch (error) {
        console.log("[ERROR] Error fetching user from persistent storage.");
        console.log(error);
    }
}

export async function loadIdToken() {
    try {
      const value = await AsyncStorage.getItem(ASYNC_STORAGE_TOKEN_KEY);
      this.setState({id_token: value})
      if (value !== null){
        // We have data!!
        void(0);
      }
      else {
        // Null user...
        void(0);
      }
    } catch (error) {
        console.log("[ERROR] Error fetching user token from persistent storage.");
        console.log(error);
    }
}

export async function loadDevMode() {
    const devModeStr = await AsyncStorage.getItem(ASYNC_STORAGE_DEV_MODE_KEY);
    return devModeStr == 'true';
}

export async function storeDevMode(is_dev_mode) {
    is_dev_mode = String(is_dev_mode);
    try {
        AsyncStorage.setItem(ASYNC_STORAGE_DEV_MODE_KEY, is_dev_mode);
    } catch (error) {
        console.log(error);
    }
}

// Until there's a way to toggle this in app, uncomment and restart app.
//storeDevMode("true");
//storeDevMode("false");
