var alfred = angular.module('alfred', []);

alfred.service('alfredAuth', function() {
    var user = window.user;
	var localUser = localStorage.getItem("alfred-user");
	if(typeof(user) == 'undefined' && typeof(localUser) != 'undefined'){
		user = JSON.parse(localUser);
	}
	
    return {
        getUser: function() {
            return user;
        },
        setUser: function(newUser) {
            user = newUser;
			if(user == null){
				localStorage.removeItem('alfred-user');
			} else{
				localStorage.setItem('alfred-user', JSON.stringify(user));
			}
        },
        isConnected: function() {
            return !!user;
        }
    };
});


alfred.service('alfredParams', function() {
    var params = window.params;
	var localParams= localStorage.getItem("alfred-params");
	if(typeof(params) == 'undefined' && typeof(localParams) != 'undefined'){
		params = JSON.parse(localParams);
	}
	
    return {
        getParams: function() {
            return params;
        },
        setParams: function(newParams) {
            params = newParams;
			localStorage.setItem('alfred-params', JSON.stringify(params));
        },
        isConfigured: function() {
            return !!params;
        }
    };
});

alfred.factory('alfredWebsocket', function($q) {
    // We return this object to anything injecting our service
    var Service = {};
    Service.callbacks = [];
    Service.callbacksOpen = [];
    Service.callbacksClose = [];
    Service.callbacksErrors = [];
    var defer = null;
    var ws;

    function createWebsocket(url){
        // Create our alfredWebsocket object with the address to the alfredWebsocket
        try{
			ws = new WebSocket(url);
		}catch(e){
			throw e;
			return;
		}
        ws.onopen = function(){
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

        ws.onclose = function(event){
            console.log("Socket has been closed!");
            var refreshIntervalId = setInterval(
                function () {
                    if (ws.readyState === 1) {
                        console.log("Connection is made");
                        clearInterval(refreshIntervalId);

                    } else if(ws.readyState === 3) {
                        createWebsocket(url);
                    }

                }, 1000); // wait 1 second for the connection...
                
            for(var i=0;i<Service.callbacksClose.length;i++){
                Service.callbacksClose[i]();
            }
        };
		
		ws.onerror = function(e){
            for(var i=0;i<Service.callbacksErrors.length;i++){
                Service.callbacksErrors[i](e);
            }
		};
    }

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
        for(var i=0;i<Service.callbacks.length;i++){
            Service.callbacks[i](data);
        }
    }
	
	Service.init = function(param){
	    createWebsocket('ws://' + param.host + ':' + param.portWebSocket + '/channel');
	}

    Service.send = function(baseCommand, arguments){
        if(arguments == null)
            arguments = {};
		var localUser = localStorage.getItem("alfred-user");
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
    
    Service.sendRaw = function(message){
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

    Service.unsubscribe = function(callback) {
        var index = Service.callbacks.indexOf(callback);
        if (index > -1) {
            Service.callbacks.splice(index, 1);
        }
    }

    Service.subscribeOpen = function(callback) {
        if(callback){
            Service.callbacksOpen.push(callback);
        }
    }

    Service.subscribeClose = function(callback) {
        if(callback){
            Service.callbacksClose.push(callback);
        }
    }

    Service.subscribeError = function(callback) {
        if(callback){
            Service.callbacksErrors.push(callback);
        }
    }

    return Service;
});

alfred.factory('sessionInjector', function() {  
    var sessionInjector = {
        request: function(config) {
			var localUser = localStorage.getItem("alfred-user");
			if (localUser != null) {
				var user = JSON.parse(localUser);
                config.headers['token'] = user.token;
			}
            return config;
        }
    };
    return sessionInjector;
});

alfred.config(['$httpProvider', function($httpProvider) {  
    $httpProvider.interceptors.push('sessionInjector');
}]);


alfred.factory('alfredClient', function(alfredWebsocket, alfredAuth, alfredParams, $q, $http) {
    
    var parameters;
    var Service = {};    
    
    Service.init = function(param){
        parameters = param || {};
        parameters.name = parameters.name || 'Alfred-angular-client';
        parameters.host = parameters.host || 'localhost';
        parameters.portWebSocket = parameters.portWebSocket || 13100;
        parameters.portHttp = parameters.portHttp || 80;
        parameters.onConnect = parameters.onConnect || null;
        parameters.onDisconnect = parameters.onDisconnect || null;
        parameters.onError = parameters.onError || null;   
        
        alfredWebsocket.subscribeOpen(parameters.onConnect);
        alfredWebsocket.subscribeClose(parameters.onDisconnect);
        alfredWebsocket.subscribeError(parameters.onError);
        alfredWebsocket.init(parameters);
    
        Service.parameters = parameters;
        Service.parameters.url = 'http://' + parameters.host + ':' + parameters.portHttp;
		
		alfredParams.setParams(parameters);
    };
    
    Service.subscribe = function (callback) {
        alfredWebsocket.subscribe(function (data) {
            callback(data);
        });
    };
    
    var events = {};
    Service.on = function (names, handler) {
        names.split(' ').forEach(function (name) {
            if (!events[name]) {
                events[name] = [];
            }
            events[name].push(handler);
        });
        return this;
    };
    
    var trigger = function (name, args) {
        for (var name in events) {
            for (var j in events[name]) {
                var handler = events[name][j];
                handler.call(null, args);
            }
        }
        return this;
    };
    
    alfredWebsocket.subscribe(function (data) {
        if(data.Event){
            trigger(data.Event, data.Arguments);
        }
    });
    
    Service.User = {
        login: function(login, password){
            alfredWebsocket.send("User_Login", {
                'login': login,
                'password': password
            });
            
            var deferred = $q.defer();
            var callback = function(data){
                if (data != null
                    && data.Command == 'Authenticated'
                    && data.Arguments != null
                    && typeof(data.Arguments.token) != 'undefined'
                    && typeof(data.Arguments.login) != 'undefined'
                    && data.Arguments.login == login) {
                    alfredAuth.setUser(data.Arguments);
                    alfredWebsocket.unsubscribe(callback);
                    deferred.resolve(data.Arguments);
                }
                else if(data != null && data.Command == 'AuthenticationFailed'){
                    alfredWebsocket.unsubscribe(callback);
                    deferred.reject(data.Arguments);
                }
            };
                
            alfredWebsocket.subscribe(callback);
            return deferred.promise;
        },
        
        logout: function(){
            alfredWebsocket.send("User_Logout");
            
            var deferred = $q.defer();
            var callback = function(data){
                if(data != null
                    && data.Command == 'Unauthorized'){
                    alfredWebsocket.unsubscribe(callback);
                    deferred.reject(data);
                }
                else if(data != null
                    && data.Command == 'Logout'){
                    alfredWebsocket.unsubscribe(callback);
					alfredAuth.setUser(null);
                    deferred.resolve(data);
                }
            };
                
            alfredWebsocket.subscribe(callback);
            return deferred.promise;
        }
    };
    
    Service.Lights = {
        lightCommand: function (id, on, bri, hue, sat) {
            var arguments = {
                id: id
            };
            
            if (on != null)
                arguments.on = on;
            if (bri != null)
                arguments.bri = bri;
            if (hue != null)
                arguments.hue = hue;
            if (sat != null)
                arguments.sat = sat;
            
            alfredWebsocket.send('Device_LightCommand', arguments);
        },
        
        getAll: function () {
            alfredWebsocket.send("Device_BroadcastLights");
            var deferred = $q.defer();
            
            var callback = function(data){
                if (data != null
                    && data.Arguments != null
                    && typeof(data.Arguments.lights) != 'undefined') {
                    var lights = JSON.parse(data.Arguments.lights);
                    alfredWebsocket.unsubscribe(callback);
                    deferred.resolve(lights);
                }
            };
              
            alfredWebsocket.subscribe(callback);
            return deferred.promise;
        },
		
		getAllInterfaces: function(){
            return $http.get(Service.parameters.url + '/device/interfaces');			
		},
		
		saveInterfaces: function(lights){
            return $http.post(Service.parameters.url + '/device/saveInterfaces',
    		JSON.stringify(lights),
    		{
    			headers: {
    				'Content-Type': 'application/json'
    			}
    		});
        },
		
		getHueBridges: function(){
            return $http.get(Service.parameters.url + '/device/hue/bridges');			
		},
		
		registerHueBridge: function(ip){
            return $http.get(Service.parameters.url + '/device/hue/bridges/' + ip + '/register');			
		},
        
        allumeTout: function () {
            alfredWebsocket.send("Device_AllumeTout");
        },
        
        eteinsTout: function () {
            alfredWebsocket.send("Device_EteinsTout");
        },
        
        allume: function (piece) {
            alfredWebsocket.send("Device_Allume",
			{
                piece: piece
            });
        },
        
        eteins: function (piece) {
            alfredWebsocket.send("Device_Eteins",
			{
                piece: piece
            });
        },
        
        turnUp: function (piece) {
            alfredWebsocket.send("Device_TurnUp",
			{
                piece: piece
            });
        },
        
        turnDown: function (piece) {
            alfredWebsocket.send("Device_TurnDown",
			{
                piece: piece
            });
        }
    };
    
    Service.Sensors = {
        getAll: function () {
            alfredWebsocket.send("Sensor_BroadcastSensors");
            
            var deferred = $q.defer();
            
            var callback = function(data){
                if(typeof(data.Arguments.sensors) != 'undefined') {
                    var sensors = JSON.parse(data.Arguments.sensors).filter(function(s){
                        return !isNaN(parseFloat(s.Value))
                            && parseFloat(s.Value) != 0
                            && !s.IsActuator;
                    }); 
                    alfredWebsocket.unsubscribe(callback);
                    deferred.resolve(sensors);
                }
            };
              
            alfredWebsocket.subscribe(callback);
            
            return deferred.promise;
        },
        
        getHistory: function (id) {
            alfredWebsocket.send("Sensor_BroadcastSensorHistory", {
                'id': id
            });
            
            var deferred = $q.defer();
            var callback = function(data){
                if(typeof(data.Arguments.history) != 'undefined') {
                    alfredWebsocket.unsubscribe(callback);
                    deferred.resolve(JSON.parse(data.Arguments));
                }
            };
            alfredWebsocket.subscribe(callback);
            return deferred.promise;
        }
    };
    
    Service.TextToSpeech = {
        speak: function (text) {
            alfredWebsocket.send("Alfred_PlayTempString", {
                'sentence': text
            });
        }
    };
    
    Service.Chat = {
        send: function (text) {
            alfredWebsocket.send("Chat_Send", {
                'text': text
            });
        }
    };
    
    Service.Scenario = {
        run: function(name){
            alfredWebsocket.send("Scenario_LaunchScenario", {
                'mode': name
            });
        },
    
        getAll: function(){
            alfredWebsocket.send("Scenario_BroadcastScenarios");
            
            
            var deferred = $q.defer();
            var callback = function(data){
                if (data != null
                  && data.Arguments != null
                  && typeof(data.Arguments.scenarios) != 'undefined') {
                  var scenarios = JSON.parse(data.Arguments.scenarios);
                  alfredWebsocket.unsubscribe(callback);
                  deferred.resolve(scenarios);
                }
            };
              
            alfredWebsocket.subscribe(callback);
            
            return deferred.promise;
        },
    
        save: function(scenario){
            $http.post(Service.parameters.url + '/scenario/save',
    		JSON.stringify(scenario),
    		{
    			headers: {
    				'Content-Type': 'application/json'
    			}
    		});
        }
    };
	
	Service.Configuration = {
		getAll: function(){
            return $http.get(Service.parameters.url + '/configuration');			
		},
		save: function(config){
            return $http.post(Service.parameters.url + '/configuration/save',
    		JSON.stringify(config),
    		{
    			headers: {
    				'Content-Type': 'application/json'
    			}
    		});
        },
		saveAll: function(configs){
            return $http.post(Service.parameters.url + '/configuration/saveBatch',
    		JSON.stringify(configs),
    		{
    			headers: {
    				'Content-Type': 'application/json'
    			}
    		});
        }
	};
    
    Service.Torrent = {
        search: function(term, callback){
            $http.get('https://yts.to/api/v2/list_movies.json?query_term=' + term, callback);
        },
    
        download: function(torrentHash, torrentName){
            var tracker = 'udp://open.demonii.com:1337';
            var magnet = 'magnet:?xt=urn:btih:' + torrentHash + '&dn=' + encodeURI(torrentName) + '&tr=' + tracker;
            $http.get(Service.parameters.url + "/torrent/download?magnet=" + magnet);
        }
    };
    
    Service.People = {
        getAll: function(){
            alfredWebsocket.send("People_Broadcast");
            
            var deferred = $q.defer();
            var callback = function(data){
                if (data != null
                  && data.Arguments != null
                  && data.Command == 'People_List'
                  && typeof(data.Arguments.people) != 'undefined') {
                  var people = JSON.parse(data.Arguments.people);
                  alfredWebsocket.unsubscribe(callback);
                  deferred.resolve(people);
                }
            };
              
            alfredWebsocket.subscribe(callback);
            return deferred.promise;
        }
    };
    
    Service.Player = {
        register: function (name) {
            alfredWebsocket.send("Player_Register", {
                'name': name
            });
        },
        
        unregister: function (name) {
            alfredWebsocket.send("Player_Unregister");
        },
        
        sendReadyToPlaySignal : function () {
            alfredWebsocket.send("Player_ReadyToPlay");
        },
    
        sendPlayPauseSignal : function () {
            alfredWebsocket.send("MediaManager_PlayPause");
        },
    
        sendNextSongSignal : function () {
            alfredWebsocket.send("MediaManager_Next");
        },
        
        sendPreviousSongSignal : function () {
            alfredWebsocket.send("MediaManager_Previous");
        },
    
        sendUpdateStatusSignal : function (status, duration, position, volume) {
            var args = {};
    
            if (status != '')
                args.status = status;
    
            if (!isNaN(duration))
                args.length = ('' + duration).replace('.', ',');
    
            if (!isNaN(position))
                args.position = ('' + position).replace('.', ',');
    
            if (!isNaN(volume))
                args.volume = ('' + volume).replace('.', ',');
    
            alfredWebsocket.send("MediaManager_UpdateStatus", args);
        }
    };
	
	Service.Music = {
		broadcastStatus: function(){
			alfredWebsocket.send("MediaManager_BroadcastStatus");
		},
        directPlay: function (music) {
            alfredWebsocket.send("MediaManager_DirectPlay", music);
        },
        addToEnd: function (music) {
            alfredWebsocket.send("MediaManager_AddToPlaylist", music);
        },
        addToEndAndPlay: function (music) {
            alfredWebsocket.send("MediaManager_AddToPlaylistAndPlay", music);
        },
        goPlaylist: function (index) {
            alfredWebsocket.send("MediaManager_GoPlaylist", {
				index: index
			});
        },
        deleteFromPlaylist: function (index) {
            alfredWebsocket.send("MediaManager_DeleteFromPlaylist", {
				index: index
			});
        },
        setPosition: function (position) {
            alfredWebsocket.send("MediaManager_SetPosition", {
				position: position
			});
        }
    };
    
    Service.ping = function(){
        alfredWebsocket.sendRaw('ping');
    };
    
    return Service;
});