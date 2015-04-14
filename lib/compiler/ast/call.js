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
	
	/* @class Call */
	AST.Call = function Call(callee,args,opexists){
		// some axioms that share the same syntax as calls will be redirected from here
		
		if(callee instanceof AST.VarOrAccess) {
			var str = callee.value().symbol();
			// p "AST.Call callee {callee} - {str}"
			if(str == 'extern') {
				// p "returning extern instead!"
				return new AST.ExternDeclaration(args);
			};
			if(str == 'tag') {
				// console.log "ERROR - access args by some method"
				return new AST.TagWrapper((args && args.index) ? (args.index(0)) : (args[0]));// hmmm
			};
			if(str == 'export') {
				return new AST.ExportStatement(args);// hmmm
			};
		};
		
		this._callee = callee;
		this._args = args || new AST.ArgList([]);// hmmm
		
		if(args instanceof Array) {
			this._args = new AST.ArgList(args);
			// console.log "ARGUMENTS IS ARRAY - error {args}"
		};
		// p "call opexists {opexists}"
		this;
	};
	
	subclass$(AST.Call,AST.Expression);
	
	AST.Call.prototype.__callee = {};
	AST.Call.prototype.callee = function(v){ return this._callee; }
	AST.Call.prototype.setCallee = function(v){ this._callee = v; return this; };
	
	AST.Call.prototype.__receiver = {};
	AST.Call.prototype.receiver = function(v){ return this._receiver; }
	AST.Call.prototype.setReceiver = function(v){ this._receiver = v; return this; };
	
	AST.Call.prototype.__args = {};
	AST.Call.prototype.args = function(v){ return this._args; }
	AST.Call.prototype.setArgs = function(v){ this._args = v; return this; };
	
	AST.Call.prototype.__block = {};
	AST.Call.prototype.block = function(v){ return this._block; }
	AST.Call.prototype.setBlock = function(v){ this._block = v; return this; };
	
	
	
	AST.Call.prototype.visit = function (){
		// console.log "visit args {args}"
		this.args().traverse();
		this.callee().traverse();
		
		return this._block && this._block.traverse();
	};
	
	AST.Call.prototype.addBlock = function (block){
		// if args.names
		// p "addBlock to call!"
		// var idx = -1
		var pos = this._args.filter(function (n,i){
			return n == '&';
		})[0];
		// idx = i if n == '&'
		// p "FOUND LOGIC"
		// p "node in args {i} {n}"
		if(pos) {
			this.args().replace(pos,block);
		} else {
			this.args().push(block);
		};
		// args.push(block)
		return this;
	};
	
	AST.Call.prototype.receiver = function (){
		return this._receiver || (this._receiver = ((this.callee() instanceof AST.Access) && this.callee().left() || AST.NULL));
	};
	
	// check if all arguments are expressions - otherwise we have an issue
	
	AST.Call.prototype.safechain = function (){
		return this.callee().safechain();// really?
	};
	
	AST.Call.prototype.c = function (){
		return AST.Call.__super__.c.apply(this,arguments);
	};
	
	AST.Call.prototype.js = function (){
		var opt = {expression: true};
		var rec = null;
		var args = this.args().compact();
		var splat = args.some(function (v){
			return v instanceof AST.Splat;
		});
		var out = null;
		var lft = null;
		var rgt = null;
		var wrap = null;
		
		var callee = this._callee = this._callee.node();// drop the var or access?
		
		// p "{self} - {@callee}"
		
		if((callee instanceof AST.Call) && callee.safechain()) {
			// p "the outer call is safechained"
			true;
			// we need to specify that the _result_ of
		};
		
		if(callee instanceof AST.Access) {
			lft = callee.left();
			rgt = callee.right();
		};
		
		if((callee instanceof AST.Super) || (callee instanceof AST.SuperAccess)) {
			this._receiver = this.scope__().context();
			// return "supercall"
		};
		
		// never call the property-access directly?
		if(callee instanceof AST.PropertyAccess) {// && rec = callee.receiver
			// p "unwrapping property-access in call"
			this._receiver = callee.receiver();
			callee = this._callee = OP('.',callee.left(),callee.right());
			// console.log "unwrapping the propertyAccess"
		};
		
		
		if(lft && lft.safechain()) {
			// p "Call[left] is safechain {lft}".blue
			lft.cache();
			// we want to 
			// wrap = ["{}"]
			// p "Call should not cache whole result - only the result of the call".red
		};
		
		
		if(callee.safechain()) {
			// 
			// if lft isa AST.Call
			// if lft isa AST.Call # could be a property access as well - it is the same?
			// if it is a local var access we simply check if it is a function, then call
			// but it should be safechained outside as well?
			if(lft) {
				lft.cache();
			};
			// the outer safechain should not cache the whole call - only ask to cache
			// the result? -- chain onto
			// p "Call safechain {callee} {lft}.{rgt}"
			var isfn = new AST.Util.IsFunction([callee]);
			wrap = [("" + (isfn.c()) + " && "),""];
		};
		
		// if callee.right
		// if calle is PropertyAccess we should convert it first
		// to keep the logic in call? 
		// 
		
		// if 
		
		// should just force expression from the start, no?
		if(splat) {
			// important to wrap the single value in a value, to keep implicit call
			// this is due to the way we check for an outer AST.Call without checking if
			// we are the receiver (in PropertyAccess). Should rather wrap in CallArguments
			var ary = ((args.count() == 1) ? (new AST.ValueNode(args.first().value())) : (new AST.Arr(args.list())));
			this.receiver().cache();// need to cache the target
			out = ("" + (callee.c({expression: true})) + ".apply(" + (this.receiver().c()) + "," + (ary.c({expression: true})) + ")");
		} else if(this._receiver) {
			this._receiver.cache();
			args.unshift(this.receiver());
			// should rather rewrite to a new call?
			out = ("" + (callee.c({expression: true})) + ".call(" + (args.c({expression: true})) + ")");
		} else {
			out = ("" + (callee.c({expression: true})) + "(" + (args.c({expression: true})) + ")");
		};
		
		if(wrap) {
			// we set the cachevar inside
			// p "special caching for call"
			if(this._cache) {
				this._cache.manual = true;
				out = ("(" + (this.cachevar().c()) + "=" + out + ")");
			};
			
			out = [wrap[0],out,wrap[1]].join("");
		};
		
		return out;
	};
	
	
	
	
	
	/* @class ImplicitCall */
	AST.ImplicitCall = function ImplicitCall(){ AST.Call.apply(this,arguments) };
	
	subclass$(AST.ImplicitCall,AST.Call);
	AST.ImplicitCall.prototype.js = function (){
		return "" + (this.callee().c()) + "()";
	};
	
	
	
	
	/* @class New */
	AST.New = function New(){ AST.Call.apply(this,arguments) };
	
	subclass$(AST.New,AST.Call);
	AST.New.prototype.js = function (o){
		// 
		var out = ("new " + (this.callee().c()));
		// out = out.parenthesize if o.parent isa AST.Access # hmm?
		if(!((o.parent() instanceof AST.Call))) {
			out += '()';
		};
		return out;
		// "{callee.c}()"
	};
	
	
	
	
	/* @class SuperCall */
	AST.SuperCall = function SuperCall(){ AST.Call.apply(this,arguments) };
	
	subclass$(AST.SuperCall,AST.Call);
	AST.SuperCall.prototype.js = function (o){
		var m = o.method();
		this.setReceiver(AST.SELF);
		this.setCallee(("" + (m.target().c()) + ".super$.prototype." + (m.name().c())));
		return AST.SuperCall.__super__.js.apply(this,arguments);
	};
	
	
	
	
	/* @class ExternDeclaration */
	AST.ExternDeclaration = function ExternDeclaration(){ AST.ListNode.apply(this,arguments) };
	
	subclass$(AST.ExternDeclaration,AST.ListNode);
	AST.ExternDeclaration.prototype.visit = function (){
		// p "visiting externdeclaration"
		this.setNodes(this.map(function (item){
			return item.node();
		}));// drop var or access really
		// only in global scope?
		var root = this.scope__();
		this.nodes().map(function (item){
			var variable = root.register(item.symbol(),item,{type: 'global'});// hmmmm
			return variable.addReference(item);
		});
		return this;
	};
	
	AST.ExternDeclaration.prototype.c = function (){
		return "// externs";
		// register :global, self, type: 'global'
	};
	


}())