($.A=$.A || _T.$('h1',$).setText("Hello")).end(),
($.B=$.B || _T.$('h2',$)).setContent(this.title(),3).end(),
($.C=$.C || _T.$('h3',$).setText("Yes!")).end(),

e = (t0 = self._ok || _T.$('div',self).ref_('ok',self).setFlag(0,state)).setContent([
	(t0.$.a || t.$$('h1','a').setText("Hello")).end(),
	(t0.$.b || t.$$('h2','b').setText("Other")).end(),
	(t0.$.c || t.$$('h3','c').setText("Yes!")).end()
],2).end();


e = (t0 = self._ok || _T.$('div',self).ref_('ok',self).setFlag(0,state)).setContent([
	(t0.$.a || t0.$('h1','a').setText("Hello")).end(),
	(t0.$.b=t0.$.b || _T.$('h2',self).setText("Other")).end(),
	(t0.$.c=t0.$.c || _T.$('h3',self).setText("Yes!")).end()
],2).end();


_T.defineTag('hello', function(tag){
	tag.prototype.render = function (){
		var self = this, $ = self.$;
		return self.setChildren([
			($.A=$.A || _T.$('h1',self)).end(),
			($.B=$.B || _T.$('h2',self)).end(),
			($.C=$.C || _T.$('h3',self)).end(),
			($.D=$.D || _T.$('ul',self)).setContent([
				($.E=$.E || _T.$('li',self)).end(),
				($.F=$.F || _T.$('li',self)).end(),
				($.G=$.G || _T.$('li',self)).end()
			],2).end()
		],2).synced();
	};
});



_T.defineTag('hello', function(tag){
	tag.prototype.render = function (){
		var self = this, $ = self.$;
		return self.setChildren([
			($.A=$.A || $.$$('h1')).end(),
			($.B=$.B || $.$$('h2')).end(),
			($.C=$.C || $.$$('h3')).end(),
			($.D=$.D || $.$$('ul')).setContent([
				($.E=$.E || $.D.$$('li')).end(),
				($.F=$.F || $.D.$$('li')).end(),
				($.G=$.G || $.D.$$('li')).end()
			],2).end()
		],2).synced();
	};
});

_T.defineTag('hello', function(tag){
	tag.prototype.render = function (){
		var self = this, $ = self.$;
		return self.setChildren([
			($.A||$.$('h1','A')).end(),
			($.B||$.$('h2','B')).end(),
			($.C||$.$('h3','C')).end(),
			($.D||$.$('ul','D')).setContent([
				($.E||$.D.$('li','E')).end(),
				($.F||$.D.$('li','F')).end(),
				($.G||$.D.$('li','G')).end()
			],2).end()
		],2).synced();
	};
});
