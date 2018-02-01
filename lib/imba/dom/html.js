var Imba = require("../imba");

// predefine all supported html tags
Imba.TAGS.defineTag('fragment', 'element', function(tag){
	
	tag.createNode = function (){
		return Imba.document().createDocumentFragment();
	};
});

Imba.TAGS.defineTag('button', function(tag){
	tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
	tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
	tag.prototype.type = function(v){ return this.getAttribute('type'); }
	tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
});

Imba.TAGS.defineTag('canvas', function(tag){
	tag.prototype.__width = {dom: true,name: 'width'};
	tag.prototype.width = function(v){ return this.dom().width; }
	tag.prototype.setWidth = function(v){ if (v != this.dom().width) { this.dom().width = v }; return this; };
	tag.prototype.__height = {dom: true,name: 'height'};
	tag.prototype.height = function(v){ return this.dom().height; }
	tag.prototype.setHeight = function(v){ if (v != this.dom().height) { this.dom().height = v }; return this; };
	
	tag.prototype.context = function (type){
		if(type === undefined) type = '2d';
		return this.dom().getContext(type);
	};
});

Imba.TAGS.defineTag('fieldset', function(tag){
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
});

Imba.TAGS.defineTag('form', function(tag){
	tag.prototype.method = function(v){ return this.getAttribute('method'); }
	tag.prototype.setMethod = function(v){ this.setAttribute('method',v); return this; };
	tag.prototype.action = function(v){ return this.getAttribute('action'); }
	tag.prototype.setAction = function(v){ this.setAttribute('action',v); return this; };
	tag.prototype.enctype = function(v){ return this.getAttribute('enctype'); }
	tag.prototype.setEnctype = function(v){ this.setAttribute('enctype',v); return this; };
	tag.prototype.autocomplete = function(v){ return this.getAttribute('autocomplete'); }
	tag.prototype.setAutocomplete = function(v){ this.setAttribute('autocomplete',v); return this; };
	tag.prototype.target = function(v){ return this.getAttribute('target'); }
	tag.prototype.setTarget = function(v){ this.setAttribute('target',v); return this; };
	
	tag.prototype.__novalidate = {dom: true,name: 'novalidate'};
	tag.prototype.novalidate = function(v){ return this.dom().novalidate; }
	tag.prototype.setNovalidate = function(v){ if (v != this.dom().novalidate) { this.dom().novalidate = v }; return this; };
});

Imba.TAGS.defineTag('html', function(tag){
	tag.prototype.parent = function (){
		return null;
	};
});

Imba.TAGS.defineTag('input', function(tag){
	tag.prototype.accept = function(v){ return this.getAttribute('accept'); }
	tag.prototype.setAccept = function(v){ this.setAttribute('accept',v); return this; };
	tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
	tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
	tag.prototype.form = function(v){ return this.getAttribute('form'); }
	tag.prototype.setForm = function(v){ this.setAttribute('form',v); return this; };
	tag.prototype.list = function(v){ return this.getAttribute('list'); }
	tag.prototype.setList = function(v){ this.setAttribute('list',v); return this; };
	tag.prototype.max = function(v){ return this.getAttribute('max'); }
	tag.prototype.setMax = function(v){ this.setAttribute('max',v); return this; };
	tag.prototype.maxlength = function(v){ return this.getAttribute('maxlength'); }
	tag.prototype.setMaxlength = function(v){ this.setAttribute('maxlength',v); return this; };
	tag.prototype.min = function(v){ return this.getAttribute('min'); }
	tag.prototype.setMin = function(v){ this.setAttribute('min',v); return this; };
	tag.prototype.pattern = function(v){ return this.getAttribute('pattern'); }
	tag.prototype.setPattern = function(v){ this.setAttribute('pattern',v); return this; };
	tag.prototype.required = function(v){ return this.getAttribute('required'); }
	tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
	tag.prototype.size = function(v){ return this.getAttribute('size'); }
	tag.prototype.setSize = function(v){ this.setAttribute('size',v); return this; };
	tag.prototype.step = function(v){ return this.getAttribute('step'); }
	tag.prototype.setStep = function(v){ this.setAttribute('step',v); return this; };
	tag.prototype.type = function(v){ return this.getAttribute('type'); }
	tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	
	tag.prototype.__autofocus = {dom: true,name: 'autofocus'};
	tag.prototype.autofocus = function(v){ return this.dom().autofocus; }
	tag.prototype.setAutofocus = function(v){ if (v != this.dom().autofocus) { this.dom().autofocus = v }; return this; };
	tag.prototype.__autocomplete = {dom: true,name: 'autocomplete'};
	tag.prototype.autocomplete = function(v){ return this.dom().autocomplete; }
	tag.prototype.setAutocomplete = function(v){ if (v != this.dom().autocomplete) { this.dom().autocomplete = v }; return this; };
	tag.prototype.__autocorrect = {dom: true,name: 'autocorrect'};
	tag.prototype.autocorrect = function(v){ return this.dom().autocorrect; }
	tag.prototype.setAutocorrect = function(v){ if (v != this.dom().autocorrect) { this.dom().autocorrect = v }; return this; };
	tag.prototype.__value = {dom: true,name: 'value'};
	tag.prototype.value = function(v){ return this.dom().value; }
	tag.prototype.setValue = function(v){ if (v != this.dom().value) { this.dom().value = v }; return this; };
	tag.prototype.__placeholder = {dom: true,name: 'placeholder'};
	tag.prototype.placeholder = function(v){ return this.dom().placeholder; }
	tag.prototype.setPlaceholder = function(v){ if (v != this.dom().placeholder) { this.dom().placeholder = v }; return this; };
	tag.prototype.__required = {dom: true,name: 'required'};
	tag.prototype.required = function(v){ return this.dom().required; }
	tag.prototype.setRequired = function(v){ if (v != this.dom().required) { this.dom().required = v }; return this; };
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
	tag.prototype.__multiple = {dom: true,name: 'multiple'};
	tag.prototype.multiple = function(v){ return this.dom().multiple; }
	tag.prototype.setMultiple = function(v){ if (v != this.dom().multiple) { this.dom().multiple = v }; return this; };
	tag.prototype.__checked = {dom: true,name: 'checked'};
	tag.prototype.checked = function(v){ return this.dom().checked; }
	tag.prototype.setChecked = function(v){ if (v != this.dom().checked) { this.dom().checked = v }; return this; };
	tag.prototype.__readOnly = {dom: true,name: 'readOnly'};
	tag.prototype.readOnly = function(v){ return this.dom().readOnly; }
	tag.prototype.setReadOnly = function(v){ if (v != this.dom().readOnly) { this.dom().readOnly = v }; return this; };
});

Imba.TAGS.defineTag('optgroup', function(tag){
	tag.prototype.label = function(v){ return this.getAttribute('label'); }
	tag.prototype.setLabel = function(v){ this.setAttribute('label',v); return this; };
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
});

Imba.TAGS.defineTag('option', function(tag){
	tag.prototype.label = function(v){ return this.getAttribute('label'); }
	tag.prototype.setLabel = function(v){ this.setAttribute('label',v); return this; };
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
	tag.prototype.__selected = {dom: true,name: 'selected'};
	tag.prototype.selected = function(v){ return this.dom().selected; }
	tag.prototype.setSelected = function(v){ if (v != this.dom().selected) { this.dom().selected = v }; return this; };
	tag.prototype.__value = {dom: true,name: 'value'};
	tag.prototype.value = function(v){ return this.dom().value; }
	tag.prototype.setValue = function(v){ if (v != this.dom().value) { this.dom().value = v }; return this; };
});

Imba.TAGS.defineTag('progress', function(tag){
	tag.prototype.max = function(v){ return this.getAttribute('max'); }
	tag.prototype.setMax = function(v){ this.setAttribute('max',v); return this; };
	tag.prototype.__value = {dom: true,name: 'value'};
	tag.prototype.value = function(v){ return this.dom().value; }
	tag.prototype.setValue = function(v){ if (v != this.dom().value) { this.dom().value = v }; return this; };
});

Imba.TAGS.defineTag('select', function(tag){
	tag.prototype.size = function(v){ return this.getAttribute('size'); }
	tag.prototype.setSize = function(v){ this.setAttribute('size',v); return this; };
	tag.prototype.form = function(v){ return this.getAttribute('form'); }
	tag.prototype.setForm = function(v){ this.setAttribute('form',v); return this; };
	tag.prototype.multiple = function(v){ return this.getAttribute('multiple'); }
	tag.prototype.setMultiple = function(v){ this.setAttribute('multiple',v); return this; };
	tag.prototype.__autofocus = {dom: true,name: 'autofocus'};
	tag.prototype.autofocus = function(v){ return this.dom().autofocus; }
	tag.prototype.setAutofocus = function(v){ if (v != this.dom().autofocus) { this.dom().autofocus = v }; return this; };
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
	tag.prototype.__required = {dom: true,name: 'required'};
	tag.prototype.required = function(v){ return this.dom().required; }
	tag.prototype.setRequired = function(v){ if (v != this.dom().required) { this.dom().required = v }; return this; };
	
	tag.prototype.setValue = function (value){
		value = String(value);
		
		if (this.dom().value != value) {
			this.dom().value = value;
			
			if (this.dom().value != value) {
				this._delayedValue = value;
			};
		};
		
		this;
		return this;
	};
	
	tag.prototype.value = function (){
		return this.dom().value;
	};
	
	tag.prototype.syncValue = function (){
		if (this._delayedValue != undefined) {
			this.dom().value = this._delayedValue;
			this._delayedValue = undefined;
		};
		return this;
	};
	
	tag.prototype.setChildren = function (){
		tag.__super__.setChildren.apply(this,arguments);
		return this.syncValue();
	};
});

Imba.TAGS.defineTag('textarea', function(tag){
	tag.prototype.rows = function(v){ return this.getAttribute('rows'); }
	tag.prototype.setRows = function(v){ this.setAttribute('rows',v); return this; };
	tag.prototype.cols = function(v){ return this.getAttribute('cols'); }
	tag.prototype.setCols = function(v){ this.setAttribute('cols',v); return this; };
	
	tag.prototype.__autofocus = {dom: true,name: 'autofocus'};
	tag.prototype.autofocus = function(v){ return this.dom().autofocus; }
	tag.prototype.setAutofocus = function(v){ if (v != this.dom().autofocus) { this.dom().autofocus = v }; return this; };
	tag.prototype.__autocomplete = {dom: true,name: 'autocomplete'};
	tag.prototype.autocomplete = function(v){ return this.dom().autocomplete; }
	tag.prototype.setAutocomplete = function(v){ if (v != this.dom().autocomplete) { this.dom().autocomplete = v }; return this; };
	tag.prototype.__autocorrect = {dom: true,name: 'autocorrect'};
	tag.prototype.autocorrect = function(v){ return this.dom().autocorrect; }
	tag.prototype.setAutocorrect = function(v){ if (v != this.dom().autocorrect) { this.dom().autocorrect = v }; return this; };
	tag.prototype.__value = {dom: true,name: 'value'};
	tag.prototype.value = function(v){ return this.dom().value; }
	tag.prototype.setValue = function(v){ if (v != this.dom().value) { this.dom().value = v }; return this; };
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
	tag.prototype.__required = {dom: true,name: 'required'};
	tag.prototype.required = function(v){ return this.dom().required; }
	tag.prototype.setRequired = function(v){ if (v != this.dom().required) { this.dom().required = v }; return this; };
	tag.prototype.__readOnly = {dom: true,name: 'readOnly'};
	tag.prototype.readOnly = function(v){ return this.dom().readOnly; }
	tag.prototype.setReadOnly = function(v){ if (v != this.dom().readOnly) { this.dom().readOnly = v }; return this; };
	tag.prototype.__placeholder = {dom: true,name: 'placeholder'};
	tag.prototype.placeholder = function(v){ return this.dom().placeholder; }
	tag.prototype.setPlaceholder = function(v){ if (v != this.dom().placeholder) { this.dom().placeholder = v }; return this; };
});

true;
