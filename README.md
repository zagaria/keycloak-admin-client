### Keycloak Admin Client

[![Build Status](https://travis-ci.org/bucharest-gold/keycloak-admin-client.svg?branch=master)](https://travis-ci.org/bucharest-gold/keycloak-admin-client)

An _Extremely Experimental_ client for connecting to the Keycloak Admin REST API - http://keycloak.github.io/docs/rest-api/index.html

The current RFC is located here: https://github.com/bucharest-gold/entente/blob/master/rfcs/keycloak-admin-rest-api-node-client.md

## Development & Testing

To run the tests, you'll need to have a keycloak server running. No worries!
This is all taken care of for you. Just run `./test/scripts/start-server.sh`.
If you don't already have a server downloaded, this script will download one
for you, start it, initialize the admin user, and then restart.

Then just run the tests.

    make test

To stop the server, run `./test/scripts/stop-server.sh`.
