'use strict';

function requestExtensible(options) {
  if (!options) options = {};
  var rootRequest = options.request || require('request');
  var extensions = options.extensions || [];

  return function(options, callback) {

    function next(extensionIndex, options, callback) {
      if (extensionIndex >= extensions.length) {
        return rootRequest(options, callback);
      }

      var current = extensions[extensionIndex];
      return current(options, callback, function(options, callback) {
        return next(extensionIndex + 1, options, callback);
      });
    }

    return next(0, options, callback);
  };
}

module.exports = requestExtensible;
