dashboard.factory('torrentsModel', ['websocket', '$http', function(websocket, $http) {
    return new TorrentsModel(websocket, $http);
}]);

function TorrentsModel(websocket, $http){
    this.websocket = websocket;
    this.$http = $http;
    var me = this;
    
    var search = function(text, callback){
        $http.get('http://yify-torrents.com/api/list.json?keywords=' + text).success(callback);
    }
    
    var download = function(url, callback){
        $http.get('http://api-nam.kicks-ass.org/torrent/download?magnet=' + encodeURI(url)).success(callback);
    }

    return {
        search: search,
        download: download
    }
}