(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
Imba = {};

Imba.Promise = imba$class(function Promise(block){
	var self=this;
	self._thens = [];
	self._value = null;
	self._resolved = false;
	self._resolver = function (v){
		return self.resolve(v);
	};
	if(block) {
		block(self._resolver,self);
	};
	self;
});
Imba.Promise.prototype.then = function (cb){
	if(this._resolved) {
		cb(this._value);
	} else {
		this._thens.push(cb);
	};
	return this;
};
Imba.Promise.prototype.resolve = function (value){
	this._value = value;
	this._resolved = true;
	for(var i=0, ary=iter$(this._thens), len=ary.length; i < len; i++){
		ary[i](this._value);
	};
	this._thens = [];
	return this;
};
Imba.Promise.prototype.raise = function (err){
	return this;
};
}())