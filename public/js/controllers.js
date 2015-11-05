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
  var a_countdown = document.getElementById("a-countdown");

  function init() {
    $('.modal-trigger').leanModal({
      opacity: .9,
      dismissible: false
    });
    $('.tooltipped').tooltip({delay: 50});

    // Inicializar o timer
    var time = 60 * 0.5,
    display = $('#timer');
    timerId = startTimer(time, display);


    /* >> Controle do personagem de ajuda */
    $('#ktn').on('click', function() {
      if (!$('#ktn').hasClass('fixed')) {
        $('#ktn').addClass('fixed');
        $('#ktn').attr('src', './data/images/k-responde.png');
        $("#ajuda").typed({
          strings: ["Hmmm.^500.^500.^500. ^1500 eu acho que é a A! ^500 Mas eu passei isso em sala, você devia saber essa"],
          typeSpeed: 0,
          showCursor: false,
          callback: function() {
            $('#ktn').attr('src', './data/images/k-padrao.png');
          }
        });
      }
    });

    $('#ktn').on('mouseover', function() {
      if (!$('#ktn').hasClass('fixed'))
        $('#ktn').attr('src', './data/images/k-pergunta.png');
    });

    $('#ktn').on('mouseout', function() {
      if (!$('#ktn').hasClass('fixed'))
        $('#ktn').attr('src', './data/images/k-padrao.png');
    });
    /* << Controle do personagem de ajuda */


    /* >> Controle das alternativas */
    $('.opt').on('click', function(e) {
      if (!$(e.target).hasClass('fixed')) {
        checkResult(e.target.id);
      }
    });

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
    /* << Controle das alternativas */

  }

  /* Realiza mudanças na interface, bloqueia a seleção de outras alternativas, para
    o tempo e confere se o jogador acertou ou não a questão.  */
  function checkResult(id) {
    a_countdown.pause();
    clearInterval(timerId);
    $('#btn-proxima').css('visibility', 'visible'); // Exibe botão p/ próxima questão
    $('#' + id).removeClass('grey lighten-2'); // Remove cor de seleção da alternativa
    $('#ktn').addClass('fixed'); // Desativa clicks e efeitos de mouseover na personagem
    $('.opt').addClass('fixed');

    if (id === $scope.p.correta) { // Jogador acertou a questão
      a_correct.play(); // Toca o áudio de acerto
      $rootScope.score += $scope.p.dificuldade; // Aumenta o score de acordo c/ nível
    }
    else {
      $('#' + id).addClass('pink lighten-4'); // Marca a alternativa como incorreta
      $rootScope.$apply(function(){$rootScope.lifes = $rootScope.lifes - 1;}); // Jogador perde 1 vida
      if ($rootScope.lifes === 0) { // As vidas acabaram, game over
        a_gameover.play();
        $('#game-over-modal').openModal({
          opacity: .9,
          dismissible: false
        });
      }
      else { // Jogador ainda tem vida(s)
        a_wrong.play();
      }
    }
    $('#' + $scope.p.correta).addClass('green lighten-4'); // Marca a alternativa correta
    mostrarJustificativa();
  }

  // Exibe como fala da personagem a justificativa da questão correta
  function mostrarJustificativa() {
    $('#ktn').attr('src', './data/images/k-responde.png');
    $("#ajuda").typed({
      strings: [$scope.p.justificativa],
      typeSpeed: 0,
      showCursor: false,
      callback: function() {
        $('#ktn').attr('src', './data/images/k-padrao.png');
      }
    });
  }

  // Inicializa timer da questão
  function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    var ended = false;
    return setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);

        timer--;
        if (timer === 8) {
          a_countdown.play();
        }
        if (timer === -1) {
          checkResult();
        }
    }, 1000);
  }

}]);

demoControllers.controller('RankingController', ['$scope', '$rootScope', '$routeParams', '$window', '$http', function($scope, $rootScope, $routeParams, $window, $http) {

  $http.get('./data/ranking.json').success(function(data) {
    $scope.ranking = data.ranking;
  });
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
