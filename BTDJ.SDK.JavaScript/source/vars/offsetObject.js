var Utils = require('../utils');

function OffsetObject (data, valueFunc) {
    this.offsetIndex = data.OffsetIndex;
    this.offsetCount = data.OffsetCount;
    this.totalCount = data.Items;
    this.value = data.Value;
    this.valueFunc = valueFunc;
}

/**
 * Gets the offset index.
 * @returns {integer} 
 */
OffsetObject.prototype.getOffsetIndex = function () {
    return this.offsetIndex;
};

/**
 * Gets the offset count.
 * @returns {integer} 
 */
OffsetObject.prototype.getOffsetCount = function () {
    return this.offsetCount;
};

/**
 * Gets the total count of available items.
 * @returns {integer} 
 */
OffsetObject.prototype.getTotalCount = function () {
    return this.totalCount;
};

/**
 * Gets the value.
 * @returns {object} 
 */
OffsetObject.prototype.getValue = function () {
    return Utils.isDefined(this.valueFunc) ? this.valueFunc(this.value) : this.value;
};

module.exports = OffsetObject;