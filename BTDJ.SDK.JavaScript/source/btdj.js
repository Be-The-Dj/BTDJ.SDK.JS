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