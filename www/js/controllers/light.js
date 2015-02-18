dashboard.controller('light', function ($scope, lightModel) {
	var colorPicker;
	var currentLight;
	
    lightModel.subscribe(function(lights){
		for(var l in lights){
			lights[l].Bri = lights[l].Bri || 0;
		}
        $scope.lights = lights;
        $scope.$apply();
    });

    lightModel.getAll();

    $scope.toggle = function(){
        lightModel.toggle(this.light.Key, this.light.On);
    }
	
    $scope.dim = function(){
		if(this.light.Bri < 30){
			lightModel.toggle(this.light.Key, false);
		}
		else {
			lightModel.light(this.light.Key, true, this.light.Bri);
		}
    }
	
	$scope.getBri = function(){
		return this.light.Bri || 0;
	}
	
	$scope.showColorPicker = function(){
		if(!this.light.ColorEnabled){
			return;
		}
		
		currentLight = this.light;
		if(colorPicker == null){
			colorPicker = $("#spectrum").kendoColorPicker({
				value: "#ffffff",
				buttons: false,
				select: function preview(e) {
					var color = kendo.parseColor(e.value);					
					var hsv = color.toHSV();											
					var hue = Math.round(hsv.h * 65535 / 360);
					var sat = Math.round(hsv.s * 255);
					var bri = Math.round(hsv.v * 255);
					currentLight.Hue = hue;
					currentLight.Sat = sat;
					currentLight.Bri = bri;
					lightModel.light(currentLight.Key, currentLight.On, currentLight.Bri, currentLight.Hue, currentLight.Sat); 
				}
			}).data("kendoColorPicker");
		}
		colorPicker.open();
	};
            
	$scope.$watch('color', function(newColor) {
		//elm.spectrum('set', newColor);
	});

    $scope.turnAllOn = lightModel.turnAllOn;
    $scope.turnAllOff = lightModel.turnAllOff;
	
	$scope.$on('authenticated', function(event, args) {
		lightModel.getAll();
	});
});