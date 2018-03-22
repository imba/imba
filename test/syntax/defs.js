var $root$ = {};
// externs;

// self in root is an actual object, on which
// we can define methods etc.
// defining a method in the root scope is actually
// creating a method on that self
$root$.rootMethod = function (){
	return $root$;
};

// it can be called implicitly as expected, since
$root$.rootMethod(); // is the same as self.rootMethod()

// as with an object, you can also access the method
$root$.rootMethod;

// as of Imba 1.4, these methods cannot be called directly
// from within other closed scopes (class/def). At the same
// time, we have introduced a way to declare methods as variables
function varMethod(){
	return true;
};


function Item(){
	this;
};

Item.prototype.test = function (){
	// previously, Imba would lookup method definitions
	// from outer scopes, so the following code would work:
	try {
		this.rootMethod();
		ok(true == false);
	} catch (e) {
		ok(true);
	};
	
	// varMethod is like any other variable
	varMethod; // just a reference to varMethod
	varMethod(); // calling the varMethod
	
	ok(varMethod instanceof Function);
	return ok(varMethod() == true);
};

Item.prototype.method = function (){
	return this;
};

Item.prototype.letDef = function (){
	if (true) {
		function method(){
			return true;
		};
		ok(method instanceof Function);
		ok(method() == true);
	};
	
	if (true) {
		function method(){
			return false;
		};
		ok(method instanceof Function);
		ok(method() == false);
	};
	
	
	// outside of the block, method does not exist as a variable
	// and it is implicitly called on self, as expected
	return ok(this.method() == this); // self.method() == self
};

Item.prototype.nestedDef = function (){
	// defining a method inside a def will work the same as on root
	// it actually defines a method on the self
	var self = this;
	self.definedDef = function (){
		return true;
	};
	
	// calling definedDef will now work. It translates to self.definedDef()
	ok(self.definedDef() == true);
	ok(self.definedDef instanceof Function);
	
	// defining with var def will merely create a function
	function varDef(){
		return true;
	};
	
	ok(varDef instanceof Function);
	ok(varDef() == true);
	return ok(self.varDef == undefined);
};

Item.prototype.defineInBlock = function (){
	var self = this;
	var instance = self;
	// so, def without var/let/const in front will actually define
	// a method on self. Block-level functions do not introduce a new
	// self in Imba - they can be thought of as fat-arrow functions in es6
	self.defInMethod = function (){
		return true;
	};
	
	return [1,2,3].map(function() {
		// a blocklevel function does not introduce a new self
		// self is still the same self as inside the outer function
		// so here we are defining defInBlock on the Item instance three times
		self.defInBlock = function (){
			return true;
		};
		
		ok(self == instance);
		ok(self.defInBlock instanceof Function);
		return ok(self.defInMethod() == true);
	});
};





describe('Syntax - Defs',function() {
	test('root',function() { return new Item().test(); });
	test('nested',function() { return new Item().nestedDef(); });
	test('let',function() {
		return new Item().letDef();
	});
	
	return test('scoping',function() {
		return new Item().defineInBlock();
	});
});
