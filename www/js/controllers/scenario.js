dashboard.controller('scenario', function ($scope, $http, scenarioModel) {

    scenarioModel.subscribe(function(scenarios){
        $scope.scenarios = scenarios;
        $scope.$apply();
    });

    scenarioModel.getAll();

    $scope.run = function(){
        scenarioModel.run(this.scenario.Name);
    }
    
    $scope.getRadios = function(){
    }

});