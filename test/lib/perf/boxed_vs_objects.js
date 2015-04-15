(function(){


	/* @class Token */
	function Token(value,spaced){
		this._value = value;
		this._spaced = spaced;
	};
	
	
	
	
	
	var helper = require('./helper');
	var b = new helper.Benchmark("Testing",{maxTime: 1});
	
	R1 = /^((\$|@@|@|\#)[A-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*|[$A-Za-z_][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*)([^\n\S]*:(?![\*\=:$\w\x7f-\uffff]))?/;
	
	R2 = /^[A-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]* (\-[$\w\x7f-\uffff]+)*/;
	
	var str = "hello atesg";
	
	// add tests
	b.add('String#boxed',function (){
		var arr = [];
		
		var count = 200;
		while(--count){
			var str = "mystring";
			var val = new String(str);
			val.spaced = true;
			arr.push(val);
		};
		return true;
	});
	
	b.add('Token',function (){
		var arr = [];
		
		var count = 200;
		while(--count){
			var str = "mystring";
			var val = new Token(str,true);
			arr.push(val);
		};
		return true;
	});
	
	b.add('Long regex',function (){
		return R1.exec(str);
	});
	
	b.add('Short regex',function (){
		return R2.exec(str);
	});
	
	// run async
	b.run();
	
	console.log("got here");


}())