(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
function update(){
	var a = (this.b() + 10);
	this.x() * 200;
	this.x() * 200,10;
	(this._updates)++;
	if(this._gestures) {
		for(var i=0, ary=iter$(this._gestures), len=ary.length; i < len; i++){
			ary[i].ontouchupdate(this);
		};
		a = this.b(((function (){
			for(var i=0, ary=iter$(this._gestures), len=ary.length, res=[]; i < len; i++){
				res.push(ary[i].ontouchupdate(this));
			};
			return res;
		})()));
	};
	if(this.target() && this.target().ontouchupdate) {
		this.target().ontouchupdate(this);
	};
	return this;
};
}())