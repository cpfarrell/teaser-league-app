import { getDBHost } from './constants';

export async function fetchUsersInALeague(league) {
    dbHost = await getDBHost();
    url = 'http://' + dbHost + '/users/' + league;
    return fetch(url)
        .then( response => response.json());
}

export async function fetchWeeksInALeague(league) {
    dbHost = await getDBHost();
    url = 'http://' + dbHost + '/weekly_picks/' + league;
    return fetch(url)
        .then( response => response.json());
}
