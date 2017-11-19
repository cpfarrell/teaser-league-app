import React from 'react';
import { StyleSheet, Text, View, Button, StatusBar, ScrollView, AsyncStorage, Alert, TextInput, TouchableHighlight } from 'react-native';

var ASYNC_STORAGE_USER_KEY = '@TeaserLeague:key';

export class LoginScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {user: "no_user_X"};
        this.loadUser();
        this.showAsyncStorageKeys();
    }

  async showAsyncStorageKeys() {
        console.log("All the keys that this app as set:");
        await AsyncStorage.getAllKeys(() => void(0)).then((result) => console.log("!> " + result));
  }

  async storeUser(user) {
        try {
              await AsyncStorage.setItem(ASYNC_STORAGE_USER_KEY, user);
        } catch (error) {
              console.log("Login.js error!! Couldn't set user: " + user);
        }
    }

  async loadUser() {
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
        }
    }

    getUser() {
        return this.state.user;

    }

    render() {
        var set_user_in_state_and_persistent_storage = (text) => {
            this.storeUser(text);
            this.setState({user: text});
        }

        var authenticateAndStoreUser = () => {
            if (this.state.user_text == this.state.password_text) {
                set_user_in_state_and_persistent_storage(this.state.user_text);
            }
        }

        return (
            <View style={{padding:20}}>
                <Text> 
                    Username
                </Text>
                <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1, padding:10}}
                    onChangeText={(text) => this.setState({user_text: text})}
                    value={this.state.user_text}
                />
                <Text> 
                    Password
                </Text>
                <TextInput
                    secureTextEntry={true}
                    style={{height: 40, borderColor: 'gray', borderWidth: 1, padding:10}}
                    onChangeText={(text) => this.setState({password_text: text})}
                    value={this.state.password_text}
                />
                <Button title="Submit" onPress={authenticateAndStoreUser} />
                <Text>Currently logged in user: {this.getUser()}</Text>
            </View>
       );
    }
}
