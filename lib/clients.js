'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module clients
 */

module.exports = {
    find: find,
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
