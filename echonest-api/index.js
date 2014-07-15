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
    if (method == 'get') {
      options.url += '?' + querystring.stringify(data);
      return request.get(options, callback);
    } else if (method == 'post') {
      options.form = data;
      return request.post(options, callback);
    } else {
      throw 'Unknown method: ' + method;
    }
  };
}

module.exports = EchonestApi;