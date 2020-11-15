import {Game} from './state.imba'

tag Tile
	prop nr

	def render
		let placed = data.history.indexOf(nr)
		let won = data.winner and data.winner.indexOf(nr) >= 0
		<self .won=won> <span> <slot>

tag App
	css d:vflex pos:absolute inset:0

	css .tiles
		d:grid
		grid: 1fr 1fr 1fr / 1fr 1fr 1fr
		fl:1 w:100% h:100% c:white fs:30px
		
	css .tile
		d:flex ja:center
		bg:blue6 bg@odd:blue5 fs:30px fs.won:50px

	def setup
		data = new Game

	def render
		<self[d:vflex pos:absolute inset:0]>
			<div.tiles> for tile,i in data.tiles
				<Tile.tile[$nr:{i}] data=data nr=i @click=data.placeTile(i)> tile
			<footer[d:hflex ai:center p:4]>
				<input[pos:relative w:100%] bind=data.turn type='range' min=0 max=9>

imba.mount <App>