(function(){


	// externs;
	
	(function(){
		var tag = Imba.defineTag('custom',function custom(d){this.setDom(d)});
		tag.prototype.hello = function (){
			return true;
		};
	
	})();
	
	t$('a').end();
	t$('a').flag('a').flag('b').end();
	t$('a').flag('b').setHref("").end();
	t$('a').flag('b').flag('c',true).end();
	
	describe('Tags - Define',function (){
		return test("basic",function (){
			var el = t$('custom').end();
			eq(el.hello(),true);
			return eq(el.toString(),"<div class='_custom'></div>");
		});
	});


}())