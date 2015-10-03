(function(){
	
	// predefine all supported html tags
	Imba.extendTag('htmlelement', function(tag){
		
		
		tag.prototype.__id = {name: 'id'};
		tag.prototype.id = function(v){ return this.getAttribute('id'); }
		tag.prototype.setId = function(v){ this.setAttribute('id',v); return this; };
		
		tag.prototype.__tabindex = {name: 'tabindex'};
		tag.prototype.tabindex = function(v){ return this.getAttribute('tabindex'); }
		tag.prototype.setTabindex = function(v){ this.setAttribute('tabindex',v); return this; };
		
		tag.prototype.__title = {name: 'title'};
		tag.prototype.title = function(v){ return this.getAttribute('title'); }
		tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };
		
		tag.prototype.__role = {name: 'role'};
		tag.prototype.role = function(v){ return this.getAttribute('role'); }
		tag.prototype.setRole = function(v){ this.setAttribute('role',v); return this; };
	});
	
	
	Imba.defineTag('fragment','htmlelement', function(tag){
		
		tag.createNode = function (){
			return Imba.document().createDocumentFragment();
		};
	});
	
	Imba.defineTag('a', function(tag){
		
		tag.prototype.__href = {dom: true,name: 'href'};
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
	});
	
	Imba.defineTag('abbr');
	Imba.defineTag('address');
	Imba.defineTag('area');
	Imba.defineTag('article');
	Imba.defineTag('aside');
	Imba.defineTag('audio');
	Imba.defineTag('b');
	Imba.defineTag('base');
	Imba.defineTag('bdi');
	Imba.defineTag('bdo');
	Imba.defineTag('big');
	Imba.defineTag('blockquote');
	Imba.defineTag('body');
	Imba.defineTag('br');
	
	Imba.defineTag('button', function(tag){
		
		tag.prototype.__autofocus = {name: 'autofocus'};
		tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
		tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
		
		tag.prototype.__type = {dom: true,name: 'type'};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__disabled = {dom: true,name: 'disabled'};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
	});
	
	Imba.defineTag('canvas', function(tag){
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
	
	
	Imba.defineTag('caption');
	Imba.defineTag('cite');
	Imba.defineTag('code');
	Imba.defineTag('col');
	Imba.defineTag('colgroup');
	Imba.defineTag('data');
	Imba.defineTag('datalist');
	Imba.defineTag('dd');
	Imba.defineTag('del');
	Imba.defineTag('details');
	Imba.defineTag('dfn');
	Imba.defineTag('div');
	Imba.defineTag('dl');
	Imba.defineTag('dt');
	Imba.defineTag('em');
	Imba.defineTag('embed');
	Imba.defineTag('fieldset');
	Imba.defineTag('figcaption');
	Imba.defineTag('figure');
	Imba.defineTag('footer');
	
	Imba.defineTag('form', function(tag){
		
		tag.prototype.__method = {dom: true,name: 'method'};
		tag.prototype.method = function(v){ return this.getAttribute('method'); }
		tag.prototype.setMethod = function(v){ this.setAttribute('method',v); return this; };
		
		tag.prototype.__action = {dom: true,name: 'action'};
		tag.prototype.action = function(v){ return this.getAttribute('action'); }
		tag.prototype.setAction = function(v){ this.setAttribute('action',v); return this; };
	});
	
	Imba.defineTag('h1');
	Imba.defineTag('h2');
	Imba.defineTag('h3');
	Imba.defineTag('h4');
	Imba.defineTag('h5');
	Imba.defineTag('h6');
	Imba.defineTag('head');
	Imba.defineTag('header');
	Imba.defineTag('hr');
	Imba.defineTag('html');
	Imba.defineTag('i');
	
	Imba.defineTag('iframe', function(tag){
		
		tag.prototype.__src = {name: 'src'};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	});
	
	Imba.defineTag('img', function(tag){
		
		tag.prototype.__src = {name: 'src'};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
	});
	
	Imba.defineTag('input', function(tag){
		// can use attr instead
		
		tag.prototype.__name = {dom: true,name: 'name'};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__type = {dom: true,name: 'type'};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__value = {dom: true,name: 'value'};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; }; // dom property - NOT attribute
		
		tag.prototype.__required = {dom: true,name: 'required'};
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		tag.prototype.__disabled = {dom: true,name: 'disabled'};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		tag.prototype.__placeholder = {dom: true,name: 'placeholder'};
		tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
		tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; };
		
		
		tag.prototype.__autofocus = {name: 'autofocus'};
		tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
		tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			if (v != this.dom().value) { this.dom().value = v };
			return this;
		};
		
		tag.prototype.checked = function (){
			return this.dom().checked;
		};
		
		tag.prototype.setChecked = function (bool){
			if (bool != this.dom().checked) { this.dom().checked = bool };
			return this;
		};
	});
	
	Imba.defineTag('ins');
	Imba.defineTag('kbd');
	Imba.defineTag('keygen');
	Imba.defineTag('label');
	Imba.defineTag('legend');
	Imba.defineTag('li');
	
	Imba.defineTag('link', function(tag){
		
		tag.prototype.__rel = {dom: true,name: 'rel'};
		tag.prototype.rel = function(v){ return this.getAttribute('rel'); }
		tag.prototype.setRel = function(v){ this.setAttribute('rel',v); return this; };
		
		tag.prototype.__type = {dom: true,name: 'type'};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
		
		tag.prototype.__href = {dom: true,name: 'href'};
		tag.prototype.href = function(v){ return this.getAttribute('href'); }
		tag.prototype.setHref = function(v){ this.setAttribute('href',v); return this; };
		
		tag.prototype.__media = {dom: true,name: 'media'};
		tag.prototype.media = function(v){ return this.getAttribute('media'); }
		tag.prototype.setMedia = function(v){ this.setAttribute('media',v); return this; };
	});
	
	Imba.defineTag('main');
	Imba.defineTag('map');
	Imba.defineTag('mark');
	Imba.defineTag('menu');
	Imba.defineTag('menuitem');
	
	Imba.defineTag('meta', function(tag){
		
		tag.prototype.__name = {dom: true,name: 'name'};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__content = {dom: true,name: 'content'};
		tag.prototype.content = function(v){ return this.getAttribute('content'); }
		tag.prototype.setContent = function(v){ this.setAttribute('content',v); return this; };
		
		tag.prototype.__charset = {dom: true,name: 'charset'};
		tag.prototype.charset = function(v){ return this.getAttribute('charset'); }
		tag.prototype.setCharset = function(v){ this.setAttribute('charset',v); return this; };
	});
	
	Imba.defineTag('meter');
	Imba.defineTag('nav');
	Imba.defineTag('noscript');
	Imba.defineTag('object');
	Imba.defineTag('ol');
	Imba.defineTag('optgroup');
	
	Imba.defineTag('option', function(tag){
		
		tag.prototype.__value = {dom: true,name: 'value'};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
	});
	
	Imba.defineTag('output');
	Imba.defineTag('p');
	Imba.defineTag('param');
	Imba.defineTag('pre');
	Imba.defineTag('progress');
	Imba.defineTag('q');
	Imba.defineTag('rp');
	Imba.defineTag('rt');
	Imba.defineTag('ruby');
	Imba.defineTag('s');
	Imba.defineTag('samp');
	
	Imba.defineTag('script', function(tag){
		
		tag.prototype.__src = {dom: true,name: 'src'};
		tag.prototype.src = function(v){ return this.getAttribute('src'); }
		tag.prototype.setSrc = function(v){ this.setAttribute('src',v); return this; };
		
		tag.prototype.__type = {dom: true,name: 'type'};
		tag.prototype.type = function(v){ return this.getAttribute('type'); }
		tag.prototype.setType = function(v){ this.setAttribute('type',v); return this; };
	});
	
	Imba.defineTag('section');
	
	Imba.defineTag('select', function(tag){
		
		tag.prototype.__multiple = {dom: true,name: 'multiple'};
		tag.prototype.multiple = function(v){ return this.getAttribute('multiple'); }
		tag.prototype.setMultiple = function(v){ this.setAttribute('multiple',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			if (v != this.dom().value) { this.dom().value = v };
			return this;
		};
	});
	
	
	Imba.defineTag('small');
	Imba.defineTag('source');
	Imba.defineTag('span');
	Imba.defineTag('strong');
	Imba.defineTag('style');
	Imba.defineTag('sub');
	Imba.defineTag('summary');
	Imba.defineTag('sup');
	Imba.defineTag('table');
	Imba.defineTag('tbody');
	Imba.defineTag('td');
	
	Imba.defineTag('textarea', function(tag){
		
		tag.prototype.__name = {dom: true,name: 'name'};
		tag.prototype.name = function(v){ return this.getAttribute('name'); }
		tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
		
		tag.prototype.__disabled = {dom: true,name: 'disabled'};
		tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
		tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
		
		tag.prototype.__required = {dom: true,name: 'required'};
		tag.prototype.required = function(v){ return this.getAttribute('required'); }
		tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
		
		tag.prototype.__placeholder = {dom: true,name: 'placeholder'};
		tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
		tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; };
		
		tag.prototype.__value = {dom: true,name: 'value'};
		tag.prototype.value = function(v){ return this.getAttribute('value'); }
		tag.prototype.setValue = function(v){ this.setAttribute('value',v); return this; };
		
		tag.prototype.__rows = {dom: true,name: 'rows'};
		tag.prototype.rows = function(v){ return this.getAttribute('rows'); }
		tag.prototype.setRows = function(v){ this.setAttribute('rows',v); return this; };
		
		tag.prototype.__cols = {dom: true,name: 'cols'};
		tag.prototype.cols = function(v){ return this.getAttribute('cols'); }
		tag.prototype.setCols = function(v){ this.setAttribute('cols',v); return this; };
		
		
		tag.prototype.__autofocus = {name: 'autofocus'};
		tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
		tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
		
		tag.prototype.value = function (){
			return this.dom().value;
		};
		
		tag.prototype.setValue = function (v){
			if (v != this.dom().value) { this.dom().value = v };
			return this;
		};
	});
	
	Imba.defineTag('tfoot');
	Imba.defineTag('th');
	Imba.defineTag('thead');
	Imba.defineTag('time');
	Imba.defineTag('title');
	Imba.defineTag('tr');
	Imba.defineTag('track');
	Imba.defineTag('u');
	Imba.defineTag('ul');
	Imba.defineTag('video');
	return Imba.defineTag('wbr');

})()