var self = this, Imba = require('imba'), _T = Imba.TAGS, t0;
var list = [1,2,3,4,5];
var state = "hello";

var e = _T.$('div',function($$) {
	var $ = this.$;
	return this.setFlag(0,state).synced();
}).end();

e = _T.$('div',function($$) {
	var $ = this.$, $ = $.$, self = this;
	return this.setFlag(0,state).setChildren([
		($.A=$.A || _T.$('h1',$).setText("Hello")).end(),
		($.B=$.B || _T.$('h2',$)).setContent(this.title(),3).end(),
		($.C=$.C || _T.$('h3',$).setText("Yes!")).end(),
		(function() {
			var $$1 = ($.D || _T.$set($,'D'));
			let res = $$1.$iter();
			for (let i = 0, len = list.length; i < len; i++) {
				res.push(($$1[i] || $$1.$(i,_T.$('div',self))).setContent(list[i],3).end());
			};
			return res;
		})()
	],1).synced();
}).end();

e = (t0 = self._ok || _T.$('div',self).ref_('ok',self).setFlag(0,state)).setContent([
	(t0.$.a=t0.$.a || _T.$('h1',self).setText("Hello")).end(),
	(t0.$.b=t0.$.b || _T.$('h2',self).setText("Other")).end(),
	(t0.$.c=t0.$.c || _T.$('h3',self).setText("Yes!")).end()
],2).end();

var closed = _T.$('div',self).setFlag(0,state).setTemplate(function() {
	var $ = this.$;
	return Imba.static([
		($.a=$.a || _T.$('h1',this).setText("Hello")).end(),
		($.b=$.b || _T.$('h2',this)).setContent(self.title(),3).end(),
		($.c=$.c || _T.$('h3',this).setText("Yes!")).end(),
		($.d=$.d || _T.$('ul',this)).setContent((function() {
			var t1, $$ = ($.e || _T.$set($,'e'));
			let res = $$.$iter();
			for (let i = 0, len = list.length; i < len; i++) {
				res.push((t1 = $$[i] || $$.$(i,_T.$('li',self))).setContent(
					(t1.$.a=t1.$.a || _T.$('span',self)).setContent(list[i],3).end()
				,2).end());
			};
			return res;
		})(),3).end()
	],1);
}).end();

var open = _T.$('div',self).setFlag(0,state).setTemplate(function() {
	var $ = this.$, self = this;
	return Imba.static([
		($.a=$.a || _T.$('h1',this).setText("Hello")).end(),
		($.b=$.b || _T.$('h2',this)).setContent(this.title(),3).end(),
		($.c=$.c || _T.$('h3',this).setText("Yes!")).end(),
		($.d=$.d || _T.$('ul',this)).setContent((function() {
			var t1, $$ = ($.e || _T.$set($,'e'));
			let res = $$.$iter();
			for (let i = 0, len = list.length; i < len; i++) {
				res.push((t1 = $$[i] || $$.$(i,_T.$('li',self))).setContent(
					(t1.$.a=t1.$.a || _T.$('span',self)).setContent(list[i],3).end()
				,2).end());
			};
			return res;
		})(),3).end()
	],1);
}).end();

var a = _T.$('div',function($$) {
	var $ = this.$, $ = $.$, self = this;
	return this.setChildren(
		($.A=$.A || _T.$('ul',$)).setContent((function() {
			var $$1 = ($.B || _T.$set($,'B'));
			let res = $$1.$iter();
			for (let i = 0, len = list.length; i < len; i++) {
				res.push(($$1[i] || $$1.$(i,_T.$('li',self))).setContent(list[i],3).end());
			};
			return res;
		})(),3).end()
	,2).synced();
}).end();

var b = _T.$('div',self).setTemplate(function() {
	var $ = this.$, self = this;
	return ($.a=$.a || _T.$('ul',this)).setContent((function() {
		var $$ = ($.b || _T.$set($,'b'));
		let res = $$.$iter();
		for (let i = 0, len = list.length; i < len; i++) {
			res.push(($$[i] || $$.$(i,_T.$('li',self))).setContent(list[i],3).end());
		};
		return res;
	})(),3).end();
}).end();

var c = _T.$('div',function($$) {
	var $ = this.$, $ = $.$, self = this;
	return this.setFlag(0,state).setChildren(
		($.A=$.A || _T.$('ul',$)).setContent((function() {
			var $$1 = ($.B || _T.$set($,'B'));
			let res = $$1.$iter();
			for (let i = 0, len = list.length; i < len; i++) {
				res.push(($$1[i] || $$1.$(i,_T.$('li',self))).setContent(list[i],3).end());
			};
			return res;
		})(),3).end()
	,2).synced();
}).end();

var d = _T.$('div',self).setFlag(0,state).setTemplate(function() {
	var $ = this.$;
	return Imba.static([
		($.a=$.a || _T.$('h1',this).setText("Hello")).end(),
		($.b=$.b || _T.$('ul',this)).setContent((function() {
			var $$ = ($.c || _T.$set($,'c'));
			let res = $$.$iter();
			for (let i = 0, len = list.length; i < len; i++) {
				res.push(($$[i] || $$.$(i,_T.$('li',self))).setContent(list[i],3).end());
			};
			return res;
		})(),3).end()
	],1);
}).end();


// should basically be
// div.setTemplate(function(){ cache.. this.setFlag(state).setChildren(...) })

function A(){ };

A.prototype.build = function (){
	return _T.$('div',function($$) {
		var $ = this.$, self = this, $ = $.$;
		return this.setChildren([
			this.title() ? (
				($.A=$.A || _T.$('something',self)).end()
			) : void(0)
		],1).synced();
	}).end();
};
