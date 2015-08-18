(function(){
	
	// unless document:documentElement:classList
	if (!document.documentElement.classList) {
		
		
			
			ElementTag.prototype.hasFlag = function (ref){
				return new RegExp('(^|\\s)' + ref + '(\\s|$)').test(this._dom.className);
			};
			
			ElementTag.prototype.addFlag = function (ref){
				if (this.hasFlag(ref)) { return this };
				this._dom.className += (this._dom.className ? (' ') : ('')) + ref;
				return this;
			};
			
			ElementTag.prototype.unflag = function (ref){
				if (!this.hasFlag(ref)) { return this };
				var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
				this._dom.className = this._dom.className.replace(regex,'');
				return this;
			};
			
			ElementTag.prototype.toggleFlag = function (ref){
				return this.hasFlag(ref) ? (this.unflag(ref)) : (this.flag(ref));
			};
			
			ElementTag.prototype.flag = function (ref,bool){
				if (arguments.length == 2 && bool == false) {
					return this.unflag(ref);
				};
				return this.addFlag(ref);
			};
		
		true;
	};

})()