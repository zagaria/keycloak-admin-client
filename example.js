var KeycloakAdminClient = require('./');

var settings = {
    baseUrl: 'http://192.168.99.100:8080/auth',
    username: 'admin',
    password: 'admin',
    grant_type: 'password',
    client_id: 'admin-cli'
};


var kc = new KeycloakAdminClient(settings);

console.log(Object.keys(kc));

kc.init().then(function (response) {
    console.log(response.accessToken);
    return kc.getRealms();
}).then(function (realms) {
    console.log('realms', realms);
}).catch(function (err) {
    console.log(err);
});
