(function(){
	
	
	// set the base type?
	
	Imba.defineTag('ast', function(tag){
		
		
		tag.prototype.__raw = {dom: true,name: 'raw'};
		tag.prototype.raw = function(v){ return this.getAttribute('raw'); }
		tag.prototype.setRaw = function(v){ this.setAttribute('raw',v); return this; };
		
		tag.prototype.append = function (value){
			if (value instanceof AST.Node) { value = value.dom() };
			return tag.__super__.append.call(this,value);
		};
	});
	
	Imba.defineTag('ast_node','ast', function(tag){
		
		tag.prototype.build = function (){
			this.render(this.object());
			return this;
		};
	});
	
	Imba.defineTag('ast_expression','ast_node');
	
	Imba.defineTag('ast_value_node','ast_node', function(tag){
		
		tag.prototype.template = function (){
			return this.object().value();
		};
	});
	
	// tag ast-literal < ast
	// 	
	// 	def build
	// 		render(object)
	// 		self
	// 		
	// 	def template
	// 		object.value

})()