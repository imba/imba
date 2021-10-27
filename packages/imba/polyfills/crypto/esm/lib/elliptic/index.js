'use strict';
var elliptic = exports;
elliptic.utils = require('./lib/utils');
elliptic.rand = require('../brorand');
elliptic.curve = require('./lib/curve');
elliptic.curves = require('./lib/curves');
// Protocols
elliptic.ec = require('./lib/ec');
elliptic.eddsa = require('./lib/eddsa');
