var Imba = require("../imba");

Imba.TAGS.ns('svg').defineTag('element', function(tag){
	
	tag.namespaceURI = function (){
		return "http://www.w3.org/2000/svg";
	};
	
	tag.buildNode = function (){
		var dom = Imba.document().createElementNS(this.namespaceURI(),this._nodeType);
		var cls = this._classes.join(" ");
		if (cls) { dom.className.baseVal = cls };
		return dom;
	};
	
	tag.inherit = function (child){
		child._protoDom = null;
		
		if (Imba.indexOf(child._name,Imba.SVG_TAGS) >= 0) {
			child._nodeType = child._name;
			return child._classes = [];
		} else {
			child._nodeType = this._nodeType;
			var className = "_" + child._name.replace(/_/g,'-');
			return child._classes = this._classes.concat(className);
		};
	};
});
