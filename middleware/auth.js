var SpotifyWebApi = require('spotify-web-api-node');

var SPOTIFY_CLIENT_ID = '80a42d72a5a4477bbd66f94612872d90';
var SPOTIFY_CLIENT_SECRET = 'a1f91550fe1548a095fc0e9fc0748800';
var SPOTIFY_REDIRECT_URI = 'http://localhost:8888/callback';

module.exports = function(opts){
  return function spotifySession(req, res, next) {
    if (!req.swa) {
      req.swa = new SpotifyWebApi({
        clientId: SPOTIFY_CLIENT_ID,
        clientSecret: SPOTIFY_CLIENT_SECRET,
        redirectUri: SPOTIFY_REDIRECT_URI
      });
    }
    if (req.session.access_token && req.session.refresh_token) {
      req.swa.setAccessToken(req.session.access_token);
      req.swa.setRefreshToken(req.session.refresh_token);  
    }
    next();
  }
}