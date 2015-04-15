(function(){


	var NODES, CLASSES;
	var fs = require('fs');
	
	module.exports.NODES = NODES = fs.readFileSync('/repos/imba/src/compiler/nodes.imba','utf8');
	module.exports.CLASSES = CLASSES = fs.readFileSync('/repos/imba/test/src/samples/classes.imba','utf8');


}())