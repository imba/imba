(function(){


	// externs;
	
	(function(){
		var tag = Imba.defineTag('custom',function custom(d){this.setDom(d)});
		tag.prototype.hello = function (){
			return true;
		};
	
	})();
	
	
	
	
	describe('Tags - Define',function (){
		
		return test("basic",function (){
			var el = t$('custom').end();
			eq(el.hello(),true);
			return eq(el.toString(),"<div class='_custom'></div>");
		});
	});


}())