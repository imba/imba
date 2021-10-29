var $b = Symbol();
require('imba/src/imba/index');


class AppHelloComponent extends imba.tags.get('component','ImbaElement') {
	
	render(){
		var $1t, $1b, $1d;
		$1t=this;
		$1t.open$();
		($1b=$1d=1,$1t[$b] === 1) || ($1b=$1d=0,$1t[$b]=1);
		$1t.close$($1d);
		return $1t;
	}
}; imba.tags.define('app-hello',AppHelloComponent,{});
console.log('hey there');

imba.inlineStyles("\ndiv {color: hsla(205.22,79.31%,65.88%,100%);\nbackground: hsla(252.00,100.00%,86.00%,100%);}\np {color: hsla(206.19,75.96%,61.47%,100%);}\nh1 {color: hsla(252.60,100.00%,91.40%,100%);}\n.l1 {background: hsla(253.00,100.00%,95.00%,100%);}\n.l3 {background: hsla(252.60,100.00%,91.40%,100%);}\n.l4 {background: hsla(252.40,100.00%,89.60%,100%);}\n.l5 {background: hsla(252.20,100.00%,87.80%,100%);}\n.l6 {background: hsla(252.00,100.00%,86.00%,100%);}\n.l7 {background: hsla(248.80,25.71%,13.73%,100%);}\n\n",'dnfuep');
/*

div {color: hsla(205.22,79.31%,65.88%,100%);
background: hsla(252.00,100.00%,86.00%,100%);}
p {color: hsla(206.19,75.96%,61.47%,100%);}
h1 {color: hsla(252.60,100.00%,91.40%,100%);}
.l1 {background: hsla(253.00,100.00%,95.00%,100%);}
.l3 {background: hsla(252.60,100.00%,91.40%,100%);}
.l4 {background: hsla(252.40,100.00%,89.60%,100%);}
.l5 {background: hsla(252.20,100.00%,87.80%,100%);}
.l6 {background: hsla(252.00,100.00%,86.00%,100%);}
.l7 {background: hsla(248.80,25.71%,13.73%,100%);}


*/
