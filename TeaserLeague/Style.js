import { StyleSheet } from 'react-native';

let mlb_dull_blue = '#002E6D';
let mlb_strong_blue = '#030E84';
let mlb_strong_red = '#CA0813';

//function extend(source, properties) {
//    var property;
//    for(property in properties) {
//        if(properties.hasOwnProperty(property)) {
//            source[property] = properties[property];
//        }
//    }
//    return source;
//}

var extend = function() {
    var extended = {};

    for(key in arguments) {
        var argument = arguments[key];
        for (prop in argument) {
            if (Object.prototype.hasOwnProperty.call(argument, prop)) {
                extended[prop] = argument[prop];
            }
        }
    }

    return extended;
};

let list_of_weeks = {
    weekDisplayBase: {
        flex: 1,
        height: 40,
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
        backgroundColor:'#FFFFFF',
        //borderRadius:10,
        borderWidth: 1,
        borderColor: '#fff'
    }
}

export default Styles = {
    colors: {
        mlb_dull_blue: mlb_dull_blue,
        mlb_strong_blue: mlb_strong_blue,
        mlb_strong_red: mlb_strong_red,
    },
    // Separate because the <Table> object doesn't support StyleSheet
    tableBorderStyle: {borderWidth: 0.5, borderColor: '#000000'},
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
        },
        weeks_row_week: { flex: 1, fontSize: 20, textAlign: 'center', textAlignVertical: 'center', },
        weeks_row_win: extend({ flex: 1, fontSize: 20, textAlign: 'center', textAlignVertical: 'center', } , {backgroundColor:'#ACD7EC'}),
        weeks_row_loss: extend({ flex: 1, fontSize: 20, textAlign: 'center', textAlignVertical: 'center', } , {backgroundColor:'#8B95C9'}),
        //weeks_row_win: extend(list_of_weeks.weekDisplayBase, {backgroundColor:'#ACD7EC'}),
        //weeks_row_loss: extend(list_of_weeks.weekDisplayBase, {backgroundColor:'#8B95C9'}),

    })
};
