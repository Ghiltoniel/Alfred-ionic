dashboard.factory('texttospeechModel', ['websocket', function(websocket) {
    return new TextToSpeechModel(websocket);
}]);

function TextToSpeechModel(websocket){
    this.websocket = websocket;
    var me = this;

    var run = function(text){
        me.websocket.Send("Alfred_PlayTempString", {
            'sentence': text
        });
    }

    return {
        run: run
    }
}