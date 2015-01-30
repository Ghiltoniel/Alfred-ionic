dashboard.controller('torrents', function ($scope, $ionicLoading, torrentsModel) {

    $scope.loading = false;
    $scope.search = function(text){
		$ionicLoading.show();
        torrentsModel.search(text, function(data){
            $scope.loading = false;
            $scope.results = data.MovieList;
			$ionicLoading.hide();
        });		
    }
    
    $scope.download = function(url){
        $scope.loading = true;
        torrentsModel.download(url, function(result){
            $scope.loading = false;
            $scope.$apply();
            $scope.results = [];
        });
    }
    
});