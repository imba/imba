var Imba = require("../imba");

require('./manager');

Imba.TagManager = new Imba.TagManagerClass();

require('./tag');
require('./html');
require('./svg');
require('./pointer');
require('./touch');
require('./event');
require('./event-manager');
require('./selector');

if (false) {};

if (true) {
	require('./server');
};
