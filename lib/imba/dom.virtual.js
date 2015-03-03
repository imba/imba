(function(){
IMBA_TAGS.htmlelement.prototype.setChildren = function (nodes){
	var al, bl;
	var prev = this._children;
	
	if((typeof nodes=='string'||nodes instanceof String) || (typeof nodes=='number'||nodes instanceof Number)) {
		this.setText(nodes);
		return this;
	};
	if(prev != null) {
		if(nodes == prev) {
			return this;
		};
		
		var aa = (prev instanceof Array);
		var ba = (nodes instanceof Array);
		
		if(!aa && !ba) {
			IMBA_TAGS.htmlelement.prototype.__super.setChildren.apply(this,arguments);
		} else {
			if(aa && ba) {
				var al = prev.length, bl = nodes.length;
				var l = Math.max(al,bl);
				var i = 0;
				
				var a, b;
				while(i < l){
					var a = prev[i], b = nodes[i];
					if(b && b != a) {
						this.append(b);
						if(a) {
							this.remove(a);
						};
					} else {
						if(a && a != b) {
							this.remove(a);
							true;
						}
					};
					i++;
				};
			} else {
				console.log("was array - is single -- confused=!!!!");
				this.empty();
				IMBA_TAGS.htmlelement.prototype.__super.setChildren.apply(this,arguments);
			}
		};
	} else {
		this.empty();
		IMBA_TAGS.htmlelement.prototype.__super.setChildren.apply(this,arguments);
	};
	this._children = nodes;
	return this;
};
IMBA_TAGS.htmlelement.prototype.content = function (){
	return this._content || this.children().toArray();
};
IMBA_TAGS.htmlelement.prototype.setText = function (text){
	if(text != this._children) {
		this.dom().textContent = this._children = text;
	};
	return this;
};
}())