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

test('Test getting the list of users for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    t.equal(typeof client.users, 'function', 'The client object returned should have a users function');

    // Use the master realm
    const realmName = 'master';

    client.users(realmName).then((listOfUsers) => {
      // The listOfUsers should be an Array
      t.equal(listOfUsers instanceof Array, true, 'the list of users should be an array');

      // The list of users in the master realm should have 4 people
      t.equal(listOfUsers.length, 4, 'There should be 4 users in master');
      t.equal(listOfUsers[0].username, 'admin', 'The first username should be the admin user');
      t.end();
    });
  });
});

test('Test getting the list of users for a Realm that doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'notarealrealm';

    client.users(realmName).catch((err) => {
      t.equal(err, 'Realm not found.', 'Realm not found should be returned if the realm wasn\'t found');
      t.end();
    });
  });
});
