var Utils = require('../utils');
var Image = require('./image');

function Artist(data) {
    this.uid = data.UID;
    this.name = data.Name;
    this.images = data.Images;
}

/**
 * Gets the uid of the artist.
 * @returns {string}
 */
Artist.prototype.getUID = function () {
    return this.uid;
};

/**
 * Gets the name of the artist.
 * @returns {string}
 */
Artist.prototype.getName = function () {
    return this.name;
};

/**
 *  Gets a array of image from this artist.
 * @returns {Image[]} 
 */
Artist.prototype.getImages = function () {
    var result = [];
    Utils.forEach(this.images, function (value, key) {
        result.push(new Image(value));
    });
    return result;
};

module.exports = Artist;