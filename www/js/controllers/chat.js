dashboard.controller('chat', function ($scope, chatModel) {
    var CHAT_ID = 'chat';

    localStorage.setItem(CHAT_ID, '[]');
    var chatMessages = $scope.chatMessages = JSON.parse(localStorage.getItem(CHAT_ID) || '[]');
    
    var id = 0;
    for(var i = 0; i < chatMessages.length; i++){
        if(chatMessages[i].id > id){
            id = chatMessages[i].id;
        }
    }
    id++;

    $scope.$watch('chatMessages', function (newValue, oldValue) {
        $scope.allChecked = !$scope.remainingCount;
        if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
            localStorage.setItem(CHAT_ID, JSON.stringify(chatMessages));
            var chatBox = $('#chat-box');
            chatBox.scrollTop(chatBox[0].scrollHeight);
        }
    }, true);

    $scope.newMessage = {
        text: ''
    };
    
    $scope.addMessage = function () {
        var message = $scope.newMessage.text.trim();
        if (!message.length) {
            return;
        }
        chatModel.send(message);
        $scope.newMessage.text = '';
    };

    chatModel.subscribe(function(command){
        var date = new Date;

        var minutes = date.getMinutes();
        var hour = date.getHours();

        $scope.chatMessages.push({
            message: command.message,
            user: command.user,
            time: hour + ':' + minutes,
            id: id++
        });
        $scope.$apply();
    });
});