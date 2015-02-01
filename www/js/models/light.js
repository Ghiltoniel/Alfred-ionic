dashboard.factory('lightModel', ['alfredClient', function(alfredClient) {
    return new LightModel(alfredClient);
}]);

function LightModel(alfredClient){
    this.alfredClient = alfredClient;
    var me = this;

    var toggle = function(id, on){
		alfredClient.Lights.lightCommand(id, on);
    }
	
    var light = function(id, on, bri, hue, sat){
		alfredClient.Lights.lightCommand(id, on, bri, hue, sat);
    }

    var turnAllOn = function(){
        alfredClient.Lights.allumeTout();
    }

    var turnAllOff = function(){
        alfredClient.Lights.eteinsTout();
    }

    var getAll = function(){
        alfredClient.Lights.getAll();
    }

    var subscribe = function(callback){
        alfredClient.subscribe(function(data){
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
		light: light,
        turnAllOn: turnAllOn,
        turnAllOff: turnAllOff,
        subscribe: subscribe
    }
}