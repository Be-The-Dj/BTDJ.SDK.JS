var _isStorageAvailable;

/**
* Check if the value is defined
* @param value
* @returns {boolean}
*/
exports.isDefined = function (value) {
    return (typeof value !== 'undefined');
};

/**
 * Check if the value is undefined
 * @param value
 * @returns {boolean} 
 */
exports.isUndefined = function (value) {
    return (typeof value === 'undefined');
};

/**
 * Check if the value a string.
 * @param {object} value
 * @returns {boolean} 
 */
exports.isString = function (value) {
    return (typeof value === 'string');
};

/**
 * Checks if the value a array.
 * @param {object} value
 * @returns {boolean} 
 */
exports.isArray = function (value) {
    return (Object.prototype.toString.call(value) === '[object Array]');
}

/**
* 
* @param {string} url
* @param {object} [options]
*/
exports.XHR = function (url, options) {
    var self = this;

    if (self.isUndefined(options)) {
        options = {};
    }

    return new Promise(function (resolve, reject) {

        if (self.isDefined(options.params)) {
            var urlParams = "";
            for (item in options.params) {
                if (options.params.hasOwnProperty(item)) {
                    if (self.isDefined(item)) {
                        if (urlParams != '') {
                            urlParams += '&';
                        }
                        urlParams += item + '=' + options.params[item];
                    }
                }
            }
            if (url.indexOf('?') == -1) {
                urlParams = '?' + urlParams;
            }
            url = url + urlParams;
        }

        var xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);

        if (self.isDefined(options.headers)) {
            for (item in options.headers) {
                if (options.headers.hasOwnProperty(item)) {
                    if (self.isDefined(item)) {
                        xhr.setRequestHeader(item, options.headers[item]);
                    }
                }
            }
        }

        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                //Logger.log("XHR Error ( " + xhr.status + " ): " + xhr.statusText);
                reject({ error: new Error(xhr.responseText), status: xhr.status });
            }
        };

        xhr.onerror = function () {
            //Logger.log("XHR Error ( " + xhr.status + " ): " + xhr.statusText);
            console.log("Error", xhr);
            reject(new Error("Network Error"));
        };

        var transformRequest = options.transformRequest || function (obj) {
            if (self.isUndefined(obj)) return;
            console.log(obj);
            return JSON.stringify(obj);
        };

        xhr.send(transformRequest(options.data));
    });
};

/**
 * Get a value of parameter from 
 * @param {string} name
 * @param {string} url
 * @returns {string} 
 */
exports.urlParameterByName = function (name, url) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url || location.search);
    return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
};

exports.forEach = function (array, func) {
    if (Array.isArray(array)) {
        for (var i = 0; i < array.length; i++) {
            func(array[i], i);
        }
    } else {
        for (var item in array) {
            if (array.hasOwnProperty(item)) {
                func(array[item], item);
            }
        }
    }
};

/**
 * Gets if the storage is available.
 * @returns {boolean} 
 */
exports.isStorageAvailable = function () {
    if (_isStorageAvailable == null) {
        _isStorageAvailable = (typeof (Storage) !== undefined);
    }

    return _isStorageAvailable;
};

/**
 * Write the given data in the session storage.
 * @param {string} key
 * @param {object} value
 */
exports.writeSessionStorage = function (key, value) {
    if (this.isStorageAvailable) {
        sessionStorage.setItem(key, value);
    }
};

/**
 * Gets the value of the given key from the session storage.
 * @param {string} key
 * @returns {object} 
 */
exports.readSessionStorage = function (key) {
    if (this.isStorageAvailable) {
        return sessionStorage.getItem(key);
    }

    return undefined;
};

/**
 * Remove the item with the given key from the session storage.
 * @param {string} key
 */
exports.removeSessionStorage = function (key) {
    if (this.isStorageAvailable) {
        sessionStorage.removeItem(key);
    }
};

/**
 * Replace the placeholders of the value with the given args.
 * @param {string} value
 * @param {string} args
 * @returns {string} 
 */
exports.formatString = function (value, args) {
    var theString = value;
    for (var i = 1; i < arguments.length; i++) {
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }
    return theString;
};