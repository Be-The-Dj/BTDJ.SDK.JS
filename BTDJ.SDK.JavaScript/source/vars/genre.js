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