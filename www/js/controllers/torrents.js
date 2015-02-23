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
    
    $scope.download = function(url){
		$ionicLoading.show();
        torrentsModel.download(url, function(result){
            $scope.loading = false;
            $scope.$apply();
            $scope.results = [];
			$ionicLoading.hide();
        });
    }
    
});