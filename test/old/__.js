var self = {}, t$0, t$bS, t$1, b$0, d$0;
imba.createProxyProperty = function (target){
	function getter(){
		return target[0] ? target[2][2] : undefined;
	};
	
	function setter(v){
		return target[0] ? 1 : null;
	};
	
	return {
		get: getter,
		set: setter
	};
};

var b = {a,b,c: self.c};

((t$0=imba.createElement('app-item',4,null,null,null,null)),
t$bS = t$0.slot$('__',t$0),
((t$1=imba.createElement('div',384,t$bS,'at-close','close?',null)),
t$1.on$(`click`,{_close: true},self)),
b$0 || !t$0.setup || t$0.setup(d$0),
t$0.end$(d$0),
t$0);

// #hello{x}_
// #alias{test} = value
// @test{hello}
// handlers[str](params.slice(1))
