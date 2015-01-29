dashboard.factory('scenarioModel', ['websocket', function(websocket) {
    return new ScenarioModel(websocket);
}]);

function ScenarioModel(websocket){
    this.websocket = websocket;
    var me = this;

    var run = function(name){
        me.websocket.Send("Scenario_LaunchScenario", {
            'mode': name
        });
    }

    var getAll = function(){
        me.websocket.Send("Scenario_BroadcastScenarios");
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

    return {
        getAll: getAll,
        run: run,
        subscribe: subscribe
    }
}