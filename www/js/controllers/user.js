dashboard.controller('user', function ($scope, $location, userModel, Auth) {

    userModel.subscribe(function(data, isOk){
        if(isOk == 'ok') {
            $scope.token = data.token;
			Auth.setUser(data);
            $scope.message = 'Login successful !';
            $location.path('/').replace();
            $scope.$apply();
        }
        else if(isOk == 'ko'){
            $scope.error = data;
            $scope.$apply();
        }
    });

    $scope.submit = function(){
        userModel.submit($scope.login, $scope.password);
    }
});

dashboard.controller('userInfos', function ($scope, $location, Auth) {

    $scope.user = Auth.getUser();
    
});