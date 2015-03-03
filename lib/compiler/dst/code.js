(function(){
(function(){
	var tag = Imba.defineTag('ast_list_node',function ast_list_node(d){this.setDom(d)},"ast_node");
	tag.prototype.template = function (obj){
		return this.object().nodes().map(function (n){
			return n.dom();
		});
	};
})();
Imba.defineTag('ast_param_list',function ast_param_list(d){this.setDom(d)},"ast_list_node");


(function(){
	var tag = Imba.defineTag('ast_block',function ast_block(d){this.setDom(d)},"ast_list_node");
	tag.prototype.template = function (obj){
		return this.object().nodes().map(function (n){
			return n.dom();
		});
	};
})();
(function(){
	var tag = Imba.defineTag('ast_code',function ast_code(d){this.setDom(d)},"ast_node");
	tag.prototype.template = function (obj){
		return this.object().body().dom();
	};
})();
Imba.defineTag('ast_root',function ast_root(d){this.setDom(d)},"ast_code");

(function(){
	var tag = Imba.defineTag('ast_class_declaration',function ast_class_declaration(d){this.setDom(d)},"ast_code");
	tag.prototype.template = function (){
		return [t$('div').flag("head").setContent([
			t$('ast').flag("keyword").setContent("class").end(),
			t$('div').setContent("&nbsp;").end(),
			t$('div').flag("classname").setContent(this.object().name().dom()).end(),
			(this.object().superclass()) && (t$('div').flag("superclass").setContent(this.object().superclass().dom()).end())
		]).end(), this.object().body().dom()];
	};
})();
(function(){
	var tag = Imba.defineTag('ast_func',function ast_func(d){this.setDom(d)},"ast_code");
	tag.flag('func');
})();
(function(){
	var tag = Imba.defineTag('ast_lambda',function ast_lambda(d){this.setDom(d)},"ast_func");
	tag.prototype.template = function (){
		return [t$('ast_param_list').setObject(this.object().params()).end(), this.object().body().dom()];
	};
})();
(function(){
	var tag = Imba.defineTag('ast_method_declaration',function ast_method_declaration(d){this.setDom(d)},"ast_func");
	tag.flag('func');
	
	tag.prototype.template = function (){
		return [t$('div').flag("head").setContent([
			t$('ast').flag("keyword").setContent("def").end(),
			t$('div').setContent("&nbsp;").end(),
			t$('div').flag("entity").flag("name").setContent(this.object().name().dom()).end(),
			t$('ast_param_list').setObject(this.object().params()).end()
		]).end(), this.object().body().dom()];
	};
})();
(function(){
	var tag = Imba.defineTag('ast_return',function ast_return(d){this.setDom(d)},"ast_node");
	tag.prototype.template = function (){
		return [t$('ast').flag("keyword").setContent("return").end(), t$('div').setContent("&nbsp;").end(), t$('ast').flag("value").setContent(this.object().value()).end()];
	};
})();
(function(){
	var tag = Imba.defineTag('ast_identifier',function ast_identifier(d){this.setDom(d)},"ast_node");
	tag.prototype.template = function (){
		return this.object().value();
	};
})();
Imba.defineTag('ast_const',function ast_const(d){this.setDom(d)},"ast_identifier");




(function(){
	var tag = Imba.defineTag('ast_op',function ast_op(d){this.setDom(d)},"ast_node");
	
	tag.prototype.__op = {dom: true};
	tag.prototype.op = function(v){ return this.getAttribute('op'); }
	tag.prototype.setOp = function(v){ this.setAttribute('op',v); return this; }
	;
	
	tag.prototype.build = function (){
		this.setOp(this.object().op());
		return tag.prototype.__super.build.call(this);
	};
	tag.prototype.template = function (){
		return [this.object().left(), t$('ast').flag("op").setRaw(this.object().op()).setContent(this.object().op()).end(), this.object().right()];
	};
})();
(function(){
	var tag = Imba.defineTag('ast_call',function ast_call(d){this.setDom(d)},"ast_node");
	tag.prototype.template = function (){
		return [this.object().callee(), this.object().args()];
	};
})();
Imba.defineTag('ast_arg_list',function ast_arg_list(d){this.setDom(d)},"ast_list_node");

(function(){
	var tag = Imba.defineTag('ast_param',function ast_param(d){this.setDom(d)},"ast_node");
	tag.prototype.template = function (){
		return this.object().name();
	};
})();
Imba.defineTag('ast_required_param',function ast_required_param(d){this.setDom(d)},"ast_param");

Imba.defineTag('ast_named_param',function ast_named_param(d){this.setDom(d)},"ast_param");

Imba.defineTag('ast_block_param',function ast_block_param(d){this.setDom(d)},"ast_param");

Imba.defineTag('ast_splat_param',function ast_splat_param(d){this.setDom(d)},"ast_param");

(function(){
	var tag = Imba.defineTag('ast_self',function ast_self(d){this.setDom(d)},"ast_value_node");
	tag.prototype.template = function (){
		return "self";
	};
})();
(function(){
	var tag = Imba.defineTag('ast_local_var_access',function ast_local_var_access(d){this.setDom(d)},"ast_node");
	tag.prototype.template = function (){
		return this.object().variable();
	};
})();
Imba.defineTag('ast_access',function ast_access(d){this.setDom(d)},"ast_op");

(function(){
	var tag = Imba.defineTag('ast_property_access',function ast_property_access(d){this.setDom(d)},"ast_access");
	tag.prototype.template = function (){
		return [this.object().left(), t$('ast').flag("op").setRaw(this.object().op()).setContent(this.object().op()).end(), this.object().right()];
	};
})();
(function(){
	var tag = Imba.defineTag('ast_index_access',function ast_index_access(d){this.setDom(d)},"ast_access");
	tag.prototype.template = function (){
		return [t$('ast').flag("left").setContent(this.object().left()).end(), t$('ast').flag("right").flag("brackets").setContent(this.object().right()).end()];
	};
})();
Imba.defineTag('ast_index',function ast_index(d){this.setDom(d)},"ast_value_node");

(function(){
	var tag = Imba.defineTag('ast_scope_context',function ast_scope_context(d){this.setDom(d)},"ast_node");
	tag.prototype.template = function (){
		return "self";
	};
})();
(function(){
	var tag = Imba.defineTag('ast_variable',function ast_variable(d){this.setDom(d)},"ast_node");
	tag.prototype.template = function (){
		return this.object().name();
	};
})();
Imba.defineTag('ast_assign',function ast_assign(d){this.setDom(d)},"ast_op");

(function(){
	var tag = Imba.defineTag('ast_var_reference',function ast_var_reference(d){this.setDom(d)},"ast_node");
	tag.prototype.template = function (){
		return [t$('ast').flag("keyword").flag("var").flag("rs").setContent("var").end(), this.object().value()];
	};
})();
}())