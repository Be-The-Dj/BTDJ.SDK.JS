var Utils = require('../utils');
var Artist = require('./artist');
var Album = require('./album');
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
    return new Artist(this.artist);
};

/**
 * Gets the album name of the track.
 * @returns {string} 
 */
Track.prototype.getAlbum = function () {
    return new Album(this.album);
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