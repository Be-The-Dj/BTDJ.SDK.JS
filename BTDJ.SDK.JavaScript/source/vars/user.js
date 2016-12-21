var Utils = require('../utils');
var Location = require('./location');

function User (data) {
    this.username = data.Username;
    this.image = ((Utils.isDefined(data.Image) || data.Image != null) && data.Image.length > 0) ? data.Image : BTDJ.getDefaultAvatarUrl();
}

/**
 * Gets the username.
 * @returns {string} 
 */
User.prototype.getUsername = function () {
    return this.username;
};

/**
 * Gets the url to the profile image of the user.
 * @returns {string} 
 */
User.prototype.getImage = function () {
    return this.image;
};

module.exports = User;