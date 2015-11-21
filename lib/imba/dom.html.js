(function(){
	
	// predefine all supported html tags
	tag$.defineTag('fragment', 'htmlelement', function(tag){
		
		tag.createNode = function (){
			return Imba.document().createDocumentFragment();
		};
	});
	
	tag$.defineTag('a', function(tag){
		
		
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
	});
	
	tag$.defineTag('abbr');
	tag$.defineTag('address');
	tag$.defineTag('area');
	tag$.defineTag('article');
	tag$.defineTag('aside');
	tag$.defineTag('audio');
	tag$.defineTag('b');
	tag$.defineTag('base');
	tag$.defineTag('bdi');
	tag$.defineTag('bdo');
	tag$.defineTag('big');
	tag$.defineTag('blockquote');
	tag$.defineTag('body');
	tag$.defineTag('br');
	
	tag$.defineTag('button', function(tag){
		
		
		tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
		tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
		
		
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
	});
	
	tag$.defineTag('canvas', function(tag){
		tag.prototype.setWidth = function (val){
			if (this.width() != val) { this.dom().width = val };
			return this;
		};
		
		tag.prototype.setHeight = function (val){
			if (this.height() != val) { this.dom().height = val };
			return this;
		};
		
		tag.prototype.width = function (){
			return this.dom().width;
		};
		
		tag.prototype.height = function (){
			return this.dom().height;
		};
	});
	
	
	tag$.defineTag('caption');
	tag$.defineTag('cite');
	tag$.defineTag('code');
	tag$.defineTag('col');
	tag$.defineTag('colgroup');
	tag$.defineTag('data');
	tag$.defineTag('datalist');
	tag$.defineTag('dd');
	tag$.defineTag('del');
	tag$.defineTag('details');
	tag$.defineTag('dfn');
	tag$.defineTag('div');
	tag$.defineTag('dl');
	tag$.defineTag('dt');
	tag$.defineTag('em');
	tag$.defineTag('embed');
	tag$.defineTag('fieldset');
	tag$.defineTag('figcaption');
	tag$.defineTag('figure');
	tag$.defineTag('footer');
	
	tag$.defineTag('form', function(tag){
		
		
		tag.prototype.method = function(v){ return this.getAttribute('method'); }
		tag.prototype.setMethod = function(v){ this.setAttribute('method',v); return this; };
		
		
		tag.prototype.action = function(v){ return this.getAttribute('action'); }
		tag.prototype.setAction = function(v){ this.setAttribute('action',v); return this; };
	});
	
	tag$.defineTag('h1');
	tag$.defineTag('h2');
	tag$.defineTag('h3');
	tag$.defineTag('h4');
	tag$.defineTag('h5');
	tag$.defineTag('h6');
	tag$.defineTag('head');
	tag$.defineTag('header');
	tag$.defineTag('hr');
	tag$.defineTag('html');
	tag$.defineTag('i');
	
	tag$.defineTag('iframe', function(tag){
		
		
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	});
	
	tag$.defineTag('img', function(tag){
		
		
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	});
	
	tag$.defineTag('input', function(tag){
		// can use attr instead
		
		
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		
		tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
		tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			if (v != this.dom().value) { this.dom().value = v };
			return this;
		};
		
		tag.prototype.setPlaceholder = function (v){
			if (v != this.dom().placeholder) { this.dom().placeholder = v };
			return this;
		};
		
		tag.prototype.placeholder = function (){
			return this.dom().placeholder;
		};
		
		tag.prototype.checked = function (){
			return this.dom().checked;
		};
		
		tag.prototype.setChecked = function (bool){
			if (bool != this.dom().checked) { this.dom().checked = bool };
			return this;
		};
	});
	
	tag$.defineTag('ins');
	tag$.defineTag('kbd');
	tag$.defineTag('keygen');
	tag$.defineTag('label');
	tag$.defineTag('legend');
	tag$.defineTag('li');
	
	tag$.defineTag('link', function(tag){
		
		
		tag.prototype.rel = function(v){ return this.getAttribute('rel'); }
		tag.prototype.setRel = function(v){ this.setAttribute('rel',v); return this; };
		
		
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
		
		
		tag.prototype.media = function(v){ return this.getAttribute('media'); }
		tag.prototype.setMedia = function(v){ this.setAttribute('media',v); return this; };
	});
	
	tag$.defineTag('main');
	tag$.defineTag('map');
	tag$.defineTag('mark');
	tag$.defineTag('menu');
	tag$.defineTag('menuitem');
	
	tag$.defineTag('meta', function(tag){
		
		
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		
		tag.prototype.content = function(v){ return this.getAttribute('content'); }
		tag.prototype.setContent = function(v){ this.setAttribute('content',v); return this; };
		
		
		tag.prototype.charset = function(v){ return this.getAttribute('charset'); }
		tag.prototype.setCharset = function(v){ this.setAttribute('charset',v); return this; };
	});
	
	tag$.defineTag('meter');
	tag$.defineTag('nav');
	tag$.defineTag('noscript');
	tag$.defineTag('object');
	tag$.defineTag('ol');
	tag$.defineTag('optgroup');
	
	tag$.defineTag('option', function(tag){
		
		
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
	});
	
	tag$.defineTag('output');
	tag$.defineTag('p');
	tag$.defineTag('param');
	tag$.defineTag('pre');
	tag$.defineTag('progress');
	tag$.defineTag('q');
	tag$.defineTag('rp');
	tag$.defineTag('rt');
	tag$.defineTag('ruby');
	tag$.defineTag('s');
	tag$.defineTag('samp');
	
	tag$.defineTag('script', function(tag){
		
		
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
		
		
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	});
	
	tag$.defineTag('section');
	
	tag$.defineTag('select', function(tag){
		
		
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		
		tag.prototype.multiple = function(v){ return this.getAttribute('multiple'); }
		tag.prototype.setMultiple = function(v){ this.setAttribute('multiple',v); return this; };
		
		
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			if (v != this.dom().value) { this.dom().value = v };
			return this;
		};
	});
	
	
	tag$.defineTag('small');
	tag$.defineTag('source');
	tag$.defineTag('span');
	tag$.defineTag('strong');
	tag$.defineTag('style');
	tag$.defineTag('sub');
	tag$.defineTag('summary');
	tag$.defineTag('sup');
	tag$.defineTag('table');
	tag$.defineTag('tbody');
	tag$.defineTag('td');
	
	tag$.defineTag('textarea', function(tag){
		
		
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		
		tag.prototype.rows = function(v){ return this.getAttribute('rows'); }
		tag.prototype.setRows = function(v){ this.setAttribute('rows',v); return this; };
		
		
		tag.prototype.cols = function(v){ return this.getAttribute('cols'); }
		tag.prototype.setCols = function(v){ this.setAttribute('cols',v); return this; };
		
		
		tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
		tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			if (v != this.dom().value) { this.dom().value = v };
			return this;
		};
		
		tag.prototype.setPlaceholder = function (v){
			if (v != this.dom().placeholder) { this.dom().placeholder = v };
			return this;
		};
		
		tag.prototype.placeholder = function (){
			return this.dom().placeholder;
		};
	});
	
	tag$.defineTag('tfoot');
	tag$.defineTag('th');
	tag$.defineTag('thead');
	tag$.defineTag('time');
	tag$.defineTag('title');
	tag$.defineTag('tr');
	tag$.defineTag('track');
	tag$.defineTag('u');
	tag$.defineTag('ul');
	tag$.defineTag('video');
	return tag$.defineTag('wbr');

})()