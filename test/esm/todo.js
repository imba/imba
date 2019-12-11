function extend$(target,ext){
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	Object.defineProperties(target.prototype,descriptors);
	// var keys = Object.keys(descriptors);
	// for(const key of keys){ let desc = descriptors[key]; }
	return target;
};
var sfc$ = {/*$sfc$*/}, $1 = {hello: 1,name: 'desc'};
var field = 'custom';

class Item {
	get hello(){ return this.__hello; }
	set hello(v){ this.__hello = v; }
	get desc(){ return this.getAttribute("desc",$1); }
	set desc(v){ this.setAttribute("desc",v,$1); }
	get ___desc(){ return $1 }
	
	constructor(title){
		this.title = title;
	}
	
	archive(){
		return this.archived = true;
	}
	
	[field](){
		return console.log(("called " + field));
	}
	
	static type(){
		return 'Item';
	}
};

class Todo extends Item {
	due(){
		return true;
	}
};

extend$(Todo,{
	due2(){
		return true;
	},
});

var todo = new Todo('hello');
todo.hello = 10;
console.log(todo.hello);
console.log(todo.archive());
console.log(Todo.type());
console.log(todo.custom());
console.log(todo.due2());
