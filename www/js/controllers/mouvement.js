dashboard.controller('mouvement', function ($scope, mouvementModel) {

    mouvementModel.subscribe(function(someoneThere){
        $scope.someoneThere = someoneThere;
        $scope.$apply();
    });

});