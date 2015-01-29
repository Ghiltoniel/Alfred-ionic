dashboard.service('Auth', function() {
    var user = window.user;
	var localUser = localStorage.getItem("user");
	if(typeof(user) == 'undefined' && typeof(localUser) != 'undefined'){
		user = JSON.parse(localUser);
	}
	
    return {
        getUser: function() {
            return user;
        },
        setUser: function(newUser) {
            user = newUser;
			localStorage.setItem('user', JSON.stringify(user));
        },
        isConnected: function() {
            return !!user;
        }
    };
});