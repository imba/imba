const combos = [
	[0,1,2],[3,4,5],[6,7,8],
	[0,3,6],[1,4,7],[2,5,8],
	[0,4,8],[2,4,6]
]

export default class Game
	turn = 0
	tiles = new Array(9)
	moves = []
	winner

	def place index
		return if tiles[index] or winner
		moves.length = turn
		moves.push(index)
		turn = moves.length
		calculate!
	
	def calculate
		winner = null
		tiles = new Array(9)
		for cross,i in moves when i < turn
			tiles[cross] = i % 2 ? "⚬" : "×"
		
		for line in combos
			let [a,b,c] = line
			if tiles[a] and tiles[a] == tiles[b] == tiles[c]
				break winner = line
		return self