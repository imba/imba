(function(){


	/* @class Token */
	function Token(value,spaced){
		this._value = value;
		this._spaced = spaced;
	};
	
	
	
	Token.prototype.toString = function (){
		return this._value;
	};
	
	
	var helper = require('./helper');
	var b = new helper.Benchmark("Testing",{maxTime: 1});
	
	R1 = /^((\$|@@|@|\#)[A-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*|[$A-Za-z_][$\w\x7f-\uffff]*(\-[$\w\x7f-\uffff]+)*)([^\n\S]*:(?![\*\=:$\w\x7f-\uffff]))?/;
	
	R2 = /^[A-Za-z_\-\x7f-\uffff][$\w\x7f-\uffff]* (\-[$\w\x7f-\uffff]+)*/;
	
	var str = "hello atesg";
	
	var id = "my-string-ref=";
	var plainset = "mystringref=";
	var plain = "myStringRef";
	var tok = new Token(id,true);
	
	var CR = /(.+)\=$/;
	var CR2 = /([\-\s])(\w)/g;
	
	function symbolize1(str){
		var sym = String(str).replace(/(.+)\=$/,"set-$1");
		sym = sym.replace(/([\-\s])(\w)/g,function (m,v,l){
			return l.toUpperCase();
		});
		return sym;
	};
	
	function symbolize2(str){
		str = String(str);
		var end = str.charAt(str.length - 1);
		if(end == '=') {
			str = 'set-' + str.slice(0,-1);
		};
		return str.replace(/([\-\s])(\w)/g,function (m,v,l){
			return l.toUpperCase();
		});
	};
	
	function symbolize3(str){
		var sym = String(str).replace(CR,"set-$1");
		sym = sym.replace(CR2,function (m,v,l){
			return l.toUpperCase();
		});
		return sym;
	};
	
	function symbolize3(str){
		var sym = String(str).replace(CR,"set-$1");
		sym = sym.replace(CR2,function (m,v,l){
			return l.toUpperCase();
		});
		return sym;
	};
	
	function symbolize4(str){
		str = String(str);
		var end = str.charAt(str.length - 1);
		
		if(end == '=') {
			str = 'set' + str[0].toUpperCase() + str.slice(1,-1);
		};
		
		if(str.indexOf("-") >= 0) {
			str = str.replace(/([\-\s])(\w)/g,function (m,v,l){
				return l.toUpperCase();
			});
		};
		
		return str;
	};
	
	
	b.add('a',function (){
		return symbolize1(id);
	});
	b.add('b',function (){
		return symbolize2(id);
	});
	b.add('c',function (){
		return symbolize3(id);
	});
	b.add('4',function (){
		return symbolize4(id);
	});
	
	b.add('a-plain',function (){
		return symbolize1(plain);
	});
	b.add('b.plain',function (){
		return symbolize2(plain);
	});
	b.add('c.plain',function (){
		return symbolize3(plain);
	});
	b.add('4.plain',function (){
		return symbolize4(plain);
	});
	
	b.add('a-plainset',function (){
		return symbolize1(plainset);
	});
	b.add('b.plainset',function (){
		return symbolize2(plainset);
	});
	b.add('c.plainset',function (){
		return symbolize3(plainset);
	});
	b.add('4.plainset',function (){
		return symbolize4(plainset);
	});
	
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
	
	b.add('Token2',function (){
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
	
	
	b.add('Autostring',function (){
		String;
		return R1.exec(str);
	});
	
	b.add('Short regex',function (){
		return R2.exec(str);
	});
	
	
	// run async
	b.run();
	
	console.log("got here");


}())