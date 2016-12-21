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