(function(){


	var NODES, CLASSES, BASICSTRINGS, INTERPOLATED;
	var fs = require('fs');
	
	module.exports.NODES = NODES = fs.readFileSync('/repos/imba/src/compiler/nodes.imba','utf8');
	module.exports.CLASSES = CLASSES = fs.readFileSync('/repos/imba/test/src/samples/classes.imba','utf8');
	module.exports.BASICSTRINGS = BASICSTRINGS = fs.readFileSync('/repos/imba/test/src/samples/basicstrings.imba','utf8');
	module.exports.INTERPOLATED = INTERPOLATED = fs.readFileSync('/repos/imba/test/src/samples/interpolated.imba','utf8');


}())