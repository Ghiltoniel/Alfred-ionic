dashboard.factory('lightModel', ['websocket', function(websocket) {
    return new LightModel(websocket);
}]);

function LightModel(websocket){
    this.websocket = websocket;
    var me = this;

    var toggle = function(id, on){
        me.websocket.Send("Device_LightCommand", {
            'id': id,
            'on': on
        });
    }

    var turnAllOn = function(){
        me.websocket.Send("Device_AllumeTout");
    }

    var turnAllOff = function(){
        me.websocket.Send("Device_EteinsTout");
    }

    var getAll = function(){
        me.websocket.Send("Device_BroadcastLights");
    }

    var subscribe = function(callback){
        me.websocket.subscribe(function(data){
            if (data != null
                && data.Arguments != null
                && typeof(data.Arguments.lights) != 'undefined') {
                var lights = JSON.parse(data.Arguments.lights);
                callback(lights);
            }
        });
    }

    return {
        getAll: getAll,
        toggle: toggle,
        turnAllOn: turnAllOn,
        turnAllOff: turnAllOff,
        subscribe: subscribe
    }
}