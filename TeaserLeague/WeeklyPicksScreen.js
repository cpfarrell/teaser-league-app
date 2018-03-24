import React from 'react';
import { StyleSheet, Text, View, Button, StatusBar, ScrollView, CheckBox, TouchableHighlight, TouchableOpacity, Alert, Modal, RefreshControl, Picker } from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell, ListView } from 'react-native-table-component';
import PopupDialog from 'react-native-popup-dialog';
import DropdownAlert from 'react-native-dropdownalert';
import { loadUser, loadIdToken } from './storage';
import { DB_HOST, getDBHost, placeholderUserName, DEFAULT_LEAGUE_NAME } from './constants';
import Styles from './Style';
import { fetchUsersInALeague, fetchWeeksInALeague } from './network';
 
async function getRequestUrl() {
    dbHost = await getDBHost();
    return 'http://' + dbHost + '/weekly_picks/' + DEFAULT_LEAGUE_NAME + '/';
}

async function getMakePicksRequestUrl() {
    dbHost = await getDBHost();
    return 'http://' + dbHost + '/make_picks/' + DEFAULT_LEAGUE_NAME + '/';
}

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

var username = 'Chris Farrell';
// TODO: This is still used in the POST!!!!
var fake_week_number = 2;
var tableHead = ['Team', 'Pick', 'Scores', 'Spread', '# Picks', 'Status'];
var fake_data = [];

export class WeeklyPicksScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        'isLoading': false,
        'pickCount': this.getPickCount(fake_data),
        data: {teams: []},
        usersWhoPicked: [],
        userList: [],
        username: null,
        week_number: 1,
        numWeeks: 0,
        numWeeksLoaded: false,
      }
      loadUser.bind(this)();
      loadIdToken.bind(this)();
      this.popUpMapping = {}
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
      //this.fetchData();
      console.log("COMPONENT DID MOUNT 1");
      this.fetchWeeksInALeagueAndSetState()
        .then(
          this.fetchUsersInALeagueAndSetState()
              .then( () => {
                  this.setState({}, () => this.fetchData());
              })
              .catch(error => console.log('!!', error.message))
        )
      console.log("COMPONENT DID MOUNT 2");
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
      const makePicksRequestUrl = await getMakePicksRequestUrl();
      fetch(makePicksRequestUrl + fake_week_number + '/' + this.state.username, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({user: this.state.uusername, id_token: this.state.id_token, teams: this.getTeamList(event)})
      })
          .then( (response) => response.json() )
          .then( (response) => {
              if (!response.success) {
                  Alert.alert(
                      "Save Failed",
                      "Authentication is probably to blame."
                  );
              } else {
                  Alert.alert(
                      "Picks Successfully Saved",
                  );
              }
          });
    }

    showErrorAlert(error) {
        this.dropdown.alertWithType('error', 'Error', error.message);
        //Alert.alert('Error', error.message);

        //this.setState({isLoading: false});
    }

    setErrorState() {
        this.setState({
            data: [],
            isLoading: false
        });
    }

    async fetchData() {
        requestUrl = await getRequestUrl();
        console.log(requestUrl + this.state.week_number + '/' + this.state.username)
        if (this.state.username == null || this.state.week_number == null) {
            this.setState({isLoading:false});
            return;
        }
        fetch(requestUrl + this.state.week_number + '/' + this.state.username)
            .then( response => response.json())
            .then( responseJson => { 
                pickCount = this.getPickCount(responseJson)
                this.setState({
                    data: responseJson,
                    pickCount: pickCount,
                    isLoading: false,
                })
            })
            .catch(error => {
                this.showErrorAlert(error)
                this.setErrorState();
            });
    }

    dataToTable(data) {
      // When go back to making picks in the app then need to care about differentiating if game is selectable.
      // if (!data['locked']) {
      if (true) {
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

      // Without flex:0 the text isn't visible.
      num_picks_touchable = (
          <TouchableOpacity  onPress={() => {
                  this.setState({usersWhoPicked: data['users_who_picked']});
                  this.numPicksPopUpRef.show();
              }}>
              <View>
                  <Text style={[styles.text, {flex:0}]}> {data['picks']}</Text>
              </View>
          </TouchableOpacity>
      );


      tabelData = [
          data['team'],
          pickable,
          data['score'],
          (data['spread']<=0 ? "": "+") + data['spread'],
          //data['picks'],
          num_picks_touchable,
          data['busted']
      ];
      return tabelData;
    }

    _handlePressPick(event) {
        if (event['locked'] == true) {

        } else if (event['pick'] === 'X' || this.state.pickCount <4 ) {
          event['pick'] = event['pick'] === 'X' ? ' ' : 'X';
          this.setState((prevState, props) => {
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
        this.setState({
            week_number: nav_state.week_number,
            username: nav_state.username ? nav_state.username : this.state.username,
            isLoading: true
        }, () => {this.fetchData()});
    }

    constructUserListString(users) {
        return users.join("\n")
    }

    popUpAbleText(users, message_text) {
        if (users == null) {
            return [null, null];
        }
        return [
                <PopupDialog ref={(popupDialog) => { this.popUpMapping[this.constructUserListString(users)] = popupDialog; }} width={0.65} height = {20*users.length}>
                    <Text style = {styles.text}>{this.constructUserListString(users)}</Text>
                </PopupDialog>
            ,
                <TouchableHighlight onPress = {() => {this.popUpMapping[this.constructUserListString(users)].show();}} underlayColor='#CCCCCC'>
                    <Text style={styles.summary} > {message_text}{users.length}</Text>
                </TouchableHighlight>
        ];
    }

    getHeaderText() {
        var userNameToDisplay = this.state.username;
        var headerText = "";
        if (this.state.username == null || this.state.username == placeholderUserName ) {
            headerText += "Your records, ";
        } else {
            headerText += this.state.username + ", ";
        }

        if (this.state.week_number == null ) {
            headerText += "Week not selected";
        } else {
            headerText += "Week " + this.state.week_number;
        }
        return (
                <Text style={[Styles.styles.leaderboard_text]}>
                    {headerText}
                </Text>
        );
    }

    getHeaderTextString() {
        var userNameToDisplay = this.state.username;
        var headerText = "";
        if (this.state.username == null || this.state.username == placeholderUserName ) {
            headerText += "Your records, ";
        } else {
            headerText += this.state.username + ", ";
        }

        if (this.state.week_number == null ) {
            headerText += "Week not selected";
        } else {
            headerText += "Week " + this.state.week_number;
        }
        return headerText;
    }

    async fetchUsersInALeagueAndSetState() {
        console.log('-----', DEFAULT_LEAGUE_NAME);
        this.setState({isLoading: true});
        await fetchUsersInALeague.bind(this)(DEFAULT_LEAGUE_NAME)
            .then( result => {
                this.setState({userList: result, isLoading: false});
                console.log('>>>', this.state.username);
                if (this.state.username == null) {
                    console.log('Saw null username');
                    this.setState({username: result[result.length-1]});
                }
            })
            //.then( result => {this.setState({userList: result}); console.log(result)})
            // This catch could be another setErrorState thing.
            .catch( error => {this.setState({userList: ['error: ' + error.message] }); console.log(error)});
    }

    async fetchWeeksInALeagueAndSetState() {
        this.setState({isLoading: true, numWeeksLoaded: false});
        await fetchWeeksInALeague.bind(this)(DEFAULT_LEAGUE_NAME)
            .then( result => {
                this.setState({numWeeks: result['num_weeks'], isLoading: false});
                this.setState({numWeeksLoaded: true});
                this.setState({week_number: result['num_weeks']-1});
                console.log("SPOCK:", result['num_weeks']);
                //console.log('###', this.state.username);
                //if (this.state.week_number == null) {
                //    console.log('Saw null week_number');
                //    this.setState({week_number: result['num_weeks']});
                //}
            })
            //.then( result => {this.setState({userList: result}); console.log(result)})
            // This catch could be another setErrorState thing.
            .catch( error => {this.setState({userList: ['error: ' + error.message] }); console.log(error)});
    }

    getUserPicker() {
        return (
            <Picker
              selectedValue={this.state.username}
              onValueChange={(itemValue, itemIndex) => {
                  console.log("Loading is about to be true! 1");
                  this.setState({isLoading: true, username: itemValue}, () => {
                      this.fetchData();
                  });
              }}>
                  {this.state.userList.map( key => {
                      return (<Picker.Item label={key} value={key} key={key} />)
                  })}
            </Picker>
        );
    }

    /*
                  {Array(8).fill(0).map( (_, i) => {
                      key = String(i+1);
                      label = 'Week ' + String(i+1);
                      return (<Picker.Item label={label} value={key} key={key} />)
                  })}
                  */
    getWeekPicker() {
        return (
            <Picker
              selectedValue={String(this.state.week_number)}
              onValueChange={(itemValue, itemIndex) => {
                  this.setState({isLoading: true, week_number: itemValue}, () => {
                  console.log("Loading is about to be true! 2");
                      this.fetchData();
                  });
              }}>
                  {Array(this.state.numWeeksLoaded ? this.state.numWeeks : []).fill(0).map( (_, i) => {
                      // Reverse sort the weeks.
                      i = this.state.numWeeks - i;
                      key = String(i);
                      label = 'Week ' + String(i);
                      return (<Picker.Item label={label} value={key} key={key} />)
                  })}
            </Picker>
        );
    }

    render() {
        var tableRows = [];
        teams = this.state.data['teams'] || []; // No data
        for(let i = 0; i < teams.length; i++){
            tableDataToDisplay = this.dataToTable(teams[i]);
            tableRows.push(<Row data={tableDataToDisplay} key= {i} style={[styles.row, i%4 < 2 && {backgroundColor: '#ACD7EC'}]} textStyle={styles.text}/>)
        }

        // Make the save button look different if you have more than 4 teams selected.
        var textStyle = [styles.saveButton];
        if (this.state.username != this.state.logged_in_user ) {
            textStyle.push({backgroundColor: '#8e9199', color: '#dbdcdd'});
        }

        let [losersPopup, losersTouchable] = this.popUpAbleText(this.state.data['losers'], 'Number of losers: ');
        let [losersIfHoldPopup, losersIfHoldTouchable] = this.popUpAbleText(this.state.data['losers_if_scores_hold'], 'Number of losers if scores hold: ');
        let [penaltiesPopup, penaltiesTouchable] = this.popUpAbleText(this.state.data['penalties'], 'Penalties: ');
        let [winnersPopup, winnersTouchable] = this.popUpAbleText(this.state.data['winners'], 'Winners in the clubhouse: ');

        // TODO: move this to a function
        numPicksPopUp = (
              <PopupDialog ref={(ref) => { this.numPicksPopUpRef = ref}} width={0.65} height={20*this.state.usersWhoPicked.length}>
                  <Text style = {styles.text}>{this.constructUserListString(this.state.usersWhoPicked)}</Text>
              </PopupDialog>
        );

        /*flex is to make sure the save button isn't covered up by the tabs*/
                    //{this.getUserPicker()}
                    //{this.getWeekPicker()}
        return (
              <View style={{flex: 1}}>
                {losersPopup}
                {losersIfHoldPopup}
                {penaltiesPopup}
                {winnersPopup}
                {numPicksPopUp}
                <ScrollView
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.isLoading}
                      onRefresh={this._onRefresh.bind(this)}
                    />
                  }>
                  {this.getHeaderText()}
                  <Text> "{this.state.username}" - "{this.state.week_number}" </Text>
                  <View style={{flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                    <View style={{flex:1}}>{this.getUserPicker()}</View>
                    <View style={{flex:1}}>{this.getWeekPicker()}</View>
                  </View>
                  <View style={{borderBottomColor: 'black', borderBottomWidth: 1}}/>
                  {losersTouchable}
                  {losersIfHoldTouchable}
                  {penaltiesTouchable}
                  {winnersTouchable}
                  <Table>
                    <Row data={tableHead} style={styles.head} textStyle={styles.text}/>
                      {tableRows}
                  </Table>
                  <TouchableOpacity onPress={() => {this._handlePressSave(data)}} underlayColor='#fff'>
                    <Text style={textStyle}>
                        Save
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              <DropdownAlert ref={ref => this.dropdown = ref} />
              </View>
       );
    }
}

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
  summary: {
    fontSize: 20,
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
