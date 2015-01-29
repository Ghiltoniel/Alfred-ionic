dashboard.controller('light', function ($scope, lightModel) {

    lightModel.subscribe(function(lights){
        $scope.lights = lights;
        $scope.$apply();
    });

    lightModel.getAll();

    $scope.toggle = function(){
        lightModel.toggle(this.light.Key, !this.light.On);
    }

    $scope.turnAllOn = lightModel.turnAllOn;
    $scope.turnAllOff = lightModel.turnAllOff;
});