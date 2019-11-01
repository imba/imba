function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

Imba.createTagScope(/*SCOPEID*/).defineTag('fragment', 'element', function(tag){
	tag.createNode = function (){
		return Imba.document().createDocumentFragment();
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
		return this.dom().getContext(type);
	};
});

function DataProxy(node,path,args){
	this._node = node;
	this._path = path;
	this._args = args;
	if (this._args) { this._setter = Imba.toSetter(this._path) };
};

DataProxy.bind = function (receiver,data,path,args){
	var proxy = receiver._data || (receiver._data = new this(receiver,path,args));
	proxy.bind(data,path,args);
	return receiver;
};

DataProxy.prototype.bind = function (data,key,args){
	if (data != this._data) {
		this._data = data;
	};
	return this;
};

DataProxy.prototype.getFormValue = function (){
	return this._setter ? this._data[this._path]() : this._data[this._path];
};

DataProxy.prototype.setFormValue = function (value){
	return this._setter ? this._data[this._setter](value) : ((this._data[this._path] = value));
};


var isArray = function(val) {
	return val && val.splice && val.sort;
};

var isSimilarArray = function(a,b) {
	var l = a.length,i = 0;
	if (l != b.length) { return false };
	while (i++ < l){
		if (a[i] != b[i]) { return false };
	};
	return true;
};

Imba.createTagScope(/*SCOPEID*/).extendTag('input', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	tag.prototype.number = function(v){ return this._number; }
	tag.prototype.setNumber = function(v){ this._number = v; return this; };
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.checked = function (){
		return this._dom.checked;
	};
	
	tag.prototype.setChecked = function (value){
		if (!!value != this._dom.checked) {
			this._dom.checked = !!value;
		};
		return this;
	};
	
	tag.prototype.setValue = function (value,source){
		if (this._localValue == undefined || source == undefined) {
			this.dom().value = this._value = value;
			this._localValue = undefined;
		};
		return this;
	};
	
	tag.prototype.setType = function (value){
		this.dom().type = this._type = value;
		return this;
	};
	
	tag.prototype.value = function (){
		var val = this._dom.value;
		return (this._number && val) ? parseFloat(val) : val;
	};
	
	tag.prototype.oninput = function (e){
		var val = this._dom.value;
		this._localValue = val;
		if (this._data && !(this.lazy()) && this.type() != 'radio' && this.type() != 'checkbox') {
			this._data.setFormValue(this.value(),this);
		};
		return;
	};
	
	tag.prototype.onchange = function (e){
		this._modelValue = this._localValue = undefined;
		if (!(this.data())) { return };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			var checked = this.checked();
			var mval = this._data.getFormValue(this);
			var dval = (this._value != undefined) ? this._value : this.value();
			
			if (this.type() == 'radio') {
				return this._data.setFormValue(dval,this);
			} else if (this.dom().value == 'on' || this.dom().value == undefined) {
				return this._data.setFormValue(!!checked,this);
			} else if (isArray(mval)) {
				var idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!checked && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this._data.setFormValue(dval,this);
			};
		} else {
			return this._data.setFormValue(this.value());
		};
	};
	
	tag.prototype.onblur = function (e){
		return this._localValue = undefined;
	};
	
	// overriding end directly for performance
	tag.prototype.end = function (){
		if (this._localValue !== undefined || !this._data) {
			return this;
		};
		
		var mval = this._data.getFormValue(this);
		if (mval === this._modelValue) { return this };
		if (!isArray(mval)) { this._modelValue = mval };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			var dval = this._value;
			var checked = isArray(mval) ? (
				mval.indexOf(dval) >= 0
			) : ((this.dom().value == 'on' || this.dom().value == undefined) ? (
				!!mval
			) : (
				mval == this._value
			));
			
			this.setChecked(checked);
		} else {
			this._dom.value = mval;
		};
		return this;
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('textarea', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value,source){
		if (this._localValue == undefined || source == undefined) {
			this.dom().value = value;
			this._localValue = undefined;
		};
		return this;
	};
	
	tag.prototype.oninput = function (e){
		var val = this._dom.value;
		this._localValue = val;
		if (this._data && !(this.lazy())) { return this._data.setFormValue(this.value(),this) };
	};
	
	tag.prototype.onchange = function (e){
		this._localValue = undefined;
		if (this._data) { return this._data.setFormValue(this.value(),this) };
	};
	
	tag.prototype.onblur = function (e){
		return this._localValue = undefined;
	};
	
	tag.prototype.render = function (){
		if (this._localValue != undefined || !this._data) { return };
		if (this._data) {
			var dval = this._data.getFormValue(this);
			this._dom.value = (dval != undefined) ? dval : '';
		};
		return this;
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('option', function(tag){
	tag.prototype.setValue = function (value){
		if (value != this._value) {
			this.dom().value = this._value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		return this._value || this.dom().value;
	};
});

Imba.createTagScope(/*SCOPEID*/).extendTag('select', function(tag){
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value,syncing){
		var prev = this._value;
		this._value = value;
		if (!syncing) { this.syncValue(value) };
		return this;
	};
	
	tag.prototype.syncValue = function (value){
		var prev = this._syncValue;
		// check if value has changed
		if (this.multiple() && (value instanceof Array)) {
			if ((prev instanceof Array) && isSimilarArray(prev,value)) {
				return this;
			};
			// create a copy for syncValue
			value = value.slice();
		};
		
		this._syncValue = value;
		// support array for multiple?
		if (typeof value == 'object') {
			var mult = this.multiple() && (value instanceof Array);
			
			for (var i = 0, items = iter$(this.dom().options), len = items.length, opt; i < len; i++) {
				opt = items[i];
				var oval = (opt._tag ? opt._tag.value() : opt.value);
				if (mult) {
					opt.selected = value.indexOf(oval) >= 0;
				} else if (value == oval) {
					this.dom().selectedIndex = i;
					break;
				};
			};
		} else {
			this.dom().value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		if (this.multiple()) {
			var res = [];
			for (var i = 0, items = iter$(this.dom().selectedOptions), len = items.length, option; i < len; i++) {
				option = items[i];
				res.push(option._tag ? option._tag.value() : option.value);
			};
			return res;
		} else {
			var opt = this.dom().selectedOptions[0];
			return opt ? ((opt._tag ? opt._tag.value() : opt.value)) : null;
		};
	};
	
	tag.prototype.onchange = function (e){
		if (this._data) { return this._data.setFormValue(this.value(),this) };
	};
	
	tag.prototype.end = function (){
		if (this._data) {
			this.setValue(this._data.getFormValue(this),1);
		};
		
		if (this._value != this._syncValue) {
			this.syncValue(this._value);
		};
		return this;
	};
});
