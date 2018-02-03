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

Imba.TAGS.extendTag('select', function(tag){
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

