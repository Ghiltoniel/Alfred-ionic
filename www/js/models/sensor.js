dashboard.factory('sensorModel', function(alfredClient) {
    return new SensorModel(alfredClient);
});

function SensorModel(alfredClient){
    this.alfredClient = alfredClient;
    var me = this;

    var getAll = function(){
        me.alfredClient.Sensors.getAll().then(function(sensors){
            
        });
    }

    var getHistory = function(id){
        me.alfredClient.Sensors.getHistory(id);
    }

    var subscribe = function(callback){
		me.alfredClient.subscribe(function(data){
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