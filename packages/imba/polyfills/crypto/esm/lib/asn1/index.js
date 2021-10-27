'use strict';
const asn1 = exports;
asn1.bignum = require('../bn.js');
asn1.define = require('./api').define;
asn1.base = require('./base');
asn1.constants = require('./constants');
asn1.decoders = require('./decoders');
asn1.encoders = require('./encoders');
