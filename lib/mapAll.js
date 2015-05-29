'use strict';

var _ = require('lodash');
var async = require('async');

module.exports = function(Promise) {

  /*
   * Map each promise using the fn iterator and then returns result as a
   * promise. This promise will only reject after all the promises are
   * done being mapped and have been fulfilled or rejected. If more than
   * one reject occurred then they will be wrapped in a AggregateError.
   */
  function mapAll(promises, fn, opts) {

    // Default option processing.
    opts = opts || {};
    opts.concurrency = opts.concurrency || promises.length;

    // Map and resolve.
    return Promise.fromNode(function(cb) {

      // Map each promise but limit the concurrency.
      async.mapLimit(promises, opts.concurrency, function(p, next) {

        // Settle a try wrapped attemp at mapping.
        Promise.settle([Promise.try(fn, p)])
        // Return PromiseInspection object.
        .then(function(arr) {
          next(null, _.head(arr));
        });

      }, cb);

    })
    // Handle any errors.
    .then(function(results) {

      // Filter results to get a list of rejects.
      var rejects = _.filter(results, _.method('isRejected'));

      if (rejects.length === 1) {

        // Only one reject, throw it but don't wrap it.
        throw rejects[0].reason();

      } else if (rejects.length > 0) {

        // More than one reject, wrap them in an aggregate error and throw.
        var err = new Promise.AggregateError();
        _.each(rejects, function(reject) {
          err.push(reject.reason());
        });
        throw err;

      } else {

        // No rejects so map all results to their fulfilled value.
        return _.map(results, _.method('value'));

      }
    });

  };

  // Static method.
  Promise.mapAll = function(promises, fn, opts) {

    return mapAll(promises, fn, opts);

  };

  // Instance method.
  Promise.prototype.mapAll = function(fn, opts) {

    return mapAll(this, fn, opts);

  };

};
