function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require('imba'), _2 = Imba.createTagList, _3 = Imba.createTagMap, self = this, _1 = Imba.createElement;
// externs;

var a = 0;
var b = 0;
var c = 0;

var Tester = Imba.defineTag('Tester', function(tag){
	tag.prototype.toString = function (){
		let html = this.dom().outerHTML;
		return html = html.replace(/\<[^\>]+\>/g,function(m) {
			return (m[1] == '/') ? ']' : '[';
		});
	};
	
	tag.prototype.test = function (options){
		this._o = options;
		this.render(options);
		return this.toString();
	};
});

Imba.defineTag('cachetest', function(tag){
	
	Imba.defineTag('panel', function(tag){
		
		tag.prototype.header = function (){
			var $ = this.$$ || (this.$$ = {}), t0;
			return (t0 = this._header= this._header||_1('div',$,'_header')).setContent((t0.$[0] || _1('div',t0.$,0).setText('H')).end(),3).end();
		};
		
		tag.prototype.body = function (){
			return (_1('div')).end();
		};
		
		tag.prototype.render = function (){
			var $ = this.$;
			return (this).setChildren([
				($[0] || _1('div',$,0).setText('P')).end(),
				this.header(),
				this.body()
			],1).synced();
		};
	});
	
	Imba.defineTag('subpanel', 'panel', function(tag){
		
		tag.prototype.header = function (){
			var $ = this.$$ || (this.$$ = {}), t0;
			return (t0 = this._header= this._header||_1('div',$,'_header')).setContent((t0.$[0] || _1('div',t0.$,0).setText('X')).end(),3).end();
		};
	});
	
	Imba.defineTag('wrapped', function(tag){
		tag.prototype.content = function(v){ return this._content; }
		tag.prototype.setContent = function(v){ this._content = v; return this; };
		
		tag.prototype.render = function (){
			var $ = this.$;
			return (this).setChildren([
				($[0] || _1('div',$,0).setText('W')).end(),
				this._content
			],1).synced();
		};
	});
	
	tag.prototype.render = function (o){
		var $ = this.$;
		if(o === undefined) o = {};
		return (this).setChildren([
			o.a ? (
				($[0] || _1('div',$,0).setText('A')).end()
			) : void(0),
			o.b && ($[1] || _1('div',$,1).setText('B')).end(),
			o.c ? (
				($[2] || _1('wrapped',$,2)).setContent([
					($[3] || _1('div',$,3,2).setText('B')).end(),
					($[4] || _1('div',$,4,2).setText('C')).end()
				],2).end()
			) : void(0),
			
			(function($0) {
				for (let i = 0, items = iter$(o.letters), len = $0.taglen = items.length; i < len; i++) {
					($0[i] || _1('div',$0,i)).setContent(items[i],3).end();
				};return $0;
			})($[5] || _2($,5))
		],1).synced();
	};
	
	tag.prototype.toString = function (){
		let html = this.dom().outerHTML;
		// strip away all tags
		return html = html.replace(/\<[^\>]+\>/g,function(m) {
			return (m[1] == '/') ? ']' : '[';
		});
		// html = html.replace(/\[(\w+)\]/g,'$1')
	};
	
	tag.prototype.test = function (options){
		this.render(options);
		return this.toString();
	};
});

let has = function(text,fn) {
	return ok(String(fn).indexOf(text) >= 0);
};


describe('Tags - Cache',function() {
	var node = (_1('cachetest')).end();
	test("basic",function() {
		return eq(node.test(),"[]");
	});
	
	test("wrapped",function() {
		return eq(node.test({c: true}),"[[[W][B][C]]]");
	});
	
	test("with list",function() {
		return eq(node.test({letters: ['A','B','C']}),"[[A][B][C]]");
	});
	
	test("setText",function() {
		let has = function(text,fn) {
			return ok(String(fn).indexOf(text) >= 0);
		};
		let dyn = 10;
		has('setText',function() { return (_1('div').setText("title")).end(); });
		has('setText',function() { return (_1('div')).setText("title " + dyn).end(); });
		return has('setText',function() { return (_1('div')).setText("title" + dyn).end(); });
	});
	
	test("svg dynamic set",function() {
		return has('set(',function() { return (_1('svg:rect').set('fill','red')).end(); });
	});
	
	test("alternate text and dom",function() {
		if (true) { return };
		var items = ["A",(_1('div').setText("B")).end()];
		var flip = function() {
			items.reverse();
			return items[0];
		};
		
		var el = (_1(Tester)).setTemplate(function() {
			var $ = this.$;
			return ($[0] || _1('li',$,0)).setContent(items[this._o],3).end();
		}).end();
		// items = ["A",<div> "B"]
		eq(el.test(0),'[[A]]');
		eq(el.test(1),'[[[B]]]');
		return eq(el.test(0),'[[A]]');
	});
	
	
	return test("pruning",function() {
		var counter = 0;
		var items = [];
		for (let i = 0; i <= 10; i++) {
			items.push({id: counter++,name: "Item"});
		};
		
		var node = (_1('div')).setTemplate(function() {
			var $ = this.$;
			return ($[0] || _1('ul',$,0)).setContent((function($0) {
				var id_, $$ = $0.$iter();
				for (let i = 0, len = items.length, item; i < len; i++) {
					item = items[i];
					$$.push(($0[id_ = item.id] || _1('li',$0,id_)).setContent(item.name,3).end());
				};return $$;
			})($[1] || _3($,1,0)),5).end();
		}).end();
		
		let prevFn = Imba.TagMap.prototype.$prune;
		var pruned = 0;
		
		Imba.TagMap.prototype.$prune = function() {
			console.log("pruned!");
			return pruned++;
		};
		
		for (let i = 0; i <= 2000; i++) {
			items.shift();
			items.push({id: counter++,name: "Item"});
			node.render();
		};
		
		let map = node.$[1];
		console.log(map.i$,map.constructor);
		eq(pruned,1);
		return self;
	});
});





