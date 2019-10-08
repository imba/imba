function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = require('imba'), _2 = Imba.createTagList, _1 = Imba.createElement;
Imba.defineTag('app', function(tag){
	
	tag.prototype.header = function (){
		var _t1, _t2, t0;
		return ((_t1 = t0 = (t0=_1('header')),_t1.setContent([
			(_t2 = _1('div',t0.$,'A',t0),_t2.setText("This is my title"),_t2),
			(_t2 = _1('button',t0.$,'B',t0),_t2.flag('right'),_t2.flag('here'),_t2.setTitle("Something"),_t2.setText("Go go"),_t2)
		],2),_t1),_t1.end((
			(_t2=t0.$.A,_t2.flagIf('bold',this.expanded),_t2.flagIf('logout',this.user),_t2.setTitle(this.title),_t2.end(),_t2),
			(_t2=t0.$.B,_t2.end(),_t2)
		,true)),_t1);
	};
	
	tag.prototype.render = function (){
		var _t1, _t2, $ = this.$, _t3, self = this;
		return (_t1 = self,_t1.$open(0),_t1.setChildren($.$ = $.$ || [
			(_t2 = _1('ul',$,0,self),_t2.flag('a'),_t2.flag('b'),_t2.setRole("list"),_t2.setContent([
				(_t3 = _1('li',$,1,0),_t3.setText("one"),_t3),
				(_t3 = _1('li',$,2,0),_t3.setText("two"),_t3),
				_1('li',$,3,0)
			],2),_t2),
			_1('ul',$,4,self),
			(_t2 = _1('main',$,6,self),_t2.flag('one'),_t2.flag('two'),_t2.flag('three'),_t2.setContent(
				(_t3 = $[7] || _1('p',$,7,6),_t3.setText("This is the app"),_t3)
			,2),_t2)
		],2),_t1.synced((
			(_t2=$[0],_t2.end((
				(_t3=$[3],_t3.setText("three " + (Math.random)),_t3)
			,true)),_t2),
			(_t2=$[4],_t2.setContent((function tagLoop($0) {
				var _t31;
				for (let i = 0, items = iter$(self.items), len = $0.taglen = items.length; i < len; i++) {
					($0[i] || _1('li',$0,i),_t31.setContent(items[i],3),_t31);
				};return $0;
			})($[5] || _2($,5,$[4])),4),_t2)
		,true)),_t1);
	};
});
