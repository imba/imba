(function(){


	// helper for subclassing
	function subclass$(obj,sup) {
		for (var k in sup) {
			if (sup.hasOwnProperty(k)) obj[k] = sup[k];
		};
		// obj.__super__ = sup;
		obj.prototype = Object.create(sup.prototype);
		obj.__super__ = obj.prototype.__super__ = sup.prototype;
		obj.prototype.initialize = obj.prototype.constructor = obj;
	};
	;
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	TAG_TYPES = {};
	TAG_ATTRS = {};
	
	
	TAG_TYPES.HTML = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
	
	TAG_TYPES.SVG = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
	
	TAG_ATTRS.HTML = "accept accessKey action allowFullScreen allowTransparency alt async autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked className cols colSpan content contentEditable contextMenu controls coords crossOrigin data dateTime defer dir disabled download draggable encType form formNoValidate frameBorder height hidden href hrefLang htmlFor httpEquiv icon id label lang list loop max maxLength mediaGroup method min multiple muted name noValidate pattern placeholder poster preload radioGroup readOnly rel required role rows rowSpan sandbox scope scrollLeft scrolling scrollTop seamless selected shape size span spellCheck src srcDoc srcSet start step style tabIndex target title type useMap value width wmode";
	
	TAG_ATTRS.SVG = "cx cy d dx dy fill fillOpacity fontFamily fontSize fx fy gradientTransform gradientUnits markerEnd markerMid markerStart offset opacity patternContentUnits patternUnits points preserveAspectRatio r rx ry spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap strokeOpacity strokeWidth textAnchor transform version viewBox x1 x2 x y1 y2 y";
	
	
	/* @class TagDesc */
	AST.TagDesc = function TagDesc(){
		this.p('TagDesc!!!',$0);
	};
	
	subclass$(AST.TagDesc,AST.Node);
	
	
	AST.TagDesc.prototype.classes = function (){
		this.p('TagDescClasses',$0);
		return this;
	};
	
	
	/* @class Tag */
	AST.Tag = function Tag(o){
		// p "init tag",$0
		if(o === undefined) o = {};
		this._parts = [];
		o.classes || (o.classes = []);
		o.attributes || (o.attributes = []);
		o.classes || (o.classes = []);
		this._options = o;
	};
	
	subclass$(AST.Tag,AST.Expression);
	
	AST.Tag.prototype.__parts = {};
	AST.Tag.prototype.parts = function(v){ return this._parts; }
	AST.Tag.prototype.setParts = function(v){ this._parts = v; return this; };
	
	AST.Tag.prototype.__object = {};
	AST.Tag.prototype.object = function(v){ return this._object; }
	AST.Tag.prototype.setObject = function(v){ this._object = v; return this; };
	
	AST.Tag.prototype.__reactive = {};
	AST.Tag.prototype.reactive = function(v){ return this._reactive; }
	AST.Tag.prototype.setReactive = function(v){ this._reactive = v; return this; };
	
	AST.Tag.prototype.__parent = {};
	AST.Tag.prototype.parent = function(v){ return this._parent; }
	AST.Tag.prototype.setParent = function(v){ this._parent = v; return this; };
	
	AST.Tag.prototype.__tree = {};
	AST.Tag.prototype.tree = function(v){ return this._tree; }
	AST.Tag.prototype.setTree = function(v){ this._tree = v; return this; };
	
	
	
	AST.Tag.prototype.set = function (obj){
		for(var o=obj, v, i=0, keys=Object.keys(o), l=keys.length, k; i < l; i++){
			
			k = keys[i];v = o[k];if(k == 'attributes') {
				// p "attributs!"
				for(var j=0, ary=iter$(v), len=ary.length; j < len; j++) {
					this.addAttribute(ary[j]);
				};
				continue;
			};
			
			this._options[k] = v;
		};
		return this;
	};
	
	AST.Tag.prototype.addClass = function (node){
		if(!((node instanceof AST.TagFlag))) {
			node = new AST.TagFlag(node);
		};
		this._options.classes.push(node);
		this._parts.push(node);
		
		// p "add class!!!"
		return this;
	};
	
	AST.Tag.prototype.addIndex = function (node){
		this._parts.push(node);
		// hmm
		this._object = node;
		// must be the first part?
		return this;
	};
	
	AST.Tag.prototype.addSymbol = function (node){
		// p "addSymbol to the tag",node
		if(this._parts.length == 0) {
			this._parts.push(node);
			this._options.ns = node;
		};
		return this;
	};
	
	
	AST.Tag.prototype.addAttribute = function (atr){
		// p "add attribute!!!", key, value
		this._parts.push(atr);// what?
		this._options.attributes.push(atr);
		return this;
	};
	
	AST.Tag.prototype.type = function (){
		return this._options.type || 'div';
	};
	
	AST.Tag.prototype.consume = function (node){
		if(node instanceof AST.TagTree) {
			// p "tag consume tagtree? {node.reactive}"
			this.setReactive(node.reactive() || !(!this.option('ivar')));// hmm
			this.setParent(node.root());// hmm
			return this;
		} else {
			return AST.Tag.__super__.consume.apply(this,arguments);
		};
	};
	
	AST.Tag.prototype.visit = function (){
		var o = this._options;
		if(o.body) {
			// force expression(!)
			o.body.map(function (v){
				return v.traverse();
			});
		};
		
		// id should also be a regular part
		// hmm?
		if(o.id) {
			o.id.traverse();
		};
		
		for(var i=0, ary=iter$(this._parts), len=ary.length; i < len; i++) {
			ary[i].traverse();
		};
		
		// for atr in @options:attributes
		// 	atr.traverse
		
		return this;
	};
	
	AST.Tag.prototype.reference = function (){
		// should resolve immediately to get the correct naming-structure that
		// reflects the nesting-level of the tag
		return this._reference || (this._reference = this.scope__().temporary(this,{type: 'tag'}).resolve());
	};
	
	// should this not happen in js?
	AST.Tag.prototype.js = function (){
		// p JSON.stringify(@options)
		// var attrs = AST.TagAttributes.new(o:attributes)
		// p "got here?"
		var body;
		var o = this._options;
		var a = {};
		
		var setup = [];
		var calls = [];
		var statics = [];
		
		var scope = this.scope__();
		var commit = "end";
		
		var isSelf = (this.type() instanceof AST.Self);
		
		for(var i=0, ary=iter$(o.attributes), len=ary.length, atr; i < len; i++) {
			atr = ary[i];a[atr.key()] = atr.value();// .populate(obj)
		};
		
		var id = (o.id instanceof AST.Node) ? (o.id.c()) : ((o.id && o.id.c().quoted()));
		
		//  "scope is", !!scope
		// p "type is {type}"
		var out = (isSelf) ? (
			commit = "synced",
			// p "got here"
			// setting correct context directly
			this.setReactive(true),
			this._reference = scope.context(),
			// hmm, not sure about this
			scope.context().c()
		) : ((o.id) ? (
			("ti$('" + (this.type().func()) + "'," + id + ")")
		) : (
			("t$('" + (this.type().func()) + "')")
		));
		
		// this is reactive if it has an ivar
		if(o.ivar) {
			this.setReactive(true);
			statics.push((".setRef(" + (o.ivar.name().quoted()) + "," + (scope.context().c()) + ")"));
		};
		
		// hmmm
		var tree = new AST.TagTree(o.body,{root: this,reactive: this.reactive()}).resolve();
		this.setTree(tree);
		
		// should it not happen through parts instead?
		// for flag in o:classes
		// 	calls.push(flag.c)
		// 	# calls.push ".flag({flag isa String ? flag.c.quoted : flag.c})"
		
		for(var i=0, ary=iter$(this._parts), len=ary.length, part; i < len; i++) {
			part = ary[i];if(part instanceof AST.TagAttr) {
				var akey = part.key();
				
				// the attr should compile itself instead -- really
				
				if(akey[0] == '.') {// should check in a better way
					calls.push((".flag(" + (akey.substr(1).quoted()) + "," + (part.value().c()) + ")"));
				} else {
					calls.push(("." + (part.key().toSetter()) + "(" + (part.value().c()) + ")"));
				};
			} else if(part instanceof AST.TagFlag) {
				calls.push(part.c());
			};
		};
		
		
		// for atr in o:attributes
		// 	# continue if atr.key.match /tst/ # whatt??!
		// 	# only force-set the standard attributes?
		// 	# what about values that are not legal?
		// 	# can easily happen - we need to compile them?
		// 	# or always proxy through set
		// 	var akey = atr.key
		// 
		// 	# TODO FIXME what if the key is dashed?
		// 	# p "attribute {akey}"
		// 	
		// 	if akey[0] == '.' # should check in a better way
		// 		# aint good?
		// 		# out += ".flag({akey.substr(1).quoted},{atr.value.c})"
		// 		calls.push ".flag({akey.substr(1).quoted},{atr.value.c})"
		// 	else
		// 		# should check for standard-attributes, consider setter instead?
		// 		# out += ".{atr.key}({atr.value.c})"
		// 		calls.push ".{atr.key.toSetter}({atr.value.c})"
		
		if(this.object()) {
			calls.push((".setObject(" + (this.object().c()) + ")"));
		};
		
		// p "tagtree is static? {tree.static}"
		
		// we need to trigger our own reference before the body does
		if(this.reactive()) {
			this.reference();// hmm
		};
		
		if(body = tree.c({expression: true})) {// force it to be an expression, no?
			calls.push(((isSelf) ? ((".setChildren([" + body + "])")) : ((".setContent([" + body + "])"))));
			// out += ".body({body})"
		};
		
		// if o:attributes:length # or -- always?
		// adds lots of extra calls - but okay for now
		calls.push(("." + commit + "()"));
		
		if(statics.length) {
			out = out + statics.join("");
		};
		
		// hmm - hack much
		if((o.ivar || this.reactive()) && !(this.type() instanceof AST.Self)) {
			// if this is an ivar, we should set the reference relative
			// to the outer reference, or possibly right on context?
			var par = this.parent();
			var ctx = !(o.ivar) && par && par.reference() || scope.context();
			var key = o.ivar || par && par.tree().indexOf(this);
			
			// need the context -- might be better to rewrite it for real?
			// parse the whole thing into calls etc
			var acc = OP('.',ctx,key).c();
			
			out = ("(" + (this.reference().c()) + " = " + acc + " || (" + acc + " = " + out + "))");
		};
		
		// should we not add references to the outer ones first?
		
		// now work on the refereces?
		
		// free variable
		if(this._reference instanceof AST.Variable) {
			this._reference.free();
		};
		// if setup:length
		// out += ".setup({setup.join(",")})"
		
		return out + calls.join("");
	};
	
	
	// This is a helper-node
	/* @class TagTree */
	AST.TagTree = function TagTree(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.TagTree,AST.ListNode);
	AST.TagTree.prototype.load = function (list){
		return (list instanceof AST.ListNode) ? (
			this._indentation || (this._indentation = list._indentation),
			list.nodes()
		) : (
			((list instanceof Array) ? (list) : ([list])).compact()
		);
	};
	
	AST.TagTree.prototype.root = function (){
		return this.option('root');
	};
	
	AST.TagTree.prototype.reactive = function (){
		return this.option('reactive');
	};
	
	AST.TagTree.prototype.resolve = function (){
		var self=this;
		this.remap(function (c){
			return c.consume(self);
		});
		return self;
	};
	
	AST.TagTree.prototype.static = function (){
		return (this._static == null) ? (this._static = this.every(function (c){
			return c instanceof AST.Tag;
		})) : (this._static);
	};
	
	AST.TagTree.prototype.c = function (){
		return AST.TagTree.__super__.c.apply(this,arguments);
		
		// p "TagTree.c {nodes}"	
		var l = this.nodes().length;
		return (l == 1) ? (
			// p "TagTree.c {nodes}"
			this.map(function (v){
				return v.c({expression: true});
			})
			// nodes.c(expression: yes)
		) : ((l > 1) && (
			this.nodes().c({expression: true})
		));
	};
	
	
	
	/* @class TagWrapper */
	AST.TagWrapper = function TagWrapper(){ AST.ValueNode.apply(this,arguments) };
	
	subclass$(AST.TagWrapper,AST.ValueNode);
	AST.TagWrapper.prototype.visit = function (){
		if(this.value() instanceof Array) {
			this.value().map(function (v){
				return v.traverse();
			});
		} else {
			this.value().traverse();
		};
		return this;
	};
	
	AST.TagWrapper.prototype.c = function (){
		return "tag$wrap(" + (this.value().c({expression: true})) + ")";
	};
	
	
	
	/* @class TagAttributes */
	AST.TagAttributes = function TagAttributes(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.TagAttributes,AST.ListNode);
	AST.TagAttributes.prototype.get = function (name){
		for(var i=0, ary=iter$(this.nodes()), len=ary.length, node, res=[]; i < len; i++) {
			node = ary[i];if(node.key() == name) {
				return node;
			};
		};return res;
	};
	
	
	
	/* @class TagAttr */
	AST.TagAttr = function TagAttr(k,v){
		// p "init TagAttribute", $0
		this._key = k;
		this._value = v;
	};
	
	subclass$(AST.TagAttr,AST.Node);
	
	AST.TagAttr.prototype.__key = {};
	AST.TagAttr.prototype.key = function(v){ return this._key; }
	AST.TagAttr.prototype.setKey = function(v){ this._key = v; return this; };
	
	AST.TagAttr.prototype.__value = {};
	AST.TagAttr.prototype.value = function(v){ return this._value; }
	AST.TagAttr.prototype.setValue = function(v){ this._value = v; return this; };
	
	AST.TagAttr.prototype.visit = function (){
		if(this.value()) {
			this.value().traverse();
		};
		return this;
	};
	
	
	
	AST.TagAttr.prototype.populate = function (obj){
		obj.add(this.key(),this.value());
		return this;
	};
	
	AST.TagAttr.prototype.c = function (){
		return "attribute";
	};
	
	
	
	/* @class TagFlag */
	AST.TagFlag = function TagFlag(value){
		this._value = value;
		this;
	};
	
	subclass$(AST.TagFlag,AST.Node);
	
	AST.TagFlag.prototype.__value = {};
	AST.TagFlag.prototype.value = function(v){ return this._value; }
	AST.TagFlag.prototype.setValue = function(v){ this._value = v; return this; };
	
	AST.TagFlag.prototype.__toggler = {};
	AST.TagFlag.prototype.toggler = function(v){ return this._toggler; }
	AST.TagFlag.prototype.setToggler = function(v){ this._toggler = v; return this; };
	
	
	
	AST.TagFlag.prototype.visit = function (){
		if(!((typeof this._value=='string'||this._value instanceof String))) {
			this._value.traverse();
		};
		return this;
	};
	
	AST.TagFlag.prototype.c = function (){
		var value_;
		return ((typeof (value_=this.value())=='string'||value_ instanceof String)) ? (
			(".flag(" + (this.value().quoted()) + ")")
		) : (
			(".flag(" + (this.value().c()) + ")")
		);
	};
	


}())