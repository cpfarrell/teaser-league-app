import React from 'react';
import { 
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { TabNavigator } from 'react-navigation';
import { LeaderboardScreen } from './LeaderboardScreen';
import { ListOfWeeksScreen } from './ListOfWeeksScreen';
import { WeeklyPicksScreen } from './WeeklyPicksScreen';
import Styles from './Style';


const RootTabNavigator = TabNavigator({
        Leaderboard: {
            screen: LeaderboardScreen,
            navigationOptions: {
                tabBarLabel: 'Leadboard',
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
    },
    {
        tabBarPosition: 'bottom',
        animationEnabled: true,
        tabBarOptions: {
            style: {backgroundColor: 'black'},
            tabStyle: {backgroundColor: Styles.colors.mlb_dull_blue},
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
