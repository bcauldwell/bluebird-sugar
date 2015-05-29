'use strict';

var Promise = require('bluebird');

// Decorate class with modules.
require('./lib/retry.js')(Promise);
require('./lib/mapAll.js')(Promise, util);

module.exports = Promise;
