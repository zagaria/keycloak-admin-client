'use strict';

const test = require('blue-tape');
const keycloakAdminClient = require('../index');
const kcSetupForTests = require('../scripts/kc-setup-for-tests.json');

const settings = {
  baseUrl: 'http://127.0.0.1:8080/auth',
  username: 'admin',
  password: 'admin',
  grant_type: 'password',
  client_id: 'admin-cli'
};

test('Test getting the list of clients for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.clients.find, 'function', 'The client object returned should have a clients.find function');

    // Use the master realm
    const realmName = 'master';

    return client.clients.find(realmName).then((listOfClients) => {
      // The listOfCients should be an Array
      t.equal(listOfClients instanceof Array, true, 'the list of client should be an array');

      // The list of client in the master realm should have 4 people
      t.equal(listOfClients.length, 10, 'There should be 4 client in master');
    });
  });
});

test("Test getting the list of clients for a Realm that doesn't exist", (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'notarealrealm';

    return t.shouldFail(client.clients.find(realmName), 'Realm not found.', "Realm not found should be returned if the realm wasn't found");
  });
});

test('Test getting 1 client using query params for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const options = {
      clientId: 'admin-cli'
    };

    return client.clients.find(realmName, options).then((listOfClients) => {
      // The listOfClients should be an Array
      t.equal(listOfClients instanceof Array, true, 'the list of clients should be an array');
      t.equal(listOfClients.length, 1, 'There should be 1 client with this clientId in master');
    });
  });
});

test('Test getting the one client for a Realm', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const id = '294193ca-3506-4fc9-9b33-cc9d25bd0ec7'; // This is the admin-cli client id from /scripts/kc-setup-for-tests.json

    return client.clients.find(realmName, {id: id}).then((client) => {
      t.equal(client.id, id, 'The client id we used and the one returned should be the same');
      t.equal(client.clientId, 'admin-cli', 'The clientId returned should be admin-cli');
    });
  });
});

test("Test getting the one client for a Realm - client id doesn't exist", (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const id = 'not-an-id';

    return t.shouldFail(client.clients.find(realmName, {id: id}), 'Could not find client', 'A Client not found error should be thrown');
  });
});

test('Test create a Client', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.clients.create, 'function', 'The client object returned should have a create function');

    const realmName = 'Test Realm 1';
    const newClient = {
      clientId: 'test created client',
      description: 'just a test',
      bearerOnly: true
    };

    return client.clients.create(realmName, newClient).then((addedClient) => {
      t.equal(addedClient.clientId, newClient.clientId, `The clientId should be named ${newClient.clientId}`);
      t.equal(addedClient.description, newClient.description, `The description should be named ${newClient.description}`);
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

  return kca.then((client) => {
    return client.clients.create(realmName, newClient).catch((err) => {
      t.equal(err.errorMessage, 'Client admin-cli already exists', 'Error message should be returned when using a non-unique clientId');
    });
  });
});

test('Test update a client info', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.clients.update, 'function', 'The client object returned should have a update function');
    // Use the Test Realm 1
    const realmName = 'Test Realm 1';
    const clientId = '38598d22-9592-4eec-819a-d6d91a6a1153';

    const testRealm = kcSetupForTests.filter((r) => {
      return r.realm === realmName;
    })[0];
    const orginalClient = testRealm.clients.filter((client) => {
      return client.id === clientId;
    })[0]; // This is the update me client from /scripts/kc-setup-for-tests.json
    const testClient = Object.assign({}, orginalClient);

    // just making sure we have the correct thing
    t.equal(testClient.id, clientId, 'The client id should be the one we want');
    t.equal(testClient.clientId, 'update me', 'The clientID returned should be update me');

    // Update the test client
    testClient.description = 'Update Description';

    return client.clients.update(realmName, testClient).then(() => {
      // The update doesn't return anything so we need to go get what we just updated
      return client.clients.find(realmName, {id: testClient.id});
    }).then((c) => {
      t.equal(c.description, testClient.description, 'The description returned should be the one we updated');
    });
  });
});

test('Test update a client info - same client id error', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the Test Realm 1
    const realmName = 'Test Realm 1';
    const clientId = '38598d22-9592-4eec-819a-d6d91a6a1153';

    const testRealm = kcSetupForTests.filter((r) => {
      return r.realm === realmName;
    })[0];
    const orginalClient = testRealm.clients.filter((client) => {
      return client.id === clientId;
    })[0]; // This is the update me client from /scripts/kc-setup-for-tests.json
    const testClient = Object.assign({}, orginalClient);

    // just making sure we have the correct thing
    t.equal(testClient.id, clientId, 'The client id should be the one we want');

    // Change the client id to the use for duplicate clients id, this will create an error since it already exists
    testClient.id = '09701f0c-db23-4b88-96d5-e35e4f766613';

    return client.clients.update(realmName, testClient).catch((err) => {
      t.equal(err.errorMessage, 'Client update me already exists', 'Should return an error message');
    });
  });
});

test('Test update a client info - same clientId(really the name of the client) error', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the Test Realm 1
    const realmName = 'Test Realm 1';
    const clientId = '38598d22-9592-4eec-819a-d6d91a6a1153';

    const testRealm = kcSetupForTests.filter((r) => {
      return r.realm === realmName;
    })[0];
    const orginalClient = testRealm.clients.filter((client) => {
      return client.id === clientId;
    })[0]; // This is the update me client from /scripts/kc-setup-for-tests.json
    const testClient = Object.assign({}, orginalClient);

    // just making sure we have the correct thing
    t.equal(testClient.id, clientId, 'The client id should be the one we want');

    // Change the client id to the use for duplicate clients id, this will create an error since it already exists
    testClient.clientId = 'use for duplicate';

    return t.shouldFail(client.clients.update(realmName, testClient), 'Client use for duplicate already exists', 'Should return an error message');
  });
});

test('Test update a client info - update a user that does not exist', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the Test Realm 1
    const realmName = 'Test Realm 1';
    const clientId = '38598d22-9592-4eec-819a-d6d91a6a1153';

    const testRealm = kcSetupForTests.filter((r) => {
      return r.realm === realmName;
    })[0];
    const orginalClient = testRealm.clients.filter((client) => {
      return client.id === clientId;
    })[0]; // This is the update me client from /scripts/kc-setup-for-tests.json
    const testClient = Object.assign({}, orginalClient);

    // just making sure we have the correct thing
    t.equal(testClient.id, clientId, 'The client id should be the one we want');

    // Change the user id to something that doesn't exist
    testClient.id = 'f9ea108b-a748-435f-9058-dab46ce5977-not-real';

    return t.shouldFail(client.clients.update(realmName, testClient), 'Could not find client', 'Should return an error that no client is found');
  });
});

test('Test delete a client', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.clients.remove, 'function', 'The client object returned should have a remove function');

    // Use the master realm
    const realmName = 'Test Realm 1';
    const id = 'd8c51041-84c7-4e76-901d-401e73eb1666';

    return client.clients.remove(realmName, id);
  });
});

test("Test delete a client that doesn't exist", (t) => {
  const kca = keycloakAdminClient(settings);

  const id = 'not-a-real-id';
  const realmName = 'master';
  return kca.then((client) => {
    // Call the deleteRealm api to remove this realm
    return t.shouldFail(client.clients.remove(realmName, id), 'Could not find client', 'Should return an error that no user is found');
  });
});

test('Test getting the client secret', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const id = '294193ca-3506-4fc9-9b33-cc9d25bd0ec7'; // This is the admin-cli client id from /scripts/kc-setup-for-tests.json

    return client.clients.getClientSecret(realmName, id).then((clientSecret) => {
      t.equal(clientSecret.type, 'secret', 'The credentials type should be secret');
      t.equal(clientSecret.value, 'f3d95ebb-42ab-4a15-998f-775a84adbbaf', 'The client-secret returned should be the one we want');
    });
  });
});

test("Test getting the client secret - client id doesn't exist", (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const id = 'not-an-id';

    return t.shouldFail(client.clients.getClientSecret(realmName, id), 'Could not find client', 'A Client not found error should be thrown');
  });
});

test("Test getting a client's roles", (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const id = '379efc29-4b2e-403c-83b6-d9c9af43b24a'; // This is the master-realm client id from /scripts/kc-setup-for-tests.json

    return client.clients.roles.find(realmName, id).then((roles) => {
      t.equal(roles.length, 18, 'Should return 14 roles');

      const expectedRole = {
        id: 'a16e820e-ae47-4ac9-82ba-683c0b866994',
        name: 'manage-identity-providers',
        description: `\${role_manage-identity-providers}`,
        scopeParamRequired: false,
        composite: false,
        clientRole: true,
        containerId: '379efc29-4b2e-403c-83b6-d9c9af43b24a'
      };
      t.deepEqual(roles.find((r) => r.id === expectedRole.id), expectedRole, 'Should have the manage-identity-providers role');
    });
  });
});

test("Test getting a client's roles - client id doesn't exist", (t) => {
  const kca = keycloakAdminClient(settings);

  const id = 'not-a-real-id';
  const realmName = 'master';
  return kca.then((client) => {
    return t.shouldFail(client.clients.roles.find(realmName, id), 'Could not find client', 'Should return an error that no user is found');
  });
});

test("Test getting a client's role", (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const id = '379efc29-4b2e-403c-83b6-d9c9af43b24a'; // This is the master-realm client id from /scripts/kc-setup-for-tests.json
    const roleName = 'manage-identity-providers';

    return client.clients.roles.find(realmName, id, roleName).then((role) => {
      const expectedRole = {
        id: 'a16e820e-ae47-4ac9-82ba-683c0b866994',
        name: 'manage-identity-providers',
        description: `\${role_manage-identity-providers}`,
        scopeParamRequired: false,
        composite: false,
        clientRole: true,
        containerId: '379efc29-4b2e-403c-83b6-d9c9af43b24a'
      };
      t.deepEqual(role, expectedRole, 'Should return the manage-identity-providers role');
    });
  });
});

test("Test getting a client's role - client id doesn't exist", (t) => {
  const kca = keycloakAdminClient(settings);

  const realmName = 'master';
  const id = 'not-a-real-id';
  const roleName = 'not-a-real-role-name';
  return kca.then((client) => {
    return t.shouldFail(client.clients.roles.find(realmName, id, roleName), 'Could not find client', 'Should return an error that no client is found');
  });
});

test("Test getting a client's role - role name doesn't exist", (t) => {
  const kca = keycloakAdminClient(settings);

  const realmName = 'master';
  const id = '379efc29-4b2e-403c-83b6-d9c9af43b24a'; // This is the master-realm client id from /scripts/kc-setup-for-tests.json
  const roleName = 'not-a-real-role-name';
  return kca.then((client) => {
    return t.shouldFail(client.clients.roles.find(realmName, id, roleName), 'Could not find role', 'Should return an error that no role is found');
  });
});

test('Test create a client role', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    const realmName = 'master';
    const id = '294193ca-3506-4fc9-9b33-cc9d25bd0ec7'; // This is the admin-cli client id from /scripts/kc-setup-for-tests.json
    const newRole = {
      name: 'my-new-role',
      description: 'A new role'
    };

    return client.clients.roles.create(realmName, id, newRole).then((addedRole) => {
      t.equal(addedRole.name, newRole.name, `The name should be named ${newRole.name}`);
      t.equal(addedRole.description, newRole.description, `The description should be named ${newRole.description}`);
    });
  });
});

test("Test create a client role - client id doesn't exist", (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    const realmName = 'master';
    const id = 'not-a-real-id';
    const newRole = {
      name: 'my-new-role',
      description: 'A new role'
    };

    return kca.then((client) => {
      return t.shouldFail(client.clients.roles.create(realmName, id, newRole), 'Could not find client', 'Should return an error that no client is found');
    });
  });
});

test('Test create a client role - a non-unique role name', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    const realmName = 'master';
    const id = '379efc29-4b2e-403c-83b6-d9c9af43b24a'; // This is the master-realm client id from /scripts/kc-setup-for-tests.json
    const newRole = {
      name: 'manage-identity-providers'
    };

    return kca.then((client) => {
      return t.shouldFail(client.clients.roles.create(realmName, id, newRole), `Role ${newRole.name} already exists`, 'Error message should be returned when using a non-unique role name');
    });
  });
});

test('Test retrive an installation from existing client', (t) => {
  const kca = keycloakAdminClient(settings);
  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const options = {
      clientId: 'admin-cli'
    };

    return client.clients.find(realmName, options).then((listOfClients) => {
      client.clients.installation(realmName, listOfClients[0].id)
        .then((installation) => {
          return t.equal(installation.resource, listOfClients[0].clientId, `The resource should be named ${listOfClients[0].clientId}`);
        });
    });
  });
});

test('Test retrive an installation from a client that does not exist', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const clientId = '58598d22-9592-4eec-819a-d6d91a6a1153';

    return t.shouldFail(client.clients.installation(realmName, clientId), 'Could not find client', 'Should return an error that no client is found');
  });
});

test('Test retrive an installation from a realm that does not exist', (t) => {
  const kca = keycloakAdminClient(settings);
  return kca.then((client) => {
    // Use the master realm
    const realmName = 'master';
    const options = {
      clientId: 'admin-cli'
    };

    return client.clients.find(realmName, options).then((listOfClients) => {
      t.shouldFail(client.clients.installation('wrong-realm', listOfClients[0].id), 'Could not find client', 'Should return an error that no client is found');
    });
  });
});
