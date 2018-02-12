var Imba = require('imba'), self = this, _2 = Imba.createTagCache, _1 = Imba.createElement;
// externs;

function jseq(find,blk){
	let val = String(blk);
	return ok(val.indexOf(find) >= 0,("'" + find + "' not found in " + val));
};

function htmleq(find,val){
	if (val instanceof Function) {
		val = val();
	};
	
	if (val instanceof Imba.Tag) {
		val = val.toString();
	};
	
	return ok(val.indexOf(find) >= 0,("'" + find + "' not found in " + val));
};

describe('Syntax - Tags',function() {
	
	var strvar = "hello";
	var numvar = 1;
	var fnvar = function() { return true; };
	var objvar = {a: 1,b: 2};
	
	test('id',function() {
		return jseq("setId('one')",function() { return (_1('div').setId('one')); });
	});
	
	test('flags',function() {
		jseq("flag('only')",function() { return (_1('div').flag('only')); });
		jseq("flag('two')",function() { return (_1('div').flag('two')); });
		jseq("flag('two',numvar)",function() { return (_1('div')).flag('two',numvar); });
		jseq("setFlag(0,strvar)",function() { return (_1('div').setFlag(0,strvar)); });
		return jseq("setFlag(0,self.name())",function() { return (_1('div').setFlag(0,self.name())); });
	});
	
	// attributes
	test('attributes',function() {
		jseq("setTitle(strvar)",function() { return (_1('div')).setTitle(strvar); });
		jseq("css('display','block')",function() { return (_1('div').css('display','block')); });
		jseq("setDisabled('disabled')",function() { return (_1('input').setDisabled('disabled')); });
		jseq("setDisabled('disabled').setReadonly('readonly')",function() { return (_1('input').setDisabled('disabled').setReadonly('readonly')); });
		return jseq(("set('model',strvar,\{number:1\})"),function() { return (_1('div')).set('model',strvar,{number:1}); });
	});
	
	// events
	test('events',function() {
		jseq("(0,['tap','prevent','after'])",function() { return (_1('div').flag('two').on$(0,['tap','prevent','after'])); });
		jseq("(0,['tap',['incr',10]])",function() { return (_1('div').flag('two').on$(0,['tap',['incr',10]])); });
		return jseq("(0,['tap',fnvar])",function() { return (_1('div').flag('two')).on$(0,['tap',fnvar]); });
	});
	
	test('data',function() {
		jseq("setData(objvar)",function() { return (_1('div')).setData(objvar); });
		return jseq("setData(objvar)",function() { return (_1('div').flag('only')).setData(objvar); });
	});
	
	test('ref',function() {
		return jseq("._main =",function() { let $ = this.$$ || (this.$$ = {});
		return (self._main = self._main||_1('div',self).flag('main')).setData(objvar); });
	});
	
	
	test('template',function() {
		function Local(){ };
		
		Local.prototype.__title = {'default': "class",name: 'title'};
		Local.prototype.title = function(v){ return this._title; }
		Local.prototype.setTitle = function(v){ this._title = v; return this; }
		Local.prototype._title = "class";
		
		Local.prototype.closed = function (){
			return (t0 = _1('div').setTitle("tag").setTemplate(function() {
				var $ = this.$, t0;
				return ($[0] || _1('h1',$,0,t0)).setContent(this.title(),3);
			})).end();
		};
		
		Local.prototype.open = function (){
			var self = this;
			return (t0 = _1('div').setTitle("tag").setTemplate(function() {
				var $ = this.$, t0;
				return ($[0] || _1('h1',$,0,t0)).setContent(self.title(),3);
			})).end();
		};
		
		var instance = new Local();
		htmleq("<h1>tag</h1>",instance.closed());
		return htmleq("<h1>class</h1>",instance.open());
	});
	
	test('root',function() {
		var t0;
		let a,b,c,d,e;
		var item = (t0 = _1('div')).setContent([
			(t0.$[0] || _1('div',t0.$,0,t0).flag('b')),
			(t0.$[1] || _1('div',t0.$,1,t0).flag('c')),
			(t0.$[2] || _1('div',t0.$,2,t0).flag('d')).setContent(
				e = (t0.$[3] || _1('div',t0.$,3,2).flag('e'))
			,3)
		],2);
		
		return eq(e.root(),item);
	});
	
	return test('multiple self',function() {
		var Local = Imba.defineTag('Local', function(tag){
			tag.prototype.render = function (){
				var $ = this.$;
				return this.setChildren(($[0] || _1('div',$,0,this).setText("ready")),3).synced();
			};
			
			tag.prototype.loading = function (){
				var $ = this.$;
				return this.setChildren(($[0] || _1('span',$,0,this).setText("loading")),3).synced();
			};
			
			tag.prototype.flip = function (bool){
				var $ = this.$, $1 = this.$;
				if(bool === undefined) bool = false;
				if (bool) {
					return this.setChildren(($[0] || _1('b',$,0,this).setText("bold")),3).synced();
				} else {
					return this.setChildren(($1[0] || _1('i',$1,0,this).setText("italic")),3).synced();
				};
			};
		});
		
		var node = (_1(Local)).end();
		htmleq('<div>ready</div>',node);
		node.loading();
		return htmleq('<span>loading</span>',node);
	});
});

