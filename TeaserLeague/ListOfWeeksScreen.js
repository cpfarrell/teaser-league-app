import React from 'react';
import { 
    AsyncStorage,
    Button,
    Dimensions,
    Picker,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import { loadLoggedInUsername } from './storage';
import { DB_HOST, getDBHost, placeholderUserName } from './constants';
import { 
    Table,
    Cell,
    Col,
    Cols,
    Row,
    Rows,
    TableWrapper
} from 'react-native-table-component';
import Styles from './Style';
import { fetchUsersInALeague } from './network';
import { loadCurrentlyActiviteLeague } from './storage';
 
async function getRequestUrl(username) {
    dbHost = await getDBHost();
    activeLeague = await loadCurrentlyActiviteLeague();
    return 'http://' + dbHost + '/list_of_weeks/' + activeLeague + '/' + username  + '/';
}

var screenWidth = Dimensions.get('window').width;

//<Text style={[styles.weekDisplayWon, this.props.weekWinLoss < 0 && styles.weekDisplayLoss]}>
//<Text style={[Styles.styles.weeks_row_win, this.props.weekWinLoss < 0 && Styles.styles.weeks_row_loss]}>
class WeekCell extends React.Component {
    render() {
        return (
            <TouchableOpacity onPress={this._handlePress.bind(this)} delayPressIn={200}>
                <Text style={Styles.styles.weeks_row_week}>
                    Week {this.props.week_id}
                </Text>
            </TouchableOpacity>
        );
    }
    _handlePress() {
        console.log("ListOfWeeks: this WeekCell upon click has username: ", this.props.username);
        var {week_id, username, navigate} = this.props;
        navigate('WeeklyPicks', {week_number: week_id, username: username});
    }
}

class DollarDisplayCell extends React.Component {
    render() {
        var amountToDisplay = "";
        if (typeof this.props.dollarAmount != 'undefined') {
            amountToDisplay = integerToFormattedDollarString(this.props.dollarAmount);
        }
        return (
            <TouchableOpacity onPress={this._handlePress.bind(this)} delayPressIn={200}>
                <Text style={[Styles.styles.weeks_row_win, this.props.dollarAmount < 0 && Styles.styles.weeks_row_loss]}>
                    {amountToDisplay} 
                </Text>
            </TouchableOpacity>
        );
    }
    _handlePress() {
        var {week_id, username, navigate} = this.props;
        navigate('WeeklyPicks', {week_number: week_id, username: username});
    }
}

function integerToFormattedDollarString(dollarValue) {
    if(dollarValue >= 0) {
        return "$" + dollarValue;
    } else {
        return "-$" + (-1*dollarValue);
    }
}

export class ListOfWeeksScreen extends React.Component {

	constructor(props) {
		 super(props);
		 this.state = {
             isLoading: true,
             username: '',
             userList: []
         };
         loadLoggedInUsername.bind(this)().then( () => {
             this._onRefresh();
             //this.fetchData() 
         });
	}

	componentDidMount() {
		console.log("did mount");
        this._onRefresh();
	}

    showErrorAlert(error) {
        this.dropdown.alertWithType('error', 'Error', error.message);
    }

    setErrorState() {
        this.setState({
            data: [],
            isLoading: false
        });
    }

	async fetchData() {
        this.setState({isLoading: true})
        if(!this.state.username) {
            this.setState({isLoading: false})
            return;
        }
        requestURL = await getRequestUrl(this.state.username);
        console.log(requestURL);
        fetch(requestURL)
            .then( response => response.json() )
            .then( result => this.setState({
                data: result,
                isLoading: false
            }))
            .catch( error => {
                this.showErrorAlert(error);
                this.setErrorState();
            });
	}

    async fetchUsersInALeagueAndSetState() {
        this.setState({userPickerLoading: true});
        activeLeague = await loadCurrentlyActiviteLeague();
        fetchUsersInALeague.bind(this)(activeLeague)
            .then( result => {
                if(this.state.username == '' && result.length > 0) {
                    this.setState({username: result[0]}, () => this.fetchData());
                }
                this.setState({userList: result, userPickerLoading: false})
            })
            .catch( error => {
                this.setState({userList: ['error: ' + error.message], userPickerLoading: false});
                console.log(error)}
            );
    }

    async _onRefresh() {
      this.fetchData();
      this.fetchUsersInALeagueAndSetState();
    }


    componentWillReceiveProps(nextProps) {
        var nav_state = nextProps.navigation.state.params;
        this.setState({
            username: nav_state.selected_username,
        }, () => this.fetchData() );
        
    }

    //_renderLoading() {
    //  if (this.state.isLoading) {
    //    //return <View><Text>Loading...</Text></View>;
    //  }
    //}

    getHeaderText() {
        var userNameToDisplay = this.state.username;
        // You didn't navigate to this screen via a tap on another username.
        //<Text style={styles.userHeader}>
        if (userNameToDisplay == placeholderUserName ) {
            return (
                <Text style={[Styles.styles.leaderboard_text]}>
                    Your record
                </Text>
            );
        }
        return (
                <Text style={[Styles.styles.leaderboard_text]}>
                    Viewing record for {userNameToDisplay}
                </Text>
        );

    }

    renderUserPicker() {
        return (
            <Picker
              selectedValue={this.state.username}
              onValueChange={(itemValue, itemIndex) => {
                  this.setState({username: itemValue}, () => {
                      this.fetchData();
                  });
              }}>
                  {this.state.userList.map( key => {
                      return (<Picker.Item label={key} value={key} key={key} />)
                  })}
            </Picker>
        );
    }

    render() {
        // Navigate elsewhere.
        const {navigate} = this.props.navigation;
        // Navigated here.
        var nav_state = this.props.navigation.state.params;

        var userNameToDisplay = this.state.username;
        var headerText = this.getHeaderText();
    	
     	//if (this.state.isLoading) {
		//	return <View><Text>Loading Stiill...</Text></View>;
	    //}
	    var weekViewResponse = this.state.data || [];

        var weekPayload = [];
        var runningWinLoss = 0;
        for (var i =0;i< weekViewResponse.length; i++) {
            var weekNumber = weekViewResponse[i].week;
            var weekWinLoss = parseInt(weekViewResponse[i].points);
            runningWinLoss += weekWinLoss;
            weekPayload.push({
                key: i,
                week_id: weekNumber,
                weekWinLoss: weekWinLoss,
                runningWinLoss: runningWinLoss,
                username: userNameToDisplay,
                navigate: navigate
            })
        }
        var testWeeks = [];
        for (var i =0;i< weekViewResponse.length; i++) {
            var weekNumber = weekViewResponse[i].week;
            var weekWinLoss = parseInt(weekViewResponse[i].points);
            testWeeks.push(['Week ' + weekNumber, weekWinLoss]);
        }
        return (<View>
                    <ScrollView
                      refreshControl={
                        <RefreshControl
                          refreshing={this.state.isLoading || this.state.userPickerLoading}
                          onRefresh={this._onRefresh.bind(this)}
                        />
                     }>
                        {headerText}
                        {/* Debug text for user/week state */}
                        {/*<Text> "{this.state.username}"</Text> */}
                        {this.renderUserPicker()}
                        <Table borderStyle={Styles.tableBorderStyle}>
                          {/*<Row key={-1} data={['Week', 'Win/Loss', 'Running']} flexArr={[1,1,1]}/>*/}
                          <Row data={['Week', 'Win/Loss', 'Running']} style={Styles.styles.leaderboard_head} textStyle={Styles.styles.leaderboard_head_text} flexArr={[1,1,1]}/>
                          { weekPayload.map((row, i) => {
                                  //let bgColor = '$
                                  
                                  return (<Row key={i} data={this.getWeekAndDollarDisplay(row)} flexArr={[1,1,1]}/>)
                              })
                          }
                        </Table>
                    </ScrollView>
                    <DropdownAlert ref={ref => this.dropdown = ref} />
                </View>
        );  
    }

    getWeekAndDollarDisplay(row) {

        return [
                <WeekCell
                    week_id={row.week_id}
                    weekWinLoss={row.weekWinLoss} 
                    username={row.username}
                    navigate={row.navigate}
                />
            ,
            
                <DollarDisplayCell
                    week_id={row.week_id}
                    dollarAmount={row.weekWinLoss} 
                    username={row.username}
                    navigate={row.navigate}
                />
            ,
                <DollarDisplayCell
                    week_id={row.week_id}
                    dollarAmount={row.runningWinLoss} 
                    username={row.username}
                    navigate={row.navigate}
                />
            

            //(<TouchableOpacity style={{flex: 1}}><Text>{row.week_id}</Text></TouchableOpacity>),
            //row.weekWinLoss
        ];
                //<WeekDisplay 
                //    key={i} 
                //    week_id={weekNumber}
                //    weekNumberString={weekNumber} 
                //    weekWinLoss={weekWinLoss} 
                //    username={userNameToDisplay}
                //    navigate={navigate}
                ///>
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
        //borderRadius:10,
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
        //borderRadius:10,
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
