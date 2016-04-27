### Keycloak Admin Client

[![Build Status](https://travis-ci.org/bucharest-gold/keycloak-admin-client.svg?branch=master)](https://travis-ci.org/bucharest-gold/keycloak-admin-client)

An _Extremely Experimental_ client for connecting to the Keycloak Admin REST API - http://keycloak.github.io/docs/rest-api/index.html

## API Documentation

http://bucharest-gold.github.io/keycloak-admin-client/

## Example

    'use strict';

    let adminClient = require('./');

    let settings = {
        baseUrl: 'http://127.0.0.1:8080/auth',
        username: 'admin',
        password: 'admin',
        grant_type: 'password',
        client_id: 'admin-cli'
    };

    adminClient(settings)
      .then((client) => {
        console.log('client', client);
        client.realms()
          .then((realms) => {
            console.log('realms', realms);
          });
      })
      .catch((err) => {
        console.log('Error', err);
      });


## Development & Testing

To run the tests, you'll need to have a keycloak server running. No worries!
This is all taken care of for you. Just run `./build/start-server.sh`.
If you don't already have a server downloaded, this script will download one
for you, start it, initialize the admin user, and then restart.

Then just run the tests.

    make test

To stop the server, run `./build/stop-server.sh`.

### Other

The current RFC is located here: https://github.com/bucharest-gold/entente/blob/master/rfcs/keycloak-admin-rest-api-node-client.md
