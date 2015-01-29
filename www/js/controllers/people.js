dashboard.controller('people', function ($scope, peopleModel) {

    peopleModel.subscribe(function(people){
        $scope.people = people;
        $scope.$apply();
    });
    
    peopleModel.getAll();
    $scope.initDashboard = initDashboard;
});