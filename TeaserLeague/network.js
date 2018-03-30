import { getDBHost } from './constants';

export async function fetchUsersInALeague(league) {
    dbHost = await getDBHost();
    url = 'http://' + dbHost + '/users/' + league;
    return fetch(url)
        .then( response => response.json());
}

export async function fetchUsersInAnyLeague() {
    dbHost = await getDBHost();
    url = 'http://' + dbHost + '/users';
    return fetch(url)
        .then( response => response.json());
}

export async function fetchWeeksInALeague(league) {
    dbHost = await getDBHost();
    url = 'http://' + dbHost + '/weekly_picks/' + league;
    console.log(url);
    return fetch(url)
        .then( response => response.json());
}
