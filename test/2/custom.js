var Imba = require('imba2'), _1 = Imba.createElementFactory(/*SCOPEID*/), _2 = Imba.createTagScope(/*SCOPEID*/), fragment$ = Imba.createFragment;

// extend tag p
// 	
// 	def analyze
// 		console.log "analyzing paragraph"

/* css

.completed {
	color: green;
}

*/


var todos = [
	{title: "Remember milk"},
	{title: "Do something here"},
	{title: "Go again",completed: true}
];

_2.defineTag('list-item', null, function(tag){
	Object.defineProperty(tag.prototype,'desc',{
		configurable: true,
		get: function(){ return this.getAttribute('desc'); },
		set: function(v){ this.setAttribute('desc',v); }
	});
	
	tag.prototype.$mount = function (){
		var self = this;
		console.log("mounted todo");
		self.render();
		
		return self.addEventListener('click',function(e) {
			return self.$mousedown(e);
		});
	};
	
	tag.prototype.$unmount = function (){
		console.log("unmounted todo");
		return this;
	};
	
	tag.prototype.$mousedown = function (){
		return console.log("onmousedown todoitem!!");
	};
	
	tag.prototype.$awaken = function (){
		// called when element is created by residing
		// in document or simply through doc.createElement
		return this;
	};
	
	tag.prototype.render = function (){
		var t$,t$0,c$,c$0,c$f,v$,v$0,f$,f$i,k$,b$,b$0,el$,bel$;
		b$ = 1;
		t$ = this;
		t$.open$();
		c$ = t$.$ || (b$=0,t$.$={});
		b$ || (el$=_1('span',t$,0,'',"This is the title"));
		t$.close$();
		return t$;
	};
});

_2.defineTag('todo-item', 'list-item', function(tag){
	Object.defineProperty(tag.prototype,'data',{
		configurable: true,
		get: function(){ return this._data; },
		set: function(v){ this._data = v; }
	});
	
	tag.prototype.toggleItem = function (){
		return this.data.completed = !this.data.completed;
	};
	
	tag.prototype.$mousedown = function (e){
		return this.render();
	};
	
	tag.prototype.onmousedown = function (){
		return console.log("hello");
	};
	
	tag.prototype.render = function (){
		var t$,t$0,c$,c$0,c$f,v$,v$0,f$,f$i,k$,b$,b$0,el$,bel$;
		b$ = 1;
		t$ = this;
		t$.open$();
		c$ = t$.$ || (b$=0,t$.$={});
		v$=(this.data.completed);
		v$===c$.b || t$.flag$(v$ ? 'completed' : '',c$.b=v$);
		c$.c || (c$.c = _1('span',t$,0,'',null));
		v$=this.data.title;
		v$===c$.d || c$.c.insert$(c$.d=v$,-1,c$.d_);
		t$.close$();
		return t$;
	};
});

_2.defineTag('app-root', null, function(tag){
	Object.defineProperty(tag.prototype,'test',{
		configurable: true,
		get: function(){ return this.getAttribute('test'); },
		set: function(v){ this.setAttribute('test',v); }
	});
	
	tag.prototype.initialize = function (){
		return console.log("hello",this.getAttribute('test'),!!this.parentNode);
	};
	
	tag.prototype.$mount = function (){
		return console.log("did mount now!",this.getAttribute('test'),this.test);
		// this.render()
	};
	
	tag.prototype.render = function (){
		var t$,t$0,c$,c$0,c$f,v$,v$0,f$,f$i,k$,b$,b$0,el$,bel$;
		b$ = 1;
		t$ = this;
		t$.open$();
		c$ = t$.$ || (b$=0,t$.$={});
		b$ || (el$=_1('div',t$,0,'',"Hello there"));
		b$ || (el$=_1('div',t$,1,'',"This is the root!"));
		b$ || (el$=_1('list-item',t$,2,'',null));
		f$ = c$.e || (c$.e = fragment$(1,t$,3));
		f$i = 0;
		c$0=c$;
		t$0=t$;
		c$f=f$.$;
		for (let i = 0, len = todos.length; i < len; i++) {
			b$=1;
			t$ = c$f[f$i] || (b$=0,c$f[f$i] = _1('todo-item',f$,f$i,'',null));
			c$=t$.$ || (t$.$={});
			v$=todos[i];
			v$===c$.f || (t$.todo=c$.f=v$);
			f$i++;
		};c$=c$0;t$=t$0;f$.reconcile(f$i);
		t$.close$();
		return t$;
	};
});

// var item = <todo-item>
var app = document.createElement('app-root');
app.test = 100;
app.render();

document.body.appendChild(
	app
);

