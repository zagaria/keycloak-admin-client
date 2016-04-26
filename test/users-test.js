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

test('Test getting the one user for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const userId = 'f9ea108b-a748-435f-9058-dab46ce59771'; // This is the admin user id from /build/kc-setup-for-tests.json

    client.user(realmName, userId).then((user) => {
      t.equal(user.id, userId, 'The userId we used and the one returned should be the same');
      t.equal(user.username, 'admin', 'The username returned should be admin');
      t.end();
    });
  });
});

test('Test getting the one user for a Realm - userId doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const userId = 'not-an-id';

    client.user(realmName, userId).catch((err) => {
      t.equal(err, 'User not found', 'A User not found error should be thrown');
      t.end();
    });
  });
});

test('Test update a users info', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    t.equal(typeof client.updateUser, 'function', 'The client object returned should have a updateUser function');
    // Use the master realm
    const realmName = 'master';
    let testUser = Object.assign({}, kcSetupForTests[0].users.find((user) => { return user.id === '3ff724a6-90a8-4050-9981-4a6def74870a';})); // This is the test1 user id from /build/kc-setup-for-tests.json

    // just making sure we have the correct thing
    t.equal(testUser.id, '3ff724a6-90a8-4050-9981-4a6def74870a', 'The userId should be the one we want');
    t.equal(testUser.firstName, 'Test User 1', 'The firstName returned should be Test User 1');

    // Update the test user
    testUser.firstName = 'Test User 1 is my first name';
    testUser.lastName = 'This is my last name';

    client.updateUser(realmName, testUser).then(() => {
      // The update doesn't return anything so we need to go get what we just updated
      return client.user(realmName, testUser.id);
    }).then((user) => {
      t.equal(user.firstName, testUser.firstName, 'The firstName returned should be Test User 1 is my first name');
      t.equal(user.lastName, testUser.lastName, 'The lastName returned should be This is my last name');
      t.end();
    });
  });
});


test('Test update a users info - same username error', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    let testUser = Object.assign({}, kcSetupForTests[0].users.filter((user) => { return user.id === '3ff724a6-90a8-4050-9981-4a6def74870a';})[0]); // This is the test1 user id from /build/kc-setup-for-tests.json

    // just making sure we have the correct thing
    t.equal(testUser.id, '3ff724a6-90a8-4050-9981-4a6def74870a', 'The userId should be the one we want');

    // Change the user id to the admin user id, this will create an error since the username/email already exists
    testUser.id = 'f9ea108b-a748-435f-9058-dab46ce59771';

    client.updateUser(realmName, testUser).catch((err) => {
      t.equal(err.errorMessage, 'User exists with same username or email', 'Should return an error message');
      t.end();
    });
  });
});

test('Test update a users info - update a user that does not exist', (t) => {
  const kca = keycloakAdminClient(settings);

  kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    let testUser = Object.assign(kcSetupForTests[0].users.filter((user) => { return user.id === '3ff724a6-90a8-4050-9981-4a6def74870a';})[0]); // This is the test1 user id from /build/kc-setup-for-tests.json

    // just making sure we have the correct thing
    t.equal(testUser.id, '3ff724a6-90a8-4050-9981-4a6def74870a', 'The userId should be the one we want');

    // Change the user id to something that doesn't exist
    testUser.id = 'f9ea108b-a748-435f-9058-dab46ce5977-not-real';

    client.updateUser(realmName, testUser).catch((err) => {
      console.log(err);
      t.equal(err, 'User not found', 'Should return an error that no user is found');
      t.end();
    });
  });
});
