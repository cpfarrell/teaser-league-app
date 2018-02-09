import React from 'react';
import { AsyncStorage } from 'react-native';

export var ASYNC_STORAGE_USER_KEY = '@TeaserLeague:username';
export var ASYNC_STORAGE_TOKEN_KEY = '@TeaserLeague:id_token';

export async function loadUser() {
    try {
      const value = await AsyncStorage.getItem(ASYNC_STORAGE_USER_KEY);
      this.setState({logged_in_user: value})
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
