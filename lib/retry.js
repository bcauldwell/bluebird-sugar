'use strict';

var _ = require('lodash');
var retry = require('retry-bluebird');

module.exports = function(Promise) {

  /*
   * If fn rejects retry will retry running fn a number of times
   * until it fulfills.
   */

  // Static method.
  Promise.retry = function(opts, fn, args) {

    // If args is not an array, make it an array.
    if (!_.isArray(args)) {
      args = [args];
    }

    // Wrap fn so we can apply args and so we can add counter.
    var wrap = function(counter) {
      args.push(counter);
      return fn.apply(null, args);
    };

    // Retry.
    return retry(opts, fn);

  };

};
