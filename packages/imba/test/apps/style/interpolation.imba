let count = 1
let num = 0
let str = "hello"

tag app-root
	<self>
		<input bind=str>
		<input type='range' min=0 max=100 bind=num>
		<button @click=(count++)> 'zoom in'
		<button @click=(num++)> 'move right'
		<h1[pos:relative l:{num}px top:{num}u]> "Hello there!"
		<h2[bg:gray3 pos:relative width:{num}%]> "Other"
		<div[zoom:{count} @md:{count + 1}]> "zoomed?"
		<h3[bg:gray3 prefix:{str}]> "Prefixed?"
		<div[bg:blue3 x:{num}]> "Transformed?"
		<div[bg:teal3 px:{num} py:{num / 2}]> "Padding"

imba.mount(<app-root>)

test do
	ok 1