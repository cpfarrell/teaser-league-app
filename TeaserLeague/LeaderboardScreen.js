import React from 'react';
import { 
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { 
    Table,
    Cell ,
    Col,
    Cols,
    Row,
    Rows,
    TableWrapper
} from 'react-native-table-component';
import DropdownAlert from 'react-native-dropdownalert';

import styles from './Style';

import {DB_HOST, getDBHost} from './constants';
var REQUEST_URL = 'http://' + DB_HOST + '/leaderboard/2017TL';

async function getRequestUrl() {
    dbHost = await getDBHost();
    return 'http://' + dbHost + '/leaderboard/2017TL';
}

export class LeaderboardScreen extends React.Component {
  _navigate = (username) => {
      console.log(username)
  }

  state = {
    isLoading: true
  };

  componentDidMount() {
    this.fetchData()
          .catch(((error) => {
              this.dropdown.alertWithType('error', 'Error', error.message);
              this.setState({'data':[], 'isLoading': false});
              console.log("[ERROR] Fetching data failed");
          }).bind(this));
  }

    showErrorAlert(error) {
        this.dropdown.alertWithType('error', 'Error', error.message);
        //this.setState({isLoading: false});
    }

    setErrorState() {
        this.setState({
            data: [],
            isLoading: false
        });
    }

async fetchData() {
    request_url = await getRequestUrl();
    fetch(request_url)
        .then( response => response.json())
        .then( resultJson => this.setState({
            data: resultJson,
            isLoading: false
        }))
        .catch(error => {
            this.showErrorAlert(error)
            this.setErrorState();
        });
  }

  _onRefresh() {
    this.setState({isLoading: true});
    this.fetchData()
          .catch((error) => {
              this.dropdown.alertWithType('error', 'Error', error.message);
              this.setState({'data':[], 'isLoading': false});
              console.log("[ERROR] Fetching data failed");
          }
    );
  }

  _renderLoading() {
    if (this.state.isLoading) {
      return <View><Text>Loading...</Text></View>;
    }
  }

  render() {
    const {navigate} = this.props.navigation;

    const mockAPIReturnValues = this.state.data || [];

    const columnTitles = ['Rank', 'Username', 'Won/Loss'];

    const clickableUsername = (username) => (
      <TouchableOpacity onPress={() => navigate('ListOfWeeks', {selected_username: username})} delayPressIn={200}>
        <View>
          <Text style={{fontSize: 20, textAlign: 'center'}}> {username} </Text>
        </View>
      </TouchableOpacity>
    );

    var fullValues = [];
    for(let i = 0; i < mockAPIReturnValues.length; i++){
        fullValues.push([i+1, clickableUsername(mockAPIReturnValues[i]['username']), '$' + mockAPIReturnValues[i]['points']])
    }

    return (
        <View>
        {this._renderLoading()}
        <ScrollView refreshControl={
                <RefreshControl
                    refreshing={this.state.isLoading}
                    onRefresh={this._onRefresh.bind(this)}
                />
            }
        >
            <View>
                <Text style={styles.styles.leaderboard_text}> Leaderboard Week 8</Text>
            </View>
            <Table>
                <Row data={columnTitles} style={styles.styles.leaderboard_head} textStyle={styles.styles.leaderboard_head_text} flexArr={[1, 2, 2]}/>
                <TableWrapper style={{flexDirection: 'row'}}>
                    <Rows data={fullValues} style={styles.styles.leaderboard_row} textStyle={styles.styles.leaderboard_text} flexArr={[1, 2, 2]}/>
                </TableWrapper>
            </Table>
      </ScrollView>
        <DropdownAlert ref={ref => this.dropdown = ref} />
        </View>

    );
  }
}

