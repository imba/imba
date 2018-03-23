function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

// TODO classes should not be global,
// rather imported where they are needed

var voidElements = {
	area: true,
	base: true,
	br: true,
	col: true,
	embed: true,
	hr: true,
	img: true,
	input: true,
	keygen: true,
	link: true,
	meta: true,
	param: true,
	source: true,
	track: true,
	wbr: true
};

// could create a fake document 
function ImbaServerDocument(){ };

ImbaServerDocument.prototype.createElement = function (type){
	return new ImbaServerElement(type);
};

ImbaServerDocument.prototype.createElementNS = function (ns,type){
	return new ImbaServerElement(type);
};

ImbaServerDocument.prototype.createTextNode = function (value){
	return value;
};

ImbaServerDocument.prototype.createComment = function (value){
	return new ImbaServerCommentNode(value);
};

Imba.document = function (){
	return this._document || (this._document = new ImbaServerDocument());
};

var escapeAttributeValue = function(val) {
	var str = (typeof val == 'string') ? val : String(val);
	if (str.indexOf('"') >= 0) {
		str = str.replace(/\"/g,"&quot;");
	};
	return str;
};

var escapeTextContent = function(val,nodeName) {
	var str = (typeof val == 'string') ? val : String(val);
	
	if (nodeName == 'script') {
		return str;
	};
	
	if (str.indexOf('"') >= 0) {
		str = str.replace(/\"/g,"&quot;");
	};
	if (str.indexOf('<') >= 0) {
		str = str.replace(/\</g,"&lt;");
	};
	if (str.indexOf('>') >= 0) {
		str = str.replace(/\>/g,"&gt;");
	};
	return str;
};

// could optimize by using a dictionary in addition to keys
// where we cache the indexes?
function ImbaNodeClassList(dom,classes){
	this._classes = classes || [];
	this._dom = dom;
};

ImbaNodeClassList.prototype.add = function (flag){
	if (this._classes.indexOf(flag) < 0) { this._classes.push(flag) };
	return this;
};

ImbaNodeClassList.prototype.remove = function (flag){
	// TODO implement!
	// @classes.push(flag) unless @classes.indexOf(flag) >= 0
	var idx = this._classes.indexOf(flag);
	if (idx >= 0) {
		this._classes[idx] = '';
	};
	return this;
};

ImbaNodeClassList.prototype.toggle = function (flag){
	this.contains(flag) ? this.remove(flag) : this.add(flag);
	return this;
};

ImbaNodeClassList.prototype.contains = function (flag){
	return this._classes.indexOf(flag) >= 0;
};

ImbaNodeClassList.prototype.clone = function (dom){
	var clone = new ImbaNodeClassList(dom,this._classes.slice(0));
	return clone;
};

ImbaNodeClassList.prototype.toString = function (){
	// beware of perf
	return this._classes.join(" ").trim();
};

function CSSStyleDeclaration(dom){
	this._dom = dom;
	this;
};

CSSStyleDeclaration.prototype.removeProperty = function (key){
	var v_;
	return (((v_ = this[key]),delete this[key], v_));
};

CSSStyleDeclaration.prototype.toString = function (){
	var items = [];
	for (var o = this, v, i = 0, keys = Object.keys(o), l = keys.length, k; i < l; i++){
		k = keys[i];v = o[k];if (k[0] != '_') {
			items.push(("" + k + ": " + v));
		};
	};
	return items.join(';');
};

function ImbaServerCommentNode(value){
	this._value = value;
};

ImbaServerCommentNode.prototype.__outerHTML = function (){
	return ("<!-- " + escapeTextContent(this._value) + " -->");
};

ImbaServerCommentNode.prototype.toString = function (){
	if (this._tag && this._tag.toNodeString) {
		return this._tag.toNodeString();
	};
	return this.__outerHTML();
};


function ImbaServerElement(type){
	// slowing things down -- be careful
	// should only need to copy from the outer element
	// when we optimize - do it some other way
	// should somehow be linked to their owner, no?
	this.nodeName = type;
	this.classList = new ImbaNodeClassList(this);
	this._children = [];
	
	this;
};

ImbaServerElement.getter = function (name,fn){
	return Object.defineProperty(this.prototype,name,{
		get: fn,
		enumerable: true,
		configurable: true
	});
};

ImbaServerElement.prototype.cloneNode = function (deep){
	// need to include classes as well
	var el = new ImbaServerElement(this.nodeName);
	el.classList = this.classList.clone(this);
	// FIXME clone the attributes as well
	// el:className = self:className
	return el;
};

ImbaServerElement.prototype.appendChild = function (child){
	// again, could be optimized much more
	if (typeof child === 'string') {
		this._children.push(escapeTextContent(child,this.nodeName));
	} else {
		this._children.push(child);
	};
	
	return child;
};

ImbaServerElement.prototype.appendNested = function (child){
	if (child instanceof Array) {
		for (var i = 0, items = iter$(child), len = items.length; i < len; i++) {
			this.appendNested(items[i]);
		};
	} else if (child != null && child != undefined) {
		this.appendChild(child._slot_ || child);
	};
	return;
};

ImbaServerElement.prototype.insertBefore = function (node,before){
	var idx = this._children.indexOf(before);
	this.arr().splice(idx,0,node);
	return this;
};

ImbaServerElement.prototype.setAttribute = function (key,value){
	this._attributes || (this._attributes = []);
	this._attrmap || (this._attrmap = {});
	
	var idx = this._attrmap[key];
	var str = ("" + key + "=\"" + escapeAttributeValue(value) + "\"");
	
	if (idx != null) {
		this._attributes[idx] = str;
	} else {
		this._attributes.push(str);
		this._attrmap[key] = this._attributes.length - 1;
	};
	
	this._attributes[key] = value;
	return this;
};

ImbaServerElement.prototype.setAttributeNS = function (ns,key,value){
	return this.setAttribute(ns + ':' + key,value);
};

ImbaServerElement.prototype.getAttribute = function (key){
	// console.log "getAttribute not implemented on server"
	return this._attributes ? this._attributes[key] : undefined;
};

ImbaServerElement.prototype.getAttributeNS = function (ns,key){
	return this.getAttribute(ns + ':' + key);
};

ImbaServerElement.prototype.removeAttribute = function (key){
	console.log("removeAttribute not implemented on server");
	return true;
};

// noop
ImbaServerElement.prototype.addEventListener = function (){
	return this;
};

// noop
ImbaServerElement.prototype.removeEventListener = function (){
	return this;
};

ImbaServerElement.prototype.resolve = function (){
	if (this._tag && this._resolvedChildren != this._tag._tree_) {
		var content = this._tag._tree_;
		this._resolvedChildren = content;
		this._children = [];
		this.appendNested(content);
	};
	return this;
};

ImbaServerElement.prototype.__innerHTML = function (){
	this.resolve();
	return this.innerHTML || (this.textContent && escapeTextContent(this.textContent,this.nodeName)) || (this._children && this._children.join("")) || '';
};

ImbaServerElement.prototype.__outerHTML = function (){
	var v;
	var typ = this.nodeName;
	var sel = ("" + typ);
	
	if (v = this.id) { sel += (" id=\"" + escapeAttributeValue(v) + "\"") };
	if (v = this.classList.toString()) { sel += (" class=\"" + escapeAttributeValue(v) + "\"") };
	if (v = this._attributes) { sel += (" " + this._attributes.join(" ")) };
	
	// temporary workaround for IDL attributes
	// needs support for placeholder etc
	if (v = this.placeholder) { sel += (" placeholder=\"" + escapeAttributeValue(v) + "\"") };
	if (v = this.value) { sel += (" value=\"" + escapeAttributeValue(v) + "\"") };
	if (this.checked) { sel += " checked" };
	if (this.disabled) { sel += " disabled" };
	if (this.required) { sel += " required" };
	if (this.readOnly) { sel += " readonly" };
	if (this.autofocus) { sel += " autofocus" };
	
	if (this._style) {
		sel += (" style=\"" + escapeAttributeValue(this._style) + "\"");
	};
	
	if (voidElements[typ]) {
		return ("<" + sel + ">");
	} else {
		return ("<" + sel + ">" + this.__innerHTML() + "</" + typ + ">");
	};
};

ImbaServerElement.prototype.toString = function (){
	if (this._tag && this._tag.toNodeString) {
		// console.log "tag has custom string {@nodeType}" # ,self:children
		return this._tag.toNodeString();
		// return @tag.toNodeString
	};
	return this.__outerHTML();
};

ImbaServerElement.getter('outerHTML',function() {
	return this.__outerHTML();
});

ImbaServerElement.getter('children',function() {
	this.resolve();
	return this._children;
});

ImbaServerElement.getter('firstChild',function() { return this.children[0]; });
ImbaServerElement.getter('firstElementChild',function() { return this.children[0]; });
ImbaServerElement.getter('lastElementChild',function() { return this.children[this.children.length - 1]; });

ImbaServerElement.getter('style',function() {
	return this._style || (this._style = new CSSStyleDeclaration(this));
});

var el = ImbaServerElement.prototype;

Object.defineProperty(el,'className',{enumerable: true,
configurable: true,

get: function() {
	return this.classList.toString();
},

set: function(v) {
	this.classList._classes = (v || '').split(' ');
	return this.classList.toString();
}});

Imba.extendTag('element', function(tag){
	
	tag.prototype.removeAllChildren = function (){
		this._dom.children = [];
		this._dom.innerHTML = null;
		this._tree_ = this._text_ = null;
		return this;
	};
	
	tag.prototype.toString = function (){
		return this._slot_.toString();
	};
});

Imba.extendTag('html', function(tag){
	
	tag.prototype.doctype = function (){
		return this._doctype || "<!doctype html>";
	};
	
	tag.prototype.toString = function (){
		return this.doctype() + tag.prototype.__super__.toString.apply(this,arguments);
	};
});

