var SpotifyWebApi = require('spotify-web-api-node');

module.exports = function(opts){
  return function spotifySession(req, res, next) {
    if (!req.swa) {
      req.swa = new SpotifyWebApi({
        clientId: opts.CLIENT_ID,
        clientSecret: opts.CLIENT_SECRET,
        redirectUri: opts.REDIRECT_URI
      });
    }
    if (req.session.access_token && req.session.refresh_token) {
      req.swa.setAccessToken(req.session.access_token);
      req.swa.setRefreshToken(req.session.refresh_token);  
    }
    next();
  }
};