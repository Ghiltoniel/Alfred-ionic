dashboard.factory('scenarioModel', ['websocket', '$http', function(websocket, $http) {
    return new ScenarioModel(websocket, $http);
}]);

function ScenarioModel(websocket, $http){
    this.websocket = websocket;
    var me = this;

    var run = function(name){
        me.websocket.send("Scenario_LaunchScenario", {
            'mode': name
        });
    }

    var getAll = function(){
        me.websocket.send("Scenario_BroadcastScenarios");
    }

    var subscribe = function(callback){
        me.websocket.subscribe(function(data){
            if (data != null
                && data.Arguments != null
                && typeof(data.Arguments.scenarios) != 'undefined') {
                var scenarios = JSON.parse(data.Arguments.scenarios);
                callback(scenarios);
            }
        });
    }

    var save = function(scenario, callback){
        $http.post('http://nambrothers.tk/scenario/save',
		JSON.stringify(scenario),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}).success(function(data){
			callback();
		}).
	    error(function(data, status, headers, config) {
			callback(data);
	    });
    }

    return {
        getAll: getAll,
        run: run,
        subscribe: subscribe,
		save: save
    }
}