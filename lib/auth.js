'use strict';

const privates = require('./private-map');
const getToken = require('keycloak-request-token');

function authenticate (client, settings) {
  return getToken(client.baseUrl, settings)
    .then((token) => {
      privates.get(client).accessToken = token;

      return client;
    });
}

module.exports = authenticate;
