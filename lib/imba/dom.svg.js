(function(){
	function idx$(a,b){
		return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
	};
	
	
	Imba.TAGS.SVG.defineTag('svgelement', function(tag){
		
		tag.namespaceURI = function (){
			return "http://www.w3.org/2000/svg";
		};
		
		var types = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");
		
		tag.buildNode = function (){
			var dom = Imba.document().createElementNS(this.namespaceURI(),this._nodeType);
			var cls = this._classes.join(" ");
			if (cls) { dom.className = cls };
			return dom;
		};
		
		tag.inherit = function (child){
			console.log('svg inherit',child);
			child._protoDom = null;
			
			if (idx$(child._name,types) >= 0) {
				child._nodeType = child._name;
				return child._classes = [];
			} else {
				child._nodeType = this._nodeType;
				var className = "_" + child._name.replace(/_/g,'-');
				return child._classes = this._classes.concat(className);
			};
		};
		
		
		
		
		tag.prototype.x = function(v){ return this.getAttribute('x'); }
		tag.prototype.setX = function(v){ this.setAttribute('x',v); return this; };
		
		
		tag.prototype.y = function(v){ return this.getAttribute('y'); }
		tag.prototype.setY = function(v){ this.setAttribute('y',v); return this; };
	});
	
	Imba.TAGS.SVG.defineTag('svg', function(tag){
		
		
		tag.prototype.viewbox = function(v){ return this.getAttribute('viewbox'); }
		tag.prototype.setViewbox = function(v){ this.setAttribute('viewbox',v); return this; };
		
		
		tag.prototype.width = function(v){ return this.getAttribute('width'); }
		tag.prototype.setWidth = function(v){ this.setAttribute('width',v); return this; };
		
		
		tag.prototype.height = function(v){ return this.getAttribute('height'); }
		tag.prototype.setHeight = function(v){ this.setAttribute('height',v); return this; };
	});
	
	Imba.TAGS.SVG.defineTag('rect', function(tag){
		
		
		tag.prototype.width = function(v){ return this.getAttribute('width'); }
		tag.prototype.setWidth = function(v){ this.setAttribute('width',v); return this; };
		
		
		tag.prototype.height = function(v){ return this.getAttribute('height'); }
		tag.prototype.setHeight = function(v){ this.setAttribute('height',v); return this; };
	});
	
	Imba.TAGS.SVG.defineTag('circle', function(tag){
		
		
		tag.prototype.cx = function(v){ return this.getAttribute('cx'); }
		tag.prototype.setCx = function(v){ this.setAttribute('cx',v); return this; };
		
		
		tag.prototype.cy = function(v){ return this.getAttribute('cy'); }
		tag.prototype.setCy = function(v){ this.setAttribute('cy',v); return this; };
		
		
		tag.prototype.r = function(v){ return this.getAttribute('r'); }
		tag.prototype.setR = function(v){ this.setAttribute('r',v); return this; };
	});
	
	return Imba.TAGS.SVG.defineTag('ellipse', function(tag){
		
		
		tag.prototype.cx = function(v){ return this.getAttribute('cx'); }
		tag.prototype.setCx = function(v){ this.setAttribute('cx',v); return this; };
		
		
		tag.prototype.cy = function(v){ return this.getAttribute('cy'); }
		tag.prototype.setCy = function(v){ this.setAttribute('cy',v); return this; };
		
		
		tag.prototype.rx = function(v){ return this.getAttribute('rx'); }
		tag.prototype.setRx = function(v){ this.setAttribute('rx',v); return this; };
		
		
		tag.prototype.ry = function(v){ return this.getAttribute('ry'); }
		tag.prototype.setRy = function(v){ this.setAttribute('ry',v); return this; };
	});

})()