import React from 'react';
import { Picker, StyleSheet, Text, View, Button, StatusBar, ScrollView, AsyncStorage, Alert, TextInput, TouchableHighlight, Switch } from 'react-native';
import { loadUser, ASYNC_STORAGE_USER_KEY, ASYNC_STORAGE_TOKEN_KEY } from './storage';
import { DB_HOST, getDBHost } from './constants';
import { storeDevMode, loadDevMode, loadCurrentlyActiviteLeague, storeCurrentlyActiviteLeague } from './storage';

var LOGIN_URL = 'http://' + DB_HOST + '/login';
var USER_LIST_URL = 'http://10.0.100.218:5000/users/2017TL'

async function getLeaguesUserIsInUrl(userId) {
    dbHost = await getDBHost();
    return 'http://' + dbHost + '/leagues/' + userId;
}

export class SettingsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedInUsername: "Chris Farrell",
            userList: [],
            leagueList: ['tacos'],
            activeLeague: null

        };

        this.loadingLeagues = false;
        loadUser.bind(this)();
        this.showAsyncStorageKeys();
        loadCurrentlyActiviteLeague()
            .then( result => this.setState({activeLeague: result}) );
    }

  async showAsyncStorageKeys() {
        console.log("All the keys that this app as set:");
        await AsyncStorage.getAllKeys(() => void(0)).then((result) => console.log("!> " + result));
  }

  async storeUser(user, id_token) {
        try {
              await AsyncStorage.setItem(ASYNC_STORAGE_USER_KEY, user);
              await AsyncStorage.setItem(ASYNC_STORAGE_TOKEN_KEY, id_token);
        } catch (error) {
              console.log("Login.js error!! Couldn't set user: " + user);
              console.log(error);
        }
    }

    getUser() {
        return this.state.loggedInUsername;

    }

    async loadLeagues() {
        requestUrl = await getLeaguesUserIsInUrl(this.state.loggedInUsername);
        console.log("RequestUrl:", requestUrl);

        // I wonder if it's easy to prevent simultaneous requests. Yup!
        if (this.loadingLeagues == true) {
            console.log("Already loading...");
            return;
        }
        this.loadingLeagues = true;

        fetch(requestUrl)
            .then( response => response.json())
            .then( responseJson => { 
                console.log("taco...");
                console.log(responseJson);
                this.setState({
                    leagueList: responseJson
                })
                this.loadingLeagues = false;
            })
            .catch(error => {
                // this don't exist...
                this.showErrorAlert(error)
                this.setErrorState();
                this.loadingLeagues = false;
            });
    }

    async setupLocalStateGivenDevMode() {
        getDBHost()
            .then((result) => this.setState({dbHost: result}) )
            .catch((error) => console.log(error.message));
        loadDevMode()
            .then((result) => this.setState({localDevMode: result}))
            .catch((error) => console.log(error.message));
        this.loadLeagues();
    }

    componentDidMount() {
        this.setupLocalStateGivenDevMode();
    }

    render() {
        var set_user_in_state_and_persistent_storage = (user, id_token) => {
            this.storeUser(user, id_token);
            this.setState({user: user, id_token: id_token});
        }

        var authenticateAndStoreUser = () => {
            fetch(LOGIN_URL, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({username: this.state.user_text, password: this.state.password_text})
            })
            .then( (response) => response.json() )
            .then( (response) => {
                if (response.status == 'success') {
                    set_user_in_state_and_persistent_storage(this.state.user_text, response.id_token);
                }
            });
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
                <Button title="Submit" onPress={authenticateAndStoreUser} color='#083D77'/>
                <Text>Currently logged in user: {this.getUser()}</Text>
                <Text>Current league: {this.state.activeLeague}</Text>

                {/* Leagues a User is in */}
                <View style={{marginTop: 50}}>
                    <Text style={{fontSize: 20}} >Your Teaser Leagues</Text>
                    <Text>Active League: {this.state.activeLeague}</Text>
                    <Picker
                      selectedValue={this.state.activeLeague}
                      onValueChange={(itemValue, itemIndex) => {
                          console.log("Storing active league:", itemValue);
                          this.setState({activeLeague: itemValue});
                          storeCurrentlyActiviteLeague(itemValue);
                      }}>
                        {this.state.leagueList.map(league => {
                                return (<Picker.Item label={league} value={league} key={league} />)
                        })}
                      <Picker.Item label="Java" value="java" />
                      <Picker.Item label="JavaScript" value="js" />
                    </Picker>
                </View>

                <View style={{marginTop: 50}}>
                    <Text style={{fontSize: 20}} >Developer Mode</Text>
                    <Switch value={this.state.localDevMode} onValueChange={(val) => { 
                        storeDevMode(val)
                            .then(this.setupLocalStateGivenDevMode.bind(this));
                    }} />
                    <Text>{this.state.dbHost}</Text>
                </View>
                <Button title="Get Users" onPress={ () => {
                    console.log("RUN");
                    console.log("DONE");
                }} color='#083D77'/>
                <Text>Check console log: {this.state.fr} . {this.state.fe}</Text>
            </View>
       );
    }
}
