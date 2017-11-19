import React from 'react';
import { StyleSheet, Text, View, Button, StatusBar } from 'react-native';
import { TabNavigator } from 'react-navigation';
import { ListOfWeeksScreen } from './ListOfWeeks';
import { WeeklyPicksScreen } from './WeeklyPicks';
import { LeaderboardScreen } from './Leaderboard';
import { LoginScreen } from './Login';

const RootTabNavigator = TabNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      tabBarLabel: 'Login',
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
  Leaderboard: {
    screen: LeaderboardScreen,
    navigationOptions: {
      tabBarLabel: 'Leaderboard',
    },
  },
});


export default class App extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden={true}></StatusBar>
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
