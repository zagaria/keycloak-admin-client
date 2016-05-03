'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module clients
 */

module.exports = {
    clients: clients,
    client: client
};

/**
  A function to get all the clients for a realm
  @param {string} realmName - The name of the realm(not the realmID) to use - ex: master
  @param {object} [options] - The options object that will hold querystring params
  @param {string} [options.clientId] - the querystring param to search based on clientId
  @returns {Promise} A promise that will resolve with the Array of client objects
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients(realmName)
        .then((clients) => {
        console.log(clients) // [{...},{...}, ...]
      });
    });
 */
function clients(client) {
  return function clients(realmName, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      let req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/clients`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true,
        qs: options
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 200) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

/**
  A function to get 1 client for a realm
  @param {string} realmName - The name of the realm(not the realmID) to use
  @param {string} clientId - The id of the client(not the client-id) to use
  @returns {Promise} A promise that will resolve with the client object
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.client(realmName, clientId)
        .then((client) => {
        console.log(client) // {...}
      });
    });
 */
function client(c) {
  return function client(realmName, clientId) {
    return new Promise((resolve, reject) => {
      let req = {
        url: `${c.baseUrl}/admin/realms/${realmName}/clients/${clientId}`,
        auth: { bearer: privates.get(c).accessToken },
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 200) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}
