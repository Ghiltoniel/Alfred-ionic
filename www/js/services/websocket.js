dashboard.factory('websocket', ['$q', '$rootScope', function($q, $rootScope, $cookies) {
    // We return this object to anything injecting our service
    var Service = {};
    Service.callbacks = [];
    Service.callbacksOpen = [];
    var defer = null;
    var ws;

    function createWebsocket(){
        // Create our websocket object with the address to the websocket
        ws = new WebSocket("ws://nam.kicks-ass.org:13100/channel");

        ws.onopen = function(){
            console.log("Socket has been opened!");
            for(var i=0;i<Service.callbacksOpen.length;i++){
                Service.callbacksOpen[i]();
            }
        };

        ws.onmessage = function(message) {
            try{
            var data = JSON.parse(message.data);
            if(data.Command == 'Unauthorized')
            {
                localStorage.removeItem('user');
            }
            listener(data);
            } catch(e){
                listener(message.data);
            }
        };

        ws.onclose = function(){
            console.log("Socket has been closed!");
            var refreshIntervalId = setInterval(
                function () {
                    if (ws.readyState === 1) {
                        console.log("Connection is made");
                        clearInterval(refreshIntervalId);

                    } else if(ws.readyState === 3) {
                        createWebsocket();
                    }

                }, 1000); // wait 1 second for the connection...
        };
    }

    createWebsocket();

    function sendRequest(request) {
        defer = $q.defer();
        console.log('Sending request', request);
        waitForSocketConnection(ws, function(){
            ws.send(JSON.stringify(request));
        });
        return defer.promise;
    }

    function waitForSocketConnection(socket, callback){
        setTimeout(
            function () {
                if (socket.readyState === 1) {
                    console.log("Connection is made");
                    if(callback != null){
                        callback();
                    }
                    return;

                } else {
                    console.log("wait for connection...")
                    waitForSocketConnection(socket, callback);
                }

            }, 5); // wait 5 milisecond for the connection...
    }

    function listener(data) {
        console.log("Received data from websocket: ", data);
        // If an object exists with callback_id in our callbacks object, resolve it
        for(var i=0;i<Service.callbacks.length;i++){
            Service.callbacks[i](data);
        }
    }

    Service.Send = function(baseCommand, arguments){
        if(arguments == null)
            arguments = {};
		var localUser = localStorage.getItem("user");
        if (localUser != null) {
            var user = JSON.parse(localUser);
            arguments.token = user.token;
        }

        var request = {
            Command: baseCommand,
            Arguments: arguments
        }
        // Storing in a variable for clarity on what sendRequest returns
        var promise = sendRequest(request);
        return promise;
    }
    
    Service.SendRaw = function(message){
        defer = $q.defer();
        console.log('Sending request', message);
        waitForSocketConnection(ws, function(){
            ws.send(message);
        });
        return defer.promise;
    }

    Service.subscribe = function(callback) {
        Service.callbacks.push(callback);
    }

    Service.subscribeOpen = function(callback) {
        Service.callbacksOpen.push(callback);
    }

    return Service;
}])