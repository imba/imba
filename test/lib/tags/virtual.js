(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// to run these tests, simply open the imbadir/test/dom.html in your browser and
	// open the console / developer tools.
	
	// externs;
	
	Imba.defineTag('el', function(tag){
		
		tag.prototype.flag = function (ref){
			this._flagged = ref;
			return tag.__super__.flag.apply(this,arguments);
		};
	});
	
	Imba.defineTag('group', function(tag){
		
		tag.prototype.__ops = {name: 'ops'};
		tag.prototype.ops = function(v){ return this._ops; }
		tag.prototype.setOps = function(v){ this._ops = v; return this; };
		
		tag.prototype.__opstr = {name: 'opstr'};
		tag.prototype.opstr = function(v){ return this._opstr; }
		tag.prototype.setOpstr = function(v){ this._opstr = v; return this; };
		
		
		tag.prototype.__expected = {name: 'expected'};
		tag.prototype.expected = function(v){ return this._expected; }
		tag.prototype.setExpected = function(v){ this._expected = v; return this; };
		
		tag.prototype.__actual = {name: 'actual'};
		tag.prototype.actual = function(v){ return this._actual; }
		tag.prototype.setActual = function(v){ this._actual = v; return this; };
		
		tag.prototype.setStaticChildren = function (nodes){
			this._ops = [];
			this._opstr = "";
			this._errors = null;
			this.setExpected(_.flatten(nodes).filter(function(n) {
				return n && n._dom;
			}));
			this.setActual([]);
			// log "setStaticChildren",nodes,expected
			tag.__super__.setStaticChildren.call(this,nodes);
			
			for (var i=0, ary=iter$(this._dom.children), len=ary.length, child; i < len; i++) {
				// how would this work on server?
				// if child isa Text
				// 	actual.push( child:textContent )
				// 	continue if child:textContent == expected[i]
				
				child = ary[i];
				var el = child instanceof Text ? (child.textContent) : (tag$wrap(child));
				if (el != this.expected()[i]) {
					this._errors || (this._errors = []);
					// log "not the same as expected at i",child,expected[i].@dom
					this._errors.push([el,this.expected()[i],i]);
				};
				
				this.actual().push(el);
			};
			// log actual
			eq(this._errors,null);
			return this;
		};
		
		tag.prototype.appendChild = function (node){
			// log "appendChild",node
			this.ops().push(["appendChild",node]);
			this._opstr += "A";
			return tag.__super__.appendChild.apply(this,arguments);
		};
		
		tag.prototype.removeChild = function (node){
			// log "removeChild",node
			this.ops().push(["removeChild",node]);
			this._opstr += "R";
			return tag.__super__.removeChild.apply(this,arguments);
		};
		
		tag.prototype.insertBefore = function (node,rel){
			// log "insertBefore"
			this.ops().push(["insertBefore",node,rel]);
			this._opstr += "I";
			return tag.__super__.insertBefore.apply(this,arguments);
		};
		
		tag.prototype.reset = function (){
			return this.render();
		};
		
		tag.prototype.build = function (){
			return this; // dont render immediately
		};
		
		
		tag.prototype.name = function (){
			return "test";
		};
		
		tag.prototype.render = function (pars){
			// no need for nested stuff here - we're testing setStaticChildren
			// if it works on the flat level it should work everywhere
			if(!pars||pars.constructor !== Object) pars = {};
			var a = pars.a !== undefined ? pars.a : false;
			var b = pars.b !== undefined ? pars.b : false;
			var c = pars.c !== undefined ? pars.c : false;
			var d = pars.d !== undefined ? pars.d : false;
			var e = pars.e !== undefined ? pars.e : false;
			var list = pars.list !== undefined ? pars.list : null;
			var str = pars.str !== undefined ? pars.str : null;
			var list2 = pars.list2 !== undefined ? pars.list2 : null;
			return this.setStaticChildren([
				(this.$a = this.$a || t$('el')).flag('a').setStaticContent([this.name()]).end(),
				str,
				(this.$b = this.$b || t$('el')).flag('b').setText("ok").end(),
				(a) && (Imba.static([
					(this.$c = this.$c || t$('el')).flag('header').end(),
					(this.$d = this.$d || t$('el')).flag('title').setText("Header").end(),
					(this.$e = this.$e || t$('el')).flag('tools').end(),
					b ? (Imba.static([
						(this.$f = this.$f || t$('el')).flag('long').end(),
						(this.$g = this.$g || t$('el')).flag('long').end()
					],1)) : (Imba.static([
						(this.$h = this.$h || t$('el')).flag('short').end(),
						(this.$i = this.$i || t$('el')).flag('short').end(),
						(this.$j = this.$j || t$('el')).flag('short').end()
					],2)),
					(this.$k = this.$k || t$('el')).flag('ruler').end()
				],3)),
				(c) && (Imba.static([
					(this.$l = this.$l || t$('div')).flag('c1').setText("long").end(),
					(this.$m = this.$m || t$('div')).flag('c2').setText("loong").end()
				],4)),
				d && e ? (Imba.static([
					(this.$n = this.$n || t$('el')).flag('long').end(),
					(this.$o = this.$o || t$('el')).flag('footer').end(),
					(this.$p = this.$p || t$('el')).flag('bottom').end()
				],5)) : (e ? (Imba.static([
					(this.$q = this.$q || t$('el')).flag('footer').end(),
					(this.$r = this.$r || t$('el')).flag('bottom').end()
				],6)) : (
					(this.$s = this.$s || t$('el')).setText("!d and !e").end()
				)),
				list,
				(this.$t = this.$t || t$('el')).flag('x').setText("very last").end(),
				list2
			]).synced();
		};
	});
	
	
	Imba.defineTag('other', function(tag){
		
		tag.prototype.render = function (){
			var self=this;
			return this.setStaticChildren([(function(self) {
				for (var i=0, ary=iter$(self.items()), len=ary.length, res=[]; i < len; i++) {
					res.push(t$('li').setChildren([ary[i]]).end());
				};
				return res;
			})(self)]).synced();
		};
	});
	
	
	describe("Tags",function() {
		
		var a = t$('el').flag('a').setText("a").end();
		var b = t$('el').flag('b').setText("b").end();
		var c = t$('el').flag('c').setText("c").end();
		var d = t$('el').flag('d').setText("d").end();
		var e = t$('el').flag('e').setText("e").end();
		var f = t$('el').flag('f').setText("f").end();
		
		var g = t$('el').flag('g').setText("g").end();
		var h = t$('el').flag('h').setText("h").end();
		var i = t$('el').flag('i').setText("i").end();
		var j = t$('el').flag('j').setText("j").end();
		
		var group = t$('group').end();
		document.body.appendChild(group.dom());
		
		// test "first render with string" do
		// 	group.render str: "Hello"
		// 	eq group.opstr, "AAAAA"
		
		test("first render",function() {
			group.render();
			return eq(group.opstr(),"AAAA");
		});
		
		test("second render",function() {
			// nothing should happen on second render
			group.render();
			return eq(group.opstr(),"");
		});
		
		test("added block",function() {
			group.render({c: true});
			return eq(group.opstr(),"II");
		});
		
		test("remove again",function() {
			group.render({c: false});
			return eq(group.opstr(),"RR");
		});
		
		test("with string",function() {
			group.render({str: "Hello there"});
			eq(group.opstr(),"I");
			
			// changing the string only - should not be any
			// dom operations on the parent
			group.render({str: "Changed string"});
			eq(group.opstr(),"");
			
			// removing string, expect a single removeChild
			group.render({str: null});
			return eq(group.opstr(),"R");
		});
		
		test("changing conditionals",function() {
			group.render({a: true});
			eq(group.opstr(),"IIIIIII");
			
			group.render({a: true,b: true});
			return eq(group.opstr(),"RRRII");
		});
		
		return describe("dynamic lists",function() {
			// render once without anything to reset
			var full = [a,b,c,d,e,f];
			
			test("last list",function() {
				group.render();
				group.render({list2: [h,i]});
				eq(group.opstr(),"AA");
				
				group.render({list2: [h,i,j]});
				eq(group.opstr(),"A");
				
				return group.render();
				// render full regular again
			});
			
			test("adding dynamic list items",function() {
				group.render({list: full});
				eq(group.opstr(),"IIIIII");
				
				// append one
				group.render({list: [a,b,c,d,e,f,g]});
				eq(group.opstr(),"I");
				// remove again
				group.render({list: full});
				return eq(group.opstr(),"R");
			});
			
			test("removing",function() {
				group.render({list: [a,b,e,f]});
				eq(group.opstr(),"RR");
				
				group.render({list: full});
				return eq(group.opstr(),"II");
			});
			
			return test("should be reorderable",function() {
				
				group.render({list: full}); // render with the regular list
				group.render({list: [b,a,c,d,e,f]});
				eq(group.opstr(),"I");
				
				// reordering two elements
				group.render({list: full});
				group.render({list: [c,d,a,b,e,f]});
				eq(group.opstr(),"II");
				
				// reordering two elements
				group.render({list: full});
				group.render({list: [c,d,e,f,a,b],str: "Added string again as well"});
				return eq(group.opstr(),"III");
			});
		});
	});

})()