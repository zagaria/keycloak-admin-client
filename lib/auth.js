'use strict';

const request = require('request');
const privates = require('./private-map');

function authenticate(client, settings) {
  return new Promise((resolve, reject) => {
    let req = {
      url: client.baseUrl + '/realms/master/protocol/openid-connect/token',
      form: settings
    }, jsonParsedBody;

    request.post(req, (err, resp, body) => {
      if (err) {
        return reject(err);
      }

      jsonParsedBody = JSON.parse(body);
      privates.get(client).accessToken = jsonParsedBody.access_token;

      return resolve(client);
    });
  });
}

module.exports = authenticate;
