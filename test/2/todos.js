function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require('imba2'), _1 = Imba.createElementFactory(/*SCOPEID*/), fragment$ = Imba.createFragment, _2 = Imba.createTagScope(/*SCOPEID*/), tt$1;
_2.defineTag('todo-app', null, function(tag){
	tag.prototype.render = function (){
		var tt$1, tb$1, tc$1, tt$2, tt$3, tb$3, tt$4, tt$5;
		var remaining = this.todos.filter(function(todo) { return !todo.completed; });
		
		tb$1 = 1;
		tt$1 = this;
		tt$1.open$();
		tc$1 = tt$1.$ || (tb$1=0,tt$1.$={});
		b$ || (t$.id='app');
		tt$2 = tc$1.b || (tc$1.b = tt$2=_1('header',tt$1,0,'header',null));
		tb$3=1;
		tt$3 = tc$1.c || (tb$3=0,tc$1.c = tt$3=_1('input',tt$2,0,'new-todo',null));
		v$=this.newtitle;
		v$===c$.d || (c$.c.bindData(this,'newtitle'));
		b$ || (c$.c.type='text');
		b$ || (c$.c.placeholder='What to do?');
		b$ || (c$.c.autofocus=true);
		b$ || (c$.c.on$(0,['keyup','enter','addtodo'],this));
		tt$2 = tc$1.e || (tc$1.e = tt$2=_1('section',tt$1,1,'main',null));
		tt$3 = tc$1.f || (tc$1.f = tt$3=_1('ul',tt$2,0,'todo-list',null));
		f$ = c$.g || (c$.g = fragment$(1,c$.f,0));
		f$i = 0;
		c$0=c$;
		t$0=t$;
		c$f=f$.$;
		for (let i = 0, items = iter$(this.todos), len = items.length; i < len; i++) {
			b$=1;
			t$ = c$f[f$i] || (b$=0,c$f[f$i] = tt$5=_1('todo-item',tt$4,0,'',null));
			c$=t$.$ || (t$.$={});
			v$=items[i];
			v$===c$.h || (t$.data=(items[i]));
			el$.end$();
			f$i++;
		};c$=c$0;t$=t$0;f$.reconcile(f$i);
		tt$2 = tc$1.i || (tc$1.i = tt$2=_1('footer',tt$1,2,'footer',null));
		v$=(!this.todos.length);
		v$===c$.j || c$.i.flagIf$('hidden',c$.j=v$);
		tt$3 = tc$1.k || (tc$1.k = tt$3=_1('span',tt$2,0,'todo-count',null));
		tt$4 = tc$1.l || (tc$1.l = tt$4=_1('strong',tt$3,0,'',null));
		v$=remaining.length;
		v$===c$.m || c$.l.insert$(c$.m=v$,-1,c$.m_);
		tt$4 = tc$1.n || (tc$1.n = tt$4=_1('span',tt$3,1,'',null));
		v$=(" item" + ((remaining.length != 1) ? 's' : '') + " left");
		v$===c$.o || c$.n.text$(c$.o=v$);
		b$ || (tt$3=_1('button',tt$2,1,'','Clear completed'),tt$3.on$(0,['tap','clearCompleted'],this));
		el$.end$();
		t$.close$();
		return t$;
	};
	
	tag.prototype.addTodo = function (){
		this.todos.push({
			title: this.newtitle,
			completed: false
		});
		return this.newtitle = '';
	};
	
	tag.prototype.clearCompleted = function (){
		return this.todos = this.todos.filter(function(todo) { return !todo.completed; });
	};
});

_2.defineTag('todo-item', null, function(tag){
	
	tag.prototype.dropItem = function (){
		return this.api.removeTodo(this.data);
	};
	
	tag.prototype.render = function (){
		var tt$1, tb$1, tc$1, tt$2, tt$3, tb$3;
		tb$1 = 1;
		tt$1 = this;
		tt$1.open$();
		tc$1 = tt$1.$ || (tb$1=0,tt$1.$={});
		v$=(this.data.completed);
		v$===c$.p || t$.flag$(v$ ? 'completed' : '',c$.p=v$);
		tt$2 = tc$1.q || (tc$1.q = tt$2=_1('div',tt$1,0,'view',null));
		tb$3=1;
		tt$3 = tc$1.r || (tb$3=0,tc$1.r = tt$3=_1('label',tt$2,0,'',null));
		b$ || (c$.r.on$(0,['dblclick','edit'],this));
		v$=this.data.title;
		v$===c$.s || c$.r.insert$(c$.s=v$,-1,c$.s_);
		tb$3=1;
		tt$3 = tc$1.t || (tb$3=0,tc$1.t = tt$3=_1('input',tt$2,1,'',null));
		v$=this.data.completed;
		v$===c$.u || (c$.t.bindData(this.data,'completed'));
		b$ || (c$.t.type='checkbox');
		b$ || (tt$3=_1('button',tt$2,2,'destroy',null),tt$3.on$(0,['tap','dropItem'],this));
		b$ || (tt$2=_1('input',tt$1,1,'edit',null),tt$2.type='text',tt$2.on$(0,['keydown','enter','submit'],this),tt$2.on$(1,['keydown','esc','cancel'],this));
		el$.end$();
		t$.close$();
		return t$;
	};
	
	tag.prototype.submit = function (){
		return this;
	};
	
	tag.prototype.cancel = function (){
		return this;
	};
});

var todos = [
	{title: "Remember milk"},
	{title: "Do something here"},
	{title: "Go again",completed: true}
];

document.body.appendChild(((tt$1=_1('todo-app',null,0,'',null)),tt$1.todos=todos,tt$1.end$(),tt$1));
