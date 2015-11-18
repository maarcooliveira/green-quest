var demoControllers = angular.module('demoControllers', []);

demoControllers.controller('GameController', ['$scope', '$rootScope', '$routeParams', '$window', 'Questions', 'Ranking', function($scope, $rootScope, $routeParams, $window, Questions, Ranking) {

  window.scrollTo(0, 0);

  if (timerId) {
    console.log("Timer cleared");
    clearInterval(timerId);
  }

  if (angular.isUndefined($rootScope.qarr)) {
    $window.location.href = '/#/home';
  }
  else if ($rootScope.pos === $rootScope.count) {
    $window.location.href = '/#/win';
  }
  else if ($rootScope.lifes <= 0) {
    $window.location.href = '/#/home';
  }
  else {
    var id = $routeParams.id;
    Questions.get({id: id}, prepareGame);
    $rootScope.pos = $rootScope.pos + 1;
    $scope.next = $rootScope.qarr[$rootScope.pos];
  }

  function prepareGame(data) {
    $scope.p = data;
    $(document).ready(init);
  }

  var stopTimer = false;
  var timerId;
  var a_correct = document.getElementById("a-correct");
  var a_wrong = document.getElementById("a-wrong");
  var a_gameover = document.getElementById("a-gameover");
  var a_countdown = document.getElementById("a-countdown");
  var idA, idB, idC, idD;

  function init() {
    $('.modal-trigger').leanModal({
      opacity: .9,
      dismissible: false
    });
    $('.tooltipped').tooltip({delay: 50});

    // Inicializar o timer
    var time = 60 * 1,
    display = $('#timer');
    timerId = startTimer(time, display);

    var ajudaTexto = [
      "Muito fácil, é a ",
      "Posso estar enganada, mas me parece que a certa é a ",
      "Só posso te adiantar uma das alternativas incorretas: a ",
      "Pensa mais um pouco, vai. Tá fácil!",
      "Passei isso em sala, você devia saber!",
      "Tá querendo moleza, é? Tá no curso errado!",
      "Não vou estragar a surpresa.",
      "Se você conseguir errar essa, melhor fazer um intervalo, tomar um café e voltar depois."
    ];

    try{
      idA = $scope.p.respostas[0].id;
      idB = $scope.p.respostas[1].id;
      idC = $scope.p.respostas[2].id;
      idD = $scope.p.respostas[3].id;
    }catch(e){
       console.log("ERRO: alternativas incompletas", e);
    }


    function alternativaCerta() {
      var idCorreta = $scope.p.questao[6].correta;
      if (idA === idCorreta)
        return "A";
      if (idB === idCorreta)
        return "B";
      if (idC === idCorreta)
        return "C";
      if (idD === idCorreta)
        return "D";
    }

    function alternativaErrada() {
      var idCorreta = $scope.p.questao[6].correta;
      if (idA === idCorreta)
        return "B";
      if (idB === idCorreta)
        return "C";
      if (idC === idCorreta)
        return "D";
      if (idD === idCorreta)
        return "A";
    }

    function getFrase() {
      var ajuda = Math.floor(Math.random() * (7 - 0 + 1)) + 0;
      if (ajuda === 0) {
        return ajudaTexto[0] + alternativaCerta();
      }
      else if (ajuda === 1) {
        var ehCerta = Math.floor((Math.random() * 1) + 0);
        if (ehCerta === 1)
          return ajudaTexto[1] + alternativaCerta();
        else
          return ajudaTexto[1] + alternativaErrada();
      }
      else if (ajuda === 2) {
        return ajudaTexto[2] + alternativaErrada();
      }
      else {
        return ajudaTexto[ajuda];
      }
    }

    /* >> Controle do personagem de ajuda */
    $('#ktn').on('click', function() {
      if (!$('#ktn').hasClass('fixed')) {
        $('#ktn').addClass('fixed');
        $('#ktn').attr('src', './data/images/k-responde.png');
        $("#ajuda").typed({
          strings: [getFrase()],
          typeSpeed: -100,
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

    /* Realiza mudanças na interface, bloqueia a seleção de outras alternativas, para
      o tempo e confere se o jogador acertou ou não a questão.  */
    function checkResult(id) {
      a_countdown.pause();
      clearInterval(timerId);
      $('#' + id).removeClass('grey lighten-2'); // Remove cor de seleção da alternativa
      $('#ktn').addClass('fixed'); // Desativa clicks e efeitos de mouseover na personagem
      $('.opt').addClass('fixed');
      mostrarJustificativa();

      if (parseInt(id,10) === $scope.p.questao[6].correta) { // Jogador acertou a questão
        a_correct.play(); // Toca o áudio de acerto
        $rootScope.score += $scope.p.questao[4].valor; // Aumenta o score de acordo c/ nível
      }
      else {
        $('#' + id).addClass('pink lighten-4'); // Marca a alternativa como incorreta
        $rootScope.$apply(function(){$rootScope.lifes = $rootScope.lifes - 1;}); // Jogador perde 1 vida
        if ($rootScope.lifes <= 0) { // As vidas acabaram, game over
          a_gameover.play();
          $('#btn-proxima').css('visibility', 'hidden'); // Exibe botão p/ próxima questão
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
    }

    // Exibe como fala da personagem a justificativa da questão correta
    function mostrarJustificativa() {
      $('#ktn').attr('src', './data/images/k-responde.png');
      $("#ajuda").removeData('typed');
      $("#ajuda").typed({
        strings: [$scope.p.questao[5].justificativa],
        typeSpeed: -100,
        showCursor: false,
        callback: function() {
          $("#source").html('<br><a href=\'' + $scope.p.source[0] + '\' target=\'_blank\'>' + $scope.p.source[0] + '</a>');
          $('#ktn').attr('src', './data/images/k-padrao.png');
          clearInterval(timerId);
          $('#btn-proxima').css('visibility', 'visible'); // Exibe botão p/ próxima questão
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
          $('#game-over-modal').closeModal();
          $window.location.href = '/#/ranking';
        });
      }, 5000);
    }


  }


}]);

demoControllers.controller('RankingController', ['$scope', '$rootScope', '$routeParams', '$window', '$http', 'Ranking', function($scope, $rootScope, $routeParams, $window, $http, Ranking) {

  Ranking.top5(function(res) {
    $scope.ranking = res.jogadores;
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
        $window.location.href = '/#/ranking';
      });
    }, 5000);
  }
}]);
