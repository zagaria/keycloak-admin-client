'use strict';

const request = require('request');
const privates = require('./private-map');

function authenticate(client, settings) {
  return new Promise((resolve, reject) => {
    let req = {
      url: client.baseUrl + '/realms/master/protocol/openid-connect/token',
      form: settings,
      json: true
    };

    request.post(req, (err, resp, body) => {
      if (err) {
        return reject(err);
      }

      privates.get(client).accessToken = body.access_token;

      return resolve(client);
    });
  });
}

module.exports = authenticate;
