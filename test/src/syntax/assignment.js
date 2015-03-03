(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
function O(){
	return this;
};
imba$class(O);

O.prototype.__x = {};
O.prototype.x = function(v){ return this._x; }
O.prototype.setX = function(v){ this._x = v; return this; }
;

O.prototype.__y = {};
O.prototype.y = function(v){ return this._y; }
O.prototype.setY = function(v){ this._y = v; return this; }
;

O.prototype.__z = {};
O.prototype.z = function(v){ return this._z; }
O.prototype.setZ = function(v){ this._z = v; return this; }
;
function SyntaxAssignment(nestings){
	if(nestings === undefined) nestings = 0;
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
};
describe('Syntax - Assignment',function (){
	describe("properties",function (){
		var obj = new SyntaxAssignment();
		
		test("=",function (){
			obj.setIvar(1);
			return eq(obj.ivar(),1);
		});
		test("||=",function (){
			var ivar_, v_, $1, $2;
			(ivar_=obj.ivar()) || ((obj.setIvar(v_=2), v_));
			eq(obj.ivar(),1);
			
			obj.setIvar(0);
			($1=obj.ivar()) || ((obj.setIvar(v_=2), v_));
			eq(obj.ivar(),2);
			
			obj.setIvar(null);
			($2=obj.ivar()) || ((obj.setIvar(v_=3), v_));
			return eq(obj.ivar(),3);
		});
		test("&&=",function (){
			var ivar_, v_;
			obj.setIvar(1);
			(ivar_=obj.ivar()) && ((obj.setIvar(v_=2), v_));
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
			var child_;
			var o1 = new SyntaxAssignment(3);
			var o2 = o1.child();
			var o3 = o2.child();
			o1.reset();
			eq(o1.calls(),0);
			o1.child().child().setIvar(2);
			eq(o3.ivar(),2);
			eq(o1.calls(),1);
			
			(child_=o1.child().child()).setIvar(child_.ivar() + 2);
			eq(o3.ivar(),4);
			return eq(o1.calls(),2);
		});
	});
	describe("statements",function (){
		var obj = new SyntaxAssignment();
		var truthy = 1;
		var falsy = 0;
		
		test("=",function (){
			var v_;
			var localvar;
			obj.setIvar(1);
			eq(obj.ivar(),1);
			
			if(truthy) {
				try {
					localvar = (obj.setIvar(v_=4), v_);
				}
				catch (e) {
					localvar = (obj.setIvar($1=3), $1);
				}
				;
			} else {
				localvar = (obj.setIvar(v_=2), v_);
			};
			
			eq(localvar,4);
			eq(obj.ivar(),4);
			
			if(truthy) {
				try {
					localvar = (obj.setIvar(v_=nomethod()), v_);
				}
				catch (e) {
					localvar = (obj.setIvar($1=3), $1);
				}
				;
			} else {
				localvar = (obj.setIvar(v_=2), v_);
			};
			
			eq(localvar,3);
			return eq(obj.ivar(),3);
		});
		test("||= statement",function (){
			var ivar_, v_;
			obj.setIvar(0);
			if(!(ivar_=(obj.ivar()))) {
				if(truthy) {
					try {
						var l = (obj.setIvar(v_=nomethod()), v_);
					}
					catch (e) {
						l = (obj.setIvar($1=3), $1);
					}
					;
				} else {
					l = (obj.setIvar(v_=2), v_);
				}
			} else {
				l = ivar_
			};
			
			eq(l,3);
			return eq(obj.ivar(),3);
		});
		test("+= statement",function (){
			var tmp, v_;
			var l0 = 0;
			var l1 = 0;
			var l2 = 0;
			var l3 = 1;
			obj.setIvar(1);
			if(!l1) {
				if(l3) {
					if(truthy) {
						try {
							l0 = l1 = (obj.setIvar(v_=obj.ivar() + (l3 = nomethod())), v_);
						}
						catch (e) {
							l0 = l1 = (obj.setIvar($1=obj.ivar() + (l3 = 3)), $1);
						}
						;
					} else {
						l0 = l1 = (obj.setIvar(v_=obj.ivar() + (l3 = 2)), v_);
					}
				} else {
					l0 = l1 = (obj.setIvar(v_=obj.ivar() + l3), v_)
				}
			} else {
				l0 = l1
			};
			
			eq(l0,l1);
			eq(l1,obj.ivar());
			return eq(obj.ivar(),4);
		});
		return test("caching access for compound assigns",function (){
			var child_, ivar_, v_;
			var o1 = new SyntaxAssignment(3);
			var o2 = o1.child();
			var o3 = o2.child();
			o1.reset();
			
			o1.setIvar(1);
			o1.child().setIvar(1);
			eq(o1.calls(),1);
			o1.reset();
			(ivar_=(child_=o1.child()).ivar()) && ((child_.setIvar(v_=2), v_));
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
		
		(list[($1=++count)] == null) ? (list[$1] = 1) : (list[$1]);
		eq(1,list[1]);
		eq(1,count);
		
		(list[($2=++count)] == null) ? (list[$2] = 2) : (list[$2]);
		eq(2,list[2]);
		eq(2,count);
		
		list[($3=count++)] && (list[$3] = 6);
		eq(6,list[2]);
		eq(3,count);
		var base;
		
		base = function (){
			++count;
			return base;
		};
		(($4=base()).four == null) ? ($4.four = 4) : ($4.four);
		eq(4,base.four);
		eq(4,count);
		
		(($5=base()).five == null) ? ($5.five = 5) : ($5.five);
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
	test('a,b,c = 1,2,3',function (_0,_1,_2){
		var b, c, d, $1, $2, items, array, len, i, coll, len_, j, tmp, ary_, ary__, v_, $3, len__, k, tmplist;
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
		
		$1=b, $2=a, a = $1, b = $2;
		eq([a, b],[3, [1, 2]]);
		
		$1=[30, a], a = 10, b = 20, c = $1;
		eq([a, b, c],[10, 20, [30, 3]]);
		
		var items=iter$(ary);
		var a = items[(0)],b = items[(1)],c = items[(2)];
		eq([a, b, c],[1, 2, 3]);
		
		var array=iter$(ary),len=array.length,i=0;
		var a = array[i++],b = array[i++],c = new Array(len - 2);
		while(i < len){
			c[i - 2] = array[i++];
		};
		eq([a, b, c],[1, 2, [3, 4, 5]]);
		
		var list = [10, 20, 30];
		
		$1=list[1], $2=list[0], list[0] = $1, list[1] = $2;
		eq(list,[20, 10, 30]);
		
		var coll=iter$(ary),len_=coll.length,j=0,tmp=new Array(len_ - 2);
		list[0] = coll[j++];
		while(j < len_ - 1){
			tmp[j - 1] = coll[j++];
		};
		list[1] = tmp;
		list[2] = coll[j++];
		eq(list,[1, [2, 3, 4], 5]);
		
		for(var k=0, ary_=iter$(ary), len__=ary_.length, res=[]; k < len__; k++){
			res.push(ary_[k] * 2);
		};
		var x = res;
		eq(x,[2, 4, 6, 8, 10]);
		
		for(var k=0, ary_=iter$(ary), len__=ary_.length, res=[]; k < len__; k++){
			res.push(ary_[k] * 2);
		};
		var ary_=iter$(res);
		x = ary_[(0)];
		var y = ary_[(1)];
		eq([x, y],[2, 4]);
		
		for(var k=0, ary__=iter$(ary), len__=ary__.length, res=[]; k < len__; k++){
			res.push(ary__[k] * 2);
		};
		var ary__=iter$(res);
		x = ary__[(0)];
		y = ary__[(1)];
		(obj.setZ(v_=ary__[(2)]), v_);
		eq([x, y, obj.z()],[2, 4, 6]);
		
		for(var k=0, $1=iter$(ary), len__=$1.length, res=[]; k < len__; k++){
			res.push($1[k] * 2);
		};
		var $3=iter$(res),len__=$3.length,k=0,tmplist=new Array(len__ - 2);
		x = $3[k++];
		y = $3[k++];
		while(k < len__){
			tmplist[k - 2] = $3[k++];
		};
		(obj.setZ(tmplist), tmplist);
		eq([x, y, obj.z()],[2, 4, [6, 8, 10]]);
		a = _0, b = _1, c = _2;
		return;
	});
	test('a,b,c = x,y,z',function (){
		var a, b, c, $1, $2, $3, x, y;
		var o = {x: 0,y: 1,z: 2};
		var a = o.x, b = o.y, c = o.z;
		eq([a, b, c],[0, 1, 2]);
		var v = 0;
		var $1=v = 5, $2=v, $3=v, a = $1, b = $2, c = $3;
		eq([a, b, c],[5, 5, 5]);
		
		var x = 10, y = 20;
		$1=y, $2=x, x = $1, y = $2;
		eq([x, y],[20, 10]);
		
		x = 10, y = 20;
		$1=x += 20,y, $2=x, x = $1, y = $2;
		eq([x, y],[20, 30]);
		
		var fn = function (){
			x = 100;
			return 10;
		};
		x = 10, y = 20;
		$1=fn(), $2=x, x = $1, y = $2;
		return eq([x, y],[10, 100]);
	});
	test('.a,.b = x,y',function (){
		var z_, a, b, c, i, $1, $2;
		function A(){
			this._x = 0;
			this._y = 0;
			this._z = 0;
		};
		imba$class(A);
		
		A.prototype.__x = {};
		A.prototype.x = function(v){ return this._x; }
		A.prototype.setX = function(v){ this._x = v; return this; }
		;
		
		A.prototype.__y = {};
		A.prototype.y = function(v){ return this._y; }
		A.prototype.setY = function(v){ this._y = v; return this; }
		;
		
		A.prototype.__z = {};
		A.prototype.z = function(v){ return this._z; }
		A.prototype.setZ = function(v){ this._z = v; return this; }
		;
		
		A.prototype.setX = function (x){
			(this._z)++;
			return this._x = x;
		};
		var o = new A();
		z_=o.z(), o.setX(1), (o.setY(z_), z_);
		eq([o.x(), o.y()],[1, 0]);
		var a = 0, b = 0, c = 0, i = 0;
		var m = function (){
			return a + b + c;
		};
		z_=m(), $1=m(), $2=m(), a = z_, b = $1, c = $2;
		return eq([a, b, c],[0, 0, 0]);
	});
	test('tuples - edgecase',function (){
		var b, c, i, $1, $2, a;
		var b = 0, c = 0, i = 0;
		var m = function (){
			return (++i) + b + c;
		};
		var a = m(), $1=m(), $2=m(), b = $1, c = $2;
		return eq([a, b, c],[1, 2, 3]);
	});
	return test('tuples - edgecase 2',function (){
		var a, c, i, $1, $2, $3, b;
		var a = 0, c = 0, i = 0;
		
		var m = function (){
			a = 10;
			return (++i) + a + c;
		};
		var $1=m(), $2=m(), $3=m(), a = $1, b = $2, c = $3;
		return eq([a, b, c],[11, 12, 13]);
	});
});
}())