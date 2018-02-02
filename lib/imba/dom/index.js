var Imba = require("../imba");

require('./manager');

Imba.TagManager = new Imba.TagManagerClass();

require('./tag');
require('./html');
require('./pointer');
require('./touch');
require('./event');
require('./event-manager');

if (false) {};

if (true) {
	require('./server');
};
