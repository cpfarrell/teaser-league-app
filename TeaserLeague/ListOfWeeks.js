import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView, Dimensions, AsyncStorage } from 'react-native';

import { host_port } from './host';

var REQUEST_URL_BASE = host_port + '/list_of_weeks/';

var ASYNC_STORAGE_USER_KEY = '@TeaserLeague:key';

var screenWidth = Dimensions.get('window').width;
var defaultUserName = "ngoyal"

class WeekDisplay extends React.Component {
    render() {
        var amountToDisplay = "";
        if (typeof this.props.weekWinLoss != 'undefined') {
            amountToDisplay = "$" + this.props.weekWinLoss;
        }
        return (
            <TouchableOpacity onPress={this._handlePress} underlayColor='#fff'>
                <Text style={[styles.weekDisplayWon, this.props.weekWinLoss < 0 && styles.weekDisplayLoss]}>
                    {this.props.weekNumberString}{"\n"}
                    {amountToDisplay}
                </Text>
            </TouchableOpacity>
        );
    }
    _handlePress(event) {
        console.log('Pressed!');
    }
}

export class ListOfWeeksScreen extends React.Component {

	constructor(props) {
		 super(props);
		 this.state = {
             "isLoading": true,
             "username": defaultUserName
         };
         this.loadUser().then( () => {this.fetchData() });
	}

  async loadUser() {
        try {
          const value = await AsyncStorage.getItem(ASYNC_STORAGE_USER_KEY);
          this.setState({username: value})
          if (value !== null){
            // We have data!!
            void(0);
            console.log("SUCCESS!!!!      " + value);
          }
          else {
            // Null user...
            void(0);
            console.log("FAIL.........    " + value);
          }
        } catch (error) {
            console.log("[ERROR] Error fetching user from persistent storage.");
            console.log(error);
        }
  }

	componentDidMount() {
		console.log("did mount");
		this.fetchData(); 
	}

	async fetchData() {
		REQUEST_URL = REQUEST_URL_BASE + this.state.username;
                const response = await fetch(REQUEST_URL);
		const responseData = await response.json();
		this.setState({
		      'data': responseData,
		      'isLoading': false
		    });
	}

    componentWillReceiveProps(nextProps) {
        var nav_state = nextProps.navigation.state.params;
        this.setState({username: nav_state.selected_username}, () => {this.fetchData()});
    }


    render() {
        var nav_state = this.props.navigation.state.params;

        var userNameToDisplay = this.state.username;
    	
     	if (this.state.isLoading) {
			return <View><Text>Loading...</Text></View>;
	    }
	    var weekViewResponse = this.state.data;

        var allWeeks = [];
        for (var i =0;i< weekViewResponse.length; i++) {
            var weekNumber = "Week " + weekViewResponse[i].week;
            var weekWinLoss = parseInt(weekViewResponse[i].profit);
            allWeeks.push(
                <WeekDisplay key = {i} weekNumberString = {weekNumber} weekWinLoss = {weekWinLoss} />
            )
        }
        return (<ScrollView>
                    <Text style={styles.userHeader}>
                        Welcome {userNameToDisplay}
                    </Text>
                     {allWeeks}
                </ScrollView>
        );  
    }
}


/**
 * ## Styles
 */

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    weekDisplayWon: {
        flex: 1,
        height: 60,
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
        backgroundColor:'#008000',
        borderRadius:10,
        borderWidth: 1,
        borderColor: '#fff'
    },
    weekDisplayLoss: {
    	flex: 1,
        height: 60,
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
        backgroundColor: '#D3D3D3',
        borderRadius:10,
        borderWidth: 1,
        borderColor: '#fff'
    },
    userHeader: {
    	flex: 1,
        height: 100,
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
        backgroundColor: '#3090C7',
        borderRadius:10,
        borderWidth: 1,
        borderColor: '#fff'
    }
})
