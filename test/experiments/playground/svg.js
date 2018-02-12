var Imba = require('imba'), _T = Imba.TAGS;


_T.defineTag('svg:hello', 'svg:g', function(tag){
	
	tag.prototype.hello = function (){
		return true;
	};
});

var el = (_T.$('svg:hello').set('color','red')).end();
console.log(el.hello());
console.log(el.toString());
