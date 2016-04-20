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

      //There should be a master realm and it should be the first in the list.
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

test('Test import a realm - just using a realm name', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a realm,  just using the name property
  const realmToAdd = {
    realm: 'testRealm'
  };

  kca.then((client) => {
    t.equal(typeof client.importRealm, 'function', 'The client object returned should have a importRealm function');

    client.importRealm(realmToAdd).then((addedRealm) => {
      // The importRealm Endpoint does not return anything in the body.
      // But our api "fakes it" by calling the client.realm(realm) function after a succesfull import.
      t.equal(addedRealm.realm, realmToAdd.realm, 'The realm should be named ' + realmToAdd.realm);

      // clean up the realm we just added. This is only really needed when running tests locally.
      // deleteRealm is tested later on
      // TODO: find a better way
      client.deleteRealm(realmToAdd.realm);
      t.end();
    });
  });
});

test('Test import a realm - a not unique name', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a realm,  just using the name property
  const realmToAdd = {
    realm: 'master'
  };

  kca.then((client) => {
    client.importRealm(realmToAdd).catch((err) => {
      t.equal(err.errorMessage, 'Realm with same name exists', 'Error message should be returned when using a non-unique realm name');
      t.end();
    });
  });
});

test('Test delete a realm', (t) => {
  const kca = keycloakAdminClient(settings);

  // First we need to create a realm to delete
  // A minimal JSON representation of a realm,  just using the name property
  const realmToAdd = {
    realm: 'testRealmForDeleting'
  };

  kca.then((client) => {
    client.importRealm(realmToAdd).then((addedRealm) => {
      // just a quick quick that the realm is there
      t.equal(addedRealm.realm, realmToAdd.realm, 'The realm should be named ' + realmToAdd.realm);

      // Call the deleteRealm api to remove this realm
      client.deleteRealm(realmToAdd.realm).then(() => {
        // There is no return value on a delete
        t.end();
      });
    });
  });
});

test('Test delete a realm that doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a realm,  just using the name property, This realm shouldn't exist
  const realmToAdd = {
    realm: 'testRealmThatDoesntExist'
  };

  kca.then((client) => {
    // Call the deleteRealm api to remove this realm
    client.deleteRealm(realmToAdd.realm).catch((err) => {
      t.equal(err, 'Realm not found.', 'Realm not found should be returned if the realm wasn\'t found to delete');
      t.end();
    });
  });
});
