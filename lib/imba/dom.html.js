(function(){
	
	// predefine all supported html tags
	Imba.TAGS.extendTag('htmlelement', function(tag){
		
		
		
		tag.prototype.id = function(v){ return this.getAttribute('id'); }
		tag.prototype.setId = function(v){ this.setAttribute('id',v); return this; };
		
		
		tag.prototype.tabindex = function(v){ return this.getAttribute('tabindex'); }
		tag.prototype.setTabindex = function(v){ this.setAttribute('tabindex',v); return this; };
		
		
		tag.prototype.title = function(v){ return this.getAttribute('title'); }
		tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };
		
		
		tag.prototype.role = function(v){ return this.getAttribute('role'); }
		tag.prototype.setRole = function(v){ this.setAttribute('role',v); return this; };
	});
	
	
	Imba.TAGS.defineTag('fragment','htmlelement', function(tag){
		
		tag.createNode = function (){
			return Imba.document().createDocumentFragment();
		};
	});
	
	Imba.TAGS.defineTag('a', function(tag){
		
		
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
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
		
		
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
	});
	
	Imba.TAGS.defineTag('canvas', function(tag){
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
	Imba.TAGS.defineTag('fieldset');
	Imba.TAGS.defineTag('figcaption');
	Imba.TAGS.defineTag('figure');
	Imba.TAGS.defineTag('footer');
	
	Imba.TAGS.defineTag('form', function(tag){
		
		
		tag.prototype.method = function(v){ return this.getAttribute('method'); }
		tag.prototype.setMethod = function(v){ this.setAttribute('method',v); return this; };
		
		
		tag.prototype.action = function(v){ return this.getAttribute('action'); }
		tag.prototype.setAction = function(v){ this.setAttribute('action',v); return this; };
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
		
		
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	});
	
	Imba.TAGS.defineTag('img', function(tag){
		
		
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	});
	
	Imba.TAGS.defineTag('input', function(tag){
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
	
	Imba.TAGS.defineTag('ins');
	Imba.TAGS.defineTag('kbd');
	Imba.TAGS.defineTag('keygen');
	Imba.TAGS.defineTag('label');
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
		
		
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		
		tag.prototype.content = function(v){ return this.getAttribute('content'); }
		tag.prototype.setContent = function(v){ this.setAttribute('content',v); return this; };
		
		
		tag.prototype.charset = function(v){ return this.getAttribute('charset'); }
		tag.prototype.setCharset = function(v){ this.setAttribute('charset',v); return this; };
	});
	
	Imba.TAGS.defineTag('meter');
	Imba.TAGS.defineTag('nav');
	Imba.TAGS.defineTag('noscript');
	Imba.TAGS.defineTag('object');
	Imba.TAGS.defineTag('ol');
	Imba.TAGS.defineTag('optgroup');
	
	Imba.TAGS.defineTag('option', function(tag){
		
		
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
	});
	
	Imba.TAGS.defineTag('output');
	Imba.TAGS.defineTag('p');
	Imba.TAGS.defineTag('param');
	Imba.TAGS.defineTag('pre');
	Imba.TAGS.defineTag('progress');
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
	});
	
	Imba.TAGS.defineTag('section');
	
	Imba.TAGS.defineTag('select', function(tag){
		
		
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
	return Imba.TAGS.defineTag('wbr');

})()