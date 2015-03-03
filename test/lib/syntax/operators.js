(function(){
function Cache(val){
	this._gets = 0;
	this._value = val;
};
imba$class(Cache);
Cache.prototype.gets = function (){
	return this._gets;
};
Cache.prototype.setGets = function (v){
	return this._gets = v;
};;
Cache.prototype.value = function (){
	(this._gets)++;
	return this._value;
};;
function Group(items){
	this._items = items;
};
imba$class(Group);
Group.prototype.items = function (){
	return this._items;
};
Group.prototype.setItems = function (v){
	return this._items = v;
};;
Group.prototype.toString = function (){
	return this._items.toString();
};
Group.prototype.__union = function (other){
	return new Group(union$(this._items,other.items()));
};
Group.prototype.__intersect = function (other){
	return new Group(intersect$(this._items,other.items()));
};;
describe('Syntax - Operators',function (){
	test("union and intersect",function (){
		var a = [1, 2, 3, 6];
		var b = [3, 4, 5, 6];
		eq(union$(a,b),[1, 2, 3, 6, 4, 5]);
		eq(intersect$(a,b),[3, 6]);
		var ga = new Group([4, 5, 6]);
		var gb = new Group([5, 6, 7]);
		var gc = new Group([8, 9]);
		var gd = (union$(ga,gb));
		ok(gd instanceof Group);
		eq(gd.items(),[4, 5, 6, 7]);
		gd = intersect$(ga,gb);
		ok(gd instanceof Group);
		eq(gd.items(),[5, 6]);
		eq((intersect$(gb,gc)).items(),[]);
		gd = union$(intersect$(ga,gb),gc);
		eq(gd,[5, 6, 8, 9]);
		gd = union$(intersect$(ga,gb),gc) && ga;
		return eq(gd,ga);
	});
	test("in",function (){
		var a = 5;
		var ary = [1, 2, 3, 4, 5];
		ok(idx$(a,ary) >= 0);
		eq(idx$(3,ary) >= 0,true);
		eq(idx$(10,ary) >= 0,false);
		eq(idx$(3,[1, 2, 3, 4]) >= 0,true);
		eq(idx$(6,[1, 2, 3, 4]) >= 0,false);
		return ok(idx$(6,ary) == -1);
	});
	test("comparison",function (){
		var $1, value0, $2;
		var a = 50;
		ok(100 > a && a > 10);
		eq(100 > ($1 = (a = 10)) && $1 > 10,false);
		ok(100 > a && a < 50);
		var b = new Cache(10);
		ok(100 > (value0 = b.value()) && value0 > 2);
		ok(b.gets() == 1);
		ok(100 > ($2 = b.value()) && $2 < 30);
		return ok(b.gets() == 2);
	});
	return test("precedence",function (){
		ok(10 + 10 * 2,30);
		ok((10 + 10) * 2,40);
		var a = 0;
		var b = 0;
		var c = 0;
		a = 10 + 20;
		eq(a,30);
		(a = 10) + 20;
		eq(a,10);
		b = 10 + (a = 5);
		eq(b,15);
		eq(a,5);
		a = 0;
		if(!(true || true)) {
			a = 10;
		};
		return eq(a,0);
	});
});
}())