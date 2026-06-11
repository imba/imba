import 'util/styles'

css div pos:absolute d:block inset:0 p:4 pe:none
css mark pos:absolute
css li d:inline-block px:1 m:1 rd:2 fs:xs bg:gray1
# ---
tag app
	title = "Hey"
	point = {x:100, y: 100}
	
	css pos:abs inset:0 p:8 cursor:default

	<self @mousemove=(point=e)>
		# dynamically create one list item for every
		# pixel the mouse is offset to
		<ul> for nr in [0 ... point.x]
			# use dynamic inline styles for certain conditions
			<li[bg:pink3 rotate:{point.x / 360}]=(nr < point.x / 5)> nr
		<div[pos:abs b:0 r:0 t:{point.y}px l:{point.x}px bg:blue5/20]>

imba.mount <app[pos:abs inset:0 p:8 cursor:default]>