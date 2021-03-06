import React from 'react';
import { 
    Image,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Icon } from 'react-native-elements';
import { TabNavigator } from 'react-navigation';

import { LeaderboardScreen } from './LeaderboardScreen';
import { ListOfWeeksScreen } from './ListOfWeeksScreen';
import { SettingsScreen } from './SettingsScreen';
import { WeeklyPicksScreen } from './WeeklyPicksScreen';
import Styles from './Style';

var icon_size = 30;

const RootTabNavigator = TabNavigator({
        Leaderboard: {
            screen: LeaderboardScreen,
            navigationOptions: {
                tabBarLabel: 'Leaders',
                tabBarIcon: <Icon type='ionicon' name='md-podium' color='#FFFFFF' size={icon_size}/>,
            },
        },
        ListOfWeeks: {
            screen: ListOfWeeksScreen,
            navigationOptions: {
                tabBarLabel: 'Weeks',
                tabBarIcon: <Icon type='ionicon' name='md-calendar' color='#FFFFFF' size={icon_size}/>,
            },
        },
        WeeklyPicks: {
            screen: WeeklyPicksScreen,
            navigationOptions: {
                tabBarLabel: 'Picks',
                tabBarIcon: <Icon type='ionicon' name='md-checkbox' color='#FFFFFF' size={icon_size}/>,
            },

        },
    },
    {
        tabBarPosition: 'bottom',
        animationEnabled: true,
        tabBarOptions: {
            style: {backgroundColor: 'black'},
            tabStyle: {backgroundColor: Styles.colors.mlb_dull_blue},
            showIcon: true,
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
