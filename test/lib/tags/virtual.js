(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// externs;
	
	
	var ops = [];
	
	Imba.defineTag('el');
	
	Imba.defineTag('group', function(tag){
		
		tag.prototype.__long = {name: 'long'};
		tag.prototype.long = function(v){ return this._long; }
		tag.prototype.setLong = function(v){ this._long = v; return this; };
		
		tag.prototype.__headed = {name: 'headed'};
		tag.prototype.headed = function(v){ return this._headed; }
		tag.prototype.setHeaded = function(v){ this._headed = v; return this; };
		
		tag.prototype.__footed = {name: 'footed'};
		tag.prototype.footed = function(v){ return this._footed; }
		tag.prototype.setFooted = function(v){ this._footed = v; return this; };
		
		tag.prototype.render = function (){
			var t0;
			return this.setStaticChildren([
				(this.headed()) && ([
					(t0 = this[0] || (this[0] = t$('el'))).flag('header').setStaticContent([
						(t0[0] = t0[0] || t$('el')).flag('title').setStaticContent("Header").end(),
						(t0[1] = t0[1] || t$('el')).flag('tools').end(),
						(this.long()) && ([
							(t0[2] = t0[2] || t$('el')).flag('long').end()
						])
					]).end(),
					(this[1] = this[1] || t$('el')).flag('ruler').end()
				]),
				(t0 = this[2] || (this[2] = t$('ul'))).setStaticContent([
					(t0[0] = t0[0] || t$('li')).setStaticContent("Hello").end(),
					(t0[1] = t0[1] || t$('li')).setStaticContent("World").end(),
					(this.long()) && ([
						(t0[2] = t0[2] || t$('li')).setStaticContent("long").end(),
						(t0[3] = t0[3] || t$('li')).setStaticContent("loong").end()
					])
				]).end()
			]).synced();
		};
		
		tag.prototype.setStaticChildren = function (nodes){
			this._ops = [];
			this.log("setStaticChildren",nodes);
			return tag.__super__.setStaticChildren.call(this,nodes);
		};
		
		tag.prototype.testRender = function (nodes){
			var pre = nodes.slice();
			return this.setStaticChildren(nodes);
		};
		
		tag.prototype.checkRender = function (o){
			var tree;
			return tree = [];
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
		
		var root = t$('manual').end();
		document.body.appendChild(root.dom());
		
		var a = t$('el').flag('a').setChildren("a").end();
		var b = t$('el').flag('b').setChildren("b").end();
		var c = t$('el').flag('c').setChildren("c").end();
		var d1 = t$('el').flag('d').setChildren("d1").end();
		var d2 = t$('el').flag('d').setChildren("d2").end();
		var e = t$('el').flag('e').setChildren("e").end();
		var f = t$('el').flag('f').setChildren("f").end();
		var g = t$('el').flag('g').setChildren("g").end();
		var h = t$('el').flag('h').setChildren("h").end();
		var i = t$('el').flag('i').setChildren("i").end();
		var j = t$('el').flag('j').setChildren("j").end();
		var k = t$('el').flag('k').setChildren("k").end();
		var l = t$('el').flag('l').setChildren("l").end();
		var m = t$('el').flag('m').setChildren("m").end();
		
		var l0 = t$('el').flag('l0').setChildren("l0").end();
		var l1 = t$('el').flag('l1').setChildren("l1").end();
		var l2 = t$('el').flag('l2').setChildren("l2").end();
		var l3 = t$('el').flag('l3').setChildren("l3").end();
		var l4 = t$('el').flag('l4').setChildren("l4").end();
		var l5 = t$('el').flag('l5').setChildren("l5").end();
		var l6 = t$('el').flag('l6').setChildren("l6").end();
		var l7 = t$('el').flag('l7').setChildren("l7").end();
		var l8 = t$('el').flag('l8').setChildren("l8").end();
		
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