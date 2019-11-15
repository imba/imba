function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {}, Imba = require('imba2'), _1 = Imba.createElementFactory(/*SCOPEID*/), fragment$ = Imba.createFragment;
var items = [1,2,3,4,5,6];
var name = "hello";

self.test = function (data){
	b$ = 1;
	t$ = this.b$ || (b$=0,this.b$ = _1('div',null,0,'',null));
	b$ || (t$.template$ = function(){ var t$,t$0,c$,c$0,c$f,v$,v$0,f$,f$i,k$,b$,b$0,el$,bel$; t$ = this;
	;
	c$ = t$.$ || (t$.$={});
	b$ = c$.built === true;
	c$.c || (c$.c = _1('p',t$,0,'',null));
	v$=data.msg;
	v$===c$.d || c$.c.insert$(c$.d=v$,-1,c$.d_);
	c$.e || (c$.e = _1('div',t$,1,'',null));
	f$ = c$.f || (c$.f = fragment$(1,c$.e,0));
	f$i = 0;
	c$0=c$;
	t$0=t$;
	c$f=f$.$;
	for (let i = 0, ary = iter$(data.list), len = ary.length; i < len; i++) {
		b$=1;
		t$ = c$f[f$i] || (b$=0,c$f[f$i] = _1('div',f$,f$i,'',null));
		c$=t$.$ || (t$.$={});
		v$=data.msg + i;
		v$===c$.g || (t$.title=c$.g=v$);
		c$.h || (c$.h = _1('span',t$,0,'',null));
		v$=data.msg;
		v$===c$.i || c$.h.flag$(c$.i=v$);
		v$=("" + (ary[i].text));
		v$===c$.j || c$.h.text$(c$.j=v$);
		b$ || (el$=_1('span',t$,1,'baz',"one"));
		b$ || (el$=_1('span',t$,2,'qux',"two"));
		c$.k || (c$.k = _1('div',t$,3,'',null));
		b$ || (el$=_1('span',c$.k,0,'qux',"three"));
		b$ || (el$=_1('span',c$.k,1,'qux',"four"));
		b$ || (el$=_1('span',c$.k,2,'baz',"five"));
		c$.l || (c$.l = _1('div',c$.k,3,'',null));
		b$ || (el$=_1('span',c$.l,0,'qux',"six"));
		b$ || (el$=_1('span',c$.l,1,'baz',"seven"));
		c$.m || (c$.m = _1('span',c$.l,2,'',"eight"));
		v$=data.msg;
		v$===c$.n || c$.m.flag$(c$.n=v$);
		f$i++;
	};c$=c$0;t$=t$0;f$.reconcile(f$i);
	c$.built = true;;
	});
	b$ || t$.render();
	return t$;
};

self.main = function (){
	b$ = 1;
	t$ = this.o$ || (b$=0,this.o$ = _1('div',null,0,'',null));
	b$ || (t$.template$ = function(){ var t$,t$0,c$,c$0,c$f,v$,v$0,f$,f$i,k$,b$,b$0,el$,bel$; t$ = this;
	;
	c$ = t$.$ || (t$.$={});
	b$ = c$.built === true;
	b$ || (t$.tabindex=0);
	b$ || (el$=_1('h1',t$,0,'',"Hello"),el$.title="test");
	c$.p || (c$.p = _1('h2',t$,1,'',"Subtitle"));
	v$=name;
	v$===c$.q || c$.p.flag$(c$.q=v$);
	c$.r || (c$.r = _1('div',t$,2,'',null));
	v$=self.one;
	v$===c$.s || (c$.s_ = c$.r.insert$(c$.s=v$,0,c$.s_));
	v$=self.two;
	v$===c$.t || (c$.t_ = c$.r.insert$(c$.t=v$,1,c$.t_));
	c$.u || (c$.u = _1('div',t$,3,'',null));
	v$=self.three;
	v$===c$.v || c$.u.insert$(c$.v=v$,-1,c$.v_);
	c$.w || (c$.w = _1('div',t$,4,'',null));
	v$=("" + (self.four));
	v$===c$.x || c$.w.text$(c$.x=v$);
	c$.y || (c$.y = _1('ul',t$,5,'',null));
	f$ = c$.z || (c$.z = fragment$(1,c$.y,0));
	f$i = 0;
	c$0=c$;
	t$0=t$;
	c$f=f$.$;
	for (let i = 0, len = items.length; i < len; i++) {
		b$=1;
		t$ = c$f[f$i] || (b$=0,c$f[f$i] = _1('li',f$,f$i,'',null));
		c$=t$.$ || (t$.$={});
		c$.aa || (c$.aa = _1('span',t$,0,'',null));
		v$=("indexed " + i);
		v$===c$.ab || c$.aa.text$(c$.ab=v$);
		f$i++;
	};c$=c$0;t$=t$0;f$.reconcile(f$i);
	c$.built = true;;
	});
	b$ || t$.render();
	return t$;
};

var el = self.main();
document.body.appendChild(el);

ADD = function() {
	items.push(items.length * 10);
	return el.render();
};

REM = function() {
	items.pop();
	return el.render();
};
