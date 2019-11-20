function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require('imba2'), self = {};

var TERMINAL_COLOR_CODES = {
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

var fmt = function(code,string) {
	if (console.group) { return string.toString() };
	code = TERMINAL_COLOR_CODES[code];
	var resetStr = "\x1B[0m";
	var resetRegex = /\x1B\[0m/g;
	var codeRegex = /\x1B\[\d+m/g;
	var tagRegex = /(<\w+>|<A\d+>)|(<\/\w+>|<A\d+>)/i;
	var numRegex = /\d+/;
	var str = ('' + string).replace(resetRegex,("" + resetStr + "\x1B[" + code + "m")); // allow nesting
	str = ("\x1B[" + code + "m" + str + resetStr);
	return str;
};

function Spec(){
	this.blocks = [];
	this.assertions = [];
	this.stack = [this.context = this];
	this;
};

global.Spec = Spec; // global class 
Object.defineProperty(Spec.prototype,'fullName',{get: function(){
	return "";
}, configurable: true});

Spec.prototype.eval = function (block,ctx){
	var self2 = this;
	self2.stack.push(self2.context = ctx);
	var res = block();
	var after = function() {
		self2.stack.pop;
		self2.context = self2.stack[self2.stack.length - 1];
		return self2;
	};
	
	if (res && res.then) {
		return res.then(after,after);
	} else {
		after();
		return Promise.resolve(self2);
	};
};

Spec.prototype.describe = function (name,blk){
	if (this.context == this) {
		return this.blocks.push(new SpecGroup(name,blk,this));
	} else {
		return this.context.describe(name,blk);
	};
};

Spec.prototype.run = function (i,blk){
	var self2 = this;
	if(blk==undefined && typeof i == 'function') blk = i,i = 0;
	if(i==undefined) i = 0;
	if (blk) { Imba.once(self2,'done',blk) };
	Spec.CURRENT = self2;
	var block = self2.blocks[i];
	if (!block) { return self2.finish() };
	Imba.once(block,'done',function() { return self2.run(i + 1); });
	return block.run();
};


Spec.prototype.finish = function (){
	console.log("\n");
	
	var ok = [];
	var failed = [];
	
	for (let i = 0, items = iter$(this.assertions), len = items.length, test; i < len; i++) {
		test = items[i];
		test.success ? ok.push(test) : failed.push(test);
	};
	
	var logs = [
		fmt('green',("" + (ok.length) + " OK")),
		fmt('red',("" + (failed.length) + " FAILED")),
		("" + (this.assertions.length) + " TOTAL")
	];
	
	console.log(logs.join(" | "));
	
	for (let i = 0, len = failed.length, item; i < len; i++) {
		item = failed[i];
		console.log(item.fullName);
		console.log("    " + item.details);
	};
	
	var exitCode = ((failed.length == 0) ? 0 : 1);
	
	return Imba.emit(this,'done',[exitCode]);
};

// def describe name, blk do SPEC.context.describe(name,blk)
Spec.prototype.it = function (name,blk){
	return SPEC.context.it(name,blk);
};
Spec.prototype.test = function (name,blk){
	return SPEC.context.it(name,blk);
};
Spec.prototype.eq = function (actual,expected,format){
	return SPEC.context.eq(actual,expected,format);
};
Spec.prototype.match = function (actual,expected,format){
	return SPEC.context.match(actual,expected,format);
};
Spec.prototype.ok = function (actual,msg){
	return SPEC.context.assertion(new SpecAssertTruthy(SPEC.context,actual,msg));
};
Spec.prototype.assert = function (expression){
	return SPEC.context.assert(expression);
};
Spec.prototype.await = function (){
	var context_;
	return (context_ = SPEC.context).await.apply(context_,arguments);
};

function SpecCaller(scope,method,args){
	this.scope = scope;
	this.method = method;
	this.args = args;
};

global.SpecCaller = SpecCaller; // global class 
SpecCaller.prototype.run = function (){
	return (this.value == null) ? (this.value = this.scope[this.method].apply(this.scope,this.args)) : this.value;
};

function SpecGroup(name,blk,parent){
	this.parent = parent;
	this.name = name;
	this.blocks = [];
	if (blk) { SPEC.eval(blk,this) };
	this;
};

global.SpecGroup = SpecGroup; // global class 
Object.defineProperty(SpecGroup.prototype,'fullName',{get: function(){
	return ("" + (this.parent.fullName) + (this.name) + " > ");
}, configurable: true});

SpecGroup.prototype.describe = function (name,blk){
	return this.blocks.push(new SpecGroup(name,blk,this));
};

SpecGroup.prototype.it = function (name,blk){
	return this.blocks.push(new SpecExample(name,blk,this));
};

SpecGroup.prototype.emit = function (ev,pars){
	return Imba.emit(this,ev,pars);
};

SpecGroup.prototype.run = function (i){
	var self2 = this;
	if(i === undefined) i = 0;
	if (i == 0) self2.start;
	var block = self2.blocks[i];
	if (!block) { return self2.finish() };
	Imba.once(block,'done',function() { return self2.run(i + 1); });
	// block.once :done do run(i+1)
	return block.run();
};

SpecGroup.prototype.start = function (){
	this.emit('start',[this]);
	
	if (console.group) {
		return console.group(this.name);
	} else {
		return console.log(("\n-------- " + (this.name) + " --------"));
	};
};


SpecGroup.prototype.finish = function (){
	if (console.groupEnd) { console.groupEnd() };
	return this.emit('done',[this]);
};


function SpecExample(name,block,parent){
	this.parent = parent;
	this.evaluated = false;
	this.name = name;
	this.block = block;
	this.assertions = [];
	this;
};

global.SpecExample = SpecExample; // global class 
Object.defineProperty(SpecExample.prototype,'fullName',{get: function(){
	return ("" + (this.parent.fullName) + (this.name));
}, configurable: true});

SpecExample.prototype.emit = function (ev,pars){
	return Imba.emit(this,ev,pars);
};

SpecExample.prototype.await = function (){
	return this.assertion(new SpecAwait(this,arguments)).callback();
};

SpecExample.prototype.eq = function (actual,expected,format){
	if(format === undefined) format = null;
	return this.assertion(new SpecAssert(this,actual,expected,format));
};

SpecExample.prototype.assert = function (expression){
	return this.assertion(new SpecAssert(this,expression));
};

SpecExample.prototype.assertion = function (ass){
	var self2 = this;
	self2.assertions.push(ass);
	Imba.once(ass,'done',function() {
		if (self2.evaluated && self2.assertions.every(function(a) { return a.done; })) { return self2.finish() };
	});
	return ass;
};

SpecExample.prototype.run = function (){
	var self2 = this;
	var promise = (self2.block ? SPEC.eval(self2.block,self2) : Promise.resolve({}));
	return promise.then(function() {
		self2.evaluated = true;
		if (self2.assertions.every(function(a) { return a.done; })) { return self2.finish() };
	});
};

SpecExample.prototype.finish = function (){
	var details = [];
	var dots = this.assertions.map(function(v,i) {
		Spec.CURRENT.assertions.push(v);
		if (v.success) {
			return fmt('green',"✔");
		} else {
			details.push((" - " + (v.details)));
			return fmt('red',"✘");
		};
	});
	
	var str = ("" + (this.name) + " " + dots.join(" "));
	console.log(str);
	if (details.length > 0) { console.log(details.join("\n")) };
	return this.emit('done',[this]);
};

function SpecCondition(example){
	this.example = example;
	this;
};

global.SpecCondition = SpecCondition; // global class 
Object.defineProperty(SpecCondition.prototype,'fullName',{get: function(){
	return this.example.fullName;
}, configurable: true});

SpecCondition.prototype.state = function (){
	return true;
};

SpecCondition.prototype.failed = function (){
	this.done = true;
	this.success = false;
	this.emit('done',[false]);
	// process:stdout.write(fmt(:red,"✘"))
	return true;
};

SpecCondition.prototype.passed = function (){
	this.done = true;
	this.success = true;
	this.emit('done',[true]);
	// process:stdout.write(fmt(:green,"✔"))
	return true;
};

SpecCondition.prototype.emit = function (ev,pars){
	return Imba.emit(this,ev,pars);
};

Object.defineProperty(SpecCondition.prototype,'details',{get: function(){
	return "error?";
}, configurable: true});

function SpecAwait(example,args){
	var self2 = this;
	self2.example = example;
	self2.args = args;
	self2.timeout = Imba.delay(100,function() { return self2.failed(); });
	
	self2.callback = function() {
		var $0 = arguments, i = $0.length;
		var args = new Array(i>0 ? i : 0);
		while(i>0) args[i-1] = $0[--i];
		Imba.clearTimeout(self2.timeout);
		return args.equals(self2.args[0]) ? self2.passed() : self2.failed();
	};
	
	self2;
};
Imba.subclass(SpecAwait,SpecCondition);
global.SpecAwait = SpecAwait; // global class 


function SpecAssert(example,actual,expected,format){
	if(format === undefined) format = null;
	this.example = example;
	this.actual = actual;
	this.expected = expected;
	this.format = format;
	if (expected instanceof Array) {
		this.format || (this.format = String);
	};
	this.run();
	this;
};

Imba.subclass(SpecAssert,SpecCondition);
global.SpecAssert = SpecAssert; // global class 
SpecAssert.prototype.run = function (){
	var value = (this.actual instanceof SpecCaller) ? this.actual.run() : this.actual;
	return this.test(this.value = value);
};

SpecAssert.prototype.test = function (value){
	if (value && value.equals) {
		return value.equals(this.expected) ? this.passed() : this.failed();
	} else if (this.format) {
		this.left = this.format(value);
		this.right = this.format(this.expected);
		return (this.left == this.right) ? this.passed() : this.failed();
	} else {
		return (value == this.expected) ? this.passed() : this.failed();
	};
};

SpecAssert.prototype.failed = function (){
	if (console.group) {
		console.error("expected",this.expected,"got",this.actual,this);
	};
	return SpecAssert.prototype.__super__.failed.call(this);
};

Object.defineProperty(SpecAssert.prototype,'details',{get: function(){
	if (!this.success) {
		if (this.format) {
			return fmt('red',("expected " + (this.right) + " got " + (this.left)));
		} else {
			return fmt('red',("expected " + (this.expected) + " got " + (this.value)));
		};
	} else {
		return "passed test";
	};
}, configurable: true});

function SpecAssertTruthy(example,value,message){
	this.example = example;
	this.actual = value;
	this.message = message;
	this.run();
};

Imba.subclass(SpecAssertTruthy,SpecAssert);
global.SpecAssertTruthy = SpecAssertTruthy; // global class 
SpecAssertTruthy.prototype.test = function (value){
	return (!(!(value))) ? this.passed() : this.failed();
};

SpecAssertTruthy.prototype.failed = function (){
	if (console.group) {
		console.error("failed",this.message,this);
	};
	// hmm?
	return SpecAssertTruthy.prototype.__super__.failed.call(this);
};

Object.defineProperty(SpecAssertTruthy.prototype,'details',{get: function(){
	if (!this.success) {
		return fmt('red',("assertion failed: " + (this.message)));
	} else {
		return "passed test";
	};
}, configurable: true});

function SpecAssertFalsy(example,value){
	this.example = example;
	this.actual = value;
	this.run();
};

Imba.subclass(SpecAssertFalsy,SpecAssert);
global.SpecAssertFalsy = SpecAssertFalsy; // global class 
SpecAssertFalsy.prototype.test = function (value){
	return (!(value)) ? this.passed() : this.failed();
};


SPEC = new Spec();

// global def p do console.log(*arguments)
describe = self.describe = function (name,blk){
	return SPEC.context.describe(name,blk);
};
it = self.it = function (name,blk){
	return SPEC.context.it(name,blk);
};
test = self.test = function (name,blk){
	return SPEC.context.it(name,blk);
};
eq = self.eq = function (actual,expected,format){
	return SPEC.context.eq(actual,expected,format);
};
match = self.match = function (actual,expected,format){
	return SPEC.context.match(actual,expected,format);
};
ok = self.ok = function (actual,message){
	return SPEC.context.assertion(new SpecAssertTruthy(SPEC.context,actual,message));
};
assert = self.assert = function (expression){
	return SPEC.context.assert(expression);
};
await = self.await = function (){
	var context_;
	return (context_ = SPEC.context).await.apply(context_,arguments);
};


