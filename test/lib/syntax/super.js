(function(){
function Organism(){
	this.setGroup("organism");
};
imba$class(Organism);
Organism.prototype.alias = function (){
	return this._alias;
};
Organism.prototype.setAlias = function (v){
	return this._alias = v;
};;
Organism.prototype.group = function (){
	return this._group;
};
Organism.prototype.setGroup = function (v){
	return this._group = v;
};;
Organism.type = function (){
	return 'organism';
};
Organism.prototype.lineage = function (){
	return 'organism';
};
Organism.prototype.name = function (){
	return 'organism';
};
Organism.prototype.speak = function (){
	return 'ghaarg';
};
Organism.prototype.alive = function (){
	return true;
};;
function Virus(){
	this._ivar = 2;
};
imba$class(Virus,Organism);
Virus.prototype.lineage = function (){
	return "" + this.name() + "." + (Virus.prototype.__super.lineage.call(this));;
};
Virus.prototype.name = function (){
	return 'virus';
};;
function Animal(){
	this.setGroup("animal");
};
imba$class(Animal,Organism);
Animal.prototype.lineage = function (){
	return "animal." + Animal.prototype.__super.lineage.apply(this,arguments);;
};;
function Cat(){
	this.setGroup("cat");
};
imba$class(Cat,Animal);
Cat.prototype.lineage = function (){
	return "cat." + (Cat.prototype.__super.lineage.call(this));;
};
Cat.prototype.speak = function (){
	return 'miau';
};
Cat.prototype.cloak = function (){
	return Cat.prototype.__super.initialize.call(this);
};;
function Dog(){
	Animal.apply(this,arguments);
};
imba$class(Dog,Animal);
Dog.prototype.lineage = function (){
	var $1;
	return "dog." + (Dog.prototype.__super.lineage.call(this));;
};
Dog.prototype.speak = function (){
	return 'woff';
};;
function FakeDog(){
	Dog.apply(this,arguments);
};
imba$class(FakeDog,Dog);
FakeDog.prototype.lineage = function (){
	var $1;
	("fakedog." + (FakeDog.prototype.__super.__super.lineage.apply(this,arguments)));
	return "fakedog." + (FakeDog.prototype.__super.__super.lineage.call(this));;
};;
function Human(){
	Animal.apply(this,arguments);
};
imba$class(Human,Animal);
Human.prototype.lineage = function (){
	return "human." + (Human.prototype.__super.lineage.call(this));;
};
Human.prototype.speak = function (){
	return 'hello';
};;
function Zombie(){
	Human.apply(this,arguments);
};
imba$class(Zombie,Human);
Zombie.prototype.lineage = function (){
	return "zombie." + Zombie.prototype.__super.lineage.apply(this,arguments);;
};
Zombie.prototype.alive = function (){
	return false;
};;
describe('Syntax - super',function (){
	return test("stuff",function (){
		var cat = new Cat();
		var virus = new Virus();
		var dog = new Dog();
		var fakedog = new FakeDog();
		var human = new Human();
		var zombie = new Zombie();
		eq(virus.lineage(),'virus.organism');
		eq(cat.lineage(),'cat.animal.organism');
		eq(dog.lineage(),'dog.animal.organism');
		eq(zombie.lineage(),'zombie.human.animal.organism');
		eq(fakedog.lineage(),'fakedog.animal.organism');
		eq(cat.group(),"cat");
		cat.cloak();
		return eq(cat.group(),"animal");
	});
});
}())