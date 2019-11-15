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

Imba.document = new ImbaServerDocument();

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
	this.classes = classes || [];
	this.dom = dom;
};

ImbaNodeClassList.prototype.add = function (flag){
	if (this.classes.indexOf(flag) < 0) { this.classes.push(flag) };
	return this;
};

ImbaNodeClassList.prototype.remove = function (flag){
	// TODO implement!
	// @classes.push(flag) unless @classes.indexOf(flag) >= 0
	var idx = this.classes.indexOf(flag);
	if (idx >= 0) {
		this.classes[idx] = '';
	};
	return this;
};

ImbaNodeClassList.prototype.toggle = function (flag){
	this.contains(flag) ? this.remove(flag) : this.add(flag);
	return this;
};

ImbaNodeClassList.prototype.contains = function (flag){
	return this.classes.indexOf(flag) >= 0;
};

ImbaNodeClassList.prototype.clone = function (dom){
	var clone = new ImbaNodeClassList(dom,this.classes.slice(0));
	return clone;
};

ImbaNodeClassList.prototype.toString = function (){
	// beware of perf
	return this.classes.join(" ").trim();
};

function CSSStyleDeclaration(dom){
	this.dom = dom;
	this;
};

CSSStyleDeclaration.prototype.removeProperty = function (key){
	var v_;
	return (((v_ = this[key]),delete this[key], v_));
};

CSSStyleDeclaration.prototype.setProperty = function (name,value){
	return this[name] = value;
};

CSSStyleDeclaration.prototype.toString = function (){
	var items = [];
	for (let o = this, v, i = 0, keys = Object.keys(o), l = keys.length, k; i < l; i++){
		k = keys[i];v = o[k];if (k[0] != '_') {
			items.push(("" + k + ": " + v));
		};
	};
	return items.join(';');
};

function ImbaServerCommentNode(value){
	this.value = value;
};

Object.defineProperty(ImbaServerCommentNode.prototype,'outerHTML',{get: function(){
	return ("<!-- " + escapeTextContent(this.value) + " -->");
}, configurable: true});

ImbaServerCommentNode.prototype.toString = function (){
	if (this.tag && this.tag.toNodeString) {
		return this.tag.toNodeString();
	};
	return this.outerHTML;
};


function ImbaServerElement(type){
	// slowing things down -- be careful
	// should only need to copy from the outer element
	// when we optimize - do it some other way
	// should somehow be linked to their owner, no?
	this.nodeName = type;
	this.classList = new ImbaNodeClassList(this);
	this.children = [];
	
	this;
};

exports.ImbaServerElement = ImbaServerElement; // export class 
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
	this.classList = this.classList.clone(this);
	// FIXME clone the attributes as well
	// el:className = self:className
	return el;
};

ImbaServerElement.prototype.appendChild = function (child){
	// again, could be optimized much more
	if (typeof child === 'string') {
		this.children.push(escapeTextContent(child,this.nodeName));
	} else {
		this.children.push(child);
	};
	
	return child;
};

ImbaServerElement.prototype.appendNested = function (child){
	if (child instanceof Array) {
		for (let i = 0, items = iter$(child), len = items.length; i < len; i++) {
			this.appendNested(items[i]);
		};
	} else if (child != null && child != undefined) {
		this.appendChild(child.slot_ || child);
	};
	return;
};

ImbaServerElement.prototype.insertBefore = function (node,before){
	var idx = this.children.indexOf(before);
	this.children.splice(idx,0,node);
	return this;
};

ImbaServerElement.prototype.setAttribute = function (key,value){
	var attributes_, attrmap_;
	(attributes_ = this.attributes) || (this.attributes = []);
	(attrmap_ = this.attrmap) || (this.attrmap = {});
	
	let idx = this.attrmap[key];
	let str = ("" + key + "=\"" + escapeAttributeValue(value) + "\"");
	
	if (idx != null) {
		this.attributes[idx] = str;
	} else {
		this.attributes.push(str);
		this.attrmap[key] = this.attributes.length - 1;
	};
	
	this.attributes[key] = value;
	return this;
};

ImbaServerElement.prototype.setAttributeNS = function (ns,key,value){
	return this.setAttribute(ns + ':' + key,value);
};

ImbaServerElement.prototype.getAttribute = function (key){
	// console.log "getAttribute not implemented on server"
	return this.attributes ? this.attributes[key] : undefined;
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
	if (this.tag && this.resolvedChildren != this.tag.__slots_) {
		var content = this.tag.__slots_;
		this.resolvedChildren = content;
		this.children = [];
		this.appendNested(content);
	};
	return this;
};

Object.defineProperty(ImbaServerElement.prototype,'innerHTML',{set: function(value){
	return this.__innerHTML = value;
}, configurable: true});

Object.defineProperty(ImbaServerElement.prototype,'innerHTML',{get: function(){
	var o = "";
	for (let i = 0, items = iter$(this.tag.__slots_), len = items.length, item; i < len; i++) {
		item = items[i];
		if ((typeof item=='string'||item instanceof String)) {
			o += escapeTextContent(item,this.nodeName);
		} else if ((typeof item=='number'||item instanceof Number)) {
			o += "" + item;
		} else if (item) {
			o += item.outerHTML;
		};
	};
	return o;
	// self.resolve()
	// return #innerHTML || (self.textContent and escapeTextContent(self.textContent,self.nodeName)) || (self.children and self.children.join("")) or ''
}, configurable: true});

Object.defineProperty(ImbaServerElement.prototype,'outerHTML',{get: function(){
	var v;
	var typ = this.nodeName;
	var sel = ("" + typ);
	
	if (v = this.id) { sel += (" id=\"" + escapeAttributeValue(v) + "\"") };
	if (v = this.classList.toString()) { sel += (" class=\"" + escapeAttributeValue(v) + "\"") };
	if (v = this.attributes) { sel += (" " + this.attributes.join(" ")) };
	
	// temporary workaround for IDL attributes
	// needs support for placeholder etc
	if (v = this.placeholder) { sel += (" placeholder=\"" + escapeAttributeValue(v) + "\"") };
	if (v = this.value) { sel += (" value=\"" + escapeAttributeValue(v) + "\"") };
	if (this.checked) { sel += " checked" };
	if (this.disabled) { sel += " disabled" };
	if (this.required) { sel += " required" };
	if (this.readOnly) { sel += " readonly" };
	if (this.autofocus) { sel += " autofocus" };
	
	// console.log("generating outer html",sel)
	
	if (this.__style) {
		sel += (" style=\"" + escapeAttributeValue(this.__style.toString()) + "\"");
	};
	
	if (voidElements[typ]) {
		return ("<" + sel + ">");
	} else {
		return ("<" + sel + ">" + (this.innerHTML) + "</" + typ + ">");
	};
}, configurable: true});

// def toString
// 	if self.tag and self.tag.toNodeString
// 		# console.log "tag has custom string {@nodeType}" # ,self:children
// 		return self.tag.toNodeString()
// 		# return @tag.toNodeString
// 	self.outerHTML

Object.defineProperty(ImbaServerElement.prototype,'children',{set: function(value){
	return this.__children = value;
}, configurable: true});

Object.defineProperty(ImbaServerElement.prototype,'children',{get: function(){
	this.resolve();
	return this.__children;
}, configurable: true});

Object.defineProperty(ImbaServerElement.prototype,'firstChild',{get: function(){
	return this.children[0];
}, configurable: true});

Object.defineProperty(ImbaServerElement.prototype,'firstElementChild',{get: function(){
	return this.children[0];
}, configurable: true});

Object.defineProperty(ImbaServerElement.prototype,'lastElementChild',{get: function(){
	return this.children[this.children.length - 1];
}, configurable: true});

Object.defineProperty(ImbaServerElement.prototype,'style',{get: function(){
	return this.__style || (this.__style = new CSSStyleDeclaration(this));
}, configurable: true});

Object.defineProperty(ImbaServerElement.prototype,'className',{get: function(){
	return this.classList.toString();
}, configurable: true});

Object.defineProperty(ImbaServerElement.prototype,'className',{set: function(value){
	this.classList.classes = (value || '').split(' ');
	return this.classList.toString();
}, configurable: true});


Imba.createTagScope(/*SCOPEID*/).extendTag('element', function(tag){
	
	tag.prototype.removeAllChildren = function (){
		this.dom.children = [];
		this.dom.innerHTML = null;
		this.__tree_ = this.__text_ = null;
		return this;
	};
	
	tag.prototype.toString = function (){
		return this.dom.outerHTML;
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('html', function(tag){
	
	tag.prototype.doctype = function (){
		return this.doctype || "<!doctype html>";
	};
	
	tag.prototype.toString = function (){
		return this.doctype + tag.prototype.__super__.toString.apply(this,arguments);
	};
});

