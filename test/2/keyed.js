var Imba = require('imba2'), _1 = Imba.createElementFactory(/*SCOPEID*/), fragment$ = Imba.createFragment, _2 = Imba.createTagScope(/*SCOPEID*/);
var items = ['a','x','3','4','5sd','336'];
_2.defineTag('app-root', null, function(tag){
	tag.prototype.render = function (){
		var t1$t, t1$b, t1$c, t2$t, t2$v, t2$i, t2$c, t3$t, t3$k, t3$b, t3$c, t3$v, t4$t, t4$v;
		t1$b = 1;
		t1$t = this;
		t1$t.open$();
		t1$c = t1$t.$ || (t1$b=0,t1$t.$={});
		t2$t = t1$c.b || (t1$c.b = t2$t=_1('p',t1$t,0,'',null));
		t2$v=this.data.msg;
		t2$v===t1$c.c || t1$c.b.insert$(t1$c.c=t2$v,-1,t1$c.c_);
		t2$t = t1$c.d || (t1$c.d = t2$t = fragment$(2,t1$t,1));
		t2$i = 0;
		t2$c=t2$t.$;
		t2$t.open$();
		for (let i = 0, len = items.length; i < len; i++) {
			t3$k=items[i];
			t3$b=1;
			t3$t = t2$c[t3$k] || (t3$b=0,t2$c[t3$k] = t3$t=_1('div',t2$t,0,'',null));
			t3$c=t3$t.$e || (t3$t.$e={});
			t3$v=this.data.msg + i;
			t3$v===t3$c.f || (t3$t.title=t3$c.f=t3$v);
			t4$t = t3$c.g || (t3$c.g = t4$t=_1('span',t3$t,0,'',null));
			t4$v=this.data.msg;
			t4$v===t3$c.h || t3$c.g.flag$(t3$c.h=t4$v);
			t4$v=("" + (this.obj.text));
			t4$v===t3$c.i || t3$c.g.text$(t3$c.i=t4$v);
			t3$b || (t4$t=_1('span',t3$t,1,'baz',"one"));
			t3$b || (t4$t=_1('span',t3$t,2,'qux',"two"));
			t3$b || (t4$t=_1('div',t3$t,3,'',null));
			t2$t.push(t3$t,t2$i++);
		};t2$t.close$(t2$i);
		t1$t.close$();
		return t1$t;
	};
});
