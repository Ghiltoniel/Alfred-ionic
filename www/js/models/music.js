dashboard.factory('musicModel', ['$http', 'alfredClient', function($http, alfredClient) {
    return new MusicModel($http, alfredClient);
}]);

function MusicModel($http, alfredClient){

    var search = function(term){
		return $http.get('https://www.googleapis.com/youtube/v3/search', {
			params: {
			  key: 'AIzaSyCZcBb9Iairz5CZwaa4Ya81G5r3A8oLDv0',
			  type: 'video',
			  maxResults: '8',
			  part: 'id,snippet',
			  fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
			  q: term
			}
		});
	}
	
	var getRadios = function(){
		return $http.get(alfredClient.parameters.url + '/radios');
	}
	
	var directPlay = function(result){		
		alfredClient.Music.directPlay({
			file: 'https://www.youtube.com/watch?v=' + result.id.videoId,
			title: result.snippet.title,
			artist: 'youtube',
			album: 'youtube'
		});
	};
	
	var addToEnd = function(result){		
		alfredClient.Music.addToEnd({
			file: 'https://www.youtube.com/watch?v=' + result.id.videoId,
			title: result.snippet.title,
			artist: 'youtube',
			album: 'youtube'
		});
	};
	
	var addToEndAndPlay = function(result){		
		alfredClient.Music.addToEndAndPlay({
			file: 'https://www.youtube.com/watch?v=' + result.id.videoId,
			title: result.snippet.title,
			artist: 'youtube',
			album: 'youtube'
		});
	};

    var subscribe = function(callback){
        alfredClient.subscribe(function(data){
            if (data != null
                && data.Arguments != null
                && data.Command == 'UpdateStatus') {
                var playlist = JSON.parse(data.Arguments.playlist);
                var status = JSON.parse(data.Arguments.status);
                callback(playlist, status);
            }
        });
    }

    return {
        directPlay: directPlay,
        addToEnd: addToEnd,
        addToEndAndPlay: addToEndAndPlay,
        addToEnd: addToEnd,
        search: search,
		getRadios: getRadios,
        subscribe: subscribe
    }
}