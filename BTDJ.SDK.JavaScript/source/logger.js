exports.error = function (value) {
    throw new Error(value);
};

exports.log = function (value) {
    if (BTDJ.isDevMode()) console.log('[ ' + new Date().toUTCString() + ' ] ' + value);
};