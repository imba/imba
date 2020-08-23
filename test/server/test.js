var $b = Symbol();
require('imba/src/imba/index');


class AppHelloComponent extends imba.tags.get('component','ImbaElement') {
	
	render(){
		var $1t, $1b, $1d, $0 = this._ns_ || '', $2t;
		$1t=this;
		$1t.open$();
		($1b=$1d=1,$1t[$b] === 1) || ($1b=$1d=0,$1t[$b]=1);
		((!$1b||$1d&2) && $1t.flagSelf$('dnfuep'));
		$1b || ($2t=imba.createElement('div',$1t,`dnfuep dnfuepcd ${$0}`,null));
		$1t.close$($1d);
		return $1t;
	}
}; imba.tags.define('app-hello',AppHelloComponent,{});

console.log('hey there');

imba.inlineStyles("\ndiv.dnfuep {background: hsla(0.00,100.00%,98.04%,100%);}\n\n.dnfuepcd:not(#_):not(#_) {border-radius: 4px;}\n\n",'dnfuep');
/*

div.dnfuep {background: hsla(0.00,100.00%,98.04%,100%);}

.dnfuepcd:not(#_):not(#_) {border-radius: 4px;}


*/
