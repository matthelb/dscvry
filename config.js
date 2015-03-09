module.exports = {
  "spotify" : {
    "CLIENT_ID" : process.env.SPOTIFY_CLIENT_ID,
    "CLIENT_SECRET" : process.env.SPOTIFY_CLIENT_SECRET,
    "REDIRECT_URI" : process.env.SPOTIFY_REDIRECT_URI
  },
  "echonest" : {
    "API_KEY" : process.env.ECHONEST_API_KEY,
    "CONSUMER_KEY" : process.env.ECHONEST_CONSUMER_KEY,
    "SHARED_SECRET" : process.env.ECHONEST_SHARED_SECRET
  },
  "SESSION_SECRET" : process.env.SESSION_SECRET
}
