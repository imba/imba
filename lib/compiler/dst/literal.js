(function(){
	Imba.defineTag('ast_literal','ast_node', function(tag){
		
		tag.prototype.template = function (){
			return this.object().value();
		};
	});
	
	Imba.defineTag('ast_str','ast_literal', function(tag){
		tag.flag('str');
	});
	
	Imba.defineTag('ast_num','ast_literal', function(tag){
		tag.flag('num');
	});
	
	Imba.defineTag('ast_obj','ast_literal', function(tag){
		tag.flag('obj');
	});
	
	Imba.defineTag('ast_arr','ast_literal', function(tag){
		tag.flag('arr');
		
		tag.prototype.template = function (){
			return this.object().value().map(function(v) {
				return v.dom();
			});
		};
	});

})()