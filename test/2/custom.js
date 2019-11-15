// externs;

function Item(){ };

Item.prototype.hello = function (){
	return console.log("Yesss!!");
};


customElements.define('my-item',Item,{extends: "form"});
