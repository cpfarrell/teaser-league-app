import React from 'react';
import { StyleSheet, Text, View, Button, StatusBar } from 'react-native';
import { TabNavigator } from 'react-navigation';
import { ListOfWeeksScreen } from './ListOfWeeks';
import { WeeklyPicksScreen } from './WeeklyPicks';
import { LeaderboardScreen } from './Leaderboard';
// import { LoginScreen } from './Login';

const RootTabNavigator = TabNavigator({
  // Removing login screen as not used right now.
  //  Login: {
  // screen: LoginScreen,
  // navigationOptions: {
  // tabBarLabel: 'Login',
  // },
  // },
  Leaderboard: {
    screen: LeaderboardScreen,
    navigationOptions: {
      tabBarLabel: 'Leaderboard',
    },
  },
  ListOfWeeks: {
    screen: ListOfWeeksScreen,
    navigationOptions: {
      tabBarLabel: 'List Weeks',
    },
  },
  WeeklyPicks: {
    screen: WeeklyPicksScreen,
    navigationOptions: {
      tabBarLabel: 'Weekly Picks',
    },
  },
    });


export default class App extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden={false}></StatusBar>
        <RootTabNavigator />
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
});
