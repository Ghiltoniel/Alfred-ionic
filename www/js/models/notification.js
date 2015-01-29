dashboard.factory('notificationModel', ['websocket', function(websocket) {
    return new NotificationModel(websocket);
}]);

function NotificationModel(websocket){
    this.websocket = websocket;
    var me = this;

    var subscribe = function(callback){
        me.websocket.subscribe(function(data){
            if (data != null
                && data.Arguments != null
                && typeof(data.Arguments.task) != 'undefined') {
                callback({
                    task: data.Arguments.task,
                    user: data.Arguments.user
                });
            }
        });
    }

    return {
        subscribe: subscribe
    }
}