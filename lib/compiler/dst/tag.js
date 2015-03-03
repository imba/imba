(function(){
(function(){
	var tag = Imba.defineTag('ast_tag',function ast_tag(d){this.setDom(d)},"ast_expression");
	tag.prototype.build = function (){
		console.log(this.object().option('type'));
		console.log(this.object()._parts);
		tag.prototype.__super.build.apply(this,arguments);
		return this;
	};
	tag.prototype.append = function (value){
		console.log(("ast-tag appending value " + value));
		return tag.prototype.__super.append.apply(this,arguments);
	};
	tag.prototype.template = function (){
		return [t$('ast').flag("head").setContent([
			t$('ast').flag("type").setContent(this.object().option('type')).end(),
			this.object().parts()
		]).end(), t$('ast').flag("body").setContent(this.object().option('body')).end()];
	};
})();
Imba.defineTag('ast_tag_body',function ast_tag_body(d){this.setDom(d)},"ast_list_node");

(function(){
	var tag = Imba.defineTag('ast_tag_type_identifier',function ast_tag_type_identifier(d){this.setDom(d)},"ast_value_node");
	tag.prototype.template = function (){
		return this.object().value();
	};
})();
(function(){
	var tag = Imba.defineTag('ast_tag_flag',function ast_tag_flag(d){this.setDom(d)},"ast_literal");
	tag.prototype.template = function (){
		console.log("AST-TAG-FLAG",this.object().value());
		return this.object().value();
	};
})();
(function(){
	var tag = Imba.defineTag('ast_tag_attr',function ast_tag_attr(d){this.setDom(d)},"ast_node");
	tag.prototype.template = function (){
		return [t$('div').flag("key").setContent(this.object().key()).end(), this.object().value()];
	};
})();
}())