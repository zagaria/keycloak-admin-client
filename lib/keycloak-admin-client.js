"use strict";
var request = require('request');

/**
 settings  - {Object} - an object containing the settings
 settings.baseUrl - {String} - The baseurl for the Keycloak server - ex: http://localhost:8080/auth,
 settings.username
 settings.password
 settings.grant_type,
 settings.client_id
 */
function keycloakAdminClient(settings) {
  settings = settings || {};

  // setup our client and its private data
  const data = {},
        o = {};
  o.realms = getRealms(o);

  // Make baseUrl unchanging
  Object.defineProperty(o, 'baseUrl', {
    value: settings.baseUrl
  });

  // A WeakMap reference to our private data
  // means that when all references to 'o' disappear
  // then the entry will be removed from the map
  privates.set(o, data);

  // return a promise that resolves after auth
  return authenticate(o, settings);
}

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

/**
 Returns a function that can get the realms for the provided client.
 */
function getRealms(client) {
  return function realms() {
    return new Promise((resolve, reject) => {
      let req = {
        url: client.baseUrl + '/admin/realms',
        auth: { bearer: privates.get(client).accessToken }
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        return resolve(JSON.parse(body));
      });
    });
  };
}

const privates = new WeakMap();

module.exports = keycloakAdminClient;
