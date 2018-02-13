import { StyleSheet } from 'react-native';

let mlb_dull_blue = '#002E6D';
let mlb_strong_blue = '#030E84';
let mlb_strong_red = '#CA0813';

export default styles = {
    colors: {
        mlb_dull_blue: mlb_dull_blue,
        mlb_strong_blue: mlb_strong_blue,
        mlb_strong_red: mlb_strong_red,
    },
    styles: StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
        },
        leaderboard_text: {
            flex: 1,
            fontSize: 20,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        leaderboard_head: {
            height: 50,
            backgroundColor: mlb_strong_blue,
        },
        leaderboard_head_text: {
            flex: 1,
            fontSize: 20,
            textAlign: 'center',
            textAlignVertical: 'center',
            color: '#FFFFFF'
        },
        leaderboard_row: {
            height: 50 
        }
    })
};
