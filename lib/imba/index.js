var Imba = require("./imba");
var activate = false;
var ns = ((typeof window !== 'undefined') ? window : (((typeof global !== 'undefined') ? global : null)));

if (ns && ns.Imba) {
	console.warn(("Imba v" + (ns.Imba.VERSION) + " is already loaded."));
	Imba = ns.Imba;
} else if (ns) {
	ns.Imba = Imba;
	activate = true;
	if (ns.define && ns.define.amd) {
		ns.define("imba",[],function() { return Imba; });
	};
};

module.exports = Imba;

if (!false) {
	require('./scheduler');
	require('./dom/index');
};

if (activate) {
	Imba.EventManager.activate();
};

if (true) {
	if (!null) {
		require('../../register.js');
	};
};
