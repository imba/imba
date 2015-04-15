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
	
	/* @class Organism */
	function Organism(){
		this._ivar = 1;
	};
	
	var lvar = 10;
	
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
	
	Organism.prototype.lvar = function (){
		return lvar;
	};
	
	// hmm, maybe we shouldnt allow this?
	// class Other
	// 	#		def inner
	// 		yes
	;
	
	/* @class Virus */
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
	
	
	/* @class Animal */
	function Animal(){ Organism.apply(this,arguments) };
	
	subclass$(Animal,Organism);
	Animal.prototype.lineage = function (){
		return "animal." + (Animal.__super__.lineage.call(this));
	};
	
	
	/* @class Cat */
	function Cat(){ Animal.apply(this,arguments) };
	
	subclass$(Cat,Animal);
	Cat.prototype.lineage = function (){
		return "cat." + (Cat.__super__.lineage.call(this));
	};
	
	Cat.prototype.speak = function (){
		return 'miau';
	};
	
	
	/* @class Dog */
	function Dog(){ Animal.apply(this,arguments) };
	
	subclass$(Dog,Animal);
	Dog.prototype.lineage = function (){
		return "dog." + (Dog.__super__.lineage.call(this));
	};
	
	Dog.prototype.speak = function (){
		return 'woff';
	};
	
	
	
	/* @class Human */
	function Human(){ Animal.apply(this,arguments) };
	
	subclass$(Human,Animal);
	Human.prototype.lineage = function (){
		return "human." + (Human.__super__.lineage.call(this));
	};
	
	Human.prototype.speak = function (){
		return 'hello';
	};
	
	
	/* @class Zombie */
	function Zombie(){ Human.apply(this,arguments) };
	
	subclass$(Zombie,Human);
	Zombie.prototype.lineage = function (){
		return "zombie." + (Zombie.__super__.lineage.call(this));
	};
	
	Zombie.prototype.alive = function (){
		return false;
	};
	
	
	
	describe('Syntax - Class',function (){
		test('should',function (){
			var obj = new Organism();
			return eq(obj.lvar(),10);
		});
		
		describe('Methods',function (){
			it('should define class methods',function (){
				return eq(Organism.type(),'organism');
			});
			
			return it('should inherit class methods',function (){
				return eq(Virus.type,Organism.type);
			});
			
			// it 'should call super in class methods' do
			//   eq Dog.type, "dog.animal.organism"
			//   eq Cat.type, "cat.animal.organism"
		});
		
		describe('Instance',function (){
			it('should call the parent constructor by default',function (){
				var obj = new Cat();
				return eq(obj._ivar,1);
			});
			
			it('should define instance methods',function (){
				var obj = new Organism();
				var val = obj.alive();
				// eq val, true
				ok(obj.alive());
				return eq(obj.speak(),'ghaarg');
			});
			
			it('should inherit instance methods',function (){
				var obj = new Virus();
				return ok(obj.alive());
			});
			
			
			it('should override instance methods',function (){
				eq(new Organism().name(),'organism');
				return eq(new Virus().name(),'virus');
			});
			
			return it('should call super in instance methods',function (){
				eq(new Virus().lineage(),'virus.organism');
				return eq(new Zombie().lineage(),'zombie.human.animal.organism');
			});
		});
		
		test('define methods outside scope',function (){
			/* @class Cls */
			function Cls(){ };
			
			Cls.a = function (){
				return 1;
			};
			Cls.prototype.a = function (){
				return 2;
			};
			
			
			Cls.b = function (){
				return 1;
			};
			
			Cls.prototype.b = function (){
				return 2;
			};
			
			eq(Cls.a(),1);
			eq(Cls.b(),1);
			
			eq(new Cls().a(),2);
			return eq(new Cls().b(),2);
		});
		
		
		return test('Scoping',function (){
			var variable = 1;
			
			/* @class A */
			function A(add){
				this._sum = variable1 + add;
				this;
			};
			
			var variable1 = 2;
			
			A.base = function (){
				return variable1;
			};
			
			A.add = function (add){
				return variable1 += add;
			};
			
			
			
			A.prototype.base = function (){
				return variable1;
			};
			
			A.prototype.sum = function (){
				return this._sum;
			};
			
			
			eq(variable,1);
			eq(A.base(),2);
			eq(new A().base(),2);
			eq(new A(5).sum(),7);
			
			A.add(2);
			
			eq(variable,1);
			return eq(A.base(),4);
		});
	});


}())