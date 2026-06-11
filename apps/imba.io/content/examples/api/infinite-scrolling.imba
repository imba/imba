# [preview=lg]

# ---

tag app

	show-items = 10

	<self>
		css w:100% p:5 g:5 d:vbox

		for i in [0 .. 1000] when i < show-items
			<div>
				css min-width:30 p:2 bg:teal3 c:gray7 bxs:sm rd:md ta:center
				"#{i}"

		<[h:10px]@intersect.in=(show-items += 10)>
# ---

imba.mount <app>
