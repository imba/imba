var Imba = require('imba2'), _1 = Imba.createElementFactory(/*SCOPEID*/), fragment$ = Imba.createFragment, _2 = Imba.createTagScope(/*SCOPEID*/);
var items = [1,2,3,4,5,6];
var name = "hello";

var App = _2.defineTag('App', function(tag){
	tag.prototype.render = function (){
		var t$,t$0,c$,c$0,c$f,v$,v$0,f$,f$i,k$,b$,b$0;
		t$ = this;
		t$.open$();
		c$ = t$.$;
		b$ = c$.built === true;
		b$ || (t$.set('tabindex',0));
		b$=1;
		c$.b || (b$=0,c$.b = _1('h1',t$,0,'',"Hello"));
		b$ || (c$.b.set('title',"test"));
		c$.c || (c$.c = _1('h2',t$,1,'',"Subtitle"));
		v$=name;
		v$===c$.d || c$.c.flag$(c$.d=v$);
		c$.e || (c$.e = _1('div',t$,2,'',null));
		v$=this.one;
		v$===c$.f || (c$.f_ = c$.e.insert$(c$.f=v$,0,c$.f_));
		v$=this.two;
		v$===c$.g || (c$.g_ = c$.e.insert$(c$.g=v$,1,c$.g_));
		c$.h || (c$.h = _1('div',t$,3,'',null));
		v$=this.three;
		v$===c$.i || c$.h.render$(c$.i=v$,c$.i_);
		c$.j || (c$.j = _1('div',t$,4,'',null));
		v$=("" + (this.four));
		v$===c$.k || c$.j.text$(c$.k=v$);
		c$.l || (c$.l = _1('ul',t$,5,'',null));
		f$ = c$.m || (c$.m = fragment$(2,c$.l,0));
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
			v$===c$.n || (t$.set('data',c$.n=v$));
			c$.o || (c$.o = _1('span',t$,0,'',null));
			v$=("hello " + i);
			v$===c$.p || c$.o.text$(c$.p=v$);
			f$i++;
		};c$=c$0;t$=t$0;f$.reconcile(f$i);
		c$.q || (c$.q = _1('ul',t$,6,'',null));
		f$ = c$.r || (c$.r = fragment$(1,c$.q,0));
		f$i = 0;
		c$0=c$;
		t$0=t$;
		c$f=f$.$;
		for (let i = 0, len = items.length; i < len; i++) {
			b$=1;
			t$ = c$f[f$i] || (b$=0,c$f[f$i] = _1('li',f$,f$i,'',null));
			c$=t$.$;
			c$.s || (c$.s = _1('span',t$,0,'',null));
			v$=("indexed " + i);
			v$===c$.t || c$.s.text$(c$.t=v$);
			f$i++;
		};c$=c$0;t$=t$0;f$.reconcile(f$i);
		c$.built = true;;
		t$.close$();
		return;
	};
});

var el = t$ = this.u$ || (this.u$ = _1(App,null,0,'',null));
c$ = t$.$;
b$ = c$.built === true;
c$.built = true;

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
