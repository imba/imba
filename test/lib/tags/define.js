(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// externs;
	
	Imba.defineTag('custom', function(tag){
		
		tag.prototype.hello = function (){
			return true;
		};
	});
	
	t$('a').end();
	t$('a').flag('a').flag('b').end();
	t$('a').flag('b').setHref("").end();
	t$('a').flag('b').flag('c',true).end();
	
	Imba.defineTag('cached', function(tag){
		
		tag.prototype.build = function (){
			this._ary = ['a','b','c'];
			return this.render();
		};
		
		tag.prototype.render = function (){
			var self=this;
			return this.setChildren((function(self) {
				for (var i=0, ary=iter$(self._ary), len=ary.length, res=[]; i < len; i++) {
					res.push((self['_' + ary[i]] = self['_' + ary[i]] || t$('div')).setContent("v").end());
				};
				return res;
			})(self)).synced();
		};
	});
	
	
	describe('Tags - Define',function() {
		
		test("basic",function() {
			var el = t$('custom').end();
			eq(el.hello(),true);
			return eq(el.toString(),"<div class='_custom'></div>");
		});
		
		
		return test("caching",function() {
			var ary;
			var el = t$('cached').end();
			var els = el.dom().children;
			var ary=iter$(els);var a = ary[0],b = ary[1],c = ary[2];
			eq(els.length,3);
			eq(els,[a,b,c]);
			
			el.render();
			// children should remain the same after rerender
			return eq(el.dom().children,[a,b,c]);
		});
	});

})()