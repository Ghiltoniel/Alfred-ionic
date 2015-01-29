dashboard.controller('notification', function ($scope, notificationModel) {
    var STORAGE_ID = 'notifications';
    var id = 0;
    localStorage.setItem(STORAGE_ID, '[]');
    var notifications = $scope.notifications = JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');

    $scope.$watch('notifications', function (newValue, oldValue) {
        $scope.allChecked = !$scope.remainingCount;
        if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
            localStorage.setItem(STORAGE_ID, JSON.stringify(notifications));
        }
    }, true);

    $scope.addTodo = function () {
        var newTodo = $scope.newTodo.trim();
        if (!newTodo.length) {
            return;
        }

        $scope.newTodo = '';
    };

    notificationModel.subscribe(function(command){
        var date = new Date;

        var minutes = date.getMinutes();
        var hour = date.getHours();

        notifications.push({
            task: command.task,
            user: command.user,
            time: hour + ':' + minutes,
            id: id++
        });
    });
});