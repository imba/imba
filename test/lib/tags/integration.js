(function(){
function Tracer(){
	this.clear();
};
imba$class(Tracer);
Tracer.prototype.stack = function (){
	return this._stack;
};
Tracer.prototype.setStack = function (v){
	return this._stack = v;
};;
Tracer.prototype.clear = function (){
	return this._stack = [];
};
Tracer.prototype.trace = function (arg){
	this._stack.push(arg);
	return this;
};;
var tracer;
setTrace(function (){
	tracer || (tracer = new Tracer());
	return tracer.trace.apply(tracer,arguments);
});
Imba.defineTag(function entries(d){this.setDom(d)},"ul");
Imba.defineTag(function entry(d){this.setDom(d)},"li");
Imba.defineTag(function task(d){this.setDom(d)},"entry");
Imba.defineTag(function project(d){this.setDom(d)},"entry");
(function(){
	var tag = Imba.defineSingletonTag(function app(d){this.setDom(d)});
	tag.prototype.awake = function (){
		return this;
	};
})();
}())