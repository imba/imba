(function(){
function promise$(a){ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); }
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
var a = [1, 2, 3, 4];
promise$(a.map(function (v){
	return v.load();
})).then(function (x){
	return promise$((function (){
		for(var i=0, ary=iter$(test()), len=ary.length, res=[]; i < len; i++){
			res.push(ary[i].load());
		};
		return res;
	})()).then(function (y){
		
	});
});
}())