
var USER_LIST_URL = 'http://10.0.100.218:5000/users';

export async function fetchUsers(league) {
    console.log("GO:" + USER_LIST_URL + '/' + league)
    return fetch(USER_LIST_URL + '/' + league)
        .then( response => response.json());
        //.then( result => {this.setState({userList: result}); console.log(result)})
        //.catch( error => this.setState({userList: ['error: ' + error.message] }));
}
