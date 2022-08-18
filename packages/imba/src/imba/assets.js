function iter$__(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : a; };

/*body*/
// imba$stdlib=1

function injectStringBefore(target,toInject,patterns = ['']){
	
	for (let $1 = 0, $2 = iter$__(patterns), $3 = $2.length; $1 < $3; $1++) {
		let patt = $2[$1];
		let idx = target.indexOf(patt);
		if (idx >= 0) {
			
			return target.slice(0,idx) + toInject + target.slice(idx);
		};
	};
	return target;
};

export function asset(src){
	
	return src;
};

class HtmlAsset {
	
	constructor(text,refs){
		
		this.text = text;
		this.refs = refs;
	}
	
	get body(){
		var self = this;
		
		let res = this.text.replace(/ASSET_REF_(\d+)/g,function(m,nr) { return self.refs[nr]; });
		if (true) {
			
			res = injectStringBefore(res,"<script src='/__hmr__.js'></script>",['<!--$head$-->','<!--$body$-->','<html','']);
		};
		return res;
	}
	
	toString(){
		
		return this.body;
	}
};

export function html(text,refs){
	
	return new HtmlAsset(text,refs);
};
