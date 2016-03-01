(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	var self = this;
	var a = 0;
	var b = 0;
	var c = 0;
	
	tag$.defineTag('cachetest', function(tag,tag$){
		
		tag$.defineTag('panel', function(tag){
			
			tag.prototype.header = function (){
				var t0;
				return (t0 = this._header=this._header || tag$.$div().setRef('header',this)).setContent((t0.__.$A = t0.__.$A || tag$.$div()).setText('H').end(),2).end();
			};
			
			tag.prototype.body = function (){
				return tag$.$div().end();
			};
			
			tag.prototype.render = function (){
				var self = this, __ = self.__;
				return this.setChildren([
					(__.A = __.A || tag$.$div()).setText('P').end(),
					self.header(),
					self.body()
				],1).synced();
			};
		});
		
		tag$.defineTag('subpanel', 'panel', function(tag){
			
			tag.prototype.header = function (){
				var t0;
				return (t0 = this._header=this._header || tag$.$div().setRef('header',this)).setContent((t0.__.$A = t0.__.$A || tag$.$div()).setText('X').end(),2).end();
			};
		});
		
		tag$.defineTag('wrapped', function(tag){
			tag.prototype.content = function(v){ return this._content; }
			tag.prototype.setContent = function(v){ this._content = v; return this; };
			
			tag.prototype.render = function (){
				var self = this, __ = self.__;
				return this.setChildren([
					(__.A = __.A || tag$.$div()).setText('W').end(),
					self._content
				],1).synced();
			};
		});
		
		tag.prototype.render = function (o){
			var self = this, __ = self.__;
			if(o === undefined) o = {};
			return this.setChildren([
				(o.a) ? (
					(__.A = __.A || tag$.$div()).setText('A').end()
				) : void(0),
				o.b && (__.B = __.B || tag$.$div()).setText('B').end(),
				(o.c) ? (
					(__.C = __.C || tag$.$wrapped()).setContent([
						(__.CA = __.CA || tag$.$div()).setText('B').end(),
						(__.CB = __.CB || tag$.$div()).setText('C').end()
					],2).end()
				) : void(0),
				
				(function(self) {
					var _$ = (__.D = __.D || []);
					for (var i = 0, ary = iter$(o.letters), len = ary.length, res = []; i < len; i++) {
						res.push((_$[i] = _$[i] || tag$.$div()).setContent(ary[i],3).end());
					};
					return res;
				})(self)
			],1).synced();
		};
		
		tag.prototype.toString = function (){
			var html = this.dom().outerHTML;
			// strip away all tags
			return html = html.replace(/\<[^\>]+\>/g,function(m) {
				return m[1] == '/' ? (']') : ('[');
			});
			// html = html.replace(/\[(\w+)\]/g,'$1')
		};
		
		tag.prototype.test = function (options){
			this.render(options);
			return this.toString();
		};
	});
	
	
	
	return self.describe('Tags - Cache',function() {
		var node = tag$.$cachetest().end();
		self.test("basic",function() {
			return self.eq(node.test(),"[]");
		});
		
		self.test("wrapped",function() {
			return self.eq(node.test({c: true}),"[[[W][B][C]]]");
		});
		
		return self.test("with list",function() {
			return self.eq(node.test({letters: ['A','B','C']}),"[[A][B][C]]");
		});
	});

})();