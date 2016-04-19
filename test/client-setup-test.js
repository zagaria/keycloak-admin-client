'use strict';

const test = require('tape'),
  keycloakAdminClient = require('../index');


test('keycloakAdminClient should return a promise containing the client object', (t) => {
  const settings = {
    baseUrl: 'http://127.0.0.1:8080/auth',
    username: 'admin',
    password: 'admin',
    grant_type: 'password',
    client_id: 'admin-cli'
  };

  let kca = keycloakAdminClient(settings);

  t.equal(kca instanceof Promise, true, 'should return a Promise');
  kca.then((client) => {
    t.equal(typeof client.baseUrl, 'string', 'client should contain a baseUrl String');
    t.equal(client.baseUrl, settings.baseUrl, 'client should contain a baseUrl String');
    t.end();
  });
});


