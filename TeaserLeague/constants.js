import { loadDevMode } from './storage';

export var DB_HOST = 'ec2-13-57-3-135.us-west-1.compute.amazonaws.com:8564';
//export var DEV_DB_HOST = 'ec2-13-57-3-135.us-west-1.compute.amazonaws.com:8554';
export var DEV_DB_HOST = '192.168.2.26:5000';

// Not a constant...
export async function getDBHost() {
    var isDevMode = await loadDevMode();
    if (isDevMode == true) {
        return DEV_DB_HOST;
    }
    return DB_HOST;
}

export var placeholderUserName = "_DEFAULT_USERNAME";

// 2017TL is canonical league, mlb is experimental one.
export var DEFAULT_LEAGUE_NAME = '2017TL'
// export var DEFAULT_LEAGUE_NAME = '2018mlb'
