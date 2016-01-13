(function(){
	function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
	// Extending Imba.Tag#css to work without prefixes by inspecting
	// the properties of a CSSStyleDeclaration and creating a map
	
	// var prefixes = ['-webkit-','-ms-','-moz-','-o-','-blink-']
	// var props = ['transform','transition','animation']
	
	if (Imba.CLIENT) {
		var styles = window.getComputedStyle(document.documentElement,'');
		
		Imba.CSSKeyMap = {};
		
		for (var i = 0, ary = iter$(styles), len = ary.length, prefixed; i < len; i++) {
			prefixed = ary[i];
			var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'');
			var camelCase = unprefixed.replace(/-(\w)/g,function(m,a) { return a.toUpperCase(); });
			
			// if there exists an unprefixed version -- always use this
			if (prefixed != unprefixed) {
				if (styles.hasOwnProperty(unprefixed)) { continue; };
			};
			
			// register the prefixes
			Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed;
		};
		
		tag$.extendTag('element', function(tag){
			
			// override the original css method
			tag.prototype.css = function (key,val){
				if (key instanceof Object) {
					for (var i = 0, keys = Object.keys(key), l = keys.length; i < l; i++){
						this.css(keys[i],key[keys[i]]);
					};
					return this;
				};
				
				key = Imba.CSSKeyMap[key] || key;
				
				if (val == null) {
					this.dom().style.removeProperty(key);
				} else if (val == undefined) {
					return this.dom().style[key];
				} else {
					if ((typeof val=='number'||val instanceof Number) && key.match(/width|height|left|right|top|bottom/)) {
						val = val + "px";
					};
					this.dom().style[key] = val;
				};
				return this;
			};
		});
		
		return true;
	};

})()