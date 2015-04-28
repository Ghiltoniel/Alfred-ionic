dashboard.controller('torrents', function ($scope, $ionicLoading, torrentsModel) {

    $scope.loading = false;
    $scope.search = function(text){
		$ionicLoading.show();
        torrentsModel.search(text, function(data){
            $scope.loading = false;
            if (data.status == 'ok') {
                $scope.results = data.data.movies;
            }
			$ionicLoading.hide();
        });		
    }
    
    $scope.download = function(torrent){
		$ionicLoading.show();
        torrentsModel.download(torrent.torrents[0].hash, torrent.title, function(result){
            $scope.loading = false;
            $scope.$apply();
            $scope.results = [];
			$ionicLoading.hide();
        });
    }
    
});