dashboard.factory('chatModel', ['websocket', function(websocket) {
    return new ChatModel(websocket);
}]);

function ChatModel(websocket){
    this.websocket = websocket;
    var me = this;

    var subscribe = function(callback){
        me.websocket.subscribe(function(data){
            if (data != null
                && data.Arguments != null
                && typeof(data.Arguments.message) != 'undefined') {
                callback({
                    message: data.Arguments.message,
                    user: data.Arguments.user
                });
            }
        });
    }

    var send = function(text){
        me.websocket.Send("Chat_Send", {
            'text': text
        });
    }

    return {
        subscribe: subscribe,
        send: send
    }
}