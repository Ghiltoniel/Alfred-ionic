dashboard.factory('scenarioModel', function(alfredClient) {
    return new ScenarioModel(alfredClient);
});

function ScenarioModel(alfredClient){
    var run = function(name){
        alfredClient.Scenario.run(name);
    }

    var getAll = function(){
        return alfredClient.Scenario.getAll();
    }

    var save = function(scenario){
        return alfredClient.Scenario.save(scenario);
    }

    return {
        getAll: getAll,
        run: run,
		save: save
    }
}