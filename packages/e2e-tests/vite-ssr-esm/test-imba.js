var $1, $2 = imba_getRenderContext(), $3 = Symbol(), $4, $5;
const $$up$ = Symbol.for('##up');
import {createElement as imba_createElement, getRenderContext as imba_getRenderContext} from 'imba';

/*body*/
import path from 'path';
import decamelize from 'decamelize';
import {test} from './test-no-dep.imba';
import {Router} from 'imba';

console.log(test,path.resolve("h.imba"),decamelize("testGUILabel"),Router);
console.log((($4=$5=1,$1=$2[$3]) || ($4=$5=0,$1=$2[$3]=$1=imba_createElement('div',null,null,"test")),
$4 || ($1[$$up$]=$2._),
$1));
