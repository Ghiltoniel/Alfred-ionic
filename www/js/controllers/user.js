dashboard.controller('user', function ($scope, $route, $location, $ionicLoading, userModel, Auth) {

    userModel.subscribe(function(data, isOk){
        if(isOk == 'ok') {
            $scope.token = data.token;
			Auth.setUser(data);
            $scope.message = 'Login successful !';
            $location.path('/').replace();
			$ionicLoading.hide();
            $scope.$apply();
        }
        else if(isOk == 'ko'){
            $scope.error = data;
            $scope.$apply();
        }
    });

    $scope.submit = function(){
        userModel.submit($scope.login, $scope.password);
		$ionicLoading.show({
			template: 'Loading...'
		});
    }
	
	$scope.logout = function(){
		userModel.logout();
	}
});

dashboard.controller('userInfos', function ($scope, $location, Auth) {
    $scope.user = Auth.getUser();
});