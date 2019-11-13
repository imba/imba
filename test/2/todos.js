var Imba = require('imba2'), _1 = Imba.createElementFactory(/*SCOPEID*/), _2 = Imba.createTagScope(/*SCOPEID*/), self = {};

var App = _2.defineTag('App', function(tag){
	tag.prototype.addItem = function (){
		console.log("addItem!!",this.__newTodoTitle);
		if (this.__newTodoTitle) {
			API.addTodo(this.__newTodoTitle);
			return this.__newTodoTitle = "";
		};
	};
	
	tag.prototype.clearCompleted = function (){
		return API.clearCompleted();
	};
	
	tag.prototype.mount = function (){
		var self = this;
		self.__newTodoTitle = '';
		return window.addEventListener('hashchange',function() {
			return self.route = window.location.hash;
		});
	};
	
	tag.prototype.render = function (){
		var all = API.todos();
		var items = all;
		var done = API.completed();
		var active = API.remaining();
		
		if (this.route == '#/completed') {
			items = done;
		} else if (this.route == '#/active') {
			items = active;
		};
		
		return t$ = this;
		c$ = t$.$;
		c$.b=t$;
		c$.c || (c$.c = _1('header',c$.b,0,'header'));
		c$.d || (c$.d = _1('input',c$.c,0,'new-todo'));
		v$=this.__newTodoTitle;
		v$===c$.e || (c$.d.bindData(this,'__newTodoTitle'));
		(c$.d.set('type','text'));
		(c$.d.set('placeholder','What to do?'));
		(c$.d.set('autofocus',true));
		(c$.d.on$(0,['keyup','enter',['addItem']],this));
		c$.f || (c$.f = _1('section',c$.b,1,'main'));
		c$.g || (c$.g = _1('ul',c$.f,0,'todo-list'));
		c$.h || (c$.h = _1('footer',c$.b,2,'footer'));
		v$=(!all.length);
		v$===c$.i || (c$.h.flagIf('hidden',c$.i=v$));
		c$.j || (c$.j = _1('span',c$.h,0,'todo-count'));
		c$.k || (c$.k = _1('strong',c$.j,0,''));
		c$.k.render_(active.length,0);
		c$.l || (c$.l = _1('span',c$.j,1,''));
		c$.l.render_((" item" + ((active.length != 1) ? 's' : '') + " left"),0);
		c$.m || (c$.m = _1('ul',c$.h,1,'filters'));
		c$.n || (c$.n = _1('li',c$.m,0,''));
		c$.o || (c$.o = _1('a',c$.n,0,''));
		v$=(items == all);
		v$===c$.p || (c$.o.flagIf('selected',c$.p=v$));
		(c$.o.set('href','#/'));
		c$.o.render_("All",0);
		c$.q || (c$.q = _1('li',c$.m,1,''));
		c$.r || (c$.r = _1('a',c$.q,0,''));
		v$=(items == active);
		v$===c$.s || (c$.r.flagIf('selected',c$.s=v$));
		(c$.r.set('href','#/active'));
		c$.r.render_("Active",0);
		c$.t || (c$.t = _1('li',c$.m,2,''));
		c$.u || (c$.u = _1('a',c$.t,0,''));
		v$=(items == done);
		v$===c$.v || (c$.u.flagIf('selected',c$.v=v$));
		(c$.u.set('href','#/completed'));
		c$.u.render_("Completed",0);
		c$.w || (c$.w = _1('button',c$.h,2,'clear-completed'));
		v$=(!done.length);
		v$===c$.x || (c$.w.flagIf('hidden',c$.x=v$));
		(c$.w.on$(0,['tap','clearCompleted'],this));
		c$.w.render_('Clear completed',0);
		t$;
	};
});

// create an instance of the app (with id app)
var app = t$ = this.y$ || (this.y$ = _1(App,null,,'todoapp'));
c$ = t$.$;
c$.y=t$;
v$=self.store;
v$===c$.z || (c$.y.bindData(self,'store'));
(c$.y.set('id','app'));
t$;

api.render = function (){
	return app.render();
};

Imba.mount(app);
self.api.reset(6);
