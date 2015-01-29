dashboard.controller('audioPlayer', function ($scope, audioPlayerModel) {

    $scope.$on('$includeContentLoaded', function() {
        var oAudio = document.getElementById('audio_player');
        oAudio.autoplay = false;
        playerCommand = new PlayerCommand(null, oAudio, $scope, audioPlayerModel);
    
        audioPlayerModel.subscribe(function (data) {
            if (data == 'play') {     
                var d = new Date();            
                console.log(d.getSeconds() + ':' + d.getMilliseconds());
                playerCommand.StartSynchronize();
            }
            else if (data == 'pong') {
                playerCommand.Pong();
            }
            else {
                if (!data)
                    return;

                playerCommand.arguments = data.Arguments;
                if (typeof playerCommand[data.Command] != 'undefined'){
                    playerCommand[data.Command]();
                    $scope.$apply();
                }
            };        
        });
    });
    
    $scope.registered = false;
    $scope.togglePlayback = function togglePlayback() {
        if ($scope.registered) {
            audioPlayerModel.unregister();
            $scope.registered = false;
            playerCommand.player.pause();
        }
        else {
            audioPlayerModel.register();
        }
    } 
    
    $scope.playPause = audioPlayerModel.playPause;
    $scope.previous = audioPlayerModel.previous;
    $scope.next = audioPlayerModel.next;
    
});

var PlayerCommand = function PlayerCommand(arguments, player, $scope, audioPlayerModel) {
    this.arguments = arguments;
    this.player = player;
    this.scope = $scope;
    this.audioPlayerModel = audioPlayerModel;
    this.syncPosition = 0;
    this.status = -1;
    var dateStartPing;
    var ping;
    var pingCountDown;
    $(player).on('play pause ended loadstart loadeddata timeupdate', { 'command': this }, this.PlayerChange);
};

PlayerCommand.prototype = {

    Stop: function () {
        this.player.stop();
    },

    PlayPause: function () {
        if (this.player.paused == true) {
            this.player.play();
        } else {
            this.player.pause();
        }
    },

    DirectPlay: function () {
        var path = this.arguments.file;
        path = path.replace('\\\\192.168.1.32', 'ftp://media.homedns.org');

        this.player.src = path;

        if (this.arguments.sync) {
            console.log('synchronizing');
            this.audioPlayerModel.syncStatus = 'Synchronizing';
        }

        if (this.player && this.player.paused == false)
            this.player.stop();

        if (this.arguments.position)
            this.syncPosition = parseFloat(this.arguments.position.replace(',', '.'));
    },       

    Registered: function()
    {
        this.audioPlayerModel.isFirst = this.arguments.isFirst == "True" ? true : false;
        this.player.play();
        isPlayerRegistered = true;
        this.scope.registered = true;
    },

    StartSynchronize: function () {
        this.pingCountDown = 3;
        this.Ping();
    },

    Ping: function () {
        this.dateStartPing = new Date();
        this.audioPlayerModel.ping();
    },

    Pong: function () {
        var datePong = new Date();
        var newping = datePong.getTime() - this.dateStartPing.getTime();
        this.ping = this.ping > 0 ? (newping + this.ping) / 2 : newping;

        if (this.pingCountDown > 0) {
            this.pingCountDown--;
            this.Ping();
        }
        else if (this.audioPlayerModel.syncStatus == 'ReadyToPlay') {
            var me = this;
            console.log(new Date());
            window.setTimeout(function () {
                me.player.play();
                me.audioPlayerModel.syncStatus = 'Synchronized';
            }, 1000 - this.ping);
        }
    },

    Volume: function () {
        if (this.player)
            this.player.volume = this.arguments.volume / 100;
    },
    
    UpdateStatus: function(){
        var playlist = JSON.parse(this.arguments.playlist);
        var status = JSON.parse(this.arguments.status);
        
        this.scope.title = playlist[status.CurrentPlaylistIndex].title;
        this.scope.artist = playlist[status.CurrentPlaylistIndex].artist;
        this.scope.status = status;
    },

    SetPosition: function () {
        this.player.currentTime = parseFloat(this.arguments.position.replace(',', '.'));
    },

    PlayerChange: function (e) {
        var command = e.data.command;
        var eventType = e.type;
        console.log(eventType);

        if (eventType == 'undefined')
            command.status = -1;
        else if (eventType == 'loading')
            command.status = 2;
        else if (eventType == 'loadeddata') {
            command.status = 2;
            command.player.play();
        }
        else if (eventType == 'play' && command.player.src != '') {
            if (command.audioPlayerModel.syncStatus == 'Synchronizing') {
                command.player.pause();
                command.player.currentTime = command.syncPosition;
                command.syncPosition = 0;
                command.audioPlayerModel.ready();
            }
            else
                command.status = 3;
        }
        else if (eventType == 'timeupdate' 
            && command.player.readyState == 4 
            && !command.player.paused)
            command.status = 3;
        else if (eventType == 'pause')
            command.status = 4;
        else if (eventType == 'stopped')
            command.status = 5;
        else if (eventType == 'ended') {
            command.status = 5;
            command.audioPlayerModel.next();
        }


        if (command.player.src)
            command.audioPlayerModel.updateStatus(command.status, command.player.duration, command.player.currentTime, command.player.volume);
    }
}