'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module users
 */

module.exports = {
  users: users,
  user: user,
  createUser: createUser
};

/**
  A function to get the list of users for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {object} [options] - The options object that will hold querystring params
  @param {string} [options.username] - the querystring param to search based on username
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
      options = options || {};
      let req = {
        url: `${client.baseUrl}/admin/realms/${realm}/users`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        qs: {
          username: options.username
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

/**
  A function to create a new user for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {object} user - The JSON representation of a user - http://keycloak.github.io/docs/rest-api/index.html#_userrepresentation - username must be unique
  @returns {Promise} A promise that will resolve with the user object
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.createUser(realmName, user)
        .then((createdUser) => {
        console.log(createdUser) // [{...}]
      });
    });
 */
function createUser (client) {
  return function createUser (realm, user) {
    return new Promise((resolve, reject) => {
      let req = {
        url: `${client.baseUrl}/admin/realms/${realm}/users`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: user,
        method: 'POST',
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 201) {
          return reject(body);
        }

        // Since the create Endpoint returns an empty body, go get what we just imported.
        // But since we don't know the userId, we need to search based on the username, since it will be unique
        // Then get the first element in the Array returned
        return resolve(client.users(realm, {username: user.username})
          .then((user) => {
            return user[0];
          }));
      });
    });
  };
}
