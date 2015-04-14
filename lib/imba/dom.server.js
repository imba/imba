(function(){


	var $1;
	// could create a fake document 
	/* @class ImbaServerDocument */
	function ImbaServerDocument(){ };
	
	global.ImbaServerDocument = ImbaServerDocument; // global class 
	ImbaServerDocument.prototype.createElement = function (type){
		return new ImbaServerElement(type);
	};
	
	ImbaServerDocument.prototype.createElementNS = function (ns,type){
		return new ImbaServerElement(type);
	};
	
	ImbaServerDocument.prototype.createTextNode = function (value){
		return value;// hmm
	};
	
	
	
	// could optimize by using a dictionary in addition to keys
	// where we cache the indexes?
	/* @class ImbaNodeClassList */
	function ImbaNodeClassList(dom,classes){
		this._classes = classes || [];
		this._dom = dom;
	};
	
	global.ImbaNodeClassList = ImbaNodeClassList; // global class 
	
	
	ImbaNodeClassList.prototype.add = function (flag){
		if(!(this._classes.indexOf(flag) >= 0)) {
			this._classes.push(flag);
		};
		return this;
	};
	
	ImbaNodeClassList.prototype.remove = function (flag){
		// TODO implement!
		// @classes.push(flag) unless @classes.indexOf(flag) >= 0
		var idx = this._classes.indexOf(flag);
		if(idx >= 0) {
			this._classes[idx] = '';
		};
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
	
	
	
	/* @class ImbaServerElement */
	function ImbaServerElement(type){
		// slowing things down -- be careful
		// should only need to copy from the outer element
		// when we optimize - do it some other way
		
		// should somehow be linked to their owner, no?
		this._nodeType = type;
		this.nodeName = type;
		this.classList = new ImbaNodeClassList(this);
		this;
	};
	
	global.ImbaServerElement = ImbaServerElement; // global class 
	
	
	ImbaServerElement.prototype.cloneNode = function (deep){
		// need to include classes as well
		var el = new ImbaServerElement(this._nodeType);
		el.classList = this.classList.clone(this);
		// FIXME clone the attributes as well
		// el:className = self:className
		return el;
	};
	
	ImbaServerElement.prototype.appendChild = function (child){
		// again, could be optimized much more
		this.children || (this.children = []);
		return this.children.push(child);// hmmmm
	};
	
	// should implement at some point
	// should also use shortcut to wipe
	// def firstChild
	// 	nil
	// 
	// def removeChild
	// 	nil
	
	ImbaServerElement.prototype.setAttribute = function (key,value){
		this._attributes || (this._attributes = []);
		this._attributes.push(("" + key + "=\"" + value + "\""));
		this._attributes[key] = value;
		return this;
	};
	
	ImbaServerElement.prototype.getAttribute = function (key){
		// console.log "getAttribute not implemented on server"
		return (this._attributes) ? (this._attributes[key]) : (undefined);
	};
	
	ImbaServerElement.prototype.removeAttribute = function (key){
		console.log("removeAttribute not implemented on server");
		return true;
	};
	
	ImbaServerElement.prototype.__innerHTML = function (){
		var ary;
		return this.innerHTML || this.textContent || (this.children && this.children.join("")) || '';
		// hmmm
		var str = this.innerHTML || this.textContent || '';
		if(str) {
			return str;
		};
		
		if(ary = this.children) {
			var i = 0;
			var l = ary.length;
			var item;
			while(i < l){
				if(item = ary[i++]) {
					str += item.toString();
				};
			};
		};
		
		return str;
	};
	
	ImbaServerElement.prototype.__outerHTML = function (){
		var v;
		var typ = this._nodeType;
		var sel = ("" + typ);
		// difficult with all the attributes etc?
		// iterating through keys is slow (as tested) -
		// the whole point is to not need this on the server either
		// but it can surely be fixed later
		// and what if we use classList etc?
		// we do instead want to make it happen directly
		// better to use setAttribute or something, so we can get the
		// order and everything. It might not even matter though - fast
		// no matter what.
		if(v = this.id) {
			sel += (" id='" + v + "'");
		};
		if(v = this.classList.toString()) {
			sel += (" class='" + v + "'");
		};
		if(v = this._attributes) {
			sel += (" " + (this._attributes.join(" ")));
		};
		
		// var inner = self:innerHTML || self:textContent || (self:children and self:children.join("")) or ''
		return ("<" + sel + ">" + this.__innerHTML() + "</" + typ + ">");// hmm
		// if self:innerHTML
		// 
		// if self:children
		// 	"<{sel}>{inner}</{typ}>"
		// elif self:textContent
		// 	"<{sel}>{self:textContent}</{typ}>"
		// # what about self-closing?
		// else
		// 	"<{sel}></{typ}>"
	};
	
	ImbaServerElement.prototype.toString = function (){
		if(this._tag && this._tag.toNodeString) {
			// console.log "tag has custom string {@nodeType}" # ,self:children
			return this._tag.toNodeString();
			// return @tag.toNodeString
		};
		return this.__outerHTML();
	};
	
	
	
		
		IMBA_TAGS.htmlelement.prototype.toString = function (){
			return this.dom().toString();// hmmm
		};
	
	
	
		
		IMBA_TAGS.html.prototype.doctype = function (){
			return this._doctype || "<!doctype html>";
		};
		
		IMBA_TAGS.html.prototype.toString = function (){
			return this.doctype() + IMBA_TAGS.html.__super__.toString.apply(this,arguments);
			// <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
		};
	
	
	
		
		IMBA_TAGS.style.prototype.toString = function (){
			return "<style/>";
		};
	
	
	// hmm
	Imba.doc = global.document || new ImbaServerDocument();
	($1=global).document || ($1.document = Imba.doc);


}())