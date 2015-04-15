(function(){


	var Benchmark = require('benchmark');
	
	var suite = new Benchmark.Suite();
	
	// add tests
	suite.add('RegExp#test',function (){
		return /o/.test('Hello World!');
	});
	
	suite.add('String#indexOf',function (){
		return 'Hello World!'.indexOf('o') > -1;
	});
	
	suite.add('String#match',function (){
		return !(!'Hello World!'.match(/o/));
	});
	
	// add listeners
	suite.on('cycle',function (event){
		return console.log(String(event.target));
	});
	
	suite.on('complete',function (){
		return console.log('Fastest is ' + this.filter('fastest').pluck('name'));
	});
	
	// run async
	suite.run();
	
	console.log("got here");


}())