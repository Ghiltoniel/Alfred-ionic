angular.module('starter.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout, $location, $state, userModel, Auth) {
  // Form data for the login modal
	$scope.loginData = {};

	// Create the login modal that we will use later
	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
		if(Auth.getUser() == null){
			$scope.login();
		}
	});

	// Triggered in the login modal to close it
	$scope.closeLogin = function() {
		$scope.modal.hide();
	};

	// Open the login modal
	$scope.login = function() {
		$scope.modal.show();
	};

	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {
		userModel.submit($scope.loginData.username, $scope.loginData.password);
	};
  
    userModel.subscribe(function(data, isOk){
        if(isOk == 'ok') {
            $scope.token = data.token;
			Auth.setUser(data);
            $scope.message = 'Login successful !';
			$scope.modal.hide();
            $scope.$apply();
			$rootScope.$broadcast("authenticated");
        }
        else if(isOk == 'ko'){
            $scope.error = data;
            $scope.$apply();
        }
    });
})
