function Person(){ };

Person.prototype.__name__get = function(){
	return "Person " + this._name;
}

Object.defineProperty(Person.prototype,'name',{
	configurable: true,
	get: Person.prototype.__name__get,
	set: Person.prototype.__name__set
});

Person.prototype.__name__set = function(val){
	return this._name = val;
}

Object.defineProperty(Person.prototype,'name',{
	configurable: true,
	get: Person.prototype.__name__get,
	set: Person.prototype.__name__set
});

var person = new Person();
person.name = "Jane";
console.log(person.name);

const obj = {
  log: ['example','test'],
  get latest() {
    if (this.log.length === 0) return undefined;
    return this.log[this.log.length - 1];
  }
}
console.log(obj.latest); // "test".

Object.defineProperty(obj,'latest',{
	configurable: true,
	get: function(){ return "three"; }
});

console.log(obj.latest); // "test".


function defSetter(object,name,fun){
	let desc = Object.getOwnPropertyDescriptor(object,name);
	Object.defineProperty(object,name,{
		configurable: true,
		set: fun
	})
}

class Person2 {
	constructor(name) {
		this._name = name;
	}
	// get nick(){
	// 	return this._name.toLowerCase();
	// }
}

var p2 = new Person2('John');
console.log(p2.nick);

Object.defineProperty(Person2.prototype,'nick',{
	configurable: true,
	get: function(){ return this._name.toLowerCase(); }
})

console.log(p2.nick);
// defSetter(Person2.prototype,'nick',function(value){
// 	this._name = value;
// });

Object.defineProperty(Person2.prototype,'nick',{
	set: function(value){ return this._name = value; }
})


p2.nick = "Jonny";
console.log(p2.nick);