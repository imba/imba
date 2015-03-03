(function(){
// Local version of the global tags
var tag = Object.create(Imba.Tag);
var $$ = Imba.Tag

$()

HelloTagView = Imba.Tag.define("hello",function HelloTag(n,o,b){
	// When this is fired, we have already created the 
	this.setup(n,o,b); // This is the basic initor
	this.build(attrs,body);
});
HelloTagView.prototype.hide = function (){
	this._dom.style.display = 'none';
	return this;
};
HelloTagView.prototype.show = function (){
	this._dom.style.display = 'block';
	return this;
};;
H = tag.hello({classes: ["title"]});
P = tag.p({classes: ["text"]});

}())


(function(){

_DIV_ = Imba.Tag.define("hello",function HelloTag(n,o,b){
	// When this is fired, we have already created the 
	this.setup(n,o,b); // This is the basic initor
	this.build(attrs,body);
});
HelloTagView.prototype.hide = function (){
	this._dom.style.display = 'none';
	return this;
};
HelloTagView.prototype.show = function (){
	this._dom.style.display = 'block';
	return this;
};;
H = hello__({classes: ["title"]});
P = p__({classes: ["text"]});


H = tag.hello.classes("title");
P = tag.p().classes("text").title("other").body([hello]);
P = tag.el('p', {classes: "text", title: "other"̋},[hello]);

P = tag.p().classes("text").title("other").body([hello]).done();
P = tag.p().classes("text").title("other").text("hello");

tag.APP.p()

// tag.p().flag("text").title("other").text("hello");
// tag.p().flag__("text",1).setTitle("other",1).setText("hello",1);
// tag.p(function(t){t.flag("text"),t.title("other"),t.text("hello");});


// <p.text title="other"> "hello"


}())

var fakeNode = true;

function FAKEDOM(){}

FAKEDOM.prototype.setAttribute = function(k,v){
	this[k] = v;
}

function BASETAG(fake){
}

BASETAG.prototype.classes = function(val){
	this.dom.className = val;
	return this;
}

BASETAG.prototype.classes = function(val){
	this.dom.className = val;
	return this;
}
BASETAG.prototype.title = function(val){
	this.dom.setAttribute('title',val);
	return this;
}
BASETAG.prototype.text = function(val){
	this.dom.innerText = val;
	return this;
}

BASETAG.prototype.id = function(val){
	this.dom.id = val;
	return this;
}

BASETAG.prototype.done = function(){
	return this;
}

BASETAG.prototype.setDom = function(dom){
	this.dom = dom;
	dom.tag = this;
}

BASETAG.prototype.setAttributes = function(attrs){
	var keys = Object.keys(attrs), l = keys.length, i = 0, k = '';
	while(i < l) {
		k = keys[i++];
		if(this[k]) this[k](attrs[k]);
	}
	return this;
}

function TAG1(fake){
	this.dom = fake ? new FAKEDOM() : document.createElement('div');
	this.dom.tag = this;
}

TAG1.prototype = Object.create(BASETAG.prototype);

function TAG2(fake,attrs){
	this.dom = fake ? new FAKEDOM() : document.createElement('div');
	this.dom.tag = this;
	this.setAttributes(attrs);
	return this;
}

TAG2.prototype = Object.create(BASETAG.prototype);

function TAG3(fake,id,classes){
	this.dom = fake ? new FAKEDOM() : document.createElement('div');
	this.dom.tag = this;
	if(id) this.dom.id = id;
	if(classes) this.dom.className = classes;
}

TAG3.prototype = Object.create(BASETAG.prototype);

function TAG4(){}
TAG4.prototype = Object.create(BASETAG.prototype);
function TAG4NEW(fake){
	var tag = new TAG4();
	var dom = fake ? new FAKEDOM() : document.createElement('div');
	tag.dom = dom;
	dom.tag = tag;
	return tag;
}

function TAG5(dom){
	this.dom = dom;
	dom.tag = this;
}
TAG5.prototype = Object.create(BASETAG.prototype);
function TAG5NEW(fake){
	var dom = fake ? new FAKEDOM() : document.createElement('div');
	return new TAG5(dom);
}

// Like 
function TAG6(fake){
	this.createElement(fake);
}
TAG6.prototype = Object.create(BASETAG.prototype);
TAG6.prototype.createElement = function(fake){
	this.dom = fake ? new FAKEDOM() : document.createElement('div');
	this.dom.tag = this;
}

function TAG7(dom){
	this.setDom(dom);
}
TAG7.prototype = Object.create(BASETAG.prototype);
function TAG7NEW(fake){
	var dom = fake ? new FAKEDOM() : document.createElement('div');
	return new TAG7(dom);
}

function creator(type,name){
	return function(fake){
		var dom = fake ? new FAKEDOM() : document.createElement(name);
		return new type(dom);
	}
}

TAG7DYN = creator(TAG7,'div');


// var TYPES = {
// 	ul: TAG1,
// 	ol: TAG2,
// 	div: TAG4
// }
// 
// function $$(name,fake){
// 	var typ = TYPES[name];
// 	return new typ(fake);
// }
// 
// 
// 
// $$.ul = function(fake){ return new TAG1(fake); }
// $$.ol = function(fake){ return new TAG2(fake); }

t.div().classes("text").title("other");

new TAG1().classes("text").title("other");
(t = new TAG1(),t.classes("text"),t.title("other"),t);


C = tag$canvas().id("root").flag("page");

C = tag$canvas.flag("page").id("root");

C = tag$('canvas','page').id("root");






(function(){
t$('ol');
tc$('ol','hello');
tc$('canvas','draw full nav-right');
A = tc$('div','hello there again');
C = tic$('canvas','root','page');

Imba.defineTag(function other(d){this.setDom(d)},"canvas",function(tag){



});

(function(tag){

	tag.prototype.awesome = function()

}());

Imba.defineTag(function awesome(d){this.setDom(d)},"other");


var AwesomeTag = Imba.defineTag(function awesome(d){this.setDom(d)},"other");

var AwesomeTag = Imba.defineTag(function awesome(d){this.setDom(d)},"other");


Imba.defineTag(function awesome(d){this.setDom(d)},"other").__extend(function(){

});

(function(){
	// closure
	var tag = Imba.defineTag(function awesome(d){
		this.setDom(d)
	},"other");


	tag.prototype

})();

var tag = Imba.defineTag(function awesome(d){this.setDom(d)},"other");
(function(tag){
	// closure
	

	tag.prototype

})(tag);

Imba.defineTag(function awesome(d){this.setDom(d)},"other").__extend(function(){

});


(function(tag){

	tag.prototype.awesome = function()

}(Imba.defineTag(
	function awesome(d){
		this.setDom(d)
	},
	"other"
));

Other = imba$class(function Other(){
	return this;
});
Other.prototype.ping = function (){
	return 3;
};;
O = tic$('other','home','mobile');
B = tc$('awesome','hello there');
}())






O = tic$('other','home','mobile');
B = tc$('awesome','hello there');
L = tc$('ol','hello').setup([
	t$('li').text("Sindre"),
	t$('li').text("Synne")
]);

O = tag$other().id('home').flag('mobile');
B = tag$awesome().flag('hello there');
L = tag$ol.flag('hello').setup([
	tag$li().text("Sindre"),
	tag$li().text("Synne")
]);--








