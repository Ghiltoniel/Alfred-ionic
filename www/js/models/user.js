dashboard.factory('userModel', ['websocket', function(websocket) {
    return new UserModel(websocket);
}]);

function UserModel(websocket){
    this.websocket = websocket;
    var me = this;
    var login;

    var submit = function(login, password){
        me.login = login;
        me.websocket.send("User_Login", {
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
	
	var logout = function(){
		me.websocket.send("User_Logout");
	};

    return {
        submit: submit,
        subscribe: subscribe,
		logout: logout
    }
}