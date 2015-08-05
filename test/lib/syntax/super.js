(function(){
	// helper for subclassing
	function subclass$(obj,sup) {
		for (var k in sup) {
			if (sup.hasOwnProperty(k)) obj[k] = sup[k];
		};
		// obj.__super__ = sup;
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
	};
	
	
	function Organism(){
		this.setGroup("organism");
	};
	
	
	Organism.prototype.__alias = {name: 'alias'};
	Organism.prototype.alias = function(v){ return this._alias; }
	Organism.prototype.setAlias = function(v){ this._alias = v; return this; };
	
	Organism.prototype.__group = {name: 'group'};
	Organism.prototype.group = function(v){ return this._group; }
	Organism.prototype.setGroup = function(v){ this._group = v; return this; };
	
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
	};
	
	
	function Virus(){
		this._ivar = 2;
	};
	
	subclass$(Virus,Organism);
	Virus.prototype.lineage = function (){
		return "" + this.name() + "." + (Virus.__super__.lineage.call(this));
	};
	
	Virus.prototype.name = function (){
		return 'virus';
	};
	
	
	function Animal(){
		this.setGroup("animal");
	};
	
	subclass$(Animal,Organism);
	Animal.prototype.lineage = function (){
		// super should do the same as super.lineage(*arguments)
		return "animal." + Animal.__super__.lineage.apply(this,arguments);
	};
	
	
	function Cat(){
		this.setGroup("cat");
	};
	
	subclass$(Cat,Animal);
	Cat.prototype.lineage = function (){
		return "cat." + (Cat.__super__.lineage.call(this));
	};
	
	Cat.prototype.speak = function (){
		return 'miau';
	};
	
	Cat.prototype.cloak = function (){
		// call the initialize of animal
		return Cat.__super__.initialize.call(this);
	};
	
	
	
	function Dog(){ Animal.apply(this,arguments) };
	
	subclass$(Dog,Animal);
	Dog.prototype.lineage = function (){
		return "dog." + (Dog.__super__.lineage.call(this));
	};
	
	Dog.prototype.speak = function (){
		return 'woff';
	};
	
	
	function FakeDog(){ Dog.apply(this,arguments) };
	
	subclass$(FakeDog,Dog);
	FakeDog.prototype.lineage = function (){
		"fakedog." + (FakeDog.__super__.__super__.lineage.apply(this,arguments));
		return "fakedog." + (FakeDog.__super__.__super__.lineage.call(this));
	};
	
	
	function Human(){
		this._human = true;
	};
	
	subclass$(Human,Animal);
	Human.prototype.lineage = function (){
		return "human." + (Human.__super__.lineage.call(this));
	};
	
	Human.prototype.speak = function (){
		return 'hello';
	};
	
	
	function Zombie(){ Human.apply(this,arguments) };
	
	subclass$(Zombie,Human);
	Zombie.prototype.lineage = function (){
		return "zombie." + Zombie.__super__.lineage.apply(this,arguments);
	};
	
	Zombie.prototype.alive = function (){
		return false;
	};
	
	
	Human.Child = function Child(){
		Human.Child.__super__.constructor.apply(this,arguments);
	};
	subclass$(Human.Child,Human);
	
	
	
	
	
	describe('Syntax - super',function() {
		
		return test("stuff",function() {
			
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

})()