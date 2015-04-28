dashboard.factory('torrentsModel', ['websocket', '$http', function(websocket, $http) {
    return new TorrentsModel(websocket, $http);
}]);

function TorrentsModel(websocket, $http){
    this.websocket = websocket;
    this.$http = $http;
    var me = this;
    
    var search = function(text, callback){
        $http.get('https://yts.to/api/v2/list_movies.json?query_term=' + text).success(callback);
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