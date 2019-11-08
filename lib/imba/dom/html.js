function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

Imba.createTagScope(/*SCOPEID*/).defineTag('fragment', 'element', function(tag){
	tag.createNode = function (){
		return Imba.document.createDocumentFragment();
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('html', function(tag){
	tag.prototype.parent = function (){
		return null;
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('canvas', function(tag){
	tag.prototype.context = function (type){
		if(type === undefined) type = '2d';
		return this.dom.getContext(type);
	};
});

function DataProxy(node,path,args){
	this.node = node;
	this.path = path;
	this.args = args;
	if (this.args) { this.setter = Imba.toSetter(this.path) };
};

DataProxy.bind = function (receiver,data,path,args){
	let proxy = receiver.data || (receiver.data = new this(receiver,path,args));
	proxy.bind(data,path,args);
	return receiver;
};

DataProxy.prototype.bind = function (data,key,args){
	if (data != this.data) {
		this.data = data;
	};
	return this;
};

DataProxy.prototype.getFormValue = function (){
	return this.setter ? this.data[this.path]() : this.data[this.path];
};

DataProxy.prototype.setFormValue = function (value){
	return this.setter ? this.data[this.setter](value) : ((this.data[this.path] = value));
};

var isArray = function(val) {
	return val && val.splice && val.sort;
};

var isSimilarArray = function(a,b) {
	let l = a.length,i = 0;
	if (l != b.length) { return false };
	while (i++ < l){
		if (a[i] != b[i]) { return false };
	};
	return true;
};

Imba.createTagScope(/*SCOPEID*/).extendTag('input', function(tag){
	Object.defineProperty(tag.prototype,'lazy',{
		configurable: true,
		get: function(){ return this._lazy; },
		set: function(v){ this._lazy = v; }
	});
	Object.defineProperty(tag.prototype,'number',{
		configurable: true,
		get: function(){ return this._number; },
		set: function(v){ this._number = v; }
	});
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	Object.defineProperty(tag.prototype,'checked',{get: function(){
		return this.dom.checked;
	}, configurable: true});
	
	Object.defineProperty(tag.prototype,'checked',{set: function(value){
		if (!!value != this.dom.checked) {
			this.dom.checked = !!value;
		};
		return this;
	}, configurable: true});
	
	// TODO rewrite to getset
	tag.prototype.setValue = function (value,source){
		if (this.localValue == undefined || source == undefined) {
			this.dom.value = this.value = value;
			this.localValue = undefined;
		};
		return this;
	};
	
	// def setType value
	// 	@dom:type = @type = value
	// 	self
	
	tag.prototype.value = function (){
		return (this.dom.type == 'number') ? parseFloat(this.dom.value || 0) : this.dom.value;
	};
	
	tag.prototype.oninput = function (e){
		let val = this.dom.value;
		this.localValue = val;
		if (this.data && !this.lazy && this.dom.type != 'radio' && this.dom.type != 'checkbox') {
			this.data.setFormValue(this.value(),this); // TODO value is function
		};
		return;
	};
	
	tag.prototype.onchange = function (e){
		this.modelValue = this.localValue = undefined;
		if (!this.data) { return };
		
		let type = this.dom.type;
		
		if (type == 'radio' || type == 'checkbox') {
			let checked = this.checked;
			let mval = this.data.getFormValue(this);
			let dval = (this.__value != undefined) ? this.__value : this.value();
			
			if (type == 'radio') {
				return this.data.setFormValue(dval,this);
			} else if (this.dom.value == 'on' || this.dom.value == undefined) {
				return this.data.setFormValue(!!checked,this);
			} else if (isArray(mval)) {
				let idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!checked && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this.data.setFormValue(dval,this);
			};
		} else {
			return this.data.setFormValue(this.value());
		};
	};
	
	tag.prototype.onblur = function (e){
		return this.localValue = undefined;
	};
	
	// overriding end directly for performance
	tag.prototype.end = function (){
		if (this.localValue !== undefined || !this.data) {
			return this;
		};
		
		let mval = this.data.getFormValue(this);
		if (mval === this.modelValue) { return this };
		if (!isArray(mval)) { this.modelValue = mval };
		
		if (this.dom.type == 'radio' || this.dom.type == 'checkbox') {
			let dval = this.value();
			let checked = isArray(mval) ? (
				mval.indexOf(dval) >= 0
			) : ((this.dom.value == 'on' || this.dom.value == undefined) ? (
				!!mval
			) : (
				mval == this.value
			));
			
			this.checked = checked;
		} else {
			this.dom.value = mval;
		};
		return this;
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('textarea', function(tag){
	Object.defineProperty(tag.prototype,'lazy',{
		configurable: true,
		get: function(){ return this._lazy; },
		set: function(v){ this._lazy = v; }
	});
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value,source){
		if (this.localValue == undefined || source == undefined) {
			this.dom.value = value;
			this.localValue = undefined;
		};
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this.dom.value;
		this.localValue = val;
		if (this.data && !this.lazy) { return this.data.setFormValue(this.value,this) };
	};
	
	tag.prototype.onchange = function (e){
		this.localValue = undefined;
		if (this.data) { return this.data.setFormValue(this.value,this) };
	};
	
	tag.prototype.onblur = function (e){
		return this.localValue = undefined;
	};
	
	tag.prototype.render = function (){
		if (this.localValue != undefined || !this.data) { return };
		if (this.data) {
			let dval = this.data.getFormValue(this);
			this.dom.value = (dval != undefined) ? dval : '';
		};
		return this;
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('option', function(tag){
	Object.defineProperty(tag.prototype,'value',{set: function(value){
		if (value != this.__value) {
			this.dom.value = this.__value = value;
		};
		return this;
	}, configurable: true});
	
	Object.defineProperty(tag.prototype,'value',{get: function(){
		return this.__value || this.dom.value;
	}, configurable: true});
});

Imba.createTagScope(/*SCOPEID*/).extendTag('select', function(tag){
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	Object.defineProperty(tag.prototype,'value',{set: function(value,syncing){
		let prev = this.__value;
		this.__value = value;
		if (!this.__syncing) { this.syncValue(value) };
		return this;
	}, configurable: true});
	
	tag.prototype.syncValue = function (value){
		let prev = this.__syncedValue;
		// check if value has changed
		if (this.dom.multiple && (value instanceof Array)) {
			if ((prev instanceof Array) && isSimilarArray(prev,value)) {
				return this;
			};
			// create a copy for syncValue
			value = value.slice();
		};
		
		this.__syncedValue = value;
		
		// support array for multiple?
		if (typeof value == 'object') {
			let mult = this.dom.multiple && (value instanceof Array);
			
			for (let i = 0, items = iter$(this.dom.options), len = items.length, opt; i < len; i++) {
				opt = items[i];
				let oval = (opt.tag ? opt.tag.value : opt.value);
				if (mult) {
					opt.selected = value.indexOf(oval) >= 0;
				} else if (value == oval) {
					this.dom.selectedIndex = i;
					break;
				};
			};
		} else {
			this.dom.value = value;
		};
		return this;
	};
	
	Object.defineProperty(tag.prototype,'value',{get: function(){
		if (this.dom.multiple) {
			let res = [];
			for (let i = 0, items = iter$(this.dom.selectedOptions), len = items.length, option; i < len; i++) {
				option = items[i];
				res.push(option.tag ? option.tag.value : option.value);
			};
			return res;
		} else {
			let opt = this.dom.selectedOptions[0];
			return opt ? ((opt.tag ? opt.tag.value : opt.value)) : null;
		};
	}, configurable: true});
	
	tag.prototype.onchange = function (e){
		if (this.data) { return this.data.setFormValue(this.value,this) };
	};
	
	tag.prototype.end = function (){
		if (this.data) {
			this.__syncing = true;
			this.value = this.data.getFormValue(this);
			this.__syncing = false;
		};
		
		if (this.value != this.__syncedValue) {
			this.syncValue(this.value);
		};
		return this;
	};
});
