dashboard.controller('torrents', function ($scope, $ionicLoading, torrentsModel) {

    $scope.loading = false;
    $scope.search = function(text){
		$ionicLoading.show();
        torrentsModel.search(text, function(data){
            $scope.loading = false;
            if (data.status == 'ok') {
                $scope.results = data.data.movies;
                if(data.data.movies.length){
                    document.getElementById('torrent-search-input').blur();
                }
            }
			$ionicLoading.hide();
        });		
    }
    
    $scope.download = function(torrent){
		$ionicLoading.show();
        torrentsModel.download(torrent.torrents[0].hash, torrent.title, function(result){
            $scope.loading = false;
            $scope.$apply();
            delete $scope.results;
			$ionicLoading.hide();
        });
    }
    
});