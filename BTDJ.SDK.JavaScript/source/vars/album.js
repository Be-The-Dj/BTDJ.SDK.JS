var Utils = require('../utils');
var Artist = require('./artist');
var Genre = require('./genre');
var Image = require('./image');

function Album(data) {
    this.uid = data.UID;
    this.name = data.Name;
    this.artists = data.Artists;
    this.genres = data.Genres;
    this.year = data.Year;
    this.images = data.Images;
}

/**
 * Gets the uid of the album.
 * @returns {string}
 */
Album.prototype.getUID = function () {
    return this.uid;
};

/**
 * Gets the name of the album.
 * @returns {string}
 */
Album.prototype.getName = function () {
    return this.name;
};

/**
 * Gets a array of artist from this album.
 * @returns {Artist[]}
 */
Album.prototype.getArtists = function () {
    var result = [];
    Utils.forEach(this.artist, function (value, key) {
        result.push(new Artist(value));
    });
    return result;
};

/**
 * Gets a array of genre from this album.
 * @returns {Genre[]}
 */
Album.prototype.getGenres = function () {
    var result = [];
    Utils.forEach(this.genres, function (value, key) {
        result.push(new Genre(value));
    });
    return result;
};

/**
 * Gets the publish year of the album.
 * @returns {integer}
 */
Album.prototype.getYear = function () {
    return this.year;
};

/**
 * Gets a array of image from this album.
 * @returns {Image[]}
 */
Album.prototype.getImages = function () {
    var result = [];
    Utils.forEach(this.images, function (value, key) {
        result.push(new Image(value));
    });
    return result;
};

module.exports = Album;