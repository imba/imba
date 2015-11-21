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
			if (cls) { dom.className.baseVal = cls };
			return dom;
		};
		
		tag.inherit = function (child){
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
		
		
		
		tag.prototype.__x = {inline: false,name: 'x'};
		tag.prototype.x = function(v){ return this.getAttribute('x'); }
		tag.prototype.setX = function(v){ this.setAttribute('x',v); return this; };
		
		tag.prototype.__y = {inline: false,name: 'y'};
		tag.prototype.y = function(v){ return this.getAttribute('y'); }
		tag.prototype.setY = function(v){ this.setAttribute('y',v); return this; };
		
		
		tag.prototype.__width = {inline: false,name: 'width'};
		tag.prototype.width = function(v){ return this.getAttribute('width'); }
		tag.prototype.setWidth = function(v){ this.setAttribute('width',v); return this; };
		
		tag.prototype.__height = {inline: false,name: 'height'};
		tag.prototype.height = function(v){ return this.getAttribute('height'); }
		tag.prototype.setHeight = function(v){ this.setAttribute('height',v); return this; };
		
		
		tag.prototype.__stroke = {inline: false,name: 'stroke'};
		tag.prototype.stroke = function(v){ return this.getAttribute('stroke'); }
		tag.prototype.setStroke = function(v){ this.setAttribute('stroke',v); return this; };
		
		tag.prototype.__strokeWidth = {inline: false,name: 'strokeWidth'};
		tag.prototype.strokeWidth = function(v){ return this.getAttribute('stroke-width'); }
		tag.prototype.setStrokeWidth = function(v){ this.setAttribute('stroke-width',v); return this; };
	});
	
	Imba.TAGS.SVG.defineTag('svg', function(tag){
		
		tag.prototype.__viewbox = {inline: false,name: 'viewbox'};
		tag.prototype.viewbox = function(v){ return this.getAttribute('viewbox'); }
		tag.prototype.setViewbox = function(v){ this.setAttribute('viewbox',v); return this; };
	});
	
	Imba.TAGS.SVG.defineTag('rect');
	
	Imba.TAGS.SVG.defineTag('circle', function(tag){
		
		tag.prototype.__cx = {inline: false,name: 'cx'};
		tag.prototype.cx = function(v){ return this.getAttribute('cx'); }
		tag.prototype.setCx = function(v){ this.setAttribute('cx',v); return this; };
		
		tag.prototype.__cy = {inline: false,name: 'cy'};
		tag.prototype.cy = function(v){ return this.getAttribute('cy'); }
		tag.prototype.setCy = function(v){ this.setAttribute('cy',v); return this; };
		
		tag.prototype.__r = {inline: false,name: 'r'};
		tag.prototype.r = function(v){ return this.getAttribute('r'); }
		tag.prototype.setR = function(v){ this.setAttribute('r',v); return this; };
	});
	
	Imba.TAGS.SVG.defineTag('ellipse', function(tag){
		
		tag.prototype.__cx = {inline: false,name: 'cx'};
		tag.prototype.cx = function(v){ return this.getAttribute('cx'); }
		tag.prototype.setCx = function(v){ this.setAttribute('cx',v); return this; };
		
		tag.prototype.__cy = {inline: false,name: 'cy'};
		tag.prototype.cy = function(v){ return this.getAttribute('cy'); }
		tag.prototype.setCy = function(v){ this.setAttribute('cy',v); return this; };
		
		tag.prototype.__rx = {inline: false,name: 'rx'};
		tag.prototype.rx = function(v){ return this.getAttribute('rx'); }
		tag.prototype.setRx = function(v){ this.setAttribute('rx',v); return this; };
		
		tag.prototype.__ry = {inline: false,name: 'ry'};
		tag.prototype.ry = function(v){ return this.getAttribute('ry'); }
		tag.prototype.setRy = function(v){ this.setAttribute('ry',v); return this; };
	});
	
	Imba.TAGS.SVG.defineTag('path', function(tag){
		
		tag.prototype.__d = {inline: false,name: 'd'};
		tag.prototype.d = function(v){ return this.getAttribute('d'); }
		tag.prototype.setD = function(v){ this.setAttribute('d',v); return this; };
		
		tag.prototype.__pathLength = {inline: false,name: 'pathLength'};
		tag.prototype.pathLength = function(v){ return this.getAttribute('pathLength'); }
		tag.prototype.setPathLength = function(v){ this.setAttribute('pathLength',v); return this; };
	});
	
	return Imba.TAGS.SVG.defineTag('line', function(tag){
		
		tag.prototype.__x1 = {inline: false,name: 'x1'};
		tag.prototype.x1 = function(v){ return this.getAttribute('x1'); }
		tag.prototype.setX1 = function(v){ this.setAttribute('x1',v); return this; };
		
		tag.prototype.__x2 = {inline: false,name: 'x2'};
		tag.prototype.x2 = function(v){ return this.getAttribute('x2'); }
		tag.prototype.setX2 = function(v){ this.setAttribute('x2',v); return this; };
		
		tag.prototype.__y1 = {inline: false,name: 'y1'};
		tag.prototype.y1 = function(v){ return this.getAttribute('y1'); }
		tag.prototype.setY1 = function(v){ this.setAttribute('y1',v); return this; };
		
		tag.prototype.__y2 = {inline: false,name: 'y2'};
		tag.prototype.y2 = function(v){ return this.getAttribute('y2'); }
		tag.prototype.setY2 = function(v){ this.setAttribute('y2',v); return this; };
	});

})()