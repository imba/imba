var Imba = require("./imba");
var activate = false;
if (typeof window !== 'undefined') {
	if (window.Imba) {
		console.warn(("Imba v" + (Imba.VERSION) + " is already loaded."));
		Imba = window.Imba;
	} else {
		window.Imba = Imba;
		activate = true;
		if (window.define && window.define.amd) {
			window.define("imba",[],function() { return Imba; });
		};
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
