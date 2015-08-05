(function(){
	
	
	Imba.defineTag('ast_tag','ast_expression', function(tag){
		
		tag.prototype.build = function (){
			console.log(this.object().option('type'));
			console.log(this.object()._parts);
			tag.__super__.build.apply(this,arguments);
			return this;
		};
		
		tag.prototype.append = function (value){
			console.log(("ast-tag appending value " + value));
			return tag.__super__.append.apply(this,arguments);
		};
		
		
		tag.prototype.template = function (){
			return [
				// this is not rendering with virtual dom
				t$('ast').flag('head').setContent([
					t$('ast').flag('type').setContent(this.object().option('type')).end(),
					this.object().parts() // render to classes - no?
				]).end(),
				t$('ast').flag('body').setContent(this.object().option('body')).end()
			];
		};
	});
	
	Imba.defineTag('ast_tag_body','ast_list_node');
	
	Imba.defineTag('ast_tag_type_identifier','ast_value_node', function(tag){
		
		tag.prototype.template = function (){
			return this.object().value();
		};
	});
	
	Imba.defineTag('ast_tag_flag','ast_literal', function(tag){
		
		tag.prototype.template = function (){
			console.log("AST-TAG-FLAG",this.object().value());
			return this.object().value();
		};
	});
	
	Imba.defineTag('ast_tag_attr','ast_node', function(tag){
		
		tag.prototype.template = function (){
			return [
				t$('div').flag('key').setContent(this.object().key()).end(),
				this.object().value()
			];
		};
	});

})()