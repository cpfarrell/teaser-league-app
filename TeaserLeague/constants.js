import { loadDevMode } from './storage';

export var DB_HOST = 'ec2-13-57-3-135.us-west-1.compute.amazonaws.com:8564';
export var DEV_DB_HOST = 'DEV_BOX.ec2-13-57-3-135.us-west-1.compute.amazonaws.com:8564';

// Not a constant...
export async function getDBHost() {
    var isDevMode = await loadDevMode();
    console.log("Dev Mode:");
    console.log(isDevMode);
    if (isDevMode == true) {
        return DEV_DB_HOST;
    }
    return DB_HOST;
}
