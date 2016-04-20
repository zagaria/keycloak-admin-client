'use strict';
var request = require('request');

const privates = new WeakMap();

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
        auth: { bearer: privates.get(client).accessToken },
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        return resolve(body);
      });
    });
  };
}

function importRealm (client) {
  return function importRealm (realm) {
    return new Promise((resolve, reject) => {
      let req = {
        url: client.baseUrl + '/admin/realms',
        auth: { bearer: privates.get(client).accessToken },
        body: realm,
        json: true,
        method: 'POST'
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 201) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

function getRealm(client) {
  return function realm(realmName) {
    return new Promise((resolve, reject) => {
      let req = {
        url: client.baseUrl + '/admin/realms/' + realmName,
        auth: { bearer: privates.get(client).accessToken },
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status cod
        if (resp.statusCode !== 200) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

function deleteRealm (client) {
  return function deleteRealm (realmName) {
    return new Promise((resolve, reject) => {
      let req = {
        url: client.baseUrl + '/admin/realms/' + realmName,
        auth: { bearer: privates.get(client).accessToken },
        method: 'DELETE'
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status code is a 204
        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

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
        client = {};

  client.realms = getRealms(client);
  client.importRealm = importRealm(client);
  client.realm = getRealm(client);
  client.deleteRealm = deleteRealm(client);

  // Make baseUrl unchanging
  Object.defineProperty(client, 'baseUrl', {
    value: settings.baseUrl
  });

  // A WeakMap reference to our private data
  // means that when all references to 'client' disappear
  // then the entry will be removed from the map
  privates.set(client, data);

  // return a promise that resolves after auth
  return authenticate(client, settings);
}

module.exports = keycloakAdminClient;
