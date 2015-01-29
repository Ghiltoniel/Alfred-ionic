dashboard.factory('mouvementModel', ['websocket', function(websocket) {
    return new MouvementModel(websocket);
}]);

function MouvementModel(websocket){
    this.websocket = websocket;
    var me = this;

    var subscribe = function(callback){
        me.websocket.subscribe(function(data){
            if (data != null
                && data.Arguments != null
                && typeof(data.Arguments.someoneThere) != 'undefined') {
                callback(data.Arguments.someoneThere);
            }
        });
    }

    return {
        subscribe: subscribe
    }
}