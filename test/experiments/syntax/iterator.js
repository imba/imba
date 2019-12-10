function Iterable(){ };
		
Iterable.prototype[Symbol.iterator] = function (){
	return {
		i: 0,
		next: function() {
			if (this.i < 3) {
				return {value: (this.i = this.i + 1) - 1,done: false};
			} else {
				return {value: undefined,done: true};
			};
		}
	};
};
const iterable = new Iterable();
let res;
let res1 = [];
for (let value of iterable){
	res1.push(value);
};
res = res1;
console.log(res1);