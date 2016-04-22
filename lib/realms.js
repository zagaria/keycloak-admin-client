'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module realms
 */

module.exports = {
    realms: realms,
    realm: realm,
    importRealm: importRealm,
    deleteRealm: deleteRealm,
    updateRealm: updateRealm
};

/**
  A function to get all the realms for a client
  @returns {Promise} A promise that will resolve with the Array of realm objects
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.realms()
        .then((realms) => {
        console.log(realms) // [{...},{...}, ...]
      });
    });
 */
function realms(client) {
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

/**
  A function to get 1 realm for a client
  @param {string} realmName - The name of the realm(not the realmID) to find - ex: master
  @returns {Promise} A promise that will resolve with the realm object
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.realm(realmName)
        .then((realm) => {
        console.log(realm) // {...}
      });
    });
 */
function realm(client) {
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

/**
  A function to update a realm for a client
  @param {object} realm - The JSON representation of the realm to insert.
  @returns {Promise} A promise that resolves with the JSON representation of the import realm.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.importRealm(realmName, realm)
        .then((newRealm) => {
          console.log(newRealm); //{...}
      });
    });
 */
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

        // Since the import Endpoint returns an empty body, go get what we just imported.
        return resolve(client.realm(realm.realm));
      });
    });
  };
}

/**
  A function to update a realm for a client
  @param {string} realmName - The name of the realm(not the realmID) to update - ex: master,
  @param {object} realm - The JSON representation of the fields to update.
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.updateRealm(realmName, realm)
        .then(() => {
          console.log('success');
      });
    });
 */
function updateRealm (client) {
  return function updateRealm (realmName, realm) {
    return new Promise((resolve, reject) => {
      let req = {
        url: client.baseUrl + '/admin/realms/' + realmName,
        auth: { bearer: privates.get(client).accessToken },
        json: true,
        method: 'PUT',
        body: realm
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        // Check that the status cod
        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

/**
  A function to delete a realm for a client
  @param {string} realmName - The name of the realm(not the realmID) to delete - ex: master,
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.deleteRealm(realmName,)
        .then(() => {
          console.log('success');
      });
    });
 */
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
