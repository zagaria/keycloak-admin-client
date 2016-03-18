var request = require('request');

function init (settings) {
    var jsonParsedBody,
        self = this;

    return new Promise(function (resolve, reject) {
        request.post({url: settings.baseUrl + settings.url, form: settings}, function (err, resp, body) {
            if (err) {
                return reject(err);
            }

            try {
                jsonParsedBody = JSON.parse(body);
            } catch (e) {
                return reject(e);
            }

            self._setAccessToken(jsonParsedBody.access_token);

            return resolve({accessToken: jsonParsedBody.access_token, rawJSONBody: jsonParsedBody});
        });
    });
}

/**
    settings  - {Object} - an object containing the settings
    settings.baseUrl - {String} - The baseurl for the Keycloak server - ex: http://localhost:8080/auth,
    settings.username
    settings.password
    settings.grant_type,
    settings.client_id
*/
var KeyCloakAdminClient = function (settings) {
    settings = settings || {};

    var accessToken;

    settings.url = '/realms/master/protocol/openid-connect/token';

    this._getBaseUrl = function () {
        return settings.baseUrl;
    };

    this._getAccessToken = function () {
        return accessToken;
    };

    this._setAccessToken = function (token) {
        accessToken = token;
    };

    this.init = function () {
        return init.call(this, settings);
    };

    return this;
};

KeyCloakAdminClient.prototype.getRealms = function () {
    var self = this;

    var auth = {
         bearer: this._getAccessToken()
    };

    return new Promise(function (resolve, reject) {
        request({
            url: self._getBaseUrl() + '/admin/realms',
            auth: auth
        }, function (err, resp, body) {
            if (err) {
                return reject(err);
            }

            try {
                jsonParsedBody = JSON.parse(body);
            } catch (e) {
                return reject(e);
            }

            return resolve(jsonParsedBody);
        });
    });
};

module.exports = KeyCloakAdminClient;
