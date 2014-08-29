var app = angular.module('dscvry', ['ngCookies', 'ngRoute']);

var loading_phrases = ['Reticulating splines', 'Crunching numbers', 'Consulting monkeys', 'Generating Gene Pools', 'Crossing t\'s', 'Checkering flags', 'Unreticulating splines', 'Re-reticulating splines'];

app.controller('DscvryController', function($scope, $cookies, $cookieStore, $route, $location, $http, $sce) {  
  $scope.reset = function() {
    $scope.spotify_embed_url = '';
    $scope.access_token = '';
    $scope.playlists = [];
    $scope.playlist = '';
    $scope.user = {display_name: '', images: [{url: ''}]};
    $scope.ticket = '';
    $scope.catalog_id = '';
    $scope.ticket_processed = false;
  }
  $scope.reset();

  var cookie = $cookies['express:sess'];
  if (cookie) {
    var session = JSON.parse(atob(cookie));
    $scope.access_token = session.access_token;
    $http.defaults.headers.common.Authorization = 'Bearer ' + $scope.access_token;
    $http.get('https://api.spotify.com/v1/me').
      success(function(data) {
        $scope.user = data;
        $http.get('https://api.spotify.com/v1/users/' + $scope.user.id + '/playlists').
        success(function(data1) {
          $scope.playlists = data1.items;
        });
      }).
      error(function(data, status) {
        if (status == 401) {
          window.location.href = '/login';
        }
      });
  }

  $scope.set_embed_url = function(trackset) {
    $scope.spotify_embed_url = $sce.trustAsResourceUrl('https://embed.spotify.com/?theme=white&uri=spotify:trackset:' + trackset);
    var elem = document.getElementById('embed');
    var width = Math.min(640, elem ? angular.element(elem)[0].offsetWidth : window.innerWidth * 4 / 9);
    var height = Math.min(720, elem ? angular.element(elem)[0].offsetHeight : window.innerHeight)
    $scope.embed_height = height;
    $scope.embed_width = width;
  }

  $scope.set_loading_phrase = function() {
    $scope.loading_phrase = loading_phrases[Math.floor(Math.random()*loading_phrases.length)];
  }

  var trackset = $location.search()['trackset'];
  if (trackset) {
    $scope.set_embed_url(trackset);
  }

  $scope.check_ticket = function() {
    return $http.get('/status', { params: { ticket: $scope.ticket } }).
      success(function(data) {
        switch (data.status) {
          case "complete":
            $scope.ticket_processed = true;
            $scope.get_tracks($scope.catalog_id);
            break;
          // case "pending":
          //   break;
          // case "error":
          //   break;
          // case "unknown":
          //   break;
          default:
            break;
        }
      });
  }

  $scope.get_tracks = function(catalog_id) {
    return $http.get('/playlist', { params: { catalog_id: catalog_id } }).
      success(function(data) {
        var trackset = data.tracks.filter(function(t){ return t.length > 0 }).join(',');
        $scope.set_embed_url(trackset);
        $location.search('trackset', trackset);
      });
  }

  $scope.generate_catalog = function(playlist_id, user_id) {
    return $http.get('/generate', { params: { playlist_id: playlist_id, user_id: user_id } }).
      success(function(data) {
        $scope.ticket = data.ticket;
        $scope.catalog_id = data.catalog_id;
      });
  }

  $scope.select_playlist = function(playlist) {
    $scope.ticket = '';
    $scope.catalog_id = '';
    $scope.spotify_embed_url = '';
    $scope.ticket_processed = false;
    $scope.playlist = playlist;
    $scope.set_loading_phrase();
    var check_until_processed = function() {
      $scope.set_loading_phrase();
      var start = Date.now();
      $scope.check_ticket().then(function() {
        if (!$scope.ticket_processed) {
          var elapsed = Date.now() - start;
          setTimeout(check_until_processed, Math.max(0, 1000 - elapsed));
        }
      });
    };
    $scope.generate_catalog(playlist.id, playlist.owner.id).then(check_until_processed);
  }
}).config(function($routeProvider) {
  $routeProvider.when('/', {
    reloadOnSearch: false
  });
});