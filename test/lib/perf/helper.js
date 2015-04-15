(function(){


	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var git = require('gift');
	var benchmark = require('benchmark');
	var chalk = require('chalk');
	var fs = require('fs');
	var repo = git("/repos/imba");
	
	function gitinfo(cb){
		return repo.current_commit(function (err,commit){
			return cb(commit);
		});
	};
	
	/* @class Benchmark */
	function Benchmark(name,o){
		var self=this;
		if(o === undefined) o = {};
		self._name = name;
		self._runner = new benchmark.Suite(o);
		self._commit = null;
		self._runner.on('cycle',function (event){
			self.cycled(event);
			return self.log(String(event.target));
		});
		
		self._runner.on('complete',function (e){
			self.log('Fastest is ' + this.filter('fastest').pluck('name'));
			return self.completed(e);
		});
		
		return self;
	};
	
	exports.Benchmark = Benchmark; // export class 
	
	
	Benchmark.prototype.log = function (str){
		console.log(str);
		return this;
	};
	
	Benchmark.prototype.start = function (){
		return this;
	};
	
	Benchmark.prototype.cycled = function (e){
		return this;
	};
	
	Benchmark.prototype.completed = function (){
		var lines = [];
		var json = {
			name: this._name,
			commit: ("" + (this._commit.id) + " - " + (this._commit.message)),
			tests: []
		};
		
		for(var i=0, ary=iter$(this._runner), len=ary.length, item; i < len; i++) {
			item = ary[i];json.tests.push(("" + (item.hz.toFixed(0)) + " - " + (item.name)));
			// console.log "item {item} {item:hz}"
			// lines.push "{@commit:id}"
		};
		
		// console.log JSON.stringify(json)
		
		// write to file
		fs.appendFile(("" + __dirname + "/results.log"),JSON.stringify(json,null,4) + '\n',function (){
			return true;
		});
		return this;
	};
	
	Benchmark.prototype.add = function (name,blk,o){
		if(o === undefined) o = {maxTime: 4};
		this._runner.add(name,blk,o);
		return this;
	};
	
	Benchmark.prototype.run = function (){
		var self=this;
		gitinfo(function (commit){
			self._commit = commit;
			self.start();
			return self._runner.run();
		});
		return self;
	};
	


}())