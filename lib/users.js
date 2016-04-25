'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module users
 */

module.exports = {
  users: users,
  user: user
};

/**
  A function to get the list of users for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @returns {Promise} A promise that will resolve with an Array of user objects
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.users(realmName)
        .then((userList) => {
        console.log(userList) // [{...},{...}, ...]
      });
    });
 */
function users (client) {
  return function users (realm, options) {
    return new Promise((resolve, reject) => {
      let req = {
        url: `${client.baseUrl}/admin/realms/${realm}/users`,
        auth: {
          bearer: privates.get(client).accessToken
        },
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

/**
  A function to get the list of users for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @returns {Promise} A promise that will resolve with the user object
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.user(realmName, userId)
        .then((user) => {
        console.log(user) // {...}
      });
    });
 */
function user (client) {
  return function user (realm, userId) {
    return new Promise((resolve, reject) => {
      let req = {
        url: `${client.baseUrl}/admin/realms/${realm}/users/${userId}`,
        auth: {
          bearer: privates.get(client).accessToken
        },
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
