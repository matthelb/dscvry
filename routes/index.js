var express = require('express');

var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var EchonestApi = require('echonest-api');
var config = require('../config.json');
var router = express.Router();

var echonest = new EchonestApi(config.echonest.API_KEY);

var scopes = ['playlist-modify', 'user-read-email', 'playlist-read-private', 'playlist-modify-private', 'user-read-private'];

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/logout', function(req, res) {
  req.session = null;
  res.redirect('/');
});

router.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  res.redirect(req.swa.createAuthorizeURL(scopes, state));
});

router.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  req.swa.authorizationCodeGrant(code).then(function(data1) {
    req.session.access_token = data1.access_token;
    req.session.refresh_token = data1.refresh_token;
    res.redirect('/');
  });
});

router.get('/status', function(req, res) {
  var ticket = req.query.ticket;
  echonest.request('tasteprofile/status', 'get', { ticket: ticket }, function(data) {
    res.json({
      status: data.response.ticket_status,
      details: data.response.details
    });
  });
});

router.get('/playlist', function(req, res) {
  var catalog_id = req.query.catalog_id;
  echonest.request('playlist/static', 'get', {
    seed_catalog : catalog_id,
    adventurousness : 1.0,
    type : 'catalog-radio',
    song_selection: 'song_discovery-top',
    bucket : ['id:spotify', 'tracks', 'song_discovery']
  }, function(data3) {
    var tracks = data3.response.songs ?
      data3.response.songs.map(function(song) { return song.tracks[0] ? song.tracks[0].foreign_id.substr(song.tracks[0].foreign_id.lastIndexOf(':') + 1) : '' }) :
      '';
    res.json({tracks: tracks});
    // req.swa.createPlaylist(req.query.user_id, "Tracks you may Like").then(function(p1) {
    //   req.swa.addTracksToPlaylist(req.query.user_id, p1.id, tracks).then(function(data4) {
    //     console.log('hi');
    //     console.log(p1.uri);
    //     res.redirect('/?' + querystring.stringify({playlist_uri: p1.uri}));
    //   });
    // });
  });
});

function addTracksToProfile(catalog_id, tracks, next) {
  echonest.request('tasteprofile/update', 'post', {
    id: catalog_id,
    data_type: 'json',
    data: JSON.stringify(tracks)
  }, function(data2) {
    next(data2.response.ticket);
  });
}

function retrieveTracks(swa, user_id, playlist_id, options, next) {
  swa.getPlaylistTracks(user_id, playlist_id, options).then(function(data) {
    next(data.next, data.items.map(function(song) { return { item: { track_id: song.track.uri } } }));
  });
}

router.get('/generate', function(req, res) {
  echonest.request('tasteprofile/create', 'post', {
      name: generateRandomString(32),
      type: 'song'
    }, function(data) {
      var catalog_id = data.response.id;
      var retrieveUntilFinished = function(offset) {
        retrieveTracks(req.swa, req.query.user_id, req.query.playlist_id, {limit: 100, offset: offset},
          function(next_url, tracks) {
            addTracksToProfile(catalog_id, tracks,
              function(ticket) {
                if (next_url) {
                  retrieveUntilFinished(offset + 100);
                } else {
                  res.json({
                    ticket: ticket,
                    catalog_id: catalog_id
                  })
                }
              }
            );
          }
        );
      };
      retrieveUntilFinished(0);
    });
});

module.exports = router;
