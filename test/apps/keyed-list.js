var self = {}, Imba = require('imba2'), _1 = Imba.createElementFactory(/*SCOPEID*/), fragment$ = Imba.createFragment, _2 = Imba.createTagScope(/*SCOPEID*/), t1$t;
var pool = [
	{id: 5,title: "Five"},
	{id: 6,title: "Six"},
	{id: 7,title: "Seven"}
];

var todos = [
	{id: 1,title: "One"},
	{id: 2,title: "Two"},
	{id: 3,title: "Three"},
	{id: 4,title: "Four"}
];

_2.defineTag('app-root', 'component', function(tag){
	
	tag.prototype.pop = function (){
		return pool.push(todos.pop());
	};
	
	tag.prototype.push = function (){
		return todos.push(pool.pop());
	};
	
	tag.prototype.unshift = function (){
		return todos.unshift(pool.pop());
	};
	
	tag.prototype.reorder = function (){
		return todos.unshift(todos.pop());
	};
	
	tag.prototype.replace = function (){
		var idx = 2;
		pool.push(todos[idx]);
		return todos[idx] = pool.unshift();
	};
	
	tag.prototype.render = function (){
		var t1$t, t1$b, t1$c, t2$t, t3$t, t3$i, t3$c, t4$t, t4$k, t4$b, t4$c, t5$t, t5$v;
		t1$b = 1;
		t1$t = this;
		t1$t.open$();
		t1$c = t1$t.$ || (t1$b=0,t1$t.$={});
		t1$b || (t2$t=_1('div',t1$t,0,'',null));
		t1$b || (t3$t=_1('button',t2$t,0,'pop',"Remove"));
		t1$b || (t3$t.on$('click',['pop'],this,self));
		t1$b || (t3$t=_1('button',t2$t,1,'push',"Add"));
		t1$b || (t3$t.on$('click',['push'],this,self));
		t1$b || (t3$t=_1('button',t2$t,2,'push',"Unshift"));
		t1$b || (t3$t.on$('click',['unshift'],this,self));
		t1$b || (t3$t=_1('button',t2$t,3,'push',"Replace"));
		t1$b || (t3$t.on$('click',['replace'],this,self));
		t1$b || (t3$t=_1('button',t2$t,4,'reorder',"Reorder"));
		t1$b || (t3$t.on$('click',['reorder'],this,self));
		t2$t = t1$c.b || (t1$c.b = t2$t=_1('ul',t1$t,1,'',null));
		t3$t = t1$c.c || (t1$c.c = t3$t = fragment$(2,t2$t,0));
		t3$i = 0;
		t3$c=t3$t.$;
		t3$t.open$();
		for (let i = 0, len = todos.length, item; i < len; i++) {
			item = todos[i];
			t4$k=item.id;
			t4$b=1;
			t4$t = t3$c[t4$k] || (t4$b=0,t3$c[t4$k] = t4$t=_1('li',t3$t,0,'',null));
			t4$c=t4$t.$d || (t4$t.$d={});
			t5$t = t4$c.e || (t4$c.e = t5$t=_1('span',t4$t,0,'',null));
			t5$v=item.title;
			t5$v===t4$c.f || t4$c.e.insert$(t4$c.f=t5$v,-1,t4$c.f_);
			t3$t.push(t4$t,t3$i++,t4$k);
		};t3$t.close$(t3$i);
		t1$t.close$();
		return t1$t;
	};
});

document.body.appendChild(((t1$t=_1('app-root',null,0,'',null)),
t1$t.end$(),
t1$t));

self.test("move last todo to top",async function(_0) {
	await self.spec.click('.reorder');
	return self.eq(_0.mutations.length,1);
});

// test "rename todo" do
//	await spec.click('.reorder')
//	eq $1.mutations.length,1

// This should create a new element representing the new id
// And remove the old one
// test "change id of todo" do
// 	todos[0].id = 100
// 	var i = await spec.tick()
//	console.log("info")
