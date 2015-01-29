dashboard.factory('userModel', ['websocket', function(websocket) {
    return new UserModel(websocket);
}]);

function UserModel(websocket){
    this.websocket = websocket;
    var me = this;
    var login;

    var submit = function(login, password){
        me.login = login;
        me.websocket.Send("User_Login", {
            'login': login,
            'password': password
        });
    }

    var subscribe = function(callback, login){
        me.websocket.subscribe(function(data){
            if (data != null
                && data.Command == 'Authenticated'
                && data.Arguments != null
                && typeof(data.Arguments.token) != 'undefined'
                && typeof(data.Arguments.login) != 'undefined'
                && data.Arguments.login == me.login) {
                callback(data.Arguments, 'ok');
            }
            else if(data != null
                && data.Command == 'AuthenticationFailed'){
                callback(data.Arguments.error, 'ko');
            }
        });
    }

    return {
        submit: submit,
        subscribe: subscribe
    }
}