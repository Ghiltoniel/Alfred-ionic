dashboard.factory('peopleModel', ['websocket', function(websocket) {
    return new PeopleModel(websocket);
}]);

function PeopleModel(websocket){
    this.websocket = websocket;
    var me = this;

    var subscribe = function(callback){
        me.websocket.subscribe(function(data){
            if (data != null
                && data.Arguments != null
                && data.Command == 'People_List'
                && typeof(data.Arguments.people) != 'undefined') {
                var people = JSON.parse(data.Arguments.people);
                callback(people);
            }
        });
    }

    var getAll = function(){
        me.websocket.Send("People_Broadcast");
    }

    return {
        subscribe: subscribe,
        getAll: getAll
    }
}