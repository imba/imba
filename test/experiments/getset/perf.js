class Direct {
	constructor(){
		this.value = 0;
	}

	setValue(val){
		this.value = val;
		return val;
	}

	getValue(){
		return this.value;
	}

	set other(val){
		this.value = val;
	}

	get other(){
		return this.value;
	}
}


Object.defineProperty(Direct.prototype,'third',{
	configurable: true,
	get: function(){ return this.value; },
	set: function(v){ this.value = v; }
});


// var obj = {};
// 
// var _a = 1;
// 
// obj._a = 1;
// 
// obj.aGetter = function() {
//   return _a;
// }
// 
// obj.aSetter = function(val) {
//   _a = val;
// }
// 
// Object.defineProperty(obj, 'a', {
//   enumerable: true,
//   get: function () {
//     return _a;  
//   },
//   set: function(val) {
//     _a = val;
//   }     
// });

function time(name,fn){
	var obj = new Direct();
	fn(10000000,obj);
	console.time(name);
	var res = fn(1000000,obj);
	console.timeEnd(name);
	console.log(res);
}

time('a',function(i,obj){
	var res = 0;
	while(--i > 0){
		obj.setValue(i);
		res += obj.getValue();
	}
	return res;
})

time('b',function(i,obj){
	var res = 0;
	while(--i > 0){
		obj.other = i;
		res += obj.other;
	}
	return res;
})

time('third',function(i,obj){
	var res = 0;
	while(--i > 0){
		obj.third = i;
		res += obj.other;
	}
	return res;
})