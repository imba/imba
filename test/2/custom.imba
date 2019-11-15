extern customElements

class Item

	def hello
		console.log("Yesss!!")


customElements.define('my-item',Item, { extends: "form" })