(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.BTDJ = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var OAuth2 = require('./api/oauth2');
var OffsetObject = require('./vars/offsetObject');
var User = require('./vars/user');
var Track = require('./vars/track');
var Location = require('./vars/location');
var Logger = require('./logger');
var Utils = require('./utils');

const API_RES = 'https://res.btdj.de/';
const API_RES_DEV = 'https://dev.res.btdj.de/';

const CTRL_USER = 'api/User';
const CTRL_LIVEPLAYLIST = 'api/Liveplaylist';
const CTRL_LOCATION = 'api/Location';

const METHOD_GET = '/Get';

const DEFAULT_ITEM_COUNT = 15;

exports.OAuth2 = OAuth2;

/**
 * Gets the url of the resource api.
 * @returns {string} 
 */
exports.getApiUrl = function () {
    return !BTDJ.isDevMode() ? API_RES : API_RES_DEV;
};

/**
 * Gets the current user.
 * @returns {Promise} 
 */
exports.getCurrentUser = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        var options = {
            headers: OAuth2.getAuthorzationHeader()
        };
        Utils.XHR(self.getApiUrl() + CTRL_USER + METHOD_GET, options).then(function (response) {
            resolve(new User(response));
        }, reject);
    });
};

/**
 * Gets the location in there the user is checked in.
 * @returns {Promise}
 */
exports.getCurrentLocation = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        var options = {
            headers: OAuth2.getAuthorzationHeader()
        };
        Utils.XHR(self.getApiUrl() + CTRL_LOCATION + '/Checkin', options).then(function (response) {
            resolve(new Location(response.Location));
        }, reject);
    });
};

/**
 * Gets the current location based on its ip.
 * returns {Promise}
 */
exports.getLocation = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        var options = {
            headers: OAuth2.getAuthorzationHeader()
        };
        Utils.XHR(self.getApiUrl() + CTRL_LOCATION + METHOD_GET, options).then(function (response) {
            resolve(new Location(response));
        }, reject);
    });
};

/**
 * Gets a list of locations based on its gps location.
 * @param {integer} [offsetIndex]
 * @param {integer} [offsetCount]
 * @returns {Promise}
 */
exports.getLocationWithGPS = function (offsetIndex, offsetCount) {
    var self = this;
    return new Promise(function (resolve, reject) {
        if (navigator.geolocation) {
            var geo_options = {
                enableHighAccuracy: true,
                maximumAge: 60000
            };

            var geoFinished = false;
            var geoErrorCallback = function (error) {
                reject(error);
                geoFinished = true;
                if (Utils.isDefined(error.code)) {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            Logger.error("Geolocation: User denied the request for Geolocation.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            Logger.error("Geolocation: Location information is unavailable.");
                            break;
                        case error.TIMEOUT:
                            Logger.error("Geolocation: The request to get user location timed out.");
                            break;
                        default:
                            Logger.error("An unknown error occurred.");
                            break;
                    }
                }
            };

            window.setTimeout(function () {
                if (!geoFinished) {
                    Logger.log("Geolocation: Time out.");
                    geoErrorCallback(new Error("Geo Location timed out."));
                }
            }, 30000);

            navigator.geolocation.getCurrentPosition(function (position) {
                //Success
                geoFinished = true;
                var options = {
                    headers: OAuth2.getAuthorzationHeader(),
                    params: {
                        GPS_Lat: position.coords.latitude,
                        GPS_Lon: position.coords.longitude,
                        Radius: 50,
                        OffsetIndex: Utils.isDefined(offsetIndex) ? offsetIndex : 0,
                        OffsetCount: (Utils.isDefined(offsetCount) && offsetCount != 0) ? offsetCount : DEFAULT_ITEM_COUNT
                    }
                };
                Utils.XHR(self.getApiUrl() + CTRL_LOCATION + METHOD_GET, options).then(function (response) {
                    resolve(new Location(response));
                }, reject);
            }, geoErrorCallback, geo_options);
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }
        
        
    });
};

/**
 * Gets the liveplaylist of the current location.
 * @returns {Promise} 
 */
exports.getLiveplaylist = function (offsetIndex, offsetCount) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var options = {
            headers: OAuth2.getAuthorzationHeader(),
            params: {
                OffsetIndex: Utils.isDefined(offsetIndex) ? offsetIndex : 0,
                OffsetCount: (Utils.isDefined(offsetCount) && offsetCount != 0) ? offsetCount : DEFAULT_ITEM_COUNT
            }
        };
        Utils.XHR(self.getApiUrl() + CTRL_LIVEPLAYLIST + METHOD_GET, options).then(function (response) {
            resolve(new OffsetObject(response, function (value) {
                var result = [];
                Utils.forEach(value, function (v, key) {
                    result.push(new Track(v));
                });
                return result;
            }));
        }, reject);
    });
};

/**
 * Vote for the given track.
 * @param {string|Track} track
 * @param {integer} [offsetIndex]
 * @param {integer} [offsetCount]
 * @returns {Promise} 
 */
exports.voteForTrack = function (track, offsetIndex, offsetCount) {
    var self = this;

    var trackUID;
    if (!Utils.isString(track)) {
        trackUID = track.getUID();
    } else {
        trackUID = track;
    }

    return new Promise(function (resolve, reject) {
        var options = {
            method: 'POST',
            headers: OAuth2.getAuthorzationHeader(),
            params: {
                TrackUID: trackUID,
                OffsetIndex: Utils.isDefined(offsetIndex) ? offsetIndex : 0,
                OffsetCount: (Utils.isDefined(offsetCount) && offsetCount != 0) ? offsetCount : DEFAULT_ITEM_COUNT
            }
        };
        Utils.XHR(self.getApiUrl() + CTRL_LIVEPLAYLIST + '/Vote', options).then(function (response) {
            resolve(new OffsetObject(response, function (value) {
                var result = [];
                Utils.forEach(value, function (v, key) {
                    result.push(new Track(v));
                });
                return result;
            }));
        }, reject);
    });
};

/**
 * Add the given track to the current liveplaylist.
 * @param {string|Track} track
 * @param {integer} [offsetIndex]
 * @param {integer} [offsetCount]
 * @returns {Promise}
 */
exports.addTrackToLiveplaylist = function (track, offsetIndex, offsetCount) {
    var self = this;

    var trackUID;
    if (!Utils.isString(track)) {
        trackUID = track.getUID();
    } else {
        trackUID = track;
    }

    return new Promise(function (resolve, reject) {
        var options = {
            method: 'PUT',
            headers: OAuth2.getAuthorzationHeader(),
            params: {
                TrackUID: trackUID,
                OffsetIndex: Utils.isDefined(offsetIndex) ? offsetIndex : 0,
                OffsetCount: (Utils.isDefined(offsetCount) && offsetCount != 0) ? offsetCount : DEFAULT_ITEM_COUNT
            }
        };
        Utils.XHR(self.getApiUrl() + CTRL_LIVEPLAYLIST + '/AddTrack', options).then(function (response) {
            resolve(new OffsetObject(response, function (value) {
                var result = [];
                Utils.forEach(value, function (v, key) {
                    result.push(new Track(v));
                });
                return result;
            }));
        }, reject);
    });
};

/**
 * Searaches tracks with the given term.
 * @param {string} term
 * @param {integer} [offsetIndex]
 * @param {integer} [offsetCount]
 */
exports.searchTrack = function (term, offsetIndex, offsetCount) {
    var self = this;

    return new Promise(function (resolve, reject) {
        var options = {
            headers: OAuth2.getAuthorzationHeader(),
            params: {
                Term: term,
                OffsetIndex: Utils.isDefined(offsetIndex) ? offsetIndex : 0,
                OffsetCount: (Utils.isDefined(offsetCount) && offsetCount != 0) ? offsetCount : DEFAULT_ITEM_COUNT
            }
        };
        Utils.XHR(self.getApiUrl() + CTRL_LIVEPLAYLIST + '/Search', options).then(function (response) {
            resolve(new OffsetObject(response, function (value) {
                var result = [];
                Utils.forEach(value, function (v, key) {
                    result.push(new Track(v));
                });
                return result;
            }));
        }, reject);
    })
};

/**
 * Search locations with the given term.
 * @param {string} term
 * @param {integer} [offsetIndex]
 * @param {integer} [offsetCount]
 * @returns {Promise}
 */
exports.searchLocation = function (term, offsetIndex, offsetCount) {
    var self = this;

    return new Promise(function (resolve, reject) {
        var options = {
            headers: OAuth2.getAuthorzationHeader(),
            params: {
                Term: term,
                OffsetIndex: Utils.isDefined(offsetIndex) ? offsetIndex : 0,
                OffsetCount: (Utils.isDefined(offsetCount) && offsetCount != 0) ? offsetCount : DEFAULT_ITEM_COUNT
            }
        };
        Utils.XHR(self.getApiUrl() + CTRL_LOCATION + METHOD_GET, options).then(function (response) {
            resolve(new OffsetObject(response, function (value) {
                var result = [];
                Utils.forEach(value, function (v, key) {
                    result.push(new Location(v));
                });
                return result;
            }));
        }, reject);
    });
};

/**
 * Check the user in into the given location.
 * @param {string|Location} location
 * @param {string} code
 * @returns {Promise}
 */
exports.checkIn = function (location, code) {
    var self = this;

    var locationUID;
    if (!Utils.isString(location)) {
        locationUID = location.getUID();
    } else {
        locationUID = location;
    }
    return new Promise(function (resolve, reject) {
        var options = {
            method: 'POST',
            headers: OAuth2.getAuthorzationHeader(),
            params: {
                LocationUID: locationUID,
                Code: code
            }
        };
        Utils.XHR(self.getApiUrl() + CTRL_LOCATION + '/Checkin', options).then(function (response) {
            resolve(new Location(response.Location));
        }, reject);
    });
};

/**
 * Check the user in into the location with the given code.
 * @param {string} code
 * @returns {Promise}
 */
exports.checkInWithCode = function (code) {
    var self = this;

    return new Promise(function (resolve, reject) {
        var options = {
            method: 'POST',
            headers: OAuth2.getAuthorzationHeader(),
            params: {
                Code: code
            }
        };
        Utils.XHR(self.getApiUrl() + CTRL_LOCATION + '/Checkin', options).then(function (response) {
            resolve(new Location(response.Location));
        }, reject);
    });
}
},{"./api/oauth2":3,"./logger":5,"./utils":6,"./vars/location":9,"./vars/offsetObject":10,"./vars/track":11,"./vars/user":12}],2:[function(require,module,exports){
var Utils = require('../utils');
var Logger = require('../logger');

const AUTH_URL = 'https://auth.cuco.lol/BTDJ/OAuth2/Authorize';
const AUTH_URL_DEV = 'https://dev.auth.cuco.lol/BTDJ/OAuth2/Authorize';

const defaultLoginOpts = {
    overStorage: true,
    timeOut: 500,
    scopes: 'user_private'
};

function getAuthUrl() {
    return !BTDJ.isDevMode() ? AUTH_URL : AUTH_URL_DEV;
}

function Login(opts) {
    if (Utils.isUndefined(opts.login)) {
        opts.login = defaultLoginOpts;
    }

    this.client = BTDJ.API.OAuth2.getClient();
    this.redirect = opts.login.redirect;
    this.overStorage = opts.login.overStorage;
    this.scopes = opts.login.scopes;
    this.timeOut = opts.login.timeOut;
    this.authUrl = generateAuthUrl(this);
}

Login.prototype.run = function () {
    var self = this;

    var storageCode = Utils.readSessionStorage('btdj.access.code');
    var storageCodeIsPresent = false; //(Utils.isDefined(storageCode) && storageCode != null)
    var codeIsPresent = Utils.isDefined(Utils.urlParameterByName('code'));

    if (storageCodeIsPresent || codeIsPresent) {
        // Code exist and get a token now.
        Logger.log("Get token.");

        var code;
        if (codeIsPresent) {
            code = Utils.urlParameterByName('code');
        } else if (storageCodeIsPresent) {
            code = storageCode;
        }

        return new Promise(function (resolve, reject) {
            if (Utils.isDefined(code)) {
                Utils.writeSessionStorage('btdj.access.code', code);
                resolve(code);
            } else {
                reject();
            }
        });
    } else {
        // No code for getting access token.
        //Logger.log("Code: " + readStorage());
        Logger.log("Code not found.");

        setTimeout(function () {
            window.location.href = self.authUrl;
        }, self.timeOut);
    }
};

module.exports = Login;

function generateAuthUrl(login) {
    return getAuthUrl() + "?scope=" + login.scopes + "&client_id=" + login.client.clientKey + "&response_type=code&redirect_uri=" + (login.redirect || window.location.protocol + "//" + window.location.hostname);
}

//Login.prototype.showPopup = function () {
//    Logger.error("Popup for login is currently not implemented.");

//    var popup = window.open(this.url, "Be The Dj", 'height=550,width=400,toolbar=0,menubar=0,location=0,scrollbars=1');
//    Logger.log(popup);
//    Logger.log(popup.location.href);

//    var _tmpPopupLoc = popup.location;

//    var pollTimer = window.setInterval(function () {
//        if (_tmpPopupLoc != popup.location) {
//            _tmpPopupLoc = popup.location;
//            //Logger.log("Code: " + Utils.urlParameterByName('code', _tmpPopupLoc.href));
//            Logger.log("Location of popup was changed.");
//        }
//    }, 350);

//    if (window.focus) { popup.focus() }
//};
},{"../logger":5,"../utils":6}],3:[function(require,module,exports){
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
},{"../logger":5,"../utils":6,"./login":2}],4:[function(require,module,exports){
var Api = require('./api');
var Login = require('./api/login');
var Utils = require('./utils');

const DEFAULT_OPTIONS = {
    devMode: false,
    autoLogin: false,
    defaultCoverUrl: null,
    defaultAvatarUrl: null
};

exports.API = Api;

/**
 * Initilize the BTDJ SDK with the given settings.
 * @param {object} options
 * @returns {promise} 
 */
exports.init = function (options) {
    this.options = options || DEFAULT_OPTIONS;
    Api.OAuth2.setClient(options.clientKey, options.clientSecret);

    if (options.autoLogin) {
        return Api.OAuth2.createLogin(options.login);
    } else {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    }
};

/**
 * Gets a value if the dev mode activated.
 * @returns {boolean} 
 */
exports.isDevMode = function () {
    return this.options.devMode;
};

/**
 * Gets the default cover url.
 * @returns {string} 
 */
exports.getDefaultCoverUrl = function () {
    return this.options.defaultCoverUrl;
};

/**
 * Gets the default user image url.
 * @returns {string} 
 */
exports.getDefaultAvatarUrl = function () {
    return this.options.defaultAvatarUrl;
};

exports.OffsetObject = require('./vars/offsetObject');
exports.Track = require('./vars/track');
},{"./api":1,"./api/login":2,"./utils":6,"./vars/offsetObject":10,"./vars/track":11}],5:[function(require,module,exports){
exports.error = function (value) {
    throw new Error(value);
};

exports.log = function (value) {
    if (BTDJ.isDevMode()) console.log('[ ' + new Date().toUTCString() + ' ] ' + value);
};
},{}],6:[function(require,module,exports){
var _isStorageAvailable;

/**
* Check if the value is defined
* @param value
* @returns {boolean}
*/
exports.isDefined = function (value) {
    return (typeof value !== 'undefined');
};

/**
 * Check if the value is undefined
 * @param value
 * @returns {boolean} 
 */
exports.isUndefined = function (value) {
    return (typeof value === 'undefined');
};

/**
 * Check if the value a string.
 * @param {object} value
 * @returns {boolean} 
 */
exports.isString = function (value) {
    return (typeof value === 'string');
};

/**
 * Checks if the value a array.
 * @param {object} value
 * @returns {boolean} 
 */
exports.isArray = function (value) {
    return (Object.prototype.toString.call(value) === '[object Array]');
}

/**
* 
* @param {string} url
* @param {object} [options]
*/
exports.XHR = function (url, options) {
    var self = this;

    if (self.isUndefined(options)) {
        options = {};
    }

    return new Promise(function (resolve, reject) {

        if (self.isDefined(options.params)) {
            var urlParams = "";
            for (item in options.params) {
                if (options.params.hasOwnProperty(item)) {
                    if (self.isDefined(item)) {
                        if (urlParams != '') {
                            urlParams += '&';
                        }
                        urlParams += item + '=' + options.params[item];
                    }
                }
            }
            if (url.indexOf('?') == -1) {
                urlParams = '?' + urlParams;
            }
            url = url + urlParams;
        }

        var xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);

        if (self.isDefined(options.headers)) {
            for (item in options.headers) {
                if (options.headers.hasOwnProperty(item)) {
                    if (self.isDefined(item)) {
                        xhr.setRequestHeader(item, options.headers[item]);
                    }
                }
            }
        }

        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                //Logger.log("XHR Error ( " + xhr.status + " ): " + xhr.statusText);
                reject({ error: new Error(xhr.responseText), status: xhr.status });
            }
        };

        xhr.onerror = function () {
            //Logger.log("XHR Error ( " + xhr.status + " ): " + xhr.statusText);
            console.log("Error", xhr);
            reject(new Error("Network Error"));
        };

        var transformRequest = options.transformRequest || function (obj) {
            if (self.isUndefined(obj)) return;
            console.log(obj);
            return JSON.stringify(obj);
        };

        xhr.send(transformRequest(options.data));
    });
};

/**
 * Get a value of parameter from 
 * @param {string} name
 * @param {string} url
 * @returns {string} 
 */
exports.urlParameterByName = function (name, url) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url || location.search);
    return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
};

exports.forEach = function (array, func) {
    if (Array.isArray(array)) {
        for (var i = 0; i < array.length; i++) {
            func(array[i], i);
        }
    } else {
        for (var item in array) {
            if (array.hasOwnProperty(item)) {
                func(array[item], item);
            }
        }
    }
};

/**
 * Gets if the storage is available.
 * @returns {boolean} 
 */
exports.isStorageAvailable = function () {
    if (_isStorageAvailable == null) {
        _isStorageAvailable = (typeof (Storage) !== undefined);
    }

    return _isStorageAvailable;
};

/**
 * Write the given data in the session storage.
 * @param {string} key
 * @param {object} value
 */
exports.writeSessionStorage = function (key, value) {
    if (this.isStorageAvailable) {
        sessionStorage.setItem(key, value);
    }
};

/**
 * Gets the value of the given key from the session storage.
 * @param {string} key
 * @returns {object} 
 */
exports.readSessionStorage = function (key) {
    if (this.isStorageAvailable) {
        return sessionStorage.getItem(key);
    }

    return undefined;
};

/**
 * Remove the item with the given key from the session storage.
 * @param {string} key
 */
exports.removeSessionStorage = function (key) {
    if (this.isStorageAvailable) {
        sessionStorage.removeItem(key);
    }
};

/**
 * Replace the placeholders of the value with the given args.
 * @param {string} value
 * @param {string} args
 * @returns {string} 
 */
exports.formatString = function (value, args) {
    var theString = value;
    for (var i = 1; i < arguments.length; i++) {
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }
    return theString;
};
},{}],7:[function(require,module,exports){
function Genre (data) {
    this.uid = data.UID;
    this.name = data.Name;
}

/**
 * Gets the uid of the genre.
 * @returns {string} 
 */
Genre.prototype.getUID = function () {
    return this.uid;
};

/**
 * Gets the name of the genre.
 * @returns {string} 
 */
Genre.prototype.getName = function () {
    return this.name;
};

module.exports = Genre;
},{}],8:[function(require,module,exports){
function Image (data) {
    this.uid = data.UID;
    this.url = data.URL;
    this.height = data.Height;
    this.width = data.Width;
}

/**
 * Gets the uid of the image.
 * @returns {string} 
 */
Image.prototype.getUID = function () {
    return this.uid;
};

/**
 * Gets the url to the image.
 * @returns {string} 
 */
Image.prototype.getUrl = function () {
    return this.url;
};

/**
 * Gets the height of the image.
 * @returns {integer} 
 */
Image.prototype.getHeight = function () {
    return this.height;
};

/**
 * Gets the width of the image.
 * @returns {integer} 
 */
Image.prototype.getWidth = function () {
    return this.width;
};

module.exports = Image;
},{}],9:[function(require,module,exports){
var Image = require('./image');

function Location (data) {
    this.uid = data.UID;
    this.name = data.Name;
    this.description = data.Description;
    this.postalCode = data.Zipcode;
    this.city = data.City;
    this.street = data.Street;
    this.email = data.Email;
    this.phone = data.Phone;
    this.website = data.Homepage;
    this.facebook = data.Facebook;
    this.twitter = data.Twitter;
    this.image = data.Image;
    this.imageBig = data.Image_Big;
    this.checkInCount = data.Checkins;
    this.playlistCount = data.Playlist_Count;
    this.checkInCode = data.Checkin_Code;
    this.gpsLatitude = data.GPS_Latitude;
    this.gpsLongitude = data.GPS_Longitude;
}

/**
 * Gets the uid of the location.
 * @returns {string} 
 */
Location.prototype.getUID = function () {
    return this.uid;
};

/**
 * Gets the name of the location.
 * @returns {string} 
 */
Location.prototype.getName = function () {
    return this.name;
};

/**
 * Gets the description of the location.
 * @returns {string} 
 */
Location.prototype.getDescription = function () {
    return this.description;
};

/**
 * Gets the postal code of the location.
 * @returns {string} 
 */
Location.prototype.getPostalCode = function () {
    return this.postalCode;
};

/**
 * Gets the city name of the location.
 * @returns {string} 
 */
Location.prototype.getCity = function () {
    return this.city;
};

/**
 * Gets the street of the location.
 * @returns {string} 
 */
Location.prototype.getStreet = function () {
    return this.street;
};

/**
 * Gets the email address of the location.
 * @returns {string} 
 */
Location.prototype.getEmail = function () {
    return this.email;
};

/**
 * Gets the phone number of the location.
 * @returns {string} 
 */
Location.prototype.getPhone = function () {
    return this.phone;
};

/**
 * Gets the url of the website from the location.
 * @returns {string} 
 */
Location.prototype.getWebsite = function () {
    return this.website;
};

/**
 * Gets the url to the facebook page of the location.
 * @returns {string} 
 */
Location.prototype.getFacebook = function () {
    return this.facebook;
};

/**
 * Gets the url to the twitter page of the location.
 * @returns {string} 
 */
Location.prototype.getTwitter = function () {
    return this.twitter;
};

/**
 * Get the image of the location.
 * @returns {Image} 
 */
Location.prototype.getImage = function () {
    return new Image(this.image);
};

/**
 * Gets the big image of the location.
 * @returns {Image} 
 */
Location.prototype.getImageBig = function () {
    return new Image(this.imageBig);
};

/**
 * Gets the count of check in's in this location.
 * @returns {integer} 
 */
Location.prototype.getCheckInCount = function () {
    return this.checkInCount;
};

/**
 * Gets the count of playlist from this location.
 * @returns {integer} 
 */
Location.prototype.getPlaylistCount = function () {
    return this.playlistCount;
};

/**
 * Gets the code for check in in this location.
 * @returns {string} 
 */
Location.prototype.getCheckInCode = function () {
    return this.checkInCode;
};

/**
 * Gets the gps latitude of the location.
 * @returns {decimal} 
 */
Location.prototype.getGPSLatitude = function () {
    return this.gpsLatitude;
};

/**
 * Gets the gps longitude of the location.
 * @returns {decimal} 
 */
Location.prototype.getGPSLongitude = function () {
    return this.gpsLongitude;
};

module.exports = Location;
},{"./image":8}],10:[function(require,module,exports){
var Utils = require('../utils');

function OffsetObject (data, valueFunc) {
    this.offsetIndex = data.OffsetIndex;
    this.offsetCount = data.OffsetCount;
    this.totalCount = data.Items;
    this.value = data.Value;
    this.valueFunc = valueFunc;
}

/**
 * Gets the offset index.
 * @returns {integer} 
 */
OffsetObject.prototype.getOffsetIndex = function () {
    return this.offsetIndex;
};

/**
 * Gets the offset count.
 * @returns {integer} 
 */
OffsetObject.prototype.getOffsetCount = function () {
    return this.offsetCount;
};

/**
 * Gets the total count of available items.
 * @returns {integer} 
 */
OffsetObject.prototype.getTotalCount = function () {
    return this.totalCount;
};

/**
 * Gets the value.
 * @returns {object} 
 */
OffsetObject.prototype.getValue = function () {
    return Utils.isDefined(this.valueFunc) ? this.valueFunc(this.value) : this.value;
};

module.exports = OffsetObject;
},{"../utils":6}],11:[function(require,module,exports){
var Utils = require('../utils');
var Image = require('./image');
var Genre = require('./genre');
var User = require('./user');

function Track (data) {
    this.uid = data.UID;
    this.title = data.Name;
    this.artist = data.Artist;
    this.album = data.Album;
    this.duration = data.Duration;
    this.votes = data.Votes;
    this.playCount = data.Played;
    this.votable = data.Votable;
    this.genres = data.Genres;
    this.images = data.Images;
    this.user = data.User;
    this.addedAt = data.Added;
}

/**
 * Gets the unique identifier of the track.
 * @returns {string} 
 */
Track.prototype.getUID = function () {
    return this.uid;
};

/**
 * Gets the title of the track.
 * @returns {string}
 */
Track.prototype.getTitle = function () {
    return this.title;
};

/**
 * Gets the artist name of the track.
 * @returns {string} 
 */
Track.prototype.getArtist = function () {
    return this.artist;
};

/**
 * Gets the album name of the track.
 * @returns {string} 
 */
Track.prototype.getAlbum = function () {
    return this.album;
};

/**
 * Gets the length of the track in secods.
 * @returns {integer} 
 */
Track.prototype.getDuration = function () {
    return this.duration;
};

/**
 * Gets the count of votes.
 * @returns {integer} 
 */
Track.prototype.getVoteCount = function () {
    return this.votes;
};

/**
 * If the track was already played.
 * @returns {boolean} 
 */
Track.prototype.getPlayCount = function () {
    return this.playCount;
};

/**
 * If the user can vote for this track.
 * @returns {boolean} 
 */
Track.prototype.isVotable = function () {
    return this.votable;
};

/**
 * Gets a array of image from this track.
 * @returns {Image[]} 
 */
Track.prototype.getImages = function () {
    var result = [];
    Utils.forEach(this.images, function (value, key) {
        result.push(new Image(value));
    });

    if (result.length == 0 && BTDJ.getDefaultCoverUrl() != null)
    {
        result.push(new Image({
            URL: BTDJ.getDefaultCoverUrl()
        }));
    }

    return result;
};

/**
 * Gets a array of genre from this track.
 * @returns {Genre[]} 
 */
Track.prototype.getGenres = function () {
    var result;

    if (!Utils.isArray(this.genres)) {
        result = [];

        Utils.forEach(this.genres, function (value, key) {
            result.push(new Genre(value));
        });

        this.genres = result;
    }
    else
    {
        result = this.genres;
    }

    return result;
};

/**
 * Gets the user of this track. For example, the user there added the track to a playlist.
 * @returns {User} 
 */
Track.prototype.getUser = function () {
    return new User(this.user);
};

/**
 * Gets the date and time where the track was added to a playlist.
 * @returns {date} 
 */
Track.prototype.getAddedAt = function () {
    return new Date(this.addedAt);
};

/**
 * Vote for this track.
 * @param {integer} [offsetIndex]
 * @param {integer} [offsetCount]
 * @returns {promise} 
 */
Track.prototype.vote = function (offsetIndex, offsetCount) {
    return BTDJ.API.voteForTrack(this.uid, offsetIndex, offsetCount);
};

/**
 * Add this track to the current liveplaylist.
 * @param {integer} [offsetIndex]
 * @param {integer} [offsetCount]
 * @returns {promise} 
 */
Track.prototype.addToLiveplaylist = function (offsetIndex, offsetCount) {
    return BTDJ.API.addTrackToLiveplaylist(this.uid, offsetIndex, offsetCount);
};

module.exports = Track;
},{"../utils":6,"./genre":7,"./image":8,"./user":12}],12:[function(require,module,exports){
var Utils = require('../utils');
var Location = require('./location');

function User (data) {
    this.username = data.Username;
    this.firstName = data.Firstname;
    this.lastName = data.Lastname;
    this.city = data.City;
    this.email = data.Email;
    this.image = ((Utils.isDefined(data.Image) || data.Image != null) && data.Image.length > 0) ? data.Image : BTDJ.getDefaultAvatarUrl();
    this.location = data.Location;
}

/**
 * Gets the username.
 * @returns {string} 
 */
User.prototype.getUsername = function () {
    return this.username;
};

/**
 * Gets the first name of the user.
 * @returns {string} 
 */
User.prototype.getFirstName = function () {
    return this.firstName;
};

/**
 * Gets the last name of the user.
 * @returns {string} 
 */
User.prototype.getLastName = function () {
    return this.lastName;
};

/**
 * Gets the full name of the user.
 * @param {string} [format]
 * @returns {string} 
 */
User.prototype.getFullName = function (format) {
    var _format = Utils.isDefined(format) ? format : "{0} {1}";
    return Utils.formatString(_format, this.firstName, this.lastName);
}

/**
 * Gets the city name of the user.
 * @returns {string} 
 */
User.prototype.getCity = function () {
    return this.city;
};

/**
 * Gets the email address of the user.
 * @returns {string} 
 */
User.prototype.getEmail = function () {
    return this.email;
};

/**
 * Gets the url to the profile image of the user.
 * @returns {string} 
 */
User.prototype.getImage = function () {
    return this.image;
};

/**
 * Gets the checked location of the user.
 * @returns {Location} 
 */
User.prototype.getLocation = function () {
    return new Location(this.location);
};

module.exports = User;
},{"../utils":6,"./location":9}]},{},[4])(4)
});