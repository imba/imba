(function(){
	var self=this;
	
	function check(sel,query){
		return this.eq(sel.query(),query);
	};
	
	self.describe("Syntax - Selectors",function() {
		
		return self.test("variations",function() {
			var a = 1;
			var s = "ok";
			
			check(q$('ul li .item'),"ul li .item");
			check(q$('ul ._custom.hello'),"ul ._custom.hello");
			check(q$('ul>li div[name="'+s+'"]'),'ul>li div[name="ok"]');
			check(q$('ul>li div[tabindex="'+a+'"]'),'ul>li div[tabindex="1"]');
			return check(q$('._mycanvas,._other'),'._mycanvas,._other');
		});
	});

})()