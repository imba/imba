global css @root
	$alpha:0.3
	#bg:#fa0006
	# red is lch(54 106.85 40.86)
	# lch(53.3 104.3 40.2)

	#bg2:lch(50 50 100)
	#bg3:lch(50 50 100 / 0.5)
	#bg4:lch(40 40 100 / $alpha)

tag App
	<self>
		css c:#bg
		<$a[c:#bg(l 0 h)]>
		<$b[c:#bg2]>
		<$c[c:#bg3]>
		<$d[c:#bg4]>
		<$e[c:#bg4(2l 2c 0.5h)]>

let color = do(el)
	window.getComputedStyle(el).color

let app = imba.mount(<App>)

test do eq color(app),'lch(53.3 104.3 40.2)'
test do eq color(app.$a),'lch(53.3 0 40.2)'
test do eq color(app.$b),'lch(50 50 100)'
test do eq color(app.$c),'lch(50 50 100 / 0.5)'
test do eq color(app.$d),'lch(40 40 100 / 0.3)'
test do eq color(app.$e),'lch(80 80 50 / 0.3)'