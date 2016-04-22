'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module users
 */

module.exports = {
  users: users
};

function users (client) {
  return function (realm, options) {
    return new Promise((resolve, reject) => {
      let req = {
        url: client.baseUrl + '/admin/realms/' + realm + '/users',
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
