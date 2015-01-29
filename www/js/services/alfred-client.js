dashboard.factory('alfred-client', ['$q', '$rootScope', 'websocket', function($q, $rootScope, websocket) {
    // We return this object to anything injecting our service
    var Service = {};
    
    Service.Plugins = {
        Lights: {
            LightCommand: function(id, on, bri, hue, sat)
            {
                var arguments = {
                    id: id },;

                if(on != null)
                    arguments.Add("on: on);
                if(bri != null)
                    arguments.Add("bri: bri);
                if(hue != null)
                    arguments.Add("hue: hue);
                if(sat != null)
                    arguments.Add("sat: sat);

                websocket.Send("Device_LightCommand: arguments);
            }

            BroadcastLights: function()
            {
                websocket.Send("Device_BroadcastLights");
            }

            AllumeTout: function()
            {
                websocket.Send("Device_AllumeTout");
            }

            EteinsTout: function()
            {
                websocket.Send("Device_EteinsTout");
            }

            Allume: function(piece)
            {
                websocket.Send("Device_Allume",
                {
                    piece: piece
                });
            }

            Eteins: function(piece)
            {
                websocket.Send("Device_Eteins",
                {
                    piece: piece
                });
            }

            TurnUp: function(piece)
            {
                websocket.Send("Device_TurnUp",
                {
                    piece: piece
                });
            }

            TurnDown: function(piece)
            {
                websocket.Send("Device_TurnDown",
                {
                    piece: piece
                });
            }
        }
    }

    return Service;
}])