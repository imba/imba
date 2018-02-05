var Imba = require('imba'), _T = Imba.TAGS;


var items = [1,2,3,4,5,6,7,8,9,10,11,12];
_T.$('div',this).setTemplate(function() {
	var self = this, $ = this.$;

	return (function() {
		var _$ = ($.a = $.a || []);
		let res = [];
		for (let i = 0, len = items.length, item; i < len; i++) {
			item = items[i];
			res.push((_$[i]=_$[i] || _T.$('div',self)).setData(item).setContent(item,3).end());
		};
		return res;
	})();

	_T.COLL = function(){
		var cache = {$$: 0};
		var tree = cache.$tree = [];
		var last = cache.$last = [];

		tree.static = 5; // reconcileable array
		tree.v = 0;

		tree._prev = last;
		last._prev = tree;

		cache.$tree_.$ = cache;
		cache.$last_.$ = cache;
	}

	return (function() {
		var _$ = ($.a = $.a || _T.COLL() );
		let old = _$.$tree.$reconciled;
		let res = _$.$tree;
		let other = null;

		for (let i = 0, len = items.length, item; i < len; i++) {
			item = items[i];
			let old = res[i];
			let tag = ($b[item]=$b[item] || _T.$('div',self)).setData(item).setContent(item,3).end();

			// prev index
			let prevIndex = tag.$i
			// something has changed
			if(prevIndex != i){
				
			}
			// tag has not changed
			if(prev != tag){

			}
			// set it in one array
			res[i] = tag;
		};

		return res;
	})();


	(function() {
		var $b = ($.b = $.b || {});
		let res = [];
		for (let i = 0, len = items.length, item; i < len; i++) {
			item = items[i];
			res.push(($b[item]=$b[item] || _T.$('div',self)).setData(item).setContent(item,3).end());
		};
		return res;
	})()
}).end();


