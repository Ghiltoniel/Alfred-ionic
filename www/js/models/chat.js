dashboard.factory('chatModel', function(alfredClient) {
    return new ChatModel(alfredClient);
});

function ChatModel(alfredClient){
    
    var subscribe = function(callback){
        alfredClient.subscribe(function(data){
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
        alfredClient.Chat.send(text);
    }

    return {
        subscribe: subscribe,
        send: send
    }
}