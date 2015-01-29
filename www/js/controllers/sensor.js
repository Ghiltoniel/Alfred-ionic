dashboard.controller('sensor', function ($scope, sensorModel, $cookies) {

    var areas = [];
    $scope.loading = true;
    sensorModel.subscribe(function(data, type){
        if(type == 'sensors') {
            var sensors = data;
            $scope.sensors = sensors;
            $scope.sensor = sensors[0];

            sensorModel.getHistory(sensors[0].Id);
            sensorModel.getHistory(sensors[1].Id);
            $scope.$apply();
        }
        else if(type == 'history'){
            var history = JSON.parse(data.history);
            $scope.loading = false;
            $scope.$apply();

            var graphData = [];
            var min = null;
            var max = null;
            for(var point in history){
                graphData.push({
                    y: point,
                    item1: history[point]
                });
                if(min == null || history[point] < min) {
                    min = history[point];
                }
                if(max == null || history[point] > max) {
                    max = history[point];
                }
            }
            var ymax = max + (max - min) / 2;
            var ymin = min - (max - min) / 2;

            var existingArea = areas.filter(function(e){
                return e.id == 'sensor-' + data.id;
            });
            if(existingArea.length > 0){
                existingArea[0].area.setData(graphData);
            }
            else {
                var area = new Morris.Area({
                    element: 'sensor-' + data.id,
                    resize: true,
                    data: graphData,
                    xkey: 'y',
                    ymin: Math.round(ymin),
                    ymax: Math.round(ymax),
                    ykeys: ['item1'],
                    labels: [$scope.sensor.Name],
                    lineColors: ['#a0d0e0'],
                    hideHover: 'auto'
                });

                areas.push({
                    id: 'sensor-' + data.id,
                    area: area
                });
            }
        }
        else if(type == 'value'){
            var value = data.value;

            var existingArea = areas.filter(function(e){
                return e.id == 'sensor-' + data.id;
            });
            if(existingArea.length > 0){
                var graphData = [];
                for(var point in existingArea[0].area.data){
                    graphData.push(existingArea[0].area.data[point].src);
                }
                
                graphData.push({
                    y: data.date,
                    item1: data.value
                });
                existingArea[0].area.setData(graphData);
            }
        }
    });

    $scope.selectSensor = function(){
        $scope.sensor = this.s;
        $scope.loading = true;
        sensorModel.getHistory(this.s.Id);
    }

    sensorModel.getAll();
});

dashboard.controller('sensorInfos', function ($scope, sensorModel, $cookies) {

    sensorModel.subscribe(function(data, type){
        if(type == 'history'){
            $scope.loading = false;
            $scope.$apply();

            var history = JSON.parse(data.history);
            var lastDate;
            for(var i in history) {
                var newDate = new Date(i);
                if(!lastDate || lastDate < newDate){
                    lastValue = Math.round(history[i] * 100) / 100;
                    lastDate = newDate;
                }
            }

            if(data.type == 'Temperature'){
                $scope.temperature = lastValue;
                if(lastValue > 20){
                    $scope.temperatureComment = "It's quite nice out here !";
                }
                else{
                    $scope.temperatureComment = "It's getting freezy out here !";
                }
            }
            if(data.type == 'Humidity'){
                $scope.humidity = lastValue;
                $scope.humidityComment = 'Everything\'s normal !';
            }
        }
    });
    
});