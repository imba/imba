(function(){
var $1;
ImbaServerDocument = imba$class(function ImbaServerDocument(){
	return this;
});
ImbaServerDocument.prototype.createElement = function (type){
	return new ImbaServerElement(type);
};
ImbaServerDocument.prototype.createElementNS = function (ns,type){
	return new ImbaServerElement(type);
};
ImbaServerDocument.prototype.createTextNode = function (value){
	return value;
};
ImbaNodeClassList = imba$class(function ImbaNodeClassList(dom,classes){
	this._classes = classes || [];
	this._dom = dom;
});
ImbaNodeClassList.prototype.add = function (flag){
	if(!(this._classes.indexOf(flag) >= 0)) {
		this._classes.push(flag);
	};
	return this;
};
ImbaNodeClassList.prototype.remove = function (flag){
	return this;
};
ImbaNodeClassList.prototype.toggle = function (flag){
	return this;
};
ImbaNodeClassList.prototype.clone = function (dom){
	var clone = new ImbaNodeClassList(dom,this._classes.slice(0));
	return clone;
};
ImbaNodeClassList.prototype.toString = function (){
	return this._classes.join(" ");
};
ImbaServerElement = imba$class(function ImbaServerElement(type){
	this._nodeType = type;
	this.classList = new ImbaNodeClassList(this);
	this;
});
ImbaServerElement.prototype.cloneNode = function (deep){
	var el = new ImbaServerElement(this._nodeType);
	el.classList = this.classList.clone(this);
	return el;
};
ImbaServerElement.prototype.appendChild = function (child){
	this._children || (this._children = []);
	this._children.push(child);
	return this;
};
ImbaServerElement.prototype.setAttribute = function (key,value){
	this._attributes || (this._attributes = []);
	this._attributes.push(("" + key + "=\"" + value + "\""));
	return this;
};
ImbaServerElement.prototype.getAttribute = function (key){
	console.log("getAttribute not implemented on server");
	return true;
};
ImbaServerElement.prototype.removeAttribute = function (key){
	console.log("removeAttribute not implemented on server");
	return true;
};
ImbaServerElement.prototype.toString = function (){
	var v;
	var typ = this._nodeType;
	var sel = ("" + typ);
	if(v = this.id) {
		sel += (" id='" + v + "'");
	};
	if(v = this.classList.toString()) {
		sel += (" class='" + v + "'");
	};
	if(v = this._attributes) {
		sel += (" " + (this._attributes.join(" ")));
	};
	
	return (this._children) ? (("<" + sel + ">" + (this._children.join("")) + "</" + typ + ">")) : ((this.textContent) ? (("<" + sel + ">" + (this.textContent) + "</" + typ + ">")) : (("<" + sel + "></" + typ + ">")));
};
Imba.doc = global.document || new ImbaServerDocument();
($1=global).document || ($1.document = Imba.doc);
}())