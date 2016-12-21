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