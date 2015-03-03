(function(){
Organism = imba$class(function Organism(){
	this._ivar = 1;
});
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
Virus = imba$class(function Virus(){
	this._ivar = 2;
},Organism);
Virus.prototype.lineage = function (){
	return "" + this.name() + "." + (Virus.prototype.__super.lineage.call(this));;
};
Virus.prototype.name = function (){
	return 'virus';
};;
Animal = imba$class(function Animal(){
	Organism.apply(this,arguments);
},Organism);
Animal.prototype.lineage = function (){
	return "animal." + (Animal.prototype.__super.lineage.call(this));;
};;
Cat = imba$class(function Cat(){
	Animal.apply(this,arguments);
},Animal);
Cat.prototype.lineage = function (){
	return "cat." + (Cat.prototype.__super.lineage.call(this));;
};
Cat.prototype.speak = function (){
	return 'miau';
};;
Dog = imba$class(function Dog(){
	Animal.apply(this,arguments);
},Animal);
Dog.prototype.lineage = function (){
	return "dog." + (Dog.prototype.__super.lineage.call(this));;
};
Dog.prototype.speak = function (){
	return 'woff';
};;
Human = imba$class(function Human(){
	Animal.apply(this,arguments);
},Animal);
Human.prototype.lineage = function (){
	return "human." + (Human.prototype.__super.lineage.call(this));;
};
Human.prototype.speak = function (){
	return 'hello';
};;
Zombie = imba$class(function Zombie(){
	Human.apply(this,arguments);
},Human);
Zombie.prototype.lineage = function (){
	return "zombie." + (Zombie.prototype.__super.lineage.call(this));;
};
Zombie.prototype.alive = function (){
	return false;
};;
describe('Syntax - Class',function (){
	describe('Methods',function (){
		it('should define class methods',function (){
			return eq(Organism.type(),'organism');
		});
		return it('should inherit class methods',function (){
			return eq(Virus.type,Organism.type);
		});
	});
	describe('Instance',function (){
		it('should call the parent constructor by default',function (){
			var obj = new Cat();
			return eq(obj._ivar,1);
		});
		it('should define instance methods',function (){
			var obj = new Organism();
			var val = obj.alive();
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
	return test('define methods outside scope',function (){
		function Cls(){
			return this;
		};
		imba$class(Cls);
		Cls.a = function (){
			return 1;
		};
		Cls.prototype.a = function (){
			return 2;
		};;
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
});
}())