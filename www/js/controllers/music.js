/* Controllers */
dashboard.controller('music', function($rootScope, $scope, $http, $log, $location, alfredClient) {
	
	$scope.search = function(term){
		$http.get('https://www.googleapis.com/youtube/v3/search', {
			params: {
			  key: 'AIzaSyCZcBb9Iairz5CZwaa4Ya81G5r3A8oLDv0',
			  type: 'video',
			  maxResults: '8',
			  part: 'id,snippet',
			  fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
			  q: term
			}
		})
		.success( function (data) {
			$scope.results = data.items;
			$log.info(data);
		})
		.error( function () {
			$log.info('Search error');
		});
	}
	
	$scope.suggest = function(result){		
		alfredClient.Music.directPlay({
			file: 'https://www.youtube.com/watch?v=' + result.id.videoId,
			title: result.snippet.title,
			artist: 'youtube',
			album: 'youtube'
		});
	}
	
});