
var readonly = function(target,key,descriptor) {
	descriptor.writable = false;
	return descriptor;
};

var mark = function(value) {
	return function(target,key,descriptor) {
		target._mark = value;
		return descriptor;
	};
};

function Hello(){ };

Hello.hello();

@@mark;
@@readonly;
Hello.prototype.setup = function (){
	console.log("setup!!");
	return this;
};
