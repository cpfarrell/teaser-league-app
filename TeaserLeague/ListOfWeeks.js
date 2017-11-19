import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView, Dimensions, AsyncStorage } from 'react-native';
import { loadUser } from './storage';
import { DB_HOST} from './constants';
 
var REQUEST_URL_BASE = 'http://' + DB_HOST + '/list_of_weeks/';

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
            <TouchableOpacity onPress={this._handlePress.bind(this)} underlayColor='#fff'>
                <Text style={[styles.weekDisplayWon, this.props.weekWinLoss < 0 && styles.weekDisplayLoss]}>
                    {this.props.weekNumberString}{"\n"}
                    {amountToDisplay}
                </Text>
            </TouchableOpacity>
        );
    }
    _handlePress() {
        var {week_id, navigate} = this.props;
        navigate('WeeklyPicks', {week_number: week_id});
    }
}

export class ListOfWeeksScreen extends React.Component {

	constructor(props) {
		 super(props);
		 this.state = {
             "isLoading": true,
             "username": defaultUserName
         };
         loadUser.bind(this)().then( () => {this.fetchData() });
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
        // Navigate elsewhere.
        const {navigate} = this.props.navigation;
        // Navigated here.
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
                <WeekDisplay 
                    key={i} 
                    week_id={weekNumber}
                    weekNumberString={weekNumber} 
                    weekWinLoss={weekWinLoss} 
                    navigate={navigate}
                />
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
        backgroundColor:'#ACD7EC',
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
        backgroundColor: '#8B95C9',
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
        backgroundColor: '#083D77',
        borderRadius:10,
        borderWidth: 1,
        borderColor: '#fff',
        color: 'white'
    }
})
