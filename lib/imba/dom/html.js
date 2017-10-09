var Imba = require("../imba");

// predefine all supported html tags
Imba.TAGS.defineTag('fragment', 'element', function(tag){
	
	tag.createNode = function (){
		return Imba.document().createDocumentFragment();
	};
});

Imba.TAGS.defineTag('a', function(tag){
	tag.prototype.href = function(v){ return this.getAttribute('href'); }
	tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
	tag.prototype.target = function(v){ return this.getAttribute('target'); }
	tag.prototype.setTarget = function(v){ this.setAttribute('target',v); return this; };
	tag.prototype.hreflang = function(v){ return this.getAttribute('hreflang'); }
	tag.prototype.setHreflang = function(v){ this.setAttribute('hreflang',v); return this; };
	tag.prototype.media = function(v){ return this.getAttribute('media'); }
	tag.prototype.setMedia = function(v){ this.setAttribute('media',v); return this; };
	tag.prototype.download = function(v){ return this.getAttribute('download'); }
	tag.prototype.setDownload = function(v){ this.setAttribute('download',v); return this; };
	tag.prototype.rel = function(v){ return this.getAttribute('rel'); }
	tag.prototype.setRel = function(v){ this.setAttribute('rel',v); return this; };
	tag.prototype.type = function(v){ return this.getAttribute('type'); }
	tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
});

Imba.TAGS.defineTag('abbr');
Imba.TAGS.defineTag('address');
Imba.TAGS.defineTag('area');
Imba.TAGS.defineTag('article');
Imba.TAGS.defineTag('aside');
Imba.TAGS.defineTag('audio');
Imba.TAGS.defineTag('b');
Imba.TAGS.defineTag('base');
Imba.TAGS.defineTag('bdi');
Imba.TAGS.defineTag('bdo');
Imba.TAGS.defineTag('big');
Imba.TAGS.defineTag('blockquote');
Imba.TAGS.defineTag('body');
Imba.TAGS.defineTag('br');

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

Imba.TAGS.defineTag('caption');
Imba.TAGS.defineTag('cite');
Imba.TAGS.defineTag('code');
Imba.TAGS.defineTag('col');
Imba.TAGS.defineTag('colgroup');
Imba.TAGS.defineTag('data');
Imba.TAGS.defineTag('datalist');
Imba.TAGS.defineTag('dd');
Imba.TAGS.defineTag('del');
Imba.TAGS.defineTag('details');
Imba.TAGS.defineTag('dfn');
Imba.TAGS.defineTag('div');
Imba.TAGS.defineTag('dl');
Imba.TAGS.defineTag('dt');
Imba.TAGS.defineTag('em');
Imba.TAGS.defineTag('embed');

Imba.TAGS.defineTag('fieldset', function(tag){
	tag.prototype.__disabled = {dom: true,name: 'disabled'};
	tag.prototype.disabled = function(v){ return this.dom().disabled; }
	tag.prototype.setDisabled = function(v){ if (v != this.dom().disabled) { this.dom().disabled = v }; return this; };
});

Imba.TAGS.defineTag('figcaption');
Imba.TAGS.defineTag('figure');
Imba.TAGS.defineTag('footer');

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

Imba.TAGS.defineTag('h1');
Imba.TAGS.defineTag('h2');
Imba.TAGS.defineTag('h3');
Imba.TAGS.defineTag('h4');
Imba.TAGS.defineTag('h5');
Imba.TAGS.defineTag('h6');
Imba.TAGS.defineTag('head');
Imba.TAGS.defineTag('header');
Imba.TAGS.defineTag('hr');
Imba.TAGS.defineTag('html');
Imba.TAGS.defineTag('i');

Imba.TAGS.defineTag('iframe', function(tag){
	tag.prototype.referrerpolicy = function(v){ return this.getAttribute('referrerpolicy'); }
	tag.prototype.setReferrerpolicy = function(v){ this.setAttribute('referrerpolicy',v); return this; };
	tag.prototype.src = function(v){ return this.getAttribute('src'); }
	tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	tag.prototype.srcdoc = function(v){ return this.getAttribute('srcdoc'); }
	tag.prototype.setSrcdoc = function(v){ this.setAttribute('srcdoc',v); return this; };
	tag.prototype.sandbox = function(v){ return this.getAttribute('sandbox'); }
	tag.prototype.setSandbox = function(v){ this.setAttribute('sandbox',v); return this; };
});

Imba.TAGS.defineTag('img', function(tag){
	tag.prototype.src = function(v){ return this.getAttribute('src'); }
	tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	tag.prototype.srcset = function(v){ return this.getAttribute('srcset'); }
	tag.prototype.setSrcset = function(v){ this.setAttribute('srcset',v); return this; };
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

Imba.TAGS.defineTag('ins');
Imba.TAGS.defineTag('kbd');
Imba.TAGS.defineTag('keygen');
Imba.TAGS.defineTag('label', function(tag){
	tag.prototype.accesskey = function(v){ return this.getAttribute('accesskey'); }
	tag.prototype.setAccesskey = function(v){ this.setAttribute('accesskey',v); return this; };
	tag.prototype['for'] = function(v){ return this.getAttribute('for'); }
	tag.prototype.setFor = function(v){ this.setAttribute('for',v); return this; };
	tag.prototype.form = function(v){ return this.getAttribute('form'); }
	tag.prototype.setForm = function(v){ this.setAttribute('form',v); return this; };
});


Imba.TAGS.defineTag('legend');
Imba.TAGS.defineTag('li');

Imba.TAGS.defineTag('link', function(tag){
	tag.prototype.rel = function(v){ return this.getAttribute('rel'); }
	tag.prototype.setRel = function(v){ this.setAttribute('rel',v); return this; };
	tag.prototype.type = function(v){ return this.getAttribute('type'); }
	tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	tag.prototype.href = function(v){ return this.getAttribute('href'); }
	tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
	tag.prototype.media = function(v){ return this.getAttribute('media'); }
	tag.prototype.setMedia = function(v){ this.setAttribute('media',v); return this; };
});

Imba.TAGS.defineTag('main');
Imba.TAGS.defineTag('map');
Imba.TAGS.defineTag('mark');
Imba.TAGS.defineTag('menu');
Imba.TAGS.defineTag('menuitem');

Imba.TAGS.defineTag('meta', function(tag){
	tag.prototype.property = function(v){ return this.getAttribute('property'); }
	tag.prototype.setProperty = function(v){ this.setAttribute('property',v); return this; };
	tag.prototype.content = function(v){ return this.getAttribute('content'); }
	tag.prototype.setContent = function(v){ this.setAttribute('content',v); return this; };
	tag.prototype.charset = function(v){ return this.getAttribute('charset'); }
	tag.prototype.setCharset = function(v){ this.setAttribute('charset',v); return this; };
});

Imba.TAGS.defineTag('meter');
Imba.TAGS.defineTag('nav');
Imba.TAGS.defineTag('noscript');

Imba.TAGS.defineTag('ol');

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

Imba.TAGS.defineTag('output', function(tag){
	tag.prototype['for'] = function(v){ return this.getAttribute('for'); }
	tag.prototype.setFor = function(v){ this.setAttribute('for',v); return this; };
	tag.prototype.form = function(v){ return this.getAttribute('form'); }
	tag.prototype.setForm = function(v){ this.setAttribute('form',v); return this; };
});

Imba.TAGS.defineTag('p');

Imba.TAGS.defineTag('object', function(tag){
	Imba.attr(tag,'type');
	Imba.attr(tag,'data');
	Imba.attr(tag,'width');
	Imba.attr(tag,'height');
});

Imba.TAGS.defineTag('param', function(tag){
	tag.prototype.name = function(v){ return this.getAttribute('name'); }
	tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
	tag.prototype.value = function(v){ return this.getAttribute('value'); }
	tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
});

Imba.TAGS.defineTag('pre');
Imba.TAGS.defineTag('progress', function(tag){
	tag.prototype.max = function(v){ return this.getAttribute('max'); }
	tag.prototype.setMax = function(v){ this.setAttribute('max',v); return this; };
	tag.prototype.__value = {dom: true,name: 'value'};
	tag.prototype.value = function(v){ return this.dom().value; }
	tag.prototype.setValue = function(v){ if (v != this.dom().value) { this.dom().value = v }; return this; };
});

Imba.TAGS.defineTag('q');
Imba.TAGS.defineTag('rp');
Imba.TAGS.defineTag('rt');
Imba.TAGS.defineTag('ruby');
Imba.TAGS.defineTag('s');
Imba.TAGS.defineTag('samp');

Imba.TAGS.defineTag('script', function(tag){
	tag.prototype.src = function(v){ return this.getAttribute('src'); }
	tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	tag.prototype.type = function(v){ return this.getAttribute('type'); }
	tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	tag.prototype.async = function(v){ return this.getAttribute('async'); }
	tag.prototype.setAsync = function(v){ this.setAttribute('async',v); return this; };
	tag.prototype.defer = function(v){ return this.getAttribute('defer'); }
	tag.prototype.setDefer = function(v){ this.setAttribute('defer',v); return this; };
});

Imba.TAGS.defineTag('section');

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

Imba.TAGS.defineTag('small');
Imba.TAGS.defineTag('source');
Imba.TAGS.defineTag('span');
Imba.TAGS.defineTag('strong');
Imba.TAGS.defineTag('style');
Imba.TAGS.defineTag('sub');
Imba.TAGS.defineTag('summary');
Imba.TAGS.defineTag('sup');
Imba.TAGS.defineTag('table');
Imba.TAGS.defineTag('tbody');
Imba.TAGS.defineTag('td');

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

Imba.TAGS.defineTag('tfoot');
Imba.TAGS.defineTag('th');
Imba.TAGS.defineTag('thead');
Imba.TAGS.defineTag('time');
Imba.TAGS.defineTag('title');
Imba.TAGS.defineTag('tr');
Imba.TAGS.defineTag('track');
Imba.TAGS.defineTag('u');
Imba.TAGS.defineTag('ul');
Imba.TAGS.defineTag('video');
Imba.TAGS.defineTag('wbr');

true;
