//var baseUrl = "http://localhost:4000/api";
var baseUrl = "https://salty-earth-6137.herokuapp.com/home";

angular.module('demoServices', [])
    .factory('Questions', function($http, $window, $browser){
        return {
          get: function(n, callback){
            $http.post(baseUrl+'/get_question/', $.param(n)).success(function(data){
              console.log("Success");
              callback(data);
            })
            .error(function(data){
              console.log("Error");
              console.log(data);
            });
          },
          getAllId: function(callback){
            $http.get(baseUrl+'/get_AllQuestionID').success(function(data){
              callback(data);
            });
          },
          count: function(callback){
            $http.get(baseUrl+'/num_questions').success(function(data){
              callback(data);
            });
          }
        }
    })
    .factory('Ranking', function($http, $window){
        return{
          add: function(info, callback){
            $http.post(baseUrl+'/set_rank/', $.param(info)).success(function(data){
              console.log("Success");
              callback(data);
            })
            .error(function(data){
              console.log("Error");
              callback(data);
            });
          },
          top5: function(info, callback){
            $http.get(baseUrl+'/get_Top5/').success(function(data){
              console.log("Success");
              callback(data);
            })
            .error(function(data){
              console.log("Error");
              console.log(data);
            });
          }
        }
    })
    ;
