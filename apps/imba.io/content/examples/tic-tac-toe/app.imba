import Game from './state.imba'
import {Tile} from './tile.imba'

css .tiles
	fl:1 w:100% h:100% c:blue1 fs:30px
	d:grid grid: 1fr 1fr 1fr / 1fr 1fr 1fr
	
tag App
	game = new Game

	<self[d:vflex pos:abs inset:0]>
		<div.tiles> for tile,i in game.tiles
			<Tile data=game nr=i @click=game.place(i)> tile

document.body.appendChild <App autorender=yes>