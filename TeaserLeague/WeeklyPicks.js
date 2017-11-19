import React from 'react';
import { StyleSheet, Text, View, Button, StatusBar, ScrollView, CheckBox, TouchableOpacity, TouchableHighlight, Alert, RefreshControl } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import { loadUser, loadIdToken } from './storage';
import { DB_HOST} from './constants';
 
var REQUEST_URL = 'http://' + DB_HOST + '/weekly_picks/';
var MAKE_PICKS_REQUEST_URL = 'http://' + DB_HOST + '/make_picks/';

// A weekly pick consists of:
// >> Week # at the top
//  >> List of games:
//      >> Game 1
//          1. Game #
//          2. Team
//          3. Time (bet lock)
//          4. Spread
//          5. [ ] pick box
//          6. Score (future editable)
//      >> Game 2
//          ...
// >> Winner gets: $200
// >> Losers pay: $150

var da_user = 'Chris Farrell';
var week_number = 2;
var tableHead = ['Team', 'Game Time', 'Spread', 'Pick', 'Score', 'Busted'];
var fake_data = [];

export class WeeklyPicksScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        'isLoading': true,
        'pickCount': this.getPickCount(fake_data)
      }
      loadUser.bind(this)();
      loadIdToken.bind(this)();
    }

    getPickCount(data) {
      pickCount = 0
      for (var i=0; i< data.length; i++) {
        if (data[i]['pick'] === 'X') {
          pickCount += 1;
        }
      }
      return pickCount
    }

    componentDidMount() {
      this.fetchData();
    }

    getTeamList(teamToPick) {
      teams = []
      for (var i =0; i<teamToPick.length;i++) {
        if (teamToPick[i]['pick'] === 'X') {
          teams.push(teamToPick[i]['team'])
        }
      }
      return teams;
    }

    async saveDataToServer(event) {

      // Make sure the id_token has been loaded.
      await loadUser.bind(this)();
      await loadIdToken.bind(this)();
      //console.log(event)
      fetch(MAKE_PICKS_REQUEST_URL + week_number + '/' + da_user, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({user: da_user, id_token: this.state.id_token, teams: this.getTeamList(event)})
      })
          .then( (response) => response.json() )
          .then( (response) => {
              if (!response.success) {
                  Alert.alert(
                      "Save Failed",
                      "Authentication is probably to blame."
                  );
              }
          });
    }

    async fetchData() {
      const response = await fetch(REQUEST_URL + week_number + '/' + da_user);
      const responseData = await response.json();
      pickCount = this.getPickCount(responseData)
      this.setState({
            'data': responseData,
            'pickCount': pickCount,
            'isLoading': false
          });
    }

    dataToTable(data) {
      if (!data['locked']) {
        pickable =  (
            <TouchableOpacity onPress={() =>this._handlePressPick(data)}>
                <View>
                    <Text style={{textAlign: 'center', 'color': '#083D77', fontWeight: 'bold', fontSize: 20}}> {data['pick']} </Text>
                </View>
              </TouchableOpacity>
              )
        } else {
          pickable = (
            <View style={[data['locked'] && {'backgroundColor': 'gray'}]}>
                <Text style={{textAlign: 'center', 'color': '#083D77', fontWeight: 'bold', fontSize: 20}}> {data['pick']} </Text>
            </View>
          )
        }

      tabelData = [data['team'], data['game_time'], data['spread'], pickable, data['score'], data['busted']];
      return tabelData;
    }

    _handlePressPick(event) {
        if (event['locked'] == true) {

        } else if (event['pick'] === 'X' || this.state.pickCount <4 ) {
          event['pick'] = event['pick'] === 'X' ? ' ' : 'X';
          this.setState((prevState, props) => {
            // prevState.teamToPick[event['team']] = event['pick']
            prevState.pickCount += event['pick'] === 'X'?1:-1;
            return prevState;
          })
        } else {
          Alert.alert(
          "Don't be greedy!!!",
          'Pick only 4, there are rules')
        }
    }

    _handlePressSave(event) {
      if (this.state.pickCount > 4 ) {
        Alert.alert(
          "Can't Send!!!",
          'Pick less than 4 teams')
      } else {
        this.saveDataToServer(event)
        Alert.alert("Saving!!!",
        "Saving your picks")
      }
    }

    _onRefresh() {
      this.setState({isLoading: true});
      this.fetchData().then(() => {
        this.setState({isLoading: false});
      });
    }

    // When we nave navigated to this screen.
    componentWillReceiveProps(nextProps) {
        var nav_state = nextProps.navigation.state.params;
        this.setState({week_number: nav_state.week_number});
    }

    render() {
        var tableRows = [];
        if (this.state.isLoading) {
          return <View><Text>Loading...</Text></View>;
        }
        fake_data = this.state.data;
        console.log(fake_data)

        for(let i = 0; i < fake_data.length; i++){
          tableDataToDisplay = this.dataToTable(fake_data[i]);
            tableRows.push(<Row data={tableDataToDisplay} key= {i} style={[styles.row, i%4 < 2 && {backgroundColor: '#ACD7EC'}]} textStyle={styles.text}/>)
        }

        // Make the save button look different if you have more than 4 teams selected.
        var textStyle = [styles.saveButton];
        if (this.state.pickCount > 4 ) {
            textStyle.push({backgroundColor: '#8e9199', color: '#dbdcdd'});
        }

        return (
              <View style={{flex:1}}>
                <Text style={styles.userHeader}>
                  {da_user}, Week {week_number} (well, navigationally {this.state.week_number}...)
                </Text>
                <ScrollView
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.isLoading}
                      onRefresh={this._onRefresh.bind(this)}
                    />
                  }>
                  <Table>
                    <Row data={tableHead} style={styles.head} textStyle={styles.text}/>
                      {tableRows}
                  </Table>
                  <TouchableOpacity onPress={() => {this._handlePressSave(fake_data)}} underlayColor='#fff'>
                    <Text style={textStyle}>
                        Save
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
       );
    }
}
//<Rows data={fake_data} style={styles.row} textStyle={styles.text} flexArr={[1, 2, 2]}/>
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: 15,
    textAlign: 'center', 
    textAlignVertical: 'center',
  },
  head: { height: 40, backgroundColor: '#D6EDFF'},
  row: { height: 40, backgroundColor: 'white' },
  userHeader: {
      height: 60,
      fontWeight: 'bold',
      fontSize: 20,
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      backgroundColor:'#083D77',
      borderRadius:10,
      borderWidth: 1,
      borderColor: '#fff',
      color: "#ffffff"
    },
  saveButton: {
      flex: 1,
      height: 60,
      fontWeight: 'bold',
      fontSize: 20,
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      backgroundColor:'#4863A0',
      borderRadius:10,
      borderWidth: 1,
      borderColor: '#fff',
      color: "#ffffff"
    }
});
