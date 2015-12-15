dashboard.factory('torrentsModel', function($http) {
    return new TorrentsModel($http);
});

function TorrentsModel($http){
    
    var search = function(text, callback, callbackError){
        $http.get('https://yts.to/api/v2/list_movies.json?query_term=' + text).then(callback, callbackError);
    }
    
    var download = function(torrentHash, torrentName, callback){
        var tracker = 'udp://open.demonii.com:1337';
        var magnet = 'magnet:?xt=urn:btih:' + torrentHash + '&dn=' + encodeURI(torrentName) + '&tr=' + tracker;
        $http.get('http://api-nam.kicks-ass.org/torrent/download?magnet=' + magnet).success(callback);
    }

    return {
        search: search,
        download: download
    }
}