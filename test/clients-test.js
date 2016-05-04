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
    t.equal(typeof client.clients.find, 'function', 'The client object returned should have a clients.find function');

    // Use the master realm
    const realmName = 'master';

    client.clients.find(realmName).then((listOfClients) => {
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

    client.clients.find(realmName).catch((err) => {
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

    client.clients.find(realmName, options).then((listOfClients) => {
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

    // Use the master realm
    const realmName = 'master';
    const id = '294193ca-3506-4fc9-9b33-cc9d25bd0ec7'; // This is the admin-cli client id from /build/kc-setup-for-tests.json

    client.clients.find(realmName, {id: id}).then((client) => {
      t.equal(client.id, id, 'The client id we used and the one returned should be the same');
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
    const id = 'not-an-id';

    client.clients.find(realmName, {id: id}).catch((err) => {
      t.equal(err, 'Could not find client', 'A Client not found error should be thrown');
      t.end();
    });
  });
});

test('Test create a Client', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    t.equal(typeof client.clients.create, 'function', 'The client object returned should have a create function');

    const realmName = 'Test Realm 1';
    const newClient = {
      clientId: 'test created client',
      description: 'just a test',
      bearerOnly: true
    };

    client.clients.create(realmName, newClient).then((addedClient) => {
      t.equal(addedClient.clientId, newClient.clientId, 'The clientId should be named ' + newClient.clientId);
      t.equal(addedClient.description, newClient.description, 'The description should be named ' + newClient.description);
      t.end();
    });
  });
});

test('Test create a Client - a not unique clientId', (t) => {
  const kca = keycloakAdminClient(settings);

   // Use the master realm
    const realmName = 'master';
    const newClient = {
      clientId: 'admin-cli',
      description: 'just a test'
    };

  kca.then((client) => {
    client.clients.create(realmName, newClient).catch((err) => {
      t.equal(err.errorMessage, 'Client admin-cli already exists', 'Error message should be returned when using a non-unique clientId');
      t.end();
    });
  });
});

test('Test delete a client', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    t.equal(typeof client.clients.remove, 'function', 'The client object returned should have a remove function');

    // Use the master realm
    const realmName = 'Test Realm 1';
    const id = 'd8c51041-84c7-4e76-901d-401e73eb1666';

    client.clients.remove(realmName, id).then(() => {
      t.end();
    });
  });
});

test('Test delete a client that doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  const id = 'not-a-real-id';
  const realmName = 'master';
  kca.then((client) => {
    // Call the deleteRealm api to remove this realm
    client.clients.remove(realmName, id).catch((err) => {
      t.equal(err, 'Could not find client', 'Should return an error that no user is found');
      t.end();
    });
  });
});
