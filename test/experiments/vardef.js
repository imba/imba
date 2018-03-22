var __root = {};


__root.one = function (a,b,c){
	return __root;
};

function hello(a,b,c){
	return this;
};


__root.three = function (a,b,c){
	hello;
	__root.one();
	return __root;
}; exports.three = __root.three;

function four(a,b,c){
	return this;
}; exports.four = four;

function Something(){ };

Something.prototype.again = function (){
	__root.one();
	return hello;
};
