/* Controllers */
dashboard.controller('music', function($rootScope, $scope, $http, $log, $location, $ionicPopup, musicModel, alfredClient) {
	$scope.playlist = {};
	$scope.status = {};
	$scope.current = {};
	var timerRef;
	
	$scope.search = function(term){
		if(!term || !term.length){
			$scope.results = null;
			return;
		}
		
		musicModel.search(term)
			.success( function (data) {
				$scope.results = data.items;
				$log.info(data);
			})
			.error( function () {
				$log.info('Search error');
			});
	}
	
	$scope.suggest = function(result){		
		var myPopup = $ionicPopup.show({
			template: 'How would you like to play the song ?',
			title: 'Play that song',
			scope: $scope,
			buttons: [
			  { 
				text: 'Now !',
				type: 'button-balanced',
				onTap: function(e) {
					musicModel.directPlay(result);
				},
			  },
			  {
				text: 'Add to end',
				type: 'button-positive',
				onTap: function(e) {
					musicModel.addToEnd(result);
				}
			  },
			  { 
				text: 'Cancel',
				onTap: function(e) {
					myPopup.close();
				},
			  },
			]
		  });
	}
	
	$scope.startRadio = function(radio){
		if(!radio.hasSubRadios){
			
			alfredClient.Music.directPlay({
				file: radio.BaseUrl,
				title: radio.DisplayName,
				artist: radio.DisplayName,
				album: radio.DisplayName
			});
		}
	};
	
	musicModel.subscribe(function(playlist, status){
		$scope.playlist = playlist;
		$scope.status = status;
		
		if($scope.playlist[0]){
			$scope.current = $scope.playlist[0];
		}
		
		if(!$scope.$$phase){
			$scope.$apply();
		}
	});
	
	musicModel.getRadios()
		.success( function (data) {
			$scope.radios = data;
		})
		.error( function () {
		});
	
	$scope.$watch($scope.status, function(newValue, oldValue, scope){
		if(newValue == 3 && oldValue != 3){
			if(timerRef){
				clearTimeout(timerRef);
			}
			
			timerRef = setInterval(function(){
				$scope.status.Position += 1;
			}, 1000);
		}
	});
	
	$scope.playPause = function() {
		alfredClient.Player.sendPlayPauseSignal();
	};
	
	$scope.next = function() {
		alfredClient.Player.sendNextSongSignal();
	};
	
	$scope.previous = function() {
		alfredClient.Player.sendPreviousSongSignal();
	};
	
	alfredClient.Music.broadcastStatus();
		
});