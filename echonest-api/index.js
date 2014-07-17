var PromiseImpl = require('promise');
var querystring = require('querystring');
var request = require('request');

var echonest_api_url = 'http://developer.echonest.com/api/v4/';

function EchonestApi(api_key) {
  this.request = function(endpoint, method, data, callback) {
    var url = echonest_api_url + endpoint;
    data.api_key = api_key;
    data.format = 'json';
    var options = {
      url: url,
    };
    var req;
    if (method == 'get') {
      options.url += '?' + querystring.stringify(data);
      req = request.get;
    } else if (method == 'post') {
      options.form = data;
      req = request.post;
    } else {
      throw 'Unknown method: ' + method;
    }
    req(options, function(error, response, data) {
      var json = JSON.parse(data);
      callback(json);
    });
  };
}

module.exports = EchonestApi;