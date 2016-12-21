function Image (data) {
    this.uid = data.UID;
    this.url = data.URL;
    this.height = data.Height;
    this.width = data.Width;
}

/**
 * Gets the uid of the image.
 * @returns {string} 
 */
Image.prototype.getUID = function () {
    return this.uid;
};

/**
 * Gets the url to the image.
 * @returns {string} 
 */
Image.prototype.getUrl = function () {
    return this.url;
};

/**
 * Gets the height of the image.
 * @returns {integer} 
 */
Image.prototype.getHeight = function () {
    return this.height;
};

/**
 * Gets the width of the image.
 * @returns {integer} 
 */
Image.prototype.getWidth = function () {
    return this.width;
};

module.exports = Image;