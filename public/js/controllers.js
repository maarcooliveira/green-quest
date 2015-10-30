var demoControllers = angular.module('demoControllers', []);

demoControllers.controller('GameController', ['$scope', '$rootScope', '$routeParams', '$window', function($scope, $rootScope, $routeParams, $window) {

  if (angular.isUndefined($rootScope.questions)) {
    $window.location.href = '/#/home';
  }
  else {
    var id = $routeParams.id;
    $scope.p = $rootScope.questionDoc[$rootScope.pos]; //trocar pos;
    $rootScope.pos = $rootScope.pos + 1;
    $scope.next = $rootScope.questions[$rootScope.pos];
    $(document).ready(init);
  }

  var stopTimer = false;
  var timerId;
  var a_correct = document.getElementById("a-correct");
  var a_wrong = document.getElementById("a-wrong");
  var a_gameover = document.getElementById("a-gameover");

  // $scope.question =

  function init() {
    $('.modal-trigger').leanModal({
      opacity: .9,
      dismissible: false
    });
    $('.tooltipped').tooltip({delay: 50});

    // Inicializar o timer
    var time = 60 * 1.5,
    display = $('#timer');
    timerId = startTimer(time, display);

    // Listeners para click, mouseover e mouseout para personagem de ajuda
    $('#ktn').on('click', function() {
      $('#ktn').addClass('fixed');
      $('#ktn').attr('src', './data/images/k-responde.png');

      $("#ajuda").typed({
        strings: ["Hmmm.^500.^500.^500. ^1500 eu acho que é a A! ^500 Mas eu passei isso em sala, você devia saber essa"],
        typeSpeed: 0,
        showCursor: false
      });
    });

    $('#ktn').on('mouseover', function() {
      if (!$('#ktn').hasClass('fixed'))
        $('#ktn').attr('src', './data/images/k-pergunta.png');
    });

    $('#ktn').on('mouseout', function() {
      if (!$('#ktn').hasClass('fixed'))
        $('#ktn').attr('src', './data/images/k-padrao.png');
    });

    // Listener para mouseover e mouseout em alternativas
    $('.opt').on('mouseover', function(e) {
      if (!$(e.target).hasClass('fixed')) {
        $('.opt').removeClass('grey lighten-2');
        $(e.target).addClass('grey lighten-2');
      }
    });

    $('.opt').on('mouseout', function(e) {
      if (!$(e.target).hasClass('fixed')) {
        $(e.target).removeClass('grey lighten-2');
      }
    });

    $('.opt').on('click', function(e) {
      if (!$(e.target).hasClass('fixed')) {
        $('.opt').addClass('fixed');
        $('#ktn').removeClass('fixed');
        $('#ktn').attr('src', './data/images/k-padrao.png');
        clearInterval(timerId);
        $('#btn-proxima').css('visibility', 'visible');
        checkResult(e.target.id);
      }
    });

  }

  function checkResult(id) {
    $('#' + id).removeClass('grey lighten-2');
    if (id === $scope.p.correta) {
      a_correct.play();
      $rootScope.score += $scope.p.dificuldade;
    }
    else {
      $rootScope.$apply(function(){$rootScope.lifes = $rootScope.lifes - 1;});
      if ($rootScope.lifes === 0) {
        a_gameover.play();
        $('#game-over-modal').openModal({
          opacity: .9,
          dismissible: false
        });
      }
      else {
        a_wrong.play();
      }
      $('#' + id).addClass('pink lighten-4');
    }
    $("#ajuda").typed({
      strings: [$scope.p.justificativa],
      typeSpeed: 0,
      showCursor: false
    });
    $('#' + $scope.p.correta).addClass('green lighten-4');
  }

  function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    return setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);

        if (--timer < 0) {
            timer = 0;
        }
    }, 1000);
  }

}]);

demoControllers.controller('RankingController', ['$scope', '$rootScope', '$routeParams', '$window', function($scope, $rootScope, $routeParams, $window) {

}]);

demoControllers.controller('MainController', ['$scope', '$rootScope', '$routeParams', '$window', '$http', function($scope, $rootScope, $routeParams, $window, $http) {

  $rootScope.lifes = 3;
  $rootScope.score = 0;
  $rootScope.pos = 0;
  $rootScope.questions = [21, 125, 76, 12, 42, 7, 30, 1];
  $rootScope.name = "";

  $http.get('./data/data.json').success(function(data) {
    $rootScope.questionDoc = data.perguntas;
  });

  $(document).ready(function() {
    $('.tooltipped').tooltip({delay: 50});

    $('#btn-comecar').on('mouseover', function() {
      $("#ktn-main").animate({'margin-bottom': "0px"}, {queue: false});
      $("#ktn-main").animate({'margin-top': "0px"}, {queue: false});
    });

    $('#btn-comecar').on('mouseout', function() {
      $("#ktn-main").animate({'margin-bottom': "-10px"}, {queue: false});
      $("#ktn-main").animate({'margin-top': "10px"}, {queue: false});
    });
  });

}]);
