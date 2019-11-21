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

function SpecComponent(){ };

SpecComponent.prototype.log = function (){
	var console_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>0 ? i : 0);
	while(i>0) params[i-1] = $0[--i];
	return (console_ = this.root.console).log.apply(console_,params);
};

SpecComponent.prototype.emit = function (ev,pars){
	return Imba.emit(this,ev,pars);
};

Object.defineProperty(SpecComponent.prototype,'root',{get: function(){
	return this.parent ? this.parent.root : this;
}, configurable: true});


function Spec(){
	var self2 = this;
	self2.console = console;
	self2.blocks = [];
	self2.assertions = [];
	self2.stack = [self2.context = self2];
	self2.tests = [];
	self2.warnings = [];
	self2.state = {info: [],mutations: [],log: []};
	
	self2.observer = new MutationObserver(function(muts) {
		var mutations_;
		return (mutations_ = self2.context.state.mutations).push.apply(mutations_,muts);
	});
	
	self2;
};

Imba.subclass(Spec,SpecComponent);
global.Spec = Spec; // global class 
Spec.prototype.click = async function (sel){
	let el = document.querySelector(sel);
	el.click();
	return await this.tick();
};

Spec.prototype.tick = async function (commit){
	if(commit === undefined) commit = true;
	if (commit) { Imba.commit() };
	await Imba.ticker.promise;
	return this.observer.takeRecords();
};

Object.defineProperty(Spec.prototype,'fullName',{get: function(){
	return "";
}, configurable: true});

Spec.prototype.eval = function (block,ctx){
	var self2 = this;
	self2.stack.push(self2.context = ctx);
	var res = block(self2.context.state);
	var after = function() {
		self2.stack.pop;
		self2.context = self2.stack[self2.stack.length - 1];
		self2.observer.takeRecords();
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
	return this.blocks.push(new SpecGroup(name,blk,this));
};

Spec.prototype.test = function (name,blk){
	return this.blocks.push(new SpecExample(name,blk,this));
};

Spec.prototype.eq = function (actual,expected,options){
	return new SpecAssert(this.context,actual,expected,options);
};

Spec.prototype.step = function (i,blk){
	var self2 = this;
	if(blk==undefined && typeof i == 'function') blk = i,i = 0;
	if(i==undefined) i = 0;
	Spec.CURRENT = self2;
	var block = self2.blocks[i];
	if (!block) { return self2.finish() };
	Imba.once(block,'done',function() { return self2.step(i + 1); });
	return block.run();
};

Spec.prototype.run = function (){
	var self2 = this;
	return new Promise(function(resolve,reject) {
		var prevInfo = console.info;
		self2.observer.observe(document.body,{
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true
		});
		console.info = function() {
			var $0 = arguments, i = $0.length;
			var params = new Array(i>0 ? i : 0);
			while(i>0) params[i-1] = $0[--i];
			self2.context.state.info.push(params);
			return self2.context.state.log.push(params[0]);
		};
		
		Imba.once(self2,'done',function() {
			self2.observer.disconnect();
			console.info = prevInfo;
			return resolve();
		});
		return self2.step(0);
	});
};

Spec.prototype.finish = function (){
	var ok = [];
	var failed = [];
	
	for (let i = 0, items = iter$(this.tests), len = items.length, test; i < len; i++) {
		test = items[i];
		test.failed ? failed.push(test) : ok.push(test);
	};
	
	var logs = [
		fmt('green',("" + (ok.length) + " OK")),
		fmt('red',("" + (failed.length) + " FAILED")),
		("" + (this.tests.length) + " TOTAL")
	];
	
	console.log(logs.join(" | "));
	
	console.dir("spec:done",{
		failed: failed.length,
		passed: ok.length,
		warnings: this.warnings
	});
	var exitCode = ((failed.length == 0) ? 0 : 1);
	return this.emit('done',[exitCode]);
};

function SpecGroup(name,blk,parent){
	this.parent = parent;
	this.name = name;
	this.blocks = [];
	if (blk) { SPEC.eval(blk,this) };
	this;
};

Imba.subclass(SpecGroup,SpecComponent);
global.SpecGroup = SpecGroup; // global class 
Object.defineProperty(SpecGroup.prototype,'fullName',{get: function(){
	return ("" + (this.parent.fullName) + (this.name) + " > ");
}, configurable: true});

SpecGroup.prototype.describe = function (name,blk){
	return this.blocks.push(new SpecGroup(name,blk,this));
};

SpecGroup.prototype.test = function (name,blk){
	return this.blocks.push(new SpecExample(name,blk,this));
};

SpecGroup.prototype.run = function (i){
	var self2 = this;
	if(i === undefined) i = 0;
	if (i == 0) { self2.start() };
	var block = self2.blocks[i];
	if (!block) { return self2.finish() };
	Imba.once(block,'done',function() { return self2.run(i + 1); });
	return block.run(); // this is where we wan to await?
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
	// console.groupEnd() if console.groupEnd
	return this.emit('done',[this]);
};

function SpecExample(name,block,parent){
	this.parent = parent;
	this.evaluated = false;
	this.name = name;
	this.block = block;
	this.assertions = [];
	this.root.tests.push(this);
	this.state = {info: [],mutations: [],log: []};
	this;
};

Imba.subclass(SpecExample,SpecComponent);
global.SpecExample = SpecExample; // global class 
Object.defineProperty(SpecExample.prototype,'fullName',{get: function(){
	return ("" + (this.parent.fullName) + (this.name));
}, configurable: true});

SpecExample.prototype.run = async function (){
	this.start();
	// does a block really need to run here?
	var promise = (this.block ? SPEC.eval(this.block,this) : Promise.resolve({}));
	try {
		var res = await promise;
	} catch (e) {
		console.log("error from run!");
	};
	this.evaluated = true;
	return this.finish();
};

SpecExample.prototype.start = function (){
	return this.emit('start');
};

SpecExample.prototype.finish = function (){
	this.failed ? this.fail() : this.pass();
	this.log("spec:test",{name: this.fullName,failed: this.failed});
	for (let i = 0, items = iter$(this.assertions), len = items.length, ass; i < len; i++) {
		ass = items[i];
		if (ass.failed) {
			if (ass.options.warn) {
				console.dir("spec:warn",{message: ass.toString()});
			} else {
				console.dir("spec:fail",{message: ass.toString()});
			};
		};
	};
	return this.emit('done',[this]);
};

SpecExample.prototype.fail = function (){
	return this.log(("%c✘ " + (this.fullName)),"color:red",this.state);
	// @print("✘")
};

SpecExample.prototype.pass = function (){
	return this.log(("%c✔ " + (this.fullName)),"color:green");
	// @print("✔")
};

Object.defineProperty(SpecExample.prototype,'failed',{get: function(){
	return this.assertions.some(function(ass) { return ass.critical; });
}, configurable: true});

Object.defineProperty(SpecExample.prototype,'passed',{get: function(){
	return !this.failed();
}, configurable: true});

function SpecAssert(parent,actual,expected,options){
	if(options === undefined) options = {};
	this.parent = parent;
	this.expected = expected;
	this.actual = actual;
	this.options = options;
	this.message = options.message || options.warn;
	parent.assertions.push(this);
	(this.expected == this.actual) ? this.pass() : this.fail();
	this;
};

Imba.subclass(SpecAssert,SpecComponent);
global.SpecAssert = SpecAssert; // global class 
Object.defineProperty(SpecAssert.prototype,'critical',{get: function(){
	return this.failed && !this.options.warn;
}, configurable: true});

SpecAssert.prototype.fail = function (){
	this.failed = true;
	if (this.options.warn) {
		this.root.warnings.push(this);
	};
	//	console.dir("spec:warn",message: @toString())
	// else
	// 	console.dir("spec:fail",message: @toString())
	
	console.log("failed",this,this.parent.state);
	return this;
};

SpecAssert.prototype.pass = function (){
	this.passed = true;
	return this;
};

SpecAssert.prototype.toString = function (){
	if (this.failed && (typeof this.message=='string'||this.message instanceof String)) {
		let str = this.message;
		str = str.replace('%1',this.actual);
		str = str.replace('%2',this.expected);
		return str;
	} else {
		return "failed";
	};
};


SPEC = new Spec();

// global def p do console.log(*arguments)
describe = self.describe = function (name,blk){
	return SPEC.context.describe(name,blk);
};
test = self.test = function (name,blk){
	return SPEC.context.test(name,blk);
};
eq = self.eq = function (actual,expected,o){
	return SPEC.eq(actual,expected,o);
};
ok = self.ok = function (actual,o){
	return SPEC.eq(!!actual,true,o);
};


