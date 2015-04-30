angular.module('starter.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $ionicLoading, $ionicModal, $timeout, $location, $state, alfredClient, alfredAuth) {
	// Form data for the login modal
	
	$scope.loginData = {};
	// Create the login modal that we will use later
	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
		if(alfredAuth.getUser() == null){
			$scope.login();
		}
	});

	// Triggered in the login modal to close it
	$scope.closeLogin = function() {
		$scope.modal.hide();
	};

	// Open the login modal
	$scope.login = function() {
		$ionicLoading.hide();
		$scope.modal.show();
	};
	
	$scope.logout = function(){
		alfredClient.User.logout().then(function(result){
			$scope.modal.show();
		});
	};

	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {
		alfredClient.User.login($scope.loginData.username, $scope.loginData.password).then(function(result) {
			$scope.error = null;
            $scope.message = 'Login successful !';
			$scope.modal.hide();
            $scope.$apply();
			$rootScope.$broadcast("authenticated");
			$ionicLoading.hide();
		}, function(data) {
			$scope.error = data.error;
			$scope.login();
		});
	};
})
