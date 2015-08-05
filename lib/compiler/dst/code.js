(function(){
	
	
	
	
	Imba.defineTag('ast_list_node','ast_node', function(tag){
		
		tag.prototype.template = function (obj){
			return this.object().nodes().map(function(n) {
				return n.dom();
			});
		};
	});
	
	Imba.defineTag('ast_param_list','ast_list_node');
	
	
	Imba.defineTag('ast_block','ast_list_node', function(tag){
		
		// def build
		// 	console.log "build block",object.nodes
		//	self
		
		tag.prototype.template = function (obj){
			// object.nodes.map(|n| <div.expr> ["&nbsp;&nbsp;&nbsp;&nbsp;",n.dom] )
			return this.object().nodes().map(function(n) {
				return n.dom();
			});
		};
	});
	
	Imba.defineTag('ast_code','ast_node', function(tag){
		
		tag.prototype.template = function (obj){
			return this.object().body().dom();
		};
	});
	
	
	Imba.defineTag('ast_root','ast_code');
	
	Imba.defineTag('ast_class_declaration','ast_code', function(tag){
		
		tag.prototype.template = function (){
			return [
				t$('div').flag('head').setContent([
					t$('ast').flag('keyword').setContent("class").end(),
					t$('div').setContent("&nbsp;").end(),
					t$('div').flag('classname').setContent(this.object().name().dom()).end(),
					(this.object().superclass()) && ([
						t$('div').flag('superclass').setContent(this.object().superclass().dom()).end()
					])
				]).end(),
				this.object().body().dom()
			];
		};
	});
	
	
	Imba.defineTag('ast_func','ast_code', function(tag){
		tag.flag('func');
	});
	
	Imba.defineTag('ast_lambda','ast_func', function(tag){
		
		tag.prototype.template = function (){
			return [
				// <div.head>
				t$('ast_param_list').setObject(this.object().params()).end(),
				this.object().body().dom()
			];
		};
	});
	
	Imba.defineTag('ast_method_declaration','ast_func', function(tag){
		
		tag.flag('func');
		
		tag.prototype.template = function (){
			return [
				t$('div').flag('head').setContent([
					t$('ast').flag('keyword').setContent("def").end(),
					t$('div').setContent("&nbsp;").end(),
					t$('div').flag('entity').flag('name').setContent(this.object().name().dom()).end(),
					t$('ast_param_list').setObject(this.object().params()).end()
				]).end(),
				this.object().body().dom()
			];
		};
	});
	
	Imba.defineTag('ast_return','ast_node', function(tag){
		
		tag.prototype.template = function (){
			return [
				t$('ast').flag('keyword').setContent("return").end(),
				t$('div').setContent("&nbsp;").end(),
				t$('ast').flag('value').setContent(this.object().value()).end()
			];
		};
	});
	
	
	Imba.defineTag('ast_identifier','ast_node', function(tag){
		
		tag.prototype.template = function (){
			return this.object().value();
		};
	});
	
	Imba.defineTag('ast_const','ast_identifier');
	
	
	
	
	Imba.defineTag('ast_op','ast_node', function(tag){
		
		
		tag.prototype.__op = {dom: true,name: 'op'};
		tag.prototype.op = function(v){ return this.getAttribute('op'); }
		tag.prototype.setOp = function(v){ this.setAttribute('op',v); return this; };
		
		tag.prototype.build = function (){
			this.setOp(this.object().op());
			return tag.__super__.build.call(this);
		};
		
		tag.prototype.template = function (){
			return [
				this.object().left(),
				t$('ast').flag('op').setRaw(this.object().op()).setContent(this.object().op()).end(),
				this.object().right()
			];
		};
	});
	
	
	Imba.defineTag('ast_call','ast_node', function(tag){
		
		tag.prototype.template = function (){
			return [
				this.object().callee(),
				this.object().args()
			];
		};
	});
	
	Imba.defineTag('ast_arg_list','ast_list_node');
	
	Imba.defineTag('ast_param','ast_node', function(tag){
		
		tag.prototype.template = function (){
			return this.object().name();
		};
	});
	
	Imba.defineTag('ast_required_param','ast_param');
	
	Imba.defineTag('ast_named_param','ast_param');
	
	Imba.defineTag('ast_block_param','ast_param');
	
	Imba.defineTag('ast_splat_param','ast_param');
	
	Imba.defineTag('ast_self','ast_value_node', function(tag){
		
		tag.prototype.template = function (){
			return "self";
		};
	});
	
	Imba.defineTag('ast_local_var_access','ast_node', function(tag){
		
		tag.prototype.template = function (){
			return this.object().variable();
		};
	});
	
	Imba.defineTag('ast_access','ast_op');
	
	Imba.defineTag('ast_property_access','ast_access', function(tag){
		
		tag.prototype.template = function (){
			return [
				// what about the receiver?
				this.object().left(),
				t$('ast').flag('op').setRaw(this.object().op()).setContent(this.object().op()).end(),
				this.object().right()
			];
		};
	});
	
	Imba.defineTag('ast_index_access','ast_access', function(tag){
		
		tag.prototype.template = function (){
			return [
				// what about the receiver?
				t$('ast').flag('left').setContent(this.object().left()).end(),
				t$('ast').flag('right').flag('brackets').setContent(this.object().right()).end()
			];
		};
	});
	
	Imba.defineTag('ast_index','ast_value_node');
	
	Imba.defineTag('ast_scope_context','ast_node', function(tag){
		
		tag.prototype.template = function (){
			return "self";
		};
	});
	
	Imba.defineTag('ast_variable','ast_node', function(tag){
		tag.prototype.template = function (){
			return this.object().name();
		};
	});
	
	Imba.defineTag('ast_assign','ast_op');
	
	Imba.defineTag('ast_var_reference','ast_node', function(tag){
		
		tag.prototype.template = function (){
			return [
				t$('ast').flag('keyword').flag('var').flag('rs').setContent("var").end(),
				this.object().value()
			];
		};
	});

})()