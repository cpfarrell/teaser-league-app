import React from 'react';
import { Picker, StyleSheet, Text, View, Button, StatusBar, ScrollView, AsyncStorage, Alert, TextInput, TouchableHighlight, Switch } from 'react-native';
import { DB_HOST, getDBHost } from './constants';
import { loadLoggedInUsername, storeLoggedInUsername, ASYNC_STORAGE_USER_KEY, ASYNC_STORAGE_TOKEN_KEY } from './storage';
import { storeDevMode, loadDevMode, loadCurrentlyActiviteLeague, storeCurrentlyActiviteLeague } from './storage';
import { fetchUsersInAnyLeague } from './network';

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
            userList: ["Chris Farrell", "Mike Woods"],
            leagueList: [],
            activeLeague: null

        };

        this.loadingLeagues = false;
        this.loadingAllUsers = false;
        loadLoggedInUsername.bind(this)();
        this.showAsyncStorageKeys();
        loadCurrentlyActiviteLeague()
            .then( result => {
                console.log("Loading key state:", result);
                this.setState({activeLeague: result}) 
            }
    );
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
                this.setState({
                    leagueList: responseJson
                })
                this.loadingLeagues = false;
                // Go ahead and fill in the state if 
                console.log("Existing activeLeague: ", this.state.activeLeague);
                if (this.state.activeLeague == null && responseJson.length > 0) {
                    console.log("Filler activeLeague: ", responseJson[0]);
                    newActiveLeague = responseJson[0];
                    this.setState({activeLeague: newActiveLeague});
                    storeCurrentlyActiviteLeague(newActiveLeague);

                }
            })
            .catch(error => {
                console.log("CRAP BAD");
                this.setState({
                    leagueList: [error.message]
                })
                this.loadingLeagues = false;
            });
    }

    async loadAllUsers() {
        // I wonder if it's easy to prevent simultaneous requests. Yup!
        console.log("loading All users!");
        if (this.loadingAllUsers == true) {
            console.log("Already loading users...");
            return;
        }
        this.loadingAllUsers = true;

        fetchUsersInAnyLeague()
            .then( result => {
                this.setState({userList: result});
                this.loadingAllUsers = false;
            })
            .catch(error => {
                this.setState({
                    userList: [error.message]
                })
                this.loadingAllUsers = false;
            });
    }

    async setupLocalStateGivenDevMode() {
        getDBHost()
            .then((result) => this.setState({dbHost: result}) )
            .catch((error) => console.log(error.message));
        loadDevMode()
            .then((result) => this.setState({localDevMode: result}))
            .catch((error) => console.log(error.message));
        this.loadLeagues()
            .catch( error => console.log(error));

        this.loadAllUsers();
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
                <Text style={{fontSize: 20}} >Login Info</Text>
                <Picker
                  selectedValue={this.state.loggedInUsername}
                  onValueChange={(itemValue, itemIndex) => {
                      console.log("Storing logged in user:", itemValue, itemIndex);
                      // Store, then set state. Otherwise, can't seem to change Picker...
                      storeLoggedInUsername(itemValue)
                        .then( () => {
                            this.setState({loggedInUsername: itemValue}, () => this.loadLeagues())

                        });
                  }}>
                    {this.state.userList.map(username => {
                            //label = league;
                            //console.log(username, " vs. ", this.state.loggedInUsername);
                            label = username + ((username == this.state.loggedInUsername) ? ' - Active' : '');
                            return (<Picker.Item label={label} value={username} key={username} />)
                    })}
                </Picker>
                
                <Text> 
                    Username
                </Text>
                <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1, padding:10}}
                    onChangeText={(text) => this.setState({user_text: text})}
                    value={this.state.user_text}
                    placeholder={"Use the user dropdown to login"}
                />
                <Text> 
                    Password
                </Text>
                <TextInput
                    secureTextEntry={true}
                    style={{height: 40, borderColor: 'gray', borderWidth: 1, padding:10}}
                    onChangeText={(text) => this.setState({password_text: text})}
                    value={this.state.password_text}
                    placeholder={"Use the user dropdown to login"}
                />
                <Button title="Submit" onPress={authenticateAndStoreUser} color='#083D77' disabled={true}/>
                <Text>Currently logged in user: {this.getUser()}</Text>

                {/* Dropdown for leagues a user is in */}
                <View style={{marginTop: 50}}>
                    <Text style={{fontSize: 20}} >Your Teaser Leagues</Text>
                    <Picker
                      selectedValue={this.state.activeLeague}
                      onValueChange={(itemValue, itemIndex) => {
                          console.log("Storing active league:", itemValue, itemIndex);
                          // Store, then set state. Otherwise, can't seem to change Picker...
                          storeCurrentlyActiviteLeague(itemValue)
                            .then( () =>
                                this.setState({activeLeague: itemValue})
                            );
                      }}>
                        {this.state.leagueList.map(league => {
                                //label = league;
                                label = league + ((league == this.state.activeLeague) ? ' - Active' : '');
                                return (<Picker.Item label={label} value={league} key={league} />)
                        })}
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
                <Button title="Remove League Key" onPress={ () => {
                    return AsyncStorage.removeItem('@TeaserLeague:league_id');
                }}/>
            </View>
       );
    }
}
