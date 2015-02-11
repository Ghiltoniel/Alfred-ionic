dashboard.controller('scenario', function ($scope, $ionicPopover, $http, scenarioModel) {

	var template = '<ion-popover-view><ion-header-bar> <h1 class="title">Le scénario a été lancé !</h1> </ion-header-bar></ion-popover-view>';

	$scope.popover = $ionicPopover.fromTemplate(template, {
		scope: $scope,
	});
	
	$scope.openPopover = function($event) {
		$scope.popover.show($event);
	};
	$scope.closePopover = function() {
		$scope.popover.hide();
	};
	
    scenarioModel.subscribe(function(scenarios){
        $scope.scenarios = scenarios;
        $scope.$apply();
    });

    scenarioModel.getAll();

    $scope.run = function(){
        scenarioModel.run(this.scenario.Name);
		$scope.openPopover();
    }
    
    $scope.getRadios = function(){
    }

});