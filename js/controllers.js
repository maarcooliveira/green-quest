var demoControllers = angular.module('demoControllers', []);

demoControllers.controller('GameController', ['$scope', '$rootScope', '$window', function($scope, $rootScope, $window) {

}]);

demoControllers.controller('RankingController', ['$scope', '$rootScope', '$routeParams', '$window', function($scope, $rootScope, $routeParams, $window) {

}]);

demoControllers.controller('MainController', ['$scope', '$rootScope', '$routeParams', '$window', function($scope, $rootScope, $routeParams, $window) {

  $(document).ready(function(){
    $('.tooltipped').tooltip({delay: 50});
  });

}]);
