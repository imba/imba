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
	
	// $current_describe_block = null
	// $current_it_block = null
	// SPEC_STACK = []
	
	TERMINAL_COLOR_CODES = {
		bold: 1,
		underline: 4,
		reverse: 7,
		black: 30,
		red: 31,
		green: 32,
		yellow: 33,
		blue: 34,
		magenta: 35,
		cyan: 36,
		white: 37
	};
	
	
		String.prototype.color = function (code){
			// return self if we are in client
			if(console.group) {
				return this.toString();
			};
			
			code = TERMINAL_COLOR_CODES[code];
			var resetStr = "\x1B[0m";
			var resetRegex = /\x1B\[0m/g;
			var codeRegex = /\x1B\[\d+m/g;
			var tagRegex = /(<\w+>|<A\d+>)|(<\/\w+>|<A\d+>)/i;
			var numRegex = /\d+/;
			var str = ('' + this).replace(resetRegex,("" + resetStr + "\x1B[" + code + "m"));// allow nesting
			str = ("\x1B[" + code + "m" + str + resetStr);
			return str;
		};
	
	
	function fmt(color,str){
		return str.color(color);
	};
	
	
	/* @class Spec */
	function Spec(){
		this._blocks = [];
		this._stack = [this._context = this];
		this;
	};
	
	global.Spec = Spec; // global class 
	
	Spec.prototype.__blocks = {};
	Spec.prototype.blocks = function(v){ return this._blocks; }
	Spec.prototype.setBlocks = function(v){ this._blocks = v; return this; };
	
	Spec.prototype.__context = {};
	Spec.prototype.context = function(v){ return this._context; }
	Spec.prototype.setContext = function(v){ this._context = v; return this; };
	
	Spec.prototype.__stack = {};
	Spec.prototype.stack = function(v){ return this._stack; }
	Spec.prototype.setStack = function(v){ this._stack = v; return this; };
	
	
	
	Spec.prototype.eval = function (block,ctx){
		this._stack.push(this._context = ctx);
		block();
		this._stack.pop();
		this._context = this._stack[this._stack.length - 1];// hmm
		return this;
	};
	
	Spec.prototype.describe = function (name,blk){
		return (this._context == this) ? (
			this._blocks.push(new SpecGroup(name,blk))
		) : (
			this._context.describe(name,blk)
		);
	};
	
	Spec.prototype.run = function (i){
		// p "SPEC.run {i}"
		var self=this;
		if(i === undefined) i = 0;
		var block = self._blocks[i];
		
		// we need the notifications
		if(!block) {
			return self.finish();
		};
		Imba.once(block,'done',function (){
			return self.run(i + 1);
		});
		return block.run();
	};
	
	
	Spec.prototype.finish = function (){
		return Imba.emit(this,'done',[this]);
	};
	
	// def describe name, blk do SPEC.context.describe(name,blk)
	Spec.prototype.it = function (name,blk){
		return SPEC.context().it(name,blk);
	};
	Spec.prototype.test = function (name,blk){
		return SPEC.context().it(name,blk);
	};
	Spec.prototype.eq = function (actual,expected,format){
		return SPEC.context().eq(actual,expected,format);
	};
	Spec.prototype.match = function (actual,expected,format){
		return SPEC.context().match(actual,expected,format);
	};
	Spec.prototype.ok = function (actual){
		return SPEC.context().assertion(new SpecAssertTruthy(SPEC.context(),actual));
	};
	Spec.prototype.assert = function (expression){
		return SPEC.context().assert(expression);
	};
	Spec.prototype.await = function (){
		var context_;
		return (context_=SPEC.context()).await.apply(context_,arguments);
	};
	
	// def self.call scope, method, *args
	// 	SpecCaller.new(scope,method,args)
	;
	
	// #	# def self.context
	// # 	@context || instance
	// 	
	// # def self.stack
	// # 	@stack ||= [instance]
	// # 
	// # def self.run
	// # 	instance.run
	// 
	/* @class SpecCaller */
	function SpecCaller(scope,method,args){
		this._scope = scope;
		this._method = method;
		this._args = args;
	};
	
	global.SpecCaller = SpecCaller; // global class 
	
	
	SpecCaller.prototype.run = function (){
		return (this._value == null) ? (this._value = this._scope[this._method].apply(this._scope,this._args)) : (this._value);
	};
	
	
	/* @class SpecGroup */
	function SpecGroup(name,blk){
		this._name = name;
		this._blocks = [];
		if(blk) {
			SPEC.eval(blk,this);
		};
		this;
	};
	
	global.SpecGroup = SpecGroup; // global class 
	
	
	SpecGroup.prototype.blocks = function (){
		return this._blocks;
	};
	
	SpecGroup.prototype.describe = function (name,blk){
		return this._blocks.push(new SpecGroup(name,blk));
	};
	
	SpecGroup.prototype.it = function (name,blk){
		return this._blocks.push(new SpecExample(name,blk));
	};
	
	SpecGroup.prototype.emit = function (ev,pars){
		return Imba.emit(this,ev,pars);
	};
	
	SpecGroup.prototype.run = function (i){
		var self=this;
		if(i === undefined) i = 0;
		if(i == 0) {
			self.start();
		};
		var block = self._blocks[i];
		if(!block) {
			return self.finish();
		};
		Imba.once(block,'done',function (){
			return self.run(i + 1);
		});
		// block.once :done do run(i+1)
		return block.run();
	};
	
	SpecGroup.prototype.start = function (){
		this.emit('start',[this]);
		
		return (console.group) ? (
			console.group(this._name)
		) : (
			console.log(("\n-------- " + this._name + " --------"))
		);
	};
	
	
	SpecGroup.prototype.finish = function (){
		if(console.groupEnd) {
			console.groupEnd();
		};
		return this.emit('done',[this]);
	};
	
	
	
	/* @class SpecExample */
	function SpecExample(name,block){
		this._evaluated = false;
		this._name = name;
		this._block = block;
		this._assertions = [];
		this;
	};
	
	global.SpecExample = SpecExample; // global class 
	
	
	SpecExample.prototype.emit = function (ev,pars){
		return Imba.emit(this,ev,pars);
	};
	
	SpecExample.prototype.await = function (){
		return this.assertion(new SpecAwait(this,$0)).callback();
	};
	
	SpecExample.prototype.eq = function (actual,expected,format){
		if(format === undefined) format = null;
		return this.assertion(new SpecAssert(this,actual,expected,format));
	};
	
	SpecExample.prototype.assert = function (expression){
		return this.assertion(new SpecAssert(this,expression));
	};
	
	SpecExample.prototype.assertion = function (ass){
		var self=this;
		self._assertions.push(ass);
		Imba.once(ass,'done',function (){
			return (self._evaluated && self._assertions.every(function (a){
				return a.done();
			})) && (self.finish());
		});
		return ass;
	};
	
	SpecExample.prototype.run = function (){
		if(this._block) {
			SPEC.eval(this._block,this);
		};
		this._evaluated = true;
		return (this._assertions.every(function (a){
			return a.done();
		})) && (this.finish());
	};
	
	SpecExample.prototype.finish = function (){
		var details = [];
		var dots = this._assertions.map(function (v,i){
			return (v.success()) ? (
				fmt('green',"✔")
			) : (
				details.push((" - " + (v.details()))),
				fmt('red',"✘")
			);
		});
		
		var str = ("" + this._name + " " + (dots.join(" ")));
		console.log(str);
		if(details.length > 0) {
			console.log(details.join("\n"));
		};
		return this.emit('done',[this]);
	};
	
	
	/* @class SpecObject */
	function SpecObject(){ };
	
	global.SpecObject = SpecObject; // global class 
	SpecObject.prototype.ok = function (actual){
		return SPEC.ok(actual);
	};
	
	
	/* @class SpecCondition */
	function SpecCondition(){ };
	
	global.SpecCondition = SpecCondition; // global class 
	
	SpecCondition.prototype.__success = {};
	SpecCondition.prototype.success = function(v){ return this._success; }
	SpecCondition.prototype.setSuccess = function(v){ this._success = v; return this; };
	
	SpecCondition.prototype.state = function (){
		return true;
	};
	
	SpecCondition.prototype.failed = function (){
		this._done = true;
		this._success = false;
		this.emit('done',[false]);
		return true;
	};
	
	SpecCondition.prototype.passed = function (){
		this._done = true;
		this._success = true;
		this.emit('done',[true]);
		return true;
	};
	
	SpecCondition.prototype.emit = function (ev,pars){
		return Imba.emit(this,ev,pars);
	};
	
	SpecCondition.prototype.done = function (){
		return this._done;
	};
	
	SpecCondition.prototype.details = function (){
		return "error?";
	};
	
	
	/* @class SpecAwait */
	function SpecAwait(example,args){
		var self=this;
		self._example = example;
		self._args = args;
		
		// TODO extract options
		// TODO extract times the method should be called
		
		self._timeout = Imba.delay(100,function (){
			return self.failed();
		});
		
		self._callback = function (){
			var $0 = arguments, i = $0.length;
			var args = new Array(i>0 ? i : 0);
			while(i>0) args[i-1] = $0[--i];
			Imba.clearTimeout(self._timeout);
			return (args.equals(self._args[0])) ? (self.passed()) : (self.failed());
		};
		
		self;
	};
	
	subclass$(SpecAwait,SpecCondition);
	global.SpecAwait = SpecAwait; // global class 
	
	
	SpecAwait.prototype.callback = function (){
		return this._callback;
	};
	
	
	/* @class SpecAssert */
	function SpecAssert(example,actual,expected,format){
		if(format === undefined) format = null;
		this._example = example;
		this._actual = actual;
		this._expected = expected;
		this._format = format;
		if(expected instanceof Array) {
			this._format || (this._format = String);
		};
		this.run();
		this;
	};
	
	subclass$(SpecAssert,SpecCondition);
	global.SpecAssert = SpecAssert; // global class 
	
	
	SpecAssert.prototype.run = function (){
		var value = (this._actual instanceof SpecCaller) ? (this._actual.run()) : (this._actual);
		return this.test(this._value = value);
	};
	
	SpecAssert.prototype.test = function (value){
		return (value && value.equals) ? (
			(value.equals(this.expected())) ? (this.passed()) : (this.failed())
		) : ((this._format) ? (
			this._left = this._format(value),
			this._right = this._format(this._expected),
			(this._left == this._right) ? (this.passed()) : (this.failed())
		) : (
			((value == this._expected)) ? (this.passed()) : (this.failed())
		));
	};
	
	SpecAssert.prototype.failed = function (){
		if(console.group) {
			console.error("expected",this._expected,"got",this._actual,this);
		};
		return SpecAssert.__super__.failed.call(this);
	};
	
	SpecAssert.prototype.details = function (){
		return (!(this._success)) ? (
			(this._format) ? (
				fmt('red',("expected " + this._right + " got " + this._left))
			) : (
				fmt('red',("expected " + this._expected + " got " + this._value))
			)
		) : (
			"passed test"
		);
	};
	
	
	/* @class SpecAssertTruthy */
	function SpecAssertTruthy(example,value){
		this._example = example;
		this._actual = value;
		this.run();
	};
	
	subclass$(SpecAssertTruthy,SpecAssert);
	global.SpecAssertTruthy = SpecAssertTruthy; // global class 
	
	
	SpecAssertTruthy.prototype.test = function (value){
		return (!(!(value))) ? (this.passed()) : (this.failed());
	};
	
	
	/* @class SpecAssertFalsy */
	function SpecAssertFalsy(example,value){
		this._example = example;
		this._actual = value;
		this.run();
	};
	
	subclass$(SpecAssertFalsy,SpecAssert);
	global.SpecAssertFalsy = SpecAssertFalsy; // global class 
	
	
	SpecAssertFalsy.prototype.test = function (value){
		return (!(value)) ? (this.passed()) : (this.failed());
	};
	
	
	// 
	// # extending object?!
	// # use extend syntax instead?
	
	// Want to extend root(!)
	// class Object
	
	SPEC = new Spec();
	
	// describe 'Syntax - Assignment' do
	// 	true
	// 	describe "test" do
	// 		false
	// 
	// 		test "one" do
	// 			eq(1, 1)
	// 			true
	// 
	// def describe name, blk
	// 		if @context == self
	// 			@blocks.push SpecGroup.new(name, blk)
	// 		else
	// 
	p = function p(){
		return console.log.apply(console,arguments);
	};
	describe = function describe(name,blk){
		return SPEC.context().describe(name,blk);
	};
	it = function it(name,blk){
		return SPEC.context().it(name,blk);
	};
	test = function test(name,blk){
		return SPEC.context().it(name,blk);
	};
	eq = function eq(actual,expected,format){
		return SPEC.context().eq(actual,expected,format);
	};
	match = function match(actual,expected,format){
		return SPEC.context().match(actual,expected,format);
	};
	ok = function ok(actual){
		return SPEC.context().assertion(new SpecAssertTruthy(SPEC.context(),actual));
	};
	assert = function assert(expression){
		return SPEC.context().assert(expression);
	};
	await = function await(){
		var context_;
		return (context_=SPEC.context()).await.apply(context_,arguments);
	};


}())