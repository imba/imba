(function(){
function O(){
	return this;
};
imba$class(O);
O.prototype.x = function (){
	return this._x;
};
O.prototype.setX = function (v){
	return this._x = v;
};;
O.prototype.y = function (){
	return this._y;
};
O.prototype.setY = function (v){
	return this._y = v;
};;
O.prototype.z = function (){
	return this._z;
};
O.prototype.setZ = function (v){
	return this._z = v;
};;;
function SyntaxAssignment(nestings){
	if(nestings === undefined) nestings = 0;;
	this._gets = 0;
	this._sets = 0;
	this._calls = 0;
	if(nestings > 0) {
		this._child = new SyntaxAssignment(nestings - 1);
	};
	this;
};
imba$class(SyntaxAssignment);
SyntaxAssignment.prototype.setIvar = function (val){
	this._sets = this._sets + 1;
	return this._ivar = val;
};
SyntaxAssignment.prototype.ivar = function (){
	this._gets = this._gets + 1;
	return this._ivar;
};
SyntaxAssignment.prototype.child = function (){
	this._calls = this._calls + 1;
	return this._child;
};
SyntaxAssignment.prototype.gets = function (){
	return this._gets;
};
SyntaxAssignment.prototype.sets = function (){
	return this._sets;
};
SyntaxAssignment.prototype.calls = function (){
	return this._calls;
};
SyntaxAssignment.prototype.reset = function (){
	this._gets = 0;
	this._sets = 0;
	this._calls = 0;
	if(this._child) {
		this._child.reset();
	};
	return this;
};
SyntaxAssignment.prototype.testmeth1 = function (){
	this.reset();
	this._ivar = 10;
	var ivar = this.ivar();
	ivar;
	return this;
};;
describe('Syntax - Assignment',function (){
	describe("properties",function (){
		var obj = new SyntaxAssignment();
		test("=",function (){
			obj.setIvar(1);
			return eq(obj.ivar(),1);
		});
		test("||=",function (){
			var ivar0, $1, $2;
			(ivar0 = obj.ivar()) || (obj.setIvar(2));
			eq(obj.ivar(),1);
			obj.setIvar(0);
			($1 = obj.ivar()) || (obj.setIvar(2));
			eq(obj.ivar(),2);
			obj.setIvar(null);
			($2 = obj.ivar()) || (obj.setIvar(3));
			return eq(obj.ivar(),3);
		});
		test("&&=",function (){
			var ivar0;
			obj.setIvar(1);
			(ivar0 = obj.ivar()) && (obj.setIvar(2));
			return eq(obj.ivar(),2);
		});
		test("+=",function (){
			obj.setIvar(1);
			obj.setIvar(obj.ivar() + 1);
			return eq(obj.ivar(),2);
		});
		test("-=",function (){
			obj.setIvar(1);
			obj.setIvar(obj.ivar() - 1);
			return eq(obj.ivar(),0);
		});
		return test("caching target",function (){
			var child0;
			var o1 = new SyntaxAssignment(3);
			var o2 = o1.child();
			var o3 = o2.child();
			o1.reset();
			eq(o1.calls(),0);
			o1.child().child().setIvar(2);
			eq(o3.ivar(),2);
			eq(o1.calls(),1);
			(child0 = o1.child().child()).setIvar(child0.ivar() + 2);
			eq(o3.ivar(),4);
			return eq(o1.calls(),2);
		});
	});
	describe("statements",function (){
		var obj = new SyntaxAssignment();
		var truthy = 1;
		var falsy = 0;
		test("=",function (){
			var localvar;
			obj.setIvar(1);
			eq(obj.ivar(),1);
			if(truthy) {
				try {
					localvar = obj.setIvar(4);
				}
				catch (e) {
					localvar = obj.setIvar(3);
				}
				;
			} else {
				localvar = obj.setIvar(2);
			};
			eq(localvar,4);
			eq(obj.ivar(),4);
			if(truthy) {
				try {
					localvar = obj.setIvar(nomethod());
				}
				catch (e) {
					localvar = obj.setIvar(3);
				}
				;
			} else {
				localvar = obj.setIvar(2);
			};
			eq(localvar,3);
			return eq(obj.ivar(),3);
		});
		test("||= statement",function (){
			var ivar0;
			obj.setIvar(0);
			if(!(ivar0 = (obj.ivar()))) {
				if(truthy) {
					try {
						var l = obj.setIvar(nomethod());
					}
					catch (e) {
						l = obj.setIvar(3);
					}
					;
				} else {
					l = obj.setIvar(2);
				}
			} else {
				l = ivar0
			};
			eq(l,3);
			return eq(obj.ivar(),3);
		});
		test("+= statement",function (){
			var tmp;
			var l0 = 0;
			var l1 = 0;
			var l2 = 0;
			var l3 = 1;
			obj.setIvar(1);
			if(!l1) {
				if(l3) {
					if(truthy) {
						try {
							l0 = l1 = obj.setIvar(obj.ivar() + (l3 = nomethod()));
						}
						catch (e) {
							l0 = l1 = obj.setIvar(obj.ivar() + (l3 = 3));
						}
						;
					} else {
						l0 = l1 = obj.setIvar(obj.ivar() + (l3 = 2));
					}
				} else {
					l0 = l1 = obj.setIvar(obj.ivar() + l3)
				}
			} else {
				l0 = l1
			};
			eq(l0,l1);
			eq(l1,obj.ivar());
			return eq(obj.ivar(),4);
		});
		return test("caching access for compound assigns",function (){
			var child0, ivar0;
			var o1 = new SyntaxAssignment(3);
			var o2 = o1.child();
			var o3 = o2.child();
			o1.reset();
			o1.setIvar(1);
			o1.child().setIvar(1);
			eq(o1.calls(),1);
			o1.reset();
			(ivar0 = (child0 = o1.child()).ivar()) && (child0.setIvar(2));
			eq(o2.ivar(),2);
			return eq(o1.calls(),1);
		});
	});
	test("boolean operators",function (){
		var nonce = {};
		var a = 0;
		a || (a = nonce);
		eq(nonce,a);
		var b = 1;
		b || (b = nonce);
		eq(1,b);
		var c = 0;
		c && (c = nonce);
		eq(0,c);
		var d = 1;
		d && (d = nonce);
		return eq(nonce,d);
	});
	test("mathematical operators",function (){
		var a = [1, 2, 3, 4];
		var b = [3, 4, 5, 6];
		var u = union$(a,b);
		eq(u,[1, 2, 3, 4, 5, 6]);
		var i = intersect$(a,b);
		return eq(i,[3, 4]);
	});
	test("compound assignment as a sub expression",function (){
		return p("no support for compound assigns yet");
	});
	test("compound assignment should be careful about caching variables",function (){
		var $1, $2, $3, $4, $5;
		var count = 0;
		var list = [];
		(list[($1 = ++count)] == null) ? (list[$1] = 1) : (list[$1]);
		eq(1,list[1]);
		eq(1,count);
		(list[($2 = ++count)] == null) ? (list[$2] = 2) : (list[$2]);
		eq(2,list[2]);
		eq(2,count);
		list[($3 = count++)] && (list[$3] = 6);
		eq(6,list[2]);
		eq(3,count);
		var base;
		base = function (){
			++count;
			return base;
		};
		(($4 = base()).four == null) ? ($4.four = 4) : ($4.four);
		eq(4,base.four);
		eq(4,count);
		(($5 = base()).five == null) ? ($5.five = 5) : ($5.five);
		eq(5,base.five);
		return eq(5,count);
	});
	test("compound assignment with implicit objects",function (){
		var obj = undefined;
		(obj == null) ? (obj = {one: 1}) : (obj);
		eq(obj.one,1);
		obj && (obj = {two: 2});
		eq(undefined,obj.one);
		return eq(2,obj.two);
	});
	test("compound assignment (math operators)",function (){
		var num = 10;
		num -= 5;
		eq(5,num);
		num *= 10;
		eq(50,num);
		num /= 10;
		eq(5,num);
		num %= 3;
		return eq(2,num);
	});
	test("more compound assignment",function (){
		var a = {};
		var val = undefined;
		val || (val = a);
		val || (val = true);
		eq(a,val);
		var b = {};
		val && (val = true);
		eq(val,true);
		val && (val = b);
		eq(b,val);
		var c = {};
		val = null;
		(val == null) ? (val = c) : (val);
		(val == null) ? (val = true) : (val);
		return eq(c,val);
	});
	return test('a,b,c = 1,2,3',function (_0,_1,_2){
		var b, c, d, $1, items, len, i, tmp;
		var ary = [1, 2, 3, 4, 5];
		var obj = new O();
		var a = 1;
		eq(a,1);
		var b = 2, c = 3;
		eq([a, b, c],[1, 2, 3]);
		var a = 2, b = [4], c = 6;
		eq([a, b, c],[2, [4], 6]);
		var a = 2, b = 4, c = [6];
		eq([a, b, c],[2, 4, [6]]);
		var a = 1, b = [2, 3], c = 4, d = 5;
		eq([a, b, c, d],[1, [2, 3], 4, 5]);
		var a = 1, b = 2, c = 3, d = [4, 5];
		eq([a, b, c, d],[1, 2, 3, [4, 5]]);
		var a = [1, 2], b = 3, c = 4, d = 5;
		eq([a, b, c, d],[[1, 2], 3, 4, 5]);
		$1 = a, a = b, b = $1;
		eq([a, b],[3, [1, 2]]);
		$1 = a, a = 10, b = 20, c = [30, $1];
		eq([a, b, c],[10, 20, [30, 3]]);
		var items = iter$(ary);
		var a = items[0],b = items[1],c = items[2];;
		eq([a, b, c],[1, 2, 3]);
		var items = iter$(ary),len = items.length,i = 0;
		var a = items[i++],b = items[i++],c = new Array(len - 2);
		while(i < len){
			c[i - 2] = items[i++];
		};;
		eq([a, b, c],[1, 2, [3, 4, 5]]);
		var list = [10, 20, 30];
		$1 = list[0], list[0] = list[1], list[1] = $1;
		eq(list,[20, 10, 30]);
		var items = iter$(ary),len = items.length,i = 0,tmp = new Array(len - 2);
		list[0] = items[i++];;
		while(i < len - 1){
			tmp[i - 1] = items[i++];
		};
		list[1] = tmp;
		list[2] = items[i++];;;
		eq(list,[1, [2, 3, 4], 5]);
		for(var j = 0, array = iter$(ary), len_ = array.length, v, res = []; j < len_; j = j + 1){
			v = array[j];
			res.push(v * 2);
		};
		var x = res;;
		eq(x,[2, 4, 6, 8, 10]);
		for(var j = 0, array = iter$(ary), len_ = array.length, v, res = []; j < len_; j = j + 1){
			v = array[j];
			res.push(v * 2);
		};
		var items = iter$(res);
		x = items[0];
		var y = items[1];;;;
		eq([x, y],[2, 4]);
		for(var j = 0, array = iter$(ary), len_ = array.length, v, res = []; j < len_; j = j + 1){
			v = array[j];
			res.push(v * 2);
		};
		var items = iter$(res);
		x = items[0];
		y = items[1];
		obj.setZ(items[2]);;;;
		eq([x, y, obj.z()],[2, 4, 6]);
		for(var j = 0, array = iter$(ary), len_ = array.length, v, res = []; j < len_; j = j + 1){
			v = array[j];
			res.push(v * 2);
		};
		var items = iter$(res),len = items.length,i = 0,tmp = new Array(len - 2);
		x = items[i++];
		y = items[i++];;
		while(i < len){
			tmp[i - 2] = items[i++];
		};
		obj.setZ(tmp);;;;
		eq([x, y, obj.z()],[2, 4, [6, 8, 10]]);
		a = _0, b = _1, c = _2;
		return;
	});
});
}())