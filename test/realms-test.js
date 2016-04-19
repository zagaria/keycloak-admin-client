'use strict';

const test = require('tape'),
  keycloakAdminClient = require('../index');

const settings = {
  baseUrl: 'http://127.0.0.1:8080/auth',
  username: 'admin',
  password: 'admin',
  grant_type: 'password',
  client_id: 'admin-cli'
};

test('Test getting the list of Realms', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    t.equal(typeof client.realms, 'function', 'The client object returned should have a realms function');

    client.realms().then((listOfRealms) => {
      // The listOfRealms should be an Array
      t.equal(listOfRealms instanceof Array, true, 'the list of realms should be an array');

      // There should only be 1 realm and it should be master.
      t.equal(listOfRealms.length, 1, 'There should only be 1 realm in our test server');
      t.equal(listOfRealms[0].realm, 'master', 'The realm should be named master');
      t.end();
    });
  });
});

test('Top-Level Realm Test - Test getting the just the Master Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    t.equal(typeof client.realm, 'function', 'The client object returned should have a realm function');

    // Realm takes the Realms name *not* the Realm Id
    client.realm('master').then((realm) => {
      // The realm reutned should be an object and be the master realm
      t.equal(realm instanceof Object, true, 'the list of realms should be an array');
      t.equal(realm.realm, 'master', 'The realm should be named master');
      t.end();
    });
  });
});

test('Top-Level Realm Test - wrong realm name should through an error', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Realm takes the Realms name *not* the Realm Id
    client.realm('notmaster').catch((err) => {
      t.equal(err, 'Realm not found.', 'Realm not found should be returned if the realm wasn\'t found');
      t.end();
    });
  });
});

test('Top-Level Realm Test -  no realm name should through an error', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Realm takes the Realms name *not* the Realm Id
    client.realm().catch((err) => {
      t.equal(err, 'Realm not found.', 'Realm not found should be returned if the realm wasn\'t found');
      t.end();
    });
  });
});

