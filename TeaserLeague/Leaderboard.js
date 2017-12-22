import React from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, TouchableOpacity, RefreshControl} from 'react-native';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

import { DB_HOST} from './constants';
var REQUEST_URL = 'http://' + DB_HOST + '/leaderboard';


export class LeaderboardScreen extends React.Component {
  _navigate = (username) => {
      console.log(username)
  }

  state = {
    isLoading: true
  };

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const response = await fetch(REQUEST_URL);
    const responseData = await response.json();
    this.setState({
          'data': responseData,
          'isLoading': false
        });
  }

  _onRefresh() {
    this.setState({isLoading: true});
    this.fetchData().then(() => {
      this.setState({isLoading: false});
    });
  }

  render() {
    if (this.state.isLoading) {
      return <View><Text>Loading...</Text></View>;
    }

    const {navigate} = this.props.navigation;

    const mockAPIReturnValues = this.state.data;

    const columnTitles = ['Rank', 'Username', 'Won/Loss'];

    const clickableUsername = (username) => (
      <TouchableOpacity onPress={() => navigate('ListOfWeeks', {selected_username: username})}>
        <View>
          <Text style={{fontSize: 20, textAlign: 'center'}}> {username} </Text>
        </View>
      </TouchableOpacity>
    );

    var fullValues = [];
    for(let i = 0; i < mockAPIReturnValues.length; i++){
        fullValues.push([i+1, clickableUsername(mockAPIReturnValues[i]['username']), mockAPIReturnValues[i]['points'] + '$'])
    }

    return (
      <ScrollView
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.isLoading}
                    onRefresh={this._onRefresh.bind(this)}
                  />
                }>
          <View>
              <Text style={styles.text}> Leaderboard Week 8</Text>
          </View>
        <Table>
          <Row data={columnTitles} style={styles.head} textStyle={styles.text} flexArr={[1, 2, 2]}/>
            <TableWrapper style={{flexDirection: 'row'}}>
          <Rows data={fullValues} style={styles.row} textStyle={styles.text} flexArr={[1, 2, 2]}/>
          </TableWrapper>
        </Table>
      </ScrollView>
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
    fontSize: 20,
    textAlign: 'center', 
    textAlignVertical: 'center',
  },
  head: { height: 50, backgroundColor: '#D6EDFF' },
  row: { height: 50 }
});
