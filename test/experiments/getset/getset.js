var Imba = require('imba'), _1 = Imba.createElement;
function Person(name){
	this.data = {name: name};
	this.inspect(123);
};

Object.defineProperty(Person.prototype,'alias',{
	configurable: true,
	get: function(){ return this._alias; },
	set: function(v){ this._alias = v; }
});
Person.prototype.__role = {watch: 'roleDidSet',name: 'role'};
Object.defineProperty(Person.prototype,'role',{
	configurable: true,
	get: function(){ return this._role; },
	set: function(v){
		var a = this._role;
		if(v != a) { this._role = v; }
		if(v != a) { this.roleDidSet && this.roleDidSet(v,a,this.__role) }
	}
});

Person.prototype.inspect = function (value){
	return console.log("Hello",value);
};

Object.defineProperty(Person.prototype,'name',{get: function(){
	return this.data.name;
}, configurable: true});

Object.defineProperty(Person.prototype,'name',{set: function(val){
	return this.data.name = val;
}, configurable: true});

var p1 = new Person("Mark");

console.log(p1.name);

p1.name = "Jane";

Imba.defineTag('app', function(tag){
	
	Object.defineProperty(tag.prototype,'user',{
		configurable: true,
		get: function(){ return this._user; },
		set: function(v){ this._user = v; }
	});
	Object.defineProperty(tag.prototype,'expanded',{
		configurable: true,
		get: function(){ return this._expanded; },
		set: function(v){ this._expanded = v; }
	});
	Object.defineProperty(tag.prototype,'title',{
		configurable: true,
		get: function(){ return this._title; },
		set: function(v){ this._title = v; }
	});
	// def cachedHeader
	// 	#header = <header>
	// 		<div>
	// 		<button.right.here> "Go go"
	
	tag.prototype.header = function (){
		var t0;
		return ((_v1 = t0 = (t0=_1('header')),_v.setContent([
			(_v2 = _1('div',t0.$,'A',t0),_v.setText("This is my title"),_v),
			(_v2 = _1('button',t0.$,'B',t0),_v.flag('right'),_v.flag('here'),_v.setTitle("Something"),_v.setText("Go go"),_v)
		],2),_v)).end((
			t0.$.A.flagIf('bold',this.expanded).flagIf('logout',this.user).setTitle(this.title).end(),
			t0.$.B.end()
		,true));
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return (_v1 = this,_v.$open(0),_v.setChildren([
			this.header(),
			(_v2 = $[0] || _1('main',$,0,this),_v.flag('one'),_v.flag('two'),_v.flag('three'),_v.setContent(
				(_v3 = $[1] || _1('p',$,1,0),_v.setText("This is the app"),_v)
			,2),_v)
		],1),_v.synced(),_v);
	};
});

console.log(p1.name);


	Object.defineProperty(Person.prototype,'name',{get: function(){
		return ("Person again " + (this.data.name));
	}, configurable: true});


console.log(p1.name);
