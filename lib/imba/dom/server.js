(function(){
	
	
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
	
	global.ImbaServerDocument = ImbaServerDocument; // global class 
	ImbaServerDocument.prototype.createElement = function (type){
		return new ImbaServerElement(type);
	};
	
	ImbaServerDocument.prototype.createElementNS = function (ns,type){
		return new ImbaServerElement(type);
	};
	
	ImbaServerDocument.prototype.createTextNode = function (value){
		return value;
	};
	
	Imba.document = function (){
		return this._document || (this._document = new ImbaServerDocument());
	};
	
	// could optimize by using a dictionary in addition to keys
	// where we cache the indexes?
	function ImbaNodeClassList(dom,classes){
		this._classes = classes || [];
		this._dom = dom;
	};
	
	global.ImbaNodeClassList = ImbaNodeClassList; // global class 
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
		this.contains(flag) ? (this.remove(flag)) : (this.add(flag));
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
	
	global.ImbaServerElement = ImbaServerElement; // global class 
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
		this.children.push(child);
		return child;
	};
	
	ImbaServerElement.prototype.insertBefore = function (node,before){
		var idx = this.children.indexOf(before);
		this.arr().splice(idx,0,node);
		return this;
	};
	
	ImbaServerElement.prototype.setAttribute = function (key,value){
		this._attributes || (this._attributes = []);
		this._attributes.push(("" + key + "=\"" + value + "\""));
		this._attributes[key] = value;
		return this;
	};
	
	ImbaServerElement.prototype.getAttribute = function (key){
		// console.log "getAttribute not implemented on server"
		return this._attributes ? (this._attributes[key]) : (undefined);
	};
	
	ImbaServerElement.prototype.removeAttribute = function (key){
		console.log("removeAttribute not implemented on server");
		return true;
	};
	
	ImbaServerElement.prototype.__innerHTML = function (){
		return this.innerHTML || this.textContent || (this.children && this.children.join("")) || '';
	};
	
	ImbaServerElement.prototype.__outerHTML = function (){
		var v;
		var typ = this.nodeName;
		var sel = ("" + typ);
		
		if (v = this.id) { sel += (" id=\"" + v + "\"") };
		if (v = this.classList.toString()) { sel += (" class=\"" + v + "\"") };
		if (v = this._attributes) { sel += (" " + this._attributes.join(" ")) };
		
		// temporary workaround for IDL attributes
		// needs support for placeholder etc
		if (v = this.placeholder) { sel += (" placeholder=\"" + v + "\"") };
		if (v = this.value) { sel += (" value=\"" + v + "\"") };
		if (this.checked) { sel += " checked" };
		if (this.disabled) { sel += " disabled" };
		if (this.required) { sel += " required" };
		if (this.readOnly) { sel += " readonly" };
		if (this.autofocus) { sel += " autofocus" };
		
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
	
	ImbaServerElement.getter('firstChild',function() {
		return this.children && this.children[0];
	});
	
	ImbaServerElement.getter('firstElementChild',function() {
		return this.children && this.children[0];
	});
	
	ImbaServerElement.getter('lastElementChild',function() {
		return this.children && this.children[this.children.length - 1];
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
	
	tag$.extendTag('element', function(tag){
		
		tag.prototype.empty = function (){
			this._dom.children = [];
			this._dom.innerHTML = null;
			this._empty = true;
			return this;
		};
		
		tag.prototype.first = function (){
			return this._dom.children[0];
		};
		
		tag.prototype.last = function (){
			return this._dom.children[this._dom.children.length - 1];
		};
		
		tag.prototype.prepend = function (item){
			return this._dom.children.unshift(item);
		};
		
		tag.prototype.toString = function (){
			return this.dom().toString();
		};
	});
	
	tag$.extendTag('html', function(tag){
		
		tag.prototype.doctype = function (){
			return this._doctype || "<!doctype html>";
		};
		
		tag.prototype.toString = function (){
			return this.doctype() + tag.__super__.toString.apply(this,arguments);
		};
	});
	
	
	// global:document ||= Imba.document

})();