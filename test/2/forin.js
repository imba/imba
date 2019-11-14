var Imba = require('imba2'), _1 = Imba.createElementFactory(/*SCOPEID*/), fragment$ = Imba.createFragment, _2 = Imba.createTagScope(/*SCOPEID*/);
var items = [1,2,3,4,5,6];

var App = _2.defineTag('App', function(tag){
	tag.prototype.render = function (){
		var t$,t$0,c$,c$0,c$f,v$,v$0,f$,f$i,k$,b$;
		t$ = this;
		c$ = t$.$;
		b$ = c$._;
		b$ || (t$.set('tabindex',0));
		b$=1;
		c$.b || (b$=0,c$.b = _1('h1',t$,0,'',"Hello"));
		b$ || (c$.b.set('title',"test"));
		b$=1;
		c$.c || (b$=0,c$.c = _1('ul',t$,1,'',null));
		f$ = c$.d || (c$.d = fragment$(2,c$.c,0));
		f$i = 0;
		c$0=c$;
		t$0=t$;
		c$f=f$.$;
		for (let i = 0, len = items.length, item; i < len; i++) {
			item = items[i];
			k$=item;
			b$=1;
			t$ = c$f[k$] || (b$=0,c$f[k$] = _1('li',f$,0,'',null));
			c$=t$.$;
			v$=item;
			v$===c$.e || (t$.set('data',c$.e=v$));
			b$=1;
			c$.f || (b$=0,c$.f = _1('span',t$,0,'',null));
			v$=("hello " + i);
			v$===c$.g || c$.f.render_(c$.g=v$,0);
			f$.push(t$,f$i++);
		};c$=c$0;t$=t$0;f$.reconcile(f$i);
		b$=1;
		c$.h || (b$=0,c$.h = _1('ul',t$,2,'',null));
		f$ = c$.i || (c$.i = fragment$(1,c$.h,0));
		f$i = 0;
		c$0=c$;
		t$0=t$;
		c$f=f$.$;
		for (let i = 0, len = items.length; i < len; i++) {
			b$=1;
			t$ = c$f[f$i] || (b$=0,c$f[f$i] = _1('li',f$,f$i,'',null));
			c$=t$.$;
			b$=1;
			c$.j || (b$=0,c$.j = _1('span',t$,0,'',null));
			v$=("indexed " + i);
			v$===c$.k || c$.j.render_(c$.k=v$,0);
			f$.push(t$,f$i++);
		};c$=c$0;t$=t$0;f$.reconcile(f$i);
		c$._ = true;
		return;
	};
});

var el = t$ = this.l$ || (this.l$ = _1(App,null,0,'',null));
c$ = t$.$;
b$ = c$._;
c$._ = true;

EL = el;
Imba.mount(el);

ADD = function() {
	items.push(items.length * 10);
	return EL.render();
};

REM = function() {
	items.pop();
	return EL.render();
};
