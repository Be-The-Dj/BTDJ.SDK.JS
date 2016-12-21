var OAuth2 = require('./api/oauth2');
var OffsetObject = require('./vars/offsetObject');
var User = require('./vars/user');
var Track = require('./vars/track');
var Location = require('./vars/location');
var Logger = require('./logger');
var Utils = require('./utils');

const API_RES = 'https://api.btdj.de/';
const API_RES_DEV = 'https://dev-api.btdj.de/';

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