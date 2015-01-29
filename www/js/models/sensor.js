dashboard.factory('sensorModel', ['websocket', function(websocket, $cookies) {
    return new SensorModel(websocket, $cookies);
}]);

function SensorModel(websocket, $cookies){
    this.websocket = websocket;
    var me = this;

    var getAll = function(){
        me.websocket.Send("Sensor_BroadcastSensors", arguments);
    }

    var getHistory = function(id){
        me.websocket.Send("Sensor_BroadcastSensorHistory", {
            'id': id
        });
    }

    var subscribe = function(callback){
        me.websocket.subscribe(function(data){
            if (data != null
                && data.Arguments != null){
                if(typeof(data.Arguments.sensors) != 'undefined') {
                    var sensors = JSON.parse(data.Arguments.sensors).filter(function(s){
                        return !isNaN(parseFloat(s.Value))
                            && parseFloat(s.Value) != 0
                            && !s.IsActuator;
                    });
                    callback(sensors, 'sensors');
                }
                else if(typeof(data.Arguments.history) != 'undefined') {
                    callback(data.Arguments, 'history');
                }
                else if(data.Command == 'Sensor_Value') {
                    callback(data.Arguments, 'value');
                }
            }
        });
    }

    return {
        getAll: getAll,
        getHistory: getHistory,
        subscribe: subscribe
    }
}