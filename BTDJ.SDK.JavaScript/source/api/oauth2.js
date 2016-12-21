var Login = require('./login');
var Utils = require('../utils');
var Logger = require('../logger');

const TOKEN_ENDPOINT = "https://auth.cuco.lol/BTDJ/OAuth2/Token";
const TOKEN_ENDPOINT_DEV = "https://dev.auth.cuco.lol/BTDJ/OAuth2/Token";

var client;
var _token;

function getTokenEndpoint () {
    return !BTDJ.isDevMode() ? TOKEN_ENDPOINT : TOKEN_ENDPOINT_DEV;
}

function loadToken(code) {
    if (Utils.isUndefined(code)) {
        Logger.error("the code is not defined.");
    }

    var options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: {
            grant_type: "authorization_code",
            code: code,
            client_id: client.clientKey,
            client_secret: client.clientSecret,
            state: Math.abs(Math.random().toString().split('').reduce(function (p, c) { return (p << 5) - p + c; })).toString(36).substr(0, 11),
            redirect_uri: window.location.protocol + '//' + window.location.hostname
        },
        transformRequest: function (obj) {
            var str = [];
            for (p in obj) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
            return str.join("&");
        }
    };

    return new Promise(function (resolve, reject) {
        var promise = Utils.XHR(getTokenEndpoint(), options).then(function (response) {
            Utils.writeSessionStorage('btdj.access.token', JSON.stringify(response));
            _token = new Token(response);
            resolve();
        }, reject);
    });
}

exports.refreshToken = function () {
    if (!_token.isDefined()) {
        Logger.error("The data is undefined.");
    }

    var options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: {
            grant_type: 'refresh_token',
            refresh_token: _token.getRefreshToken(),
            client_id: client.clientKey,
            client_secret: client.clientSecret
            //redirect_uri: window.location.protocol + '//' + window.location.hostname
        },
        transformRequest: function (obj) {
            var str = [];
            for (p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        }
    };

    return new Promise(function (resolve, reject) {
        var promise = Utils.XHR(getTokenEndpoint(), options).then(function (response) {
            Utils.writeSessionStorage('btdj.access.token', JSON.stringify(response));
            _token = new Token(response);
            resolve();
        }, function (error) {
            Logger.log("Error on get token: " + error)
            reject(error);
        });
    });
};

exports.setClient = function (clientKey, clientSecret) {
    client = {
        clientKey: clientKey,
        clientSecret: clientSecret
    };
    Logger.log("Client was set.");
};

exports.getClient = function () {
    return client;
};

exports.getAccessToken = function () {
    return Utils.isDefined(_token) ? _token.getToken() : null;
};

exports.getAuthorzationHeader = function () {
    return { 'Authorization': _token.getType() + ' ' + _token.getToken() };
};

exports.isAuthenticated = function () {
    return Utils.isDefined(_token);
};

exports.clear = function () {
    Utils.removeSessionStorage('btdj.access.token');
};

 //TODO: Extend with additional options
exports.createLogin = function (opts) {
    var loginOpts = {
        client: client,
        login: (Utils.isDefined(opts)) ? opts : {
            scopes: 'user_private'
        }
    };

    return new Promise(function (resolve, reject) {
        var storageToken = Utils.readSessionStorage('btdj.access.token');
        
        if (Utils.isUndefined(storageToken) || storageToken == null) {
            var _login = new Login(loginOpts);
            _login.run().then(function (code) {
                Logger.log("Login was successfully. Code was received.");

                loadToken(code).then(function () {
                    Utils.removeSessionStorage('btdj.access.code');
                    resolve();
                }, reject);
            }, function (test) {
                Logger.log("Login failed. " + test);
                reject();
            });
            Logger.log("Login was created.");
        } else {
            _token = new Token(JSON.parse(storageToken));
            resolve();
            Logger.log("Token was found.");
        }
    });
};

function Token(data) {
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenType = data.token_type;
}

Token.prototype.getToken = function () {
    return this.accessToken;
};

Token.prototype.getRefreshToken = function () {
    return this.refreshToken;
};

Token.prototype.getType = function () {
    return this.tokenType;
};

Token.prototype.isDefined = function () {
    return (Utils.isDefined(this.accessToken) & Utils.isDefined(this.refreshToken));
};