function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {};
var Stylis = require('../../vendor/stylis');
var selparser = require('../../vendor/css-selector-parser');
var cssparser = new Stylis({compress: false,semicolons: false});

var selScope = null;

function rewriteSelector(str){
	var sel = selparser.parse(str);
	
	var rule = sel.rule;
	while (rule){
		if (!rule.rule) { break; };
		
		if (rule.rule.nestingOperator == '>>>') {
			rule.rule.nestingOperator = null;
			break;
		};
		
		rule = rule.rule;
	};
	
	if (rule) {
		rule.classNames = [].concat(rule.classNames || []).concat([selScope]);
	};
	
	return selparser.render(sel);
};

function plugin(context,content,selectors,parent,line,column,length){
	
	if (context == 2 && selScope) {
		for (var i = 0, items = iter$(selectors), len = items.length; i < len; i++) {
			selectors[i] = rewriteSelector(items[i]);
		};
		return content;
	};
	return content;
};

cssparser.use(plugin);


exports.compile = self.compile = function (css,o){
	if(o === undefined) o = {};
	selScope = o.scope;
	return cssparser('',css);
};
