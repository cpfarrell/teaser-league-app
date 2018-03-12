import { getDBHost } from './constants';

export async function fetchUsersInALeague(league) {
    dbHost = await getDBHost();
    url = 'http://' + dbHost + '/users/' + league;
    console.log("GO:" + url)
    return fetch(url)
        .then( response => response.json());
        //.then( result => {this.setState({userList: result}); console.log(result)})
        //.catch( error => this.setState({userList: ['error: ' + error.message] }));
}
