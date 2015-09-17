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
	
	var self=this;
	
	// import two specific items from module
	var module$=require('./module'), Item=module$.Item, hello=module$.hello;
	
	// import everything from module into a local namespace/variable 'm'
	var m = require('./module');
	
	function Sub(){ return Item.apply(this,arguments) };
	
	subclass$(Sub,Item);
	Sub.prototype.name = function (){
		return "sub" + Sub.__super__.name.apply(this,arguments);
	};
	
	
	self.describe("Syntax - Modules",function() {
		
		return self.test("modules",function() {
			var item = new Item();
			self.eq(item.name(),"item");
			
			item = new m.Item();
			self.eq(item.name(),"item");
			
			self.eq(m.Item,Item);
			
			self.eq(hello(),"world");
			
			
			// subclassing an imported class
			var sub = new Sub();
			self.eq(sub.name(),"subitem");
			
			
			self.eq(new m.A().name(),"a");
			return self.eq(new m.B().name(),"b");
		});
	});
	
	
	module.exports.Item = Item;
	

})()