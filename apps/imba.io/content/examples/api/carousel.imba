# [preview=lg]
# ---
import {genres} from 'imdb'

tag Card
	shown = 1
	css bg:gray3 d:vflex ja:center c:white rd:md pos:relative

	<self[o:{shown}] @intersect(20)=(shown = e.ratio)>
		<div[fs:xl c:gray8]> data.title
		<div[bg:{data.color} p:1 2 rd:lg]> shown.toFixed(2)

tag App
	css self
		d:hgrid pos:absolute inset:0 gap:4px py:6
		ofx:scroll scroll-snap-type:x mandatory
		.item scroll-snap-align:start w:200px
		@before,@after content:" " d:block w:6

	<self> for item in genres
		<Card.item data=item>
# ---
let app = <App>
imba.mount app