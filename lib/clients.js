'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module clients
 */

module.exports = {
    find: find,
    remove: remove
};

/**
  A function to get all the clients or a specific client for a realm
  @param {string} realmName - The name of the realm(not the realmID) to use - ex: master
  @param {object} [options] - The options object
  @param {string} [options.id] - The id of the client(not the client-id), this will override any query param options used
  @param {string} [options.clientId] - the querystring param to search based on clientId
  @returns {Promise} A promise that will resolve with the Array of clients or just 1 client if the id option is used
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.find(realmName)
        .then((clients) => {
        console.log(clients) // [{...},{...}, ...]
      });
    });
 */
function find(client) {
  return function find(realmName, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      let req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true
      };

      if (options.id) {
        req.url = `${client.baseUrl}/admin/realms/${realmName}/clients/${options.id}`;
      } else {
        req.url = `${client.baseUrl}/admin/realms/${realmName}/clients`;
        req.qs = options;
      }

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
  A function to remove a client
  @param {string} realmName - The name of the realm(not the realmID) to remove - ex: master,
  @param {string} id - The id of the client(not the client-id) to remove
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.remove(realmName, id)
        .then(() => {
          console.log('success');
      });
    });
 */
function remove (client) {
  return function remove (realmName, id) {
    return new Promise((resolve, reject) => {
      let req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/clients/${id}`,
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
