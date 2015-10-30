var demoApp = angular.module('demoApp', ['ngRoute', 'demoControllers', 'demoServices']);

demoApp.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
	$httpProvider.defaults.headers.post = { 'Content-Type': 'application/x-www-form-urlencoded' };
	$httpProvider.defaults.headers.put  = {'Content-Type': 'application/x-www-form-urlencoded'};
	$routeProvider.
	when('/home', {
	 templateUrl: 'partials/main.html',
	 controller: 'MainController'
	}).
	when('/pergunta/:id', {
	 templateUrl: 'partials/pergunta.html',
	 controller: 'GameController'
	}).
	when('/ranking', {
	 templateUrl: 'partials/ranking.html',
	 controller: 'RankingController'
	}).
	otherwise({
	 redirectTo: '/home'
	});
}]);

demoApp.run(function($rootScope) {
    $rootScope.user = undefined;
})
