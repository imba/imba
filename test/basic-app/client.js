const $3 = Symbol.for('#beforeReconcile'), $13 = Symbol.for('#placeChild'), $21 = Symbol.for('#afterVisit'), $26 = Symbol.for('#appendChild'), $27 = Symbol.for('#afterReconcile'), $33 = Symbol.for('##up');
var $6 = Symbol(), $12 = Symbol(), $18 = Symbol(), $23 = Symbol(), $28, $29 = imba_getRenderContext(), $30 = Symbol(), $31, $32;
import {styles as imba_styles, Component as imba_Component, createComponent as imba_createComponent, createElement as imba_createElement, createSVGElement as imba_createSVGElement, use_router as imba_use_router, defineTag as imba_defineTag, getRenderContext as imba_getRenderContext, mount as imba_mount} from 'imba'/*$path$*/;
(imba_use_router());

/*body*/
import './pages/index'/*$path$*/;
import $1 from './logo.svg?as=img'/*$path$*/;

class AppComponent extends imba_Component {
	
	render(){
		var $2, $4, $5, $7 = this._ns_ || '', $8, $9, $10, $11, $14, $15, $16, $17, $19, $20, $22, $24, $25;
		$2=this;
		$2[$3]();
		($4=$5=1,$2[$6] === 1) || ($4=$5=0,$2[$6]=1);
		$4 || ($8=imba_createElement('div',$2,`${$7}`,null));
		$4 || ($8.id="dropdown");
		;
		$4 || ($9=imba_createElement('header',$2,`${$7}`,null));
		$4 || ($10=imba_createSVGElement('svg',$9,`w2jnth-ai ${$7}`,null));
		$4 || ($10.set$('src',$1));
		;
		($11=$2[$12]) || ($2[$12]=$11=imba_createElement('p',$9,`${$7}`,null));
		$4 || $11[$13]("Edit ");
		$4 || ($14=imba_createElement('code',$11,`${$7}`,"app/client.imba"));
		;
		$4 || $11[$13](" and save to reload");
		;
		$4 || ($15=imba_createElement('a',$9,`io ${$7}`,"Learn Imba"));
		$4 || ($15.id=`imba`);
		$4 || ($15.href="https://imba.io");
		;
		;
		$4 || ($16=imba_createElement('nav',$2,`${$7}`,null));
		($19=$20=1,$17=$2[$18]) || ($19=$20=0,$2[$18]=$17=imba_createElement('a',$16,`${$7}`,"/context"));
		$19 || ($17.routeΞto="/context");
		$19 || !$17.setup || $17.setup($20);
		$17[$21]($20);
		;
		;
		($24=$25=1,$22=$2[$23]) || ($24=$25=0,$2[$23]=$22=imba_createComponent('context-page',$2,`${$7}`,null));
		$24 || ($22.route="/context");
		$24 || !$22.setup || $22.setup($25);
		$22[$21]($25);
		$24 || $2[$26]($22);
		;
		$2[$27]($5);
		return $2;
	}
}; imba_defineTag('app',AppComponent,{});

imba_mount((($31=$32=1,$28=$29[$30]) || ($31=$32=0,$28=$29[$30]=$28=imba_createComponent('app',null,null,null)),
$31 || ($28[$33]=$29._),
$31 || $29.sym || !$28.setup || $28.setup($32),
$29.sym || $28[$21]($32),
$28));

imba_styles.register('w2jnth',`
html {font-family: var(--font-sans,system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");}

.w2jnth-ai:not(#_):not(#_):not(#_) {width: 200px;
height: auto;}

app-tag { display:block; }
`);