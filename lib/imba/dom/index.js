var Imba = require("../imba");

require('./manager');
require('./event-manager');

Imba.TagManager = new Imba.TagManagerClass();

require('./tag');
require('./html');
require('./pointer');
require('./touch');
require('./event');

if (false) {};

if (true) {
	require('./server');
};
