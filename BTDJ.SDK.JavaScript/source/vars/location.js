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