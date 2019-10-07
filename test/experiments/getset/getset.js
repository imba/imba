function Person(name){
	this._data = {
		name: name
	};
};

Object.defineProperty(Person.prototype,'alias',{
	configurable: true,
	get: function(){ return this._alias; },
	set: function(v){ this._alias = v; return this; }
});
Person.prototype.__role = {watch: 'roleDidSet',name: 'role'};
Object.defineProperty(Person.prototype,'role',{
	configurable: true,
	get: function(){ return this._role; },
	set: function(v){
		var a = this._role;
		if(v != a) { this._role = v; }
		if(v != a) { this.roleDidSet && this.roleDidSet(v,a,this.__role) }
		return this;
	}
});

Person.prototype.age = function (){
	return 20;
};

Person.prototype.height = function (){
	return 20;
};

Person.prototype.setProperty = function (key,value,options){
	return this;
};

Person.prototype.getProperty = function (key,value,options){
	return this;
};

Object.defineProperty(Person.prototype,'name',{get: function(){
	return this._data.name;
}, configurable: true});

Object.defineProperty(Person.prototype,'name',{set: function(val){
	this._data.name = val;
	return this.data.name = val;
}, configurable: true});

var p1 = new Person("Mark");
console.log(p1.name);
p1.name = "Jane";
console.log(p1.name);
console.log(p1.name);


	Object.defineProperty(Person.prototype,'name',{get: function(){
		return ("Person again " + (this._data.name));
	}, configurable: true});


console.log(p1.name);
