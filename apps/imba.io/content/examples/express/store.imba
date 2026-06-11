export class Items < Array

	constructor db,raw = []
		super(...raw.map(do db.ref($1)))
		db = db

	def preload from = 0, to = length
		await Promise.all slice(from,to).map do $1.load!

export class Item
	constructor id,db
		id = id
		db = db
		loaded = no
		kids\Item[] = []
		#depth = -1

	def load depth = 0
		if #depth == -1
			#depth = 0
			let data = await db.fetch("item/{id}")
			data ||= {deleted: true}
			data.kids = new Items(db,data.kids or [])
			data.url &&= new URL(data.url)
			Object.assign(self,data)
			loaded = yes

		if depth > #depth
			#depth = depth
			await Promise.all(kids.map do $1.load(depth - 1))

		self

export default new class
	constructor
		idmap = {}
		global.store = self

	def fetch path, {from=-1,to=-1}={}
		let url = "https://hacker-news.firebaseio.com/v0/{path}.json"
		let req = await window.fetch(url)
		let res = await req.json!

		if res isa Array
			res = new Items(self,res.slice(0,50))

		imba.commit!
		return res

	def ref id
		idmap[id] ||= new Item(id,self)