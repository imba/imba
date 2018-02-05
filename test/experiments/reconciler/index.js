var Imba = require('imba'), _T = Imba.TAGS;


var items = [1,2,3,4,5,6,7,8,9,10,11,12];
_T.$('div',this).setTemplate(function() {
	var self = this, $ = this.$;
	return Imba.static([
		// no key
		(function() {
			var $1 = ($.a = $.a || []);
			for (let i = 0, len = $1.taglen = items.length, item; i < len; i++) {
				item = items[i];
				($1[i]=$1[i] || _T.$('div',self)).setData(item).setContent(item,3).end();
			};return $1;
		})(),
		
		(function() {
			var $2 = ($.b = $.b || []);
			for (let i = 0, len = $2.taglen = items.length, item; i < len; i++) {
				item = items[i];
				($2[i]=$2[i] || _T.$('div',self)).setData(item).setContent(item,3).end();
			};return $2;
		})(),
		
		($.c=$.c || _T.$('div',self)).setContent((function() {
			var $3 = ($.d = $.d || []);
			for (let i = 0, len = $3.taglen = items.length, item; i < len; i++) {
				item = items[i];
				($3[i]=$3[i] || _T.$('div',self)).setData(item).setContent(item,3).end();
			};return $3;
		})(),4).end(),
		
		($.e=$.e || _T.$('div',self)).setContent((function() {
			var $f = ($.f = $.f || {}), id_;
			let res = [];
			for (let i = 0, len = items.length, item; i < len; i++) {
				item = items[i];
				res.push(($f[(id_ = item.id)]=$f[id_] || _T.$('div',self)).setData(item).setContent(item,3).end());
			};
			return res;
		})(),5).end()
	],1);
}).end();


function method(){
	var $ = (this.$._method = this.$._method || {});
	let res = [];
	for (let i = 0, len = items.length, item; i < len; i++) {
		item = items[i];
		res.push(($[i]=$[i] || _T.$('div',this)).setData(item).setContent(item,3).end());
	};
	return res;
};
