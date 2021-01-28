
tag Item
	<self[fl:1 px:1]>
		css span fw:550
		<div[fs:md]>
			css span fw:600
			<span.a> "600"
			<span.b> "600"
		<div>
			css span fw:500
			css span + span fw: 700
			<span.c> "500"
			<span.d> "700"
		<span.e> "550"

test do
	let el = <Item>

	eqcss el,600,'.a'
	eqcss el,600,'.b'
	eqcss el,500,'.c'
	eqcss el,700,'.d'
	eqcss el,550,'.e'