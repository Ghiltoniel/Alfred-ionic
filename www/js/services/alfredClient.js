dashboard.factory('alfredClient', ['$q', '$rootScope', 'websocket', function($q, $rootScope, websocket) {
    // We return this object to anything injecting our service
    var Service = {};
    
		
	Service.subscribe = function(callback){
        websocket.subscribe(function(data){
			callback(data);
        });
    };
	
	var events = {};
    Service.on = function(names, handler) {
		names.split(' ').forEach(function(name) {
			if (!events[name]) {
				events[name] = [];
			}
			events[name].push(handler);
		});
		return this;
	};
    
	var trigger = function(name, args) {
		angular.forEach(events[name], function(handler) {
			handler.call(null, args);
		});
		return this;
	};
	
	websocket.subscribe(function(data){
		trigger();
	});
	
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

			websocket.send('Device_LightCommand', arguments);
		},

		getAll: function()
		{
			websocket.send("Device_BroadcastLights");
		},

		allumeTout: function()
		{
			websocket.send("Device_AllumeTout");
		},

		eteinsTout: function()
		{
			websocket.send("Device_EteinsTout");
		},

		allume: function(piece)
		{
			websocket.send("Device_Allume",
			{
				piece: piece
			});
		},

		eteins: function(piece)
		{
			websocket.send("Device_Eteins",
			{
				piece: piece
			});
		},

		turnUp: function(piece)
		{
			websocket.send("Device_TurnUp",
			{
				piece: piece
			});
		},

		turnDown: function(piece)
		{
			websocket.send("Device_TurnDown",
			{
				piece: piece
			});
		}
    };
	
	Service.Sensors = {
		getAll: function(){
			websocket.send("Sensor_BroadcastSensors");
		},
		
		getHistory: function(id){
			websocket.send("Sensor_BroadcastSensorHistory", {
				'id': id
			});
		}
	};

    return Service;
}])