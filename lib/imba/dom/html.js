function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require("../imba");

// predefine all supported html tags
Imba.TAGS.defineTag('fragment', 'element', function(tag){
	
	tag.createNode = function (){
		return Imba.document().createDocumentFragment();
	};
});

Imba.TAGS.extendTag('html', function(tag){
	tag.prototype.parent = function (){
		return null;
	};
});


Imba.TAGS.extendTag('canvas', function(tag){
	tag.prototype.context = function (type){
		if(type === undefined) type = '2d';
		return this.dom().getContext(type);
	};
});

function DataValue(node,path,mods){
	var self = this;
	self._node = node;
	self._path = path;
	self._mods = mods || {};
	self._setter = Imba.toSetter(self._path);
	var valueFn = node.value;
	node.value = function() { return self.mod(valueFn.call(this)); };
};

DataValue.prototype.data = function (){
	return this._node.data() || this._node._owner_.data();
};

DataValue.prototype.lazy = function (){
	return this._mods.lazy;
};

DataValue.prototype.get = function (){
	var data = this.data();
	var val = data[this._path];
	return (data[this._setter] && (val instanceof Function)) ? data[this._path]() : val;
};

DataValue.prototype.set = function (value){
	var data = this.data();
	var prev = data[this._path];
	if (prev instanceof Function) {
		if (data[this._setter] instanceof Function) {
			data[this._setter](value);
			return this;
		};
	};
	return data[this._path] = value;
};

DataValue.prototype.isArray = function (val){
	if(val === undefined) val = this.get();
	return val && val.splice && val.sort;
};

DataValue.prototype.mod = function (value){
	var self = this;
	if (value instanceof Array) {
		return value.map(function(_0) { return self.mod(_0); });
	};
	if (self._mods.trim && (typeof value=='string'||value instanceof String)) {
		value = value.trim();
	};
	if (self._mods.number) {
		value = parseFloat(value);
	};
	return value;
};

Imba.TAGS.extendTag('input', function(tag){
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		this.dom().value = this._value = value;
		return this;
	};
	
	tag.prototype.oninput = function (e){
		var val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this.model() && !this.model().lazy()) ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._modelValue = this._localValue = undefined;
		if (!(this.model())) { return e.silence() };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			var checked = this._dom.checked;
			var mval = this.model().get();
			var dval = (this._value != undefined) ? this._value : this.value();
			// console.log "change",type,checked,dval
			
			if (this.type() == 'radio') {
				return this.model().set(dval,true);
			} else if (this.dom().value == 'on') {
				return this.model().set(!!checked,true);
			} else if (this.model().isArray()) {
				var idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!checked && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this.model().set(dval);
			};
		} else {
			return this.model().set(this.value());
		};
	};
	
	// overriding end directly for performance
	tag.prototype.end = function (){
		if (!this._model || this._localValue !== undefined) { return this };
		var mval = this._model.get();
		if (mval == this._modelValue) { return this };
		if (!this.model().isArray()) { this._modelValue = mval };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			var dval = this._value;
			var checked = this.model().isArray() ? (
				mval.indexOf(dval) >= 0
			) : ((this.dom().value == 'on') ? (
				!!mval
			) : (
				mval == this._value
			));
			
			this._dom.checked = checked;
		} else {
			this._dom.value = mval;
			this._initialValue = this._dom.value;
		};
		return this;
	};
});

Imba.TAGS.extendTag('textarea', function(tag){
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (this._localValue == undefined) { this.dom().value = value };
		return this;
	};
	
	tag.prototype.oninput = function (e){
		var val = this._dom.value;
		this._localValue = (this._initialValue != val) ? val : undefined;
		return (this.model() && !this.model().lazy()) ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.onchange = function (e){
		this._localValue = undefined;
		return this.model() ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.render = function (){
		if (this._localValue != undefined || !(this.model())) { return };
		if (this.model()) {
			this._dom.value = this.model().get();
		};
		this._initialValue = this._dom.value;
		return this;
	};
});

Imba.TAGS.extendTag('option', function(tag){
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

Imba.TAGS.extendTag('select', function(tag){
	tag.prototype.model = function (){
		return this._model;
	};
	
	tag.prototype.setModel = function (value,mods){
		this._model || (this._model = new DataValue(this,value,mods));
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (value != this._value) {
			this._value = value;
			if (typeof value == 'object') {
				for (var i = 0, items = iter$(this.dom().options), len = items.length, opt; i < len; i++) {
					opt = items[i];
					var oval = (opt._tag ? opt._tag.value() : opt.value);
					if (value == oval) {
						this.dom().selectedIndex = i;
						break;
					};
				};
			} else {
				this.dom().value = value;
			};
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
		return this.model() ? this.model().set(this.value()) : e.silence();
	};
	
	tag.prototype.render = function (){
		if (!(this.model())) { return };
		
		var mval = this.model().get();
		// sync dom value
		if (this.multiple()) {
			for (var i = 0, items = iter$(this.dom().options), len = items.length, option; i < len; i++) {
				option = items[i];
				var oval = this.model().mod(option._tag ? option._tag.value() : option.value);
				var sel = mval.indexOf(oval) >= 0;
				option.selected = sel;
			};
		} else {
			this.setValue(mval);
			// what if mval is rich? Would be nice with some mapping
			// dom:value = mval
		};
		return this;
	};
});
