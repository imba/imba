test do
	let div = <div tabIndex=-1>
	imba.mount div
	div.focus!
	eq document.activeElement, div

test do
	let div = <div tabindex=-1>
	imba.mount div
	div.focus!
	eq document.activeElement, div
