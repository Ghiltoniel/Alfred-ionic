dashboard.controller('texttospeech', function ($scope, texttospeechModel) {

    $scope.run = function(){
        texttospeechModel.run($scope.text);
    }
    
});