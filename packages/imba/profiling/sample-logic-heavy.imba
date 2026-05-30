###
Synthetic logic-heavy compile sample.
Designed to stress expressions, conditions, loops, assignments, calls,
scopes, and class/method bodies more than style or tag volume.
###

const LEVELS = ['debug','info','warn','error']

def normalize-record record,index
	let score = 0
	let weight = record..weight or 1
	let flags = record..flags or []

	for flag,i in flags
		if flag == 'hot'
			score += 10 * weight
		elif flag == 'slow'
			score -= 4
		elif flag == 'new'
			score += 2 + i
		else
			score += 1

	if record..active
		score += 5
	else
		score -= 2

	{
		id: record..id or "record-{index}"
		name: record..name or 'unknown'
		score: score
		level: LEVELS[Math.max(0,Math.min(LEVELS.length - 1,score % LEVELS.length))]
	}

def bucket-score score
	if score > 80
		'critical'
	elif score > 50
		'high'
	elif score > 20
		'medium'
	elif score > 0
		'low'
	else
		'idle'

def merge-counts target,source
	for key,value of source
		target[key] = (target[key] or 0) + value
	target

def summarize-records records
	let buckets = {}
	let levels = {}
	let total = 0
	let max = null
	let min = null
	let normalized = []

	for record,index in records
		let item = normalize-record(record,index)
		let bucket = bucket-score(item.score)
		normalized.push(item)
		buckets[bucket] = (buckets[bucket] or 0) + 1
		levels[item.level] = (levels[item.level] or 0) + 1
		total += item.score
		if !max or item.score > max.score
			max = item
		if !min or item.score < min.score
			min = item

	let average = records.length ? total / records.length : 0
	{total, average, buckets, levels, max, min, normalized}

class LogicHeavyAnalyzer

	seed = 0
	runs = []
	index = {}

	constructor initial = 0
		seed = initial
		runs = []
		index = {}

	def ingest records
		let summary = summarize-records(records)
		runs.push(summary)
		for item in summary.normalized
			index[item.id] = item
		summary

	def compare left,right
		let changes = []
		let seen = {}

		for item in left.normalized
			seen[item.id] = yes
			let other = right.normalized.find(do $1.id == item.id)
			if other
				let delta = other.score - item.score
				if Math.abs(delta) > 5
					changes.push({id: item.id, delta, from: item.score, to: other.score})
			else
				changes.push({id: item.id, removed: yes, from: item.score})

		for item in right.normalized
			unless seen[item.id]
				changes.push({id: item.id, added: yes, to: item.score})

		changes.sort do(a,b)
			Math.abs(b.delta or b.to or 0) - Math.abs(a.delta or a.to or 0)

	def rank limit = 10
		let items = []
		for key,item of index
			items.push(item)
		items.sort do(a,b)
			b.score - a.score
		items.slice(0,limit)

	def totals
		let out = {}
		for run in runs
			merge-counts(out,run.buckets)
		out

	def explain item
		let parts = []
		if item.score > 50
			parts.push('large')
		if item.level == 'error'
			parts.push('error')
		if item.name.match(/test|demo/)
			parts.push('sample')
		if parts.length == 0
			parts.push('plain')
		parts.join(',')

	def build-report records
		let current = ingest(records)
		let previous = runs.length > 1 ? runs[runs.length - 2] : current
		let changes = compare(previous,current)
		let ranked = rank(12)
		let report = []

		for item,i in ranked
			report.push({
				position: i + 1
				id: item.id
				bucket: bucket-score(item.score)
				explain: explain(item)
			})

		{
			total: current.total
			average: current.average
			buckets: current.buckets
			levels: current.levels
			changes: changes
			report: report
		}

def make-records count
	let out = []
	for i in [0 ... count]
		let flags = []
		if i % 2 == 0
			flags.push('hot')
		if i % 3 == 0
			flags.push('slow')
		if i % 5 == 0
			flags.push('new')
		out.push({
			id: "item-{i}"
			name: i % 7 == 0 ? "test-{i}" : "item-{i}"
			weight: (i % 6) + 1
			active: i % 4 != 0
			flags: flags
		})
	out

let analyzer = new LogicHeavyAnalyzer(17)
let report = analyzer.build-report(make-records(80))
report
