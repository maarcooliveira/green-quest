var demoControllers = angular.module('demoControllers', []);

demoControllers.controller('GameController', ['$scope', '$rootScope', '$routeParams', '$window', 'Questions', 'Ranking', function($scope, $rootScope, $routeParams, $window, Questions, Ranking) {

  if (angular.isUndefined($rootScope.qarr)) {
    $window.location.href = '/#/home';
  }
  else if ($rootScope.pos === $rootScope.count) {
    $window.location.href = '/#/win';
  }
  else {
    var id = $routeParams.id;
    console.log(id);
    Questions.get({id: id}, function(data) {
      $scope.p = data;
      console.log(data);
    });
    $rootScope.pos = $rootScope.pos + 1;
    $scope.next = $rootScope.qarr[$rootScope.pos];
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

    if (parseInt(id,10) === $scope.p.questao[6].correta) { // Jogador acertou a questão
      a_correct.play(); // Toca o áudio de acerto
      $rootScope.score += $scope.p.questao[1].dificuldade; // Aumenta o score de acordo c/ nível
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
    $('#' + $scope.p.questao[6].correta).addClass('green lighten-4'); // Marca a alternativa correta
    mostrarJustificativa();
  }

  // Exibe como fala da personagem a justificativa da questão correta
  function mostrarJustificativa() {
    $('#ktn').attr('src', './data/images/k-responde.png');
    $("#ajuda").typed({
      strings: [$scope.p.questao[5].justificativa],
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

  function changeText(element, texts, time) {
    var text = texts.splice(0, 1) [0];
    if (text) {
      $( element ).fadeOut( "fast", function() {
        element.innerHTML = '<h4>' + text + '</h4>';
        $( element ).fadeIn("fast");
      });

      setTimeout(function () {
        changeText(element, texts, time);
      }, time);
    }
  }

  var texts = [
    'Enviando suas notas pra Katti',
    'Adicionando as notas no SIGA',
    'Vendo suas DPs em Complexidade',
    'Aumentando seu IRA...'
  ];
  var time = 1500;

  $scope.addToRanking = function() {
    $('#gameover-container').css('display', 'none');
    $('#loading-container').fadeIn("fast");

    var element = document.getElementById('prev-text');
    changeText(element, texts, time);

    setTimeout(function(){
      Ranking.add({nome: $rootScope.name, pontos: $rootScope.score}, function(res) {
        console.log(res);
        $('#game-over-modal').closeModal();
        $window.location.href = '/#/ranking';
      });
    }, 5000);
  }

}]);

demoControllers.controller('RankingController', ['$scope', '$rootScope', '$routeParams', '$window', '$http', 'Ranking', function($scope, $rootScope, $routeParams, $window, $http, Ranking) {

  $http.get('./data/ranking.json').success(function(data) {
    $scope.ranking = data.ranking;
  });

  Ranking.top5(function(res) {
    console.log(res);
  });
}]);

demoControllers.controller('MainController', ['$scope', '$rootScope', '$routeParams', '$window', '$http', 'Questions', function($scope, $rootScope, $routeParams, $window, $http, Questions) {

  function shuffle(arr) {
    for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    return arr;
  }

  $rootScope.lifes = 3;
  $rootScope.score = 0;
  $rootScope.pos = 0;
  $rootScope.name = "";

  Questions.getAllId(function(qids) {
    $rootScope.qarr = shuffle(qids.id);
    console.log($rootScope.qarr);
  });

  Questions.count(function(data) {
    $rootScope.count = data.quantidade;
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


demoControllers.controller('WinnerController', ['$scope', '$rootScope', '$routeParams', '$window', '$http', 'Ranking', function($scope, $rootScope, $routeParams, $window, $http, Ranking) {
  var a_win = document.getElementById("a-win");
  $rootScope.score = 0; //TODO: remover
  if ('WebkitAppearance' in document.documentElement.style) {
    conf();
  }
  else {
    $('#canvas').css('display', 'none');
  }

  a_win.play();

  function changeText(element, texts, time) {
    var text = texts.splice(0, 1) [0];
    if (text) {
      $( element ).fadeOut( "fast", function() {
        element.innerHTML = '<h4>' + text + '</h4>';
        $( element ).fadeIn("fast");
      });

      setTimeout(function () {
        changeText(element, texts, time);
      }, time);
    }
  }

  var texts = [
    'Enviando suas notas pra Katti',
    'Adicionando as notas no SIGA',
    'Vendo suas DPs em Complexidade',
    'Aumentando seu IRA...'
  ];
  var time = 1500;

  $scope.addToRanking = function() {
    $('#winner-container').css('display', 'none');
    $('#loading-container').fadeIn("fast");

    var element = document.getElementById('prev-text');
    changeText(element, texts, time);

    setTimeout(function(){
      Ranking.add({nome: $rootScope.name, pontos: $rootScope.score}, function(res) {
        console.log(res);
        $window.location.href = '/#/ranking';
      });
    }, 5000);
  }
}]);
