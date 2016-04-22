/**
 * @module keycloak-admin-client
 */

'use strict';
var request = require('request');

const privates = require('./private-map');
const authenticate = require('./auth');
const realms = require('./realms');
const users = require('./users');

/**
  Creates a new Keycloak Admin client
  @param {object} settings - an object containing the settings
  @param {string} settings.baseUrl - The baseurl for the Keycloak server - ex: http://localhost:8080/auth,
  @param {string} settings.username - The username to login to the keycloak server - ex: admin
  @param {string} settings.password - The password to login to the keycloak server - ex: *****
  @param {string} settings.grant_type - the type of authentication mechanism - ex: password,
  @param {string} settings.client_id - the id of the client that is registered with Keycloak to connect to - ex: admin-cli
  @returns {Promise} A promise that will resolve with the client object.
  @instance
  @example

  const adminClient = require('keycloak-admin-client');
  const settings = {
    baseUrl: 'http://127.0.0.1:8080/auth',
    username: 'admin',
    password: 'admin',
    grant_type: 'password',
    client_id: 'admin-cli'
  };

  adminClient(settings)
    .then((client) => {
      client.realms()
      ...
      ...
    });
 */
function keycloakAdminClient(settings) {
  settings = settings || {};

  // setup our client and its private data
  const data = {},
        client = {};

  // Add in the realms functions
  for (let func in realms) {
    client[func] = realms[func](client);
  }

  // Add in the user functions
  for (let func in users) {
    client[func] = users[func](client);
  }

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
