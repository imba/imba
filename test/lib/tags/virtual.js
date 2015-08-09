(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// externs;
	
	
	var ops = [];
	
	Imba.defineTag('el', function(tag){
		
		tag.prototype.flag = function (ref){
			this._flagged = ref;
			return tag.__super__.flag.apply(this,arguments);
		};
	});
	
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
					1,(t0 = this[0] || (this[0] = t$('el'))).flag('header').setStaticContent([
						(t0[0] = t0[0] || t$('el')).flag('title').setText("Header").end(),
						(t0[1] = t0[1] || t$('el')).flag('tools').end(),
						this.long() ? ([
							1,(t0[2] = t0[2] || t$('el')).flag('long').end(),
							(t0[3] = t0[3] || t$('el')).flag('long').end()
						]) : ([
							2,(t0[4] = t0[4] || t$('el')).flag('short').end()
						])
					]).end(),
					(this[1] = this[1] || t$('el')).flag('ruler').end()
				]),
				(t0 = this[2] || (this[2] = t$('ul'))).setStaticContent([
					(t0[0] = t0[0] || t$('li')).setText(("Hello " + (Math.random()))).end(),
					(t0[1] = t0[1] || t$('li')).setText("World").end(),
					(this.long()) && ([
						1,(t0[2] = t0[2] || t$('li')).setText("long").end(),
						(t0[3] = t0[3] || t$('li')).setText("loong").end()
					])
				]).end(),
				this.long() && this.footed() ? ([
					2,(this[3] = this[3] || t$('el')).flag('long').end(),
					(t0 = this[4] || (this[4] = t$('el'))).flag('footer').setStaticContent([(t0[0] = t0[0] || t$('el')).flag('title').setText("Footer").end()]).end(),
					(this[5] = this[5] || t$('el')).flag('bottom').end()
				]) : ((this.footed()) && ([
					3,(this[6] = this[6] || t$('el')).flag('footer').end(),
					(this[7] = this[7] || t$('el')).flag('bottom').end()
				]))
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