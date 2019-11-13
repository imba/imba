# var Imba = require '../index'

def render
	<footer title="Hello" tabindex=@dynamic>
		<section>
			<h1> "Screen"
			<span.width>
			<span.height>
		<section>
			<div> "Hello"
			<span>
				"Rendered "
				@count++
				" times"

var item = render()

###
self.hello = function (){
	$ = self.$ni231 || (self.$ni231 = TagTree())
	_t1 = self
	_init = $.built
	_t1.$open('hello0')
	_t2 = $.a || $.a = _1('section',self)
	_t3 = _1('h1',$,1,0)
	_t3.setText("Screen"),
	_t2.append(_t3)
	_t2.append(this.dynamic)
	_t1.push(_t2)
	_t1.synced($.built=true)
};

self.hello = function (){
	$ = self.$ni231 || (self.$ni231 = TagTree())
	_t1 = self
	_init = $.built
	_t1.$open('hello0')
	_t2 = $.a || $.a = _1('section',_t1,0)
	_t3 = $.b || $.b = _1('h1',_t2,0)
	_t3.setText("Screen"),
	_t2.append(this.dynamic,1)
	_t1.synced()
};

self.hello = function (){
	$ = self.$ni231 || (self.$ni231 = TagTree())
	_t1 = self
	_init = $.built
	_t1.$open('hello0')
	_init || (_t2 = $.a || $.a = _1('section',_t1,0))
	_init || (_t3 = $.b || $.b = _1('h1',_t2,0))
	_init || _t3.setText("Screen")
	_t2.append(this.dynamic,1)
	_t1.synced($.built=true)
};

self.hello = function (){
	$ = this.$ni231 || (this.$ni231 = TagTree())
	_init = $.built
	_init || $.z = this
	$.z.$open('hello0')
	_init || $.a = _1('section',$.z,0))
	_init || $.b = _1('h1',$.a,0)
	_init || $.b.setText("Screen")
	$.a.append(this.dynamic,1)
	$.z.synced($.built=true)
	$.z
};

// With if else
function (){
	$ = this.$ni231 || (this.$ni231 = TagTree())
	_init = $.built
	_init || $.z = this
	$.z.$open()
	_init || $.a = _1('section',$.z,0))
	_init || $.b = _1('h1',$.a,0).setText("Screen")

	if (this.one) {
		_tree = _cond($.z,1,0) // act as a fragment?
		_init || $.c = _1('span',_tree,0).setText("one")
		_render(_tree,this.dynamic,1)
		_render($.z,_tree)

	} else if (this.two) {
		_cond($.z,1,1)
		_init || $.d = _1('span',$.z).setText("two")
		_render($.z,$.d,1,0)

	} else {
		_cond($.z,1,2)
		_init || $.e = _1('span',$.z).setText("two")
		_render($z,$.e,1,0)
	}
	$.a.append(this.dynamic,1)
	$.z.synced($.built=true)
	$.z
};

// With if else
function (){
	$ = this.$ni231 || (this.$ni231 = TagTree())
	_init = $.built
	_init || $.z = this
	$.z.$open()
	_init || $.a = _1('section',$.z,0))
	_init || $.b = _1('h1',$.a,0).setText("Screen")

	if (this.one) {
		_tree = _cond($.z,1,0) // act as a fragment?
		_init || $.c = _1('span',_tree,0).setText("one")
		_render($.z,_tree,1)

	} else if (this.two) {
		_tree = _cond($.z,1,1)
		_init || $.d = _1('span',_tree,0).setText("two")
		_render(_tree,this.dynamic,1)
		_render($.z,_tree,1)

	} else {
		_tree = _cond($.z,1,2)
		_init || $.e = _1('span',_tree,0).setText("two")
		_render(_tree,this.other,1)
		_render($.z,_tree,1)
	}
	$.a.append(this.dynamic,1)
	$.z.synced($.built=true)
	$.z
};

// With if else
function (){
	$ = this.$ni231 || (this.$ni231 = TagTree())
	_init = $.built
	_init || $.z = this
	$.z.$open()
	_init || $.a = _1('section',$.z,0))
	_init || $.b = _1('h1',$.a,0).setText("Screen")

	if (this.one) {
		$.c || $.c = _1('span').setText("one")
		_render($.z,$.c,1)
	} else if (this.two) {
		$.y || $.y = _cond()
		$.d || $.d = _1('span',$.y,0).setText("two")
		_render($.y,this.dynamic,1)
		_render($.z,$.y,1)
	} else {
		_render($.z,null,1)
	}
	$.a.append(this.dynamic,1)
	$.z.synced($.built=true)
	$.z
};

// With if else and loop!!!
function (){
	$ = this.$ni231 || (this.$ni231 = TagTree())
	_init = $.built
	_init || $.z = this
	$.z.$open()
	_init || $.a = _1('section',$.z,0))
	_init || $.b = _1('h1',$.a,0).setText("Screen")

	if (this.one) {
		$.c || $.c = _1('span').setText("one")
		_render($.a,$.c,1)
	} else if (this.two) {
		$.y || $.y = _cond()
		$.d || $.d = _1('span',$.y,0).setText("two")
		_render($.y,this.other,1)
		_render($.a,$.y,1)
	} else {
		_render($.a,null,1) // should be a blank item?
	}

	// now deal with keyed loop
	_t = $.L || ($.L = _loop($.a,2))
	$.U || ($.U = _map($.L))
	
	_t.reset();
	for (let i=0, items = self.items, len=items.length,item; i<len; i++) {
		item = items[i];
		_k = item.id;
		_tag = $.U[_k] || ($.U[_k] = _1('div',$.a))
		$$ = _tag.$
		_init2 = $$.built
		_init2 || $$.a = _1('span',_tag,0)
		_init2 || $$.b = _1('button',_tag,1).setText("Delete")
		_v=item.title
		_v === $$.A || __render($$.b,$$.A=_v,0)
		_tag.end() // happen automatically no?
		$.L.push(_tag)
	};
	_render($.a,$.L,2)	

	$.a.append(this.dynamic,1)
	$.z.synced($.built=true) # should be set inside sync / built
	$.z
};

self.hello = function (){
	var _t1, _v, _t2, $ = ($_ = this.$).$hello$ || ($_.$hello$ = _2(this)), _t3;
	_t1 = self
	_t1.$open('hello0'),_t1.setChildren(
		(_t2 = $[0] || _1('section',$,0,self),_t2.setContent([
			(_t3 = _1('h1',$,1,0),_t3.setText("Screen"),_t3),
			(_t3 = _1('span',$,2,0),_t3.flag('width'),_t3),
			(_t3 = _1('span',$,3,0),_t3.flag('height'),_t3)
			(_t3 = _1('span',$,3,0),_t3.flag('height'),_t3)
		],2),_t2)
	,2),_t1.synced((
		(_t3=$[2],
		_v=(self.width),_v===$.A||_t3.setContent($.A=_v,3),
		_t3),
		(_t3=$[3],
		_v=(self.height),_v===$.B||_t3.setContent($.B=_v,3),
		_t3)
	,true)),_t1);
	return;
};

self.hello = function (){
	var _t1, _v, _t2, $, _t3;

	$ = ($_ = this.$).$hello$ || ($_.$hello$ = _2(this))
	_t1 = self
	_t1.$open('hello0')

	_t1._children || _t1.setChildren(
		(
			_t2 = $[0] || _1('section',$,0,self),
			_t2.setContent([
				(
					_t3 = _1('h1',$,1,0),
					_t3.setText("Screen"),
					_t3
				),
				(
					_t3 = _1('span',$,2,0),
					_t3.flag('width'),
					_t3
				),
				(
					_t3 = _1('span',$,3,0),
					_t3.flag('height'),
					_t3
				),
				(
					_t3 = _1('span',$,3,0),
					_t3.flag('height'),
					_t3
				)
			],2),
			_t2
		)
	)
	_v = self.width
	_v === $.A || $[2].setContent($.A=_v)
	_v = self.height
	_v === $.B || $[3].setContent($.B=_v)
	_t1.synced()
	_t1

	return;
};


(t3 = $[3] || (t3 = _1('span',$,3,0),t3.flag('height'),t3))
(t3 = $.a || (t3 = $.a = _1('span',t2),t3.flag('height'),t3))

self.hello = function (){
	var t1, t2, t3, c1;
	
	(
	t1 = this
	c1 = this.$.$hello$ || (this.$.hashas1 = _TagCache())
	t1.$open()
	t2 = c1.a || c1.a = _1('section',t1)
	t3 = c1.a || (t3 = c1.a = _1('h1'),t3.setText("Screen"),t3),
	t3 = c1.b || (t3 = c1.b = _1('span'),t3.flag('width'),t3),
	t3 = c1.c || (t3 = c1.c = _1('span'),t3.flag('height'),t3)
	
	_t1.setChildren(
	(_t3 = _1('h1',$,1,0),_t3.setText("Screen"),_t3),
	(_t3 = _1('span',$,2,0),_t3.flag('width'),_t3),
	(_t3 = _1('span',$,3,0),_t3.flag('height'),_t3)
	)
	)
	(_t1 = self,_t1.$open('hello0'),_t1.setChildren(
		(_t2 = $[0] || _1('section',$,0,self),_t2.setContent([
			(_t3 = _1('h1',$,1,0),_t3.setText("Screen"),_t3),
			(_t3 = _1('span',$,2,0),_t3.flag('width'),_t3),
			(_t3 = _1('span',$,3,0),_t3.flag('height'),_t3)
		],2),_t2)
	,2),_t1.synced((
		(_t3=$[2],
		_v=(self.width),_v===$.A||_t3.setContent($.A=_v,3),
		_t3),
		(_t3=$[3],
		_v=(self.height),_v===$.B||_t3.setContent($.B=_v,3),
		_t3)
	,true)),_t1);
	return;
};

###