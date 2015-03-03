(function(){
t$('ol');
tc$('ol','hello');
tc$('canvas','draw full nav-right');
A = tc$('div','hello there again');
C = tic$('canvas','root','page');
(function(){
	var tag = Imba.defineTag(function other(d){this.setDom(d)},"canvas");
	tag.prototype.ping = function (){
		return 1;
	};
})();
(function(){
	var tag = Imba.defineTag(function awesome(d){this.setDom(d)},"other");
	tag.prototype.ping = function (){
		return 2 + tag.prototype.__super.ping.apply(this,arguments);
	};
})();
Other = imba$class(function Other(){
	return this;
});
Other.prototype.ping = function (){
	return 3;
};;
O = tic$('other','home','mobile');
B = tc$('awesome','hello there');
L = tc$('ol','hello').setup([
	t$('li').text("Sindre"),
	t$('li').text("Synne")
]);
}())