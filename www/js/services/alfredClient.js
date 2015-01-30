dashboard.factory('alfredClient', ['$q', '$rootScope', 'websocket', function($q, $rootScope, websocket) {
    // We return this object to anything injecting our service
    var Service = {};
    
	Service.subscribe = function(callback){
        websocket.subscribe(function(data){
			callback(data);
        });
    };
	
    Service.Lights = {
		lightCommand: function(id, on, bri, hue, sat)
		{
			var arguments = {
				id: id 
			};

			if(on != null)
				arguments.on = on;
			if(bri != null)
				arguments.bri = bri;
			if(hue != null)
				arguments.hue = hue;
			if(sat != null)
				arguments.sat = sat;

			websocket.Send('Device_LightCommand', arguments);
		},

		getAll: function()
		{
			websocket.Send("Device_BroadcastLights");
		},

		allumeTout: function()
		{
			websocket.Send("Device_AllumeTout");
		},

		eteinsTout: function()
		{
			websocket.Send("Device_EteinsTout");
		},

		allume: function(piece)
		{
			websocket.Send("Device_Allume",
			{
				piece: piece
			});
		},

		eteins: function(piece)
		{
			websocket.Send("Device_Eteins",
			{
				piece: piece
			});
		},

		turnUp: function(piece)
		{
			websocket.Send("Device_TurnUp",
			{
				piece: piece
			});
		},

		turnDown: function(piece)
		{
			websocket.Send("Device_TurnDown",
			{
				piece: piece
			});
		}
    };
	
	Service.Sensors = {
		getAll: function(){
			websocket.Send("Sensor_BroadcastSensors");
		},
		
		getHistory: function(id){
			websocket.Send("Sensor_BroadcastSensorHistory", {
				'id': id
			});
		}
	};

    return Service;
}])