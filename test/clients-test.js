'use strict';

const test = require('tape'),
  keycloakAdminClient = require('../index'),
  kcSetupForTests = require('../build/kc-setup-for-tests.json');

const settings = {
  baseUrl: 'http://127.0.0.1:8080/auth',
  username: 'admin',
  password: 'admin',
  grant_type: 'password',
  client_id: 'admin-cli'
};

test('Test getting the list of clients for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    t.equal(typeof client.clients, 'function', 'The client object returned should have a clients function');

    // Use the master realm
    const realmName = 'master';

    client.clients(realmName).then((listOfClients) => {
      // The listOfCients should be an Array
      t.equal(listOfClients instanceof Array, true, 'the list of client should be an array');

      // The list of client in the master realm should have 4 people
      t.equal(listOfClients.length, 9, 'There should be 4 client in master');
      t.end();
    });
  });
});

test('Test getting the list of clients for a Realm that doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'notarealrealm';

    client.clients(realmName).catch((err) => {
      t.equal(err, 'Realm not found.', 'Realm not found should be returned if the realm wasn\'t found');
      t.end();
    });
  });
});

test('Test getting 1 client using query params for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {

    // Use the master realm
    const realmName = 'master';
    const options = {
      clientId: 'admin-cli'
    };

    client.clients(realmName, options).then((listOfClients) => {
      // The listOfClients should be an Array
      t.equal(listOfClients instanceof Array, true, 'the list of clients should be an array');
      t.equal(listOfClients.length, 1, 'There should be 1 client with this clientId in master');
      t.end();
    });
  });
});

test('Test getting the one client for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {

    t.equal(typeof client.client, 'function', 'The client object returned should have a client function');

    // Use the master realm
    const realmName = 'master';
    const clientId = '294193ca-3506-4fc9-9b33-cc9d25bd0ec7'; // This is the admin-cli client id from /build/kc-setup-for-tests.json

    client.client(realmName, clientId).then((client) => {
      t.equal(client.id, clientId, 'The client id we used and the one returned should be the same');
      t.equal(client.clientId, 'admin-cli', 'The clientId returned should be admin-cli');
      t.end();
    });
  });
});

test('Test getting the one client for a Realm - client id doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const clientId = 'not-an-id';

    client.client(realmName, clientId).catch((err) => {
      t.equal(err, 'Could not find client', 'A Client not found error should be thrown');
      t.end();
    });
  });
});

