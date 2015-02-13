dashboard.controller('scenario', function ($scope, $ionicModal, $ionicScrollDelegate, $ionicPopover, $http, scenarioModel) {

	var template = '<ion-popover-view><ion-header-bar> <h1 class="title">Le scénario a été lancé !</h1> </ion-header-bar></ion-popover-view>';

	$scope.popover = $ionicPopover.fromTemplate(template, {
		scope: $scope,
	});	

	// Create the login modal that we will use later
	$ionicModal.fromTemplateUrl('templates/scenario-edit.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});
	
	$scope.openPopover = function($event) {
		$scope.popover.show($event);
	};
	$scope.closePopover = function() {
		$scope.popover.hide();
	};
	
	var lightsOrig;
	$http.get('http://api-nam.kicks-ass.org/device/list').success(function(data){
		lightsOrig = data;
	});
	
	$http.get('http://api-nam.kicks-ass.org/radios').success(function(data){
		$scope.radios = data;
	});
	
	$http.get('http://api-nam.kicks-ass.org/playlists').success(function(data){
		$scope.playlists = data;
	});
	
	$http.get('http://api-nam.kicks-ass.org/music/genres').success(function(data){
		$scope.genres = data;
	});
	
	$http.get('http://api-nam.kicks-ass.org/music/artists').success(function(data){
		$scope.artists = data;
	});
	
	$scope.new = function(){
		$scope.scenario = {};
		for(var i in lightsOrig){
			var h = lightsOrig[i].Hue * 360 / 65535;
			var s = lightsOrig[i].Sat / 255;
			var v = lightsOrig[i].Bri / 255;
			lightsOrig[i].Color = tinycolor({ h: h, s: s, v: v }).toHexString();
			lightsOrig[i].DimOnly = lightsOrig[i].DimEnabled && !lightsOrig[i].ColorEnabled;
			lightsOrig[i].SwitchOnly = !lightsOrig[i].DimEnabled && !lightsOrig[i].ColorEnabled;
			lightsOrig[i].Class = lightsOrig[i].SwitchOnly ? 'item item-toggle' : 'item item-input';
		}
		$scope.lights = lightsOrig;
		$scope.modal.show();
	}
	
	$scope.edit = function(scenario){
		$scope.scenario = scenario;
		$scope.lights = lightsOrig;
		for(var i in lightsOrig){
			var lightOrig = null;
			var lightScenario = null;
			for(var j in scenario.Lights){
				if(scenario.Lights[j].Key == lightsOrig[i].Key){
					lightOrig = $scope.lights[j];
					lightScenario = scenario.Lights[j];
				}
			}
			
			lightsOrig[i].DimOnly = lightsOrig[i].DimEnabled && !lightsOrig[i].ColorEnabled;
			lightsOrig[i].SwitchOnly = !lightsOrig[i].DimEnabled && !lightsOrig[i].ColorEnabled;
			lightsOrig[i].Class = lightsOrig[i].SwitchOnly ? 'item item-toggle' : 'item item-input';
			
			if(lightOrig){
				var h = lightScenario.Hue * 360 / 65535;
				var s = lightScenario.Sat / 255;
				var v = lightScenario.Bri / 255;
				lightOrig.Color = tinycolor({ h: h, s: s, v: v }).toHexString();
				lightOrig.Bri = lightScenario.Bri;
				lightOrig.Hue = lightScenario.Hue;
				lightOrig.Sat = lightScenario.Sat;
				lightOrig.On = lightScenario.On;
				$scope.lights[i] = lightOrig;
				lightOrig = null;
			}
		}
		$scope.musicType = scenario.Radio ? 'Radio' : scenario.PlaylistId ? 'Playlist' : 'Local';
		$scope.modal.show();
	};
	
	$scope.changeColor = function(light){
		var hsv = tinycolor(light.Color).toHsv();										
		light.Hue = Math.round(hsv.h * 65535 / 360);
		light.Sat = Math.round(hsv.s * 255);
		light.Bri = Math.round(hsv.v * 255);
	};
	
	$scope.changeGenre = function(){
		$http.get('http://api-nam.kicks-ass.org/music/artists?genre='+$scope.scenario.Genre).success(function(data){
			$scope.artists = data;
		});
	};
	
	$scope.changeRadio = function(){
		$http.get('http://api-nam.kicks-ass.org/radios/subradios/'+$scope.scenario.Radio).success(function(data){
			$scope.subradios = data;
			for(var i in $scope.radios){
				if($scope.radios[i].BaseName == $scope.scenario.Radio){					
					$scope.scenario.RadioUrl = $scope.radios[i].BaseUrl;
				}
			}
		});
	};
	
	$scope.changeSubRadio = function(){
		for(var i in $scope.subradios){
			if($scope.subradios[i].Name == $scope.scenario.SubRadio){					
				$scope.scenario.RadioUrl = $scope.subradios[i].Url;
			}
		}
	};
	
	$scope.changeArtist = function(){
		$http.get('http://api-nam.kicks-ass.org/music/albums?artist='+$scope.scenario.Artist).success(function(data){
			$scope.albums = data;
		});
	};
	
	$scope.close = function(){
		$scope.modal.hide();
	};
	
    scenarioModel.subscribe(function(scenarios){
        $scope.scenarios = scenarios;
        $scope.$apply();
    });

    scenarioModel.getAll();

    $scope.run = function(){
        scenarioModel.run(this.scenario.Name);
		$scope.openPopover();
    }
    
    $scope.save = function(){
		var scenario = $scope.scenario;
		scenario.Lights = $scope.lights;
		scenarioModel.save(scenario, function(error){
			if(error.ModelState){
				$scope.errors = [];
				for(var e in error.ModelState){
					if(e != '$type'){
						$scope.errors.push(error.ModelState[e][0]);
					}
				}
				$ionicScrollDelegate.scrollTop();
			}
			if(!error){
				$scope.modal.hide();
			}
		});
	}
});