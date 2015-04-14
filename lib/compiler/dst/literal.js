(function(){


	(function(){
		var tag = Imba.defineTag('ast_literal',function ast_literal(d){this.setDom(d)},"ast_node");
		tag.prototype.template = function (){
			return this.object().value();
		};
	
	})();
	
	(function(){
		var tag = Imba.defineTag('ast_str',function ast_str(d){this.setDom(d)},"ast_literal");
		tag.flag('str');
	
	})();
	
	(function(){
		var tag = Imba.defineTag('ast_num',function ast_num(d){this.setDom(d)},"ast_literal");
		tag.flag('num');
	
	})();
	
	(function(){
		var tag = Imba.defineTag('ast_obj',function ast_obj(d){this.setDom(d)},"ast_literal");
		tag.flag('obj');
	
	})();
	
	(function(){
		var tag = Imba.defineTag('ast_arr',function ast_arr(d){this.setDom(d)},"ast_literal");
		tag.flag('arr');
		
		tag.prototype.template = function (){
			return this.object().value().map(function (v){
				return v.dom();
			});
		};
	
	})();


}())