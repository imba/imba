(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
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
			this.setExpected(_.flatten(nodes).filter(function(n) {
				return n && n._dom;
			}));
			this.setActual([]);
			this.log("setStaticChildren",nodes,this.expected());
			tag.__super__.setStaticChildren.call(this,nodes);
			
			for (var i=0, ary=iter$(this._dom.childNodes), len=ary.length; i < len; i++) {
				this.actual().push(tag$wrap(ary[i]));
			};
			
			eq(this.actual(),this.expected());
			return this;
		};
		
		tag.prototype.appendChild = function (node){
			this.log("appendChild");
			this.ops().push(["appendChild",node]);
			this._opstr += "A";
			return tag.__super__.appendChild.apply(this,arguments);
		};
		
		tag.prototype.removeChild = function (node){
			this.ops().push(["removeChild",node]);
			this._opstr += "R";
			return tag.__super__.removeChild.apply(this,arguments);
		};
		
		tag.prototype.insertBefore = function (node,rel){
			this.log("insertBefore");
			this.ops().push(["insertBefore",node,rel]);
			this._opstr += "I";
			return tag.__super__.insertBefore.apply(this,arguments);
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
			return this.setStaticChildren([
				(this[0] = this[0] || t$('div')).setText("top").end(),
				(this[1] = this[1] || t$('div')).setText("ok").end(),
				(a) && ([
					3,(this[2] = this[2] || t$('el')).flag('header').end(),
					(this[3] = this[3] || t$('el')).flag('title').setText("Header").end(),
					(this[4] = this[4] || t$('el')).flag('tools').end(),
					b ? ([
						1,(this[5] = this[5] || t$('el')).flag('long').end(),
						(this[6] = this[6] || t$('el')).flag('long').end()
					]) : ([
						2,(this[7] = this[7] || t$('el')).flag('short').end()
					]),
					(this[8] = this[8] || t$('el')).flag('ruler').end()
				]),
				(c) && ([
					4,(this[9] = this[9] || t$('div')).flag('c1').setText("long").end(),
					(this[10] = this[10] || t$('div')).flag('c2').setText("loong").end()
				]),
				d && e ? ([
					5,(this[11] = this[11] || t$('el')).flag('long').end(),
					(this[12] = this[12] || t$('el')).flag('footer').end(),
					(this[13] = this[13] || t$('el')).flag('bottom').end()
				]) : (e ? ([
					6,(this[14] = this[14] || t$('el')).flag('footer').end(),
					(this[15] = this[15] || t$('el')).flag('bottom').end()
				]) : ([
					7,(this[16] = this[16] || t$('el')).setText("!d and !e").end()
				])),
				list,
				(this[17] = this[17] || t$('div')).setText("very last").end()
			]).synced();
		};
	});
	
	
	Imba.defineTag('manual', function(tag){
		
		
		tag.prototype.__ops = {name: 'ops'};
		tag.prototype.ops = function(v){ return this._ops; }
		tag.prototype.setOps = function(v){ this._ops = v; return this; };
		
		tag.prototype.setStaticChildren = function (nodes){
			this.log("setStaticChildren",nodes);
			this._ops = [];
			return tag.__super__.setStaticChildren.call(this,nodes);
		};
		
		tag.prototype.insertDomNode = function (domNode,tail){
			this.log("insertDomNode");
			return tag.__super__.insertDomNode.call(this,domNode,tail);
		};
	});
	
	
	describe("Tags",function() {
		
		var grp = t$('group').end();
		document.body.appendChild(grp.dom());
		
		test("group",function() {
			grp.render();
			return eq(grp.opstr(),"AAAA");
		});
		
		return;
		
		var root = t$('manual').end();
		document.body.appendChild(root.dom());
		
		var a = t$('el').flag('a').setText("a").end();
		var b = t$('el').flag('b').setText("b").end();
		var c = t$('el').flag('c').setText("c").end();
		var d1 = t$('el').flag('d').setText("d1").end();
		var d2 = t$('el').flag('d').setText("d2").end();
		var e = t$('el').flag('e').setText("e").end();
		var f = t$('el').flag('f').setText("f").end();
		var g = t$('el').flag('g').setText("g").end();
		var h = t$('el').flag('h').setText("h").end();
		var i = t$('el').flag('i').setText("i").end();
		var j = t$('el').flag('j').setText("j").end();
		var k = t$('el').flag('k').setText("k").end();
		var l = t$('el').flag('l').setText("l").end();
		var m = t$('el').flag('m').setText("m").end();
		
		var l0 = t$('el').flag('l0').setText("l0").end();
		var l1 = t$('el').flag('l1').setText("l1").end();
		var l2 = t$('el').flag('l2').setText("l2").end();
		var l3 = t$('el').flag('l3').setText("l3").end();
		var l4 = t$('el').flag('l4').setText("l4").end();
		var l5 = t$('el').flag('l5').setText("l5").end();
		var l6 = t$('el').flag('l6').setText("l6").end();
		var l7 = t$('el').flag('l7').setText("l7").end();
		var l8 = t$('el').flag('l8').setText("l8").end();
		
		// make eq test actual
		
		
		
		function render(o){
			var CARY = 0;
			var tree = [
				a,
				b,
				(o.c) && (
					c
				),
				o.d ? (
					d1
				) : (
					d2
				),
				e,
				o.list || [],
				f,
				(o.e) && (
					[
						g,
						h,
						(o.f) && ([i,j])
					]
				),
				k
			];
			console.log("will render",tree);
			var pre = _.compact(_.flatten(tree.slice()));
			var actual = [];
			console.log("expects",pre);
			root.setStaticChildren(tree);
			for (var i1=0, ary=iter$(root.dom().children), len=ary.length; i1 < len; i1++) {
				actual.push(tag$wrap(ary[i1]));
			};
			
			console.log("expects",pre,actual);
			return eq(actual,pre);
		};
		
		
		test("something",function() {
			eq(1,1);
			render({d: true});
			render({c: true});
			render({list: [l1,l2,l3,l4,l5,l6,l7,l8]});
			render({list: [l2,l3,l4,l5,l6,l7,l8,l1]});
			render({e: true});
			return render({e: true,f: true});
		});
		
		return test("other",function() {
			return eq(1,1);
		});
	});

})()