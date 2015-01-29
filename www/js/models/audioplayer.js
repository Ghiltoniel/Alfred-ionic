dashboard.factory('audioPlayerModel', ['websocket', function(websocket) {
    return new AudioPlayerModel(websocket);
}]);

function AudioPlayerModel(websocket){
    this.websocket = websocket;
    var lastUpdateStatus = new Date(); 
    var syncStatus = 'Unsynchronized';
    var isFirst = false;
    var me = this;
    var login;

    var submit = function(login, password){
        me.login = login;
        me.websocket.Send("AudioPlayer_Login", {
            'login': login,
            'password': password
        });
    }

    var subscribe = function(callback, login){
        me.websocket.subscribe(function(data){
            callback(data);
        });
    }
    
    var register = function () {
        var audioTagSupport = !!(document.createElement('audio').canPlayType);
        if (audioTagSupport) {
            me.websocket.Send(
                "Player_Register", 
                {
                    name: 'playerHtml5-' + Math.round(Math.random() * 10000)
                });
        }
        else
            alert('Playback unsupported !');
    }

    var unregister = function () {
        me.websocket.Send("Player_Unregister");
    }
    
    var ping = function() {
        me.websocket.SendRaw('ping');
    }
    
    var sendReadyToPlaySignal = function () {
        console.log('sending ready signal');
        me.websocket.Send("Player_ReadyToPlay");
        this.syncStatus = 'ReadyToPlay';
    }

    var sendPlayPauseSignal = function () {
        me.websocket.Send("MediaManager_PlayPause");
    }

    var sendNextSongSignal = function () {
        me.websocket.Send("MediaManager_Next");
    }
    
    var sendPreviousSongSignal = function () {
        me.websocket.Send("MediaManager_Previous");
    }

    var sendUpdateStatusSignal = function (status, duration, position, volume) {
        if (!this.isFirst)
            return;

        var delay = (new Date()).getTime() - this.lastUpdateStatus.getTime();
        if (delay < 1000 && status == 3)
            return;
        this.lastUpdateStatus = new Date();

        var args = {};

        if (status != '')
            args.status = status;

        if (!isNaN(duration))
            args.length = ('' + duration).replace('.', ',');

        if (!isNaN(position))
            args.position = ('' + position).replace('.', ',');

        if (!isNaN(volume))
            args.volume = ('' + volume).replace('.', ',');

        me.websocket.Send(
            "MediaManager_UpdateStatus", args
        );
    }

    return {
        lastUpdateStatus: lastUpdateStatus,
        isFirst: isFirst,
        syncStatus: syncStatus,
        submit: submit,
        subscribe: subscribe,
        register: register,
        unregister: unregister,
        ping: ping,
        playPause: sendPlayPauseSignal,
        next: sendNextSongSignal,
        previous: sendPreviousSongSignal,
        ready: sendReadyToPlaySignal,
        updateStatus: sendUpdateStatusSignal
    }
}

var Task = function Task() {
    var baseCommand;
    var arguments;
    var type;
    var fromName;
    var speakBeforeExecute;
    var speakAfterExecute;
};

Task.prototype = {

    serialize: function () {
        return JSON.stringify(this);
    }

}