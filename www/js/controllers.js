angular.module('starter.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $ionicLoading, $ionicModal, $timeout, $location, $state, alfredClient, alfredAuth, alfredParams) {
	// Form data for the login modal
	
	$scope.loginData = {};
	$scope.parameters = {};
	var paramsCache = alfredParams.getParams() ;
		
	// Create the login modal that we will use later
	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.loginModal= modal;
		if(alfredAuth.getUser() == null){
			$scope.login();
		}
	});
	
	
	// Create the login modal that we will use later
	$ionicModal.fromTemplateUrl('templates/parameters.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.paramsModal = modal;
		if(paramsCache == null){
			$scope.params();
		}
	});
	
	alfredClient.subscribe(function(data){
		if(data != null
	        && data.Command == 'Unauthorized'){
			$scope.login();
	    }
    });

	// Triggered in the login modal to close it
	$scope.closeLogin = function() {
		$scope.loginModal.hide();
	};

	// Open the login modal
	$scope.login = function() {
		$ionicLoading.hide();
		$scope.loginModal.show();
	};

	// Open the login modal
	$scope.params = function() {
		$ionicLoading.hide();
		$scope.paramsModal.show();
	};
	
	$scope.logout = function(){
		alfredClient.User.logout().then(function(result){
			$scope.loginModal.show();
		}, function(error){
			alert(error);	
		});
	};

	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {
		alfredClient.User.login($scope.loginData.username, $scope.loginData.password).then(function(result) {
			$scope.error = null;
            $scope.message = 'Login successful !';
			$scope.loginModal.hide();
            $scope.$apply();
			$rootScope.$broadcast("authenticated");
			$ionicLoading.hide();
		}, function(data) {
			$scope.error = data.error;
			$scope.login();
		});
	};	
	

	// Perform the login action when the user submits the login form
	$scope.setParameters = function() {
		try{
			alfredClient.init({
				name: 'Alfred-ionic-client',
				host: $scope.parameters.host,
				portWebSocket: $scope.parameters.portWebSocket,
				portHttp: $scope.parameters.portHttp,
				onConnect: function(){					
					$rootScope.$broadcast("connected");
				}
			});
			if($scope.paramsModal){
				$scope.paramsModal.hide();
			}
			$scope.error = '';
		}
		catch(e){			
			$scope.error = e.message;
		}
	};
	
	if(paramsCache != null){
		$scope.parameters = paramsCache;
		$scope.setParameters();
	}
})
