(function(){
UlTagView = Imba.Tag.define("ul",function UlTagView(d,o,b){
	this.setDom(d);
	this.setup(o,b);
});
UlTagView.prototype.ok = function (){
	return "ul";
};;
LiTagView = Imba.Tag.define("li",function LiTagView(d,o,b){
	this.setDom(d);
	this.setup(o,b);
});
LiTagView.prototype.ok = function (){
	return "li";
};;
HelloTagView = Imba.Tag.define("hello",function HelloTagView(d,o,b){
	this.setDom(d);
	this.setup(o,b);
},"li");
HelloTagView.prototype.ok = function (){
	return "hello";
};
HelloTagView.prototype.hide = function (){
	this._dom.style.display = 'none';
	return this;
};
HelloTagView.prototype.show = function (){
	this._dom.style.display = 'block';
	return this;
};;
U = tag$("ul",{classes: ["harroo"]});
H = tag$("hello",{classes: ["title"]});
P = tag$("p",{classes: ["text"]});
}())