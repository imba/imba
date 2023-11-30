# import {diffChars,diffLines} from 'diff'
import diff from 'fast-diff'


export def createEdits from,to
	let all = diff(from,to)
	let offset = 0
	let edits = []
	for item in all
		let t = item[0]
		let str = item[1]
		let len = str.length
		
		if t == 0
			offset += len
		elif t == -1
			edits.unshift([offset,offset + len,'',str,-1])
			offset += len
		elif t == 1
			if edits[0] and edits[0][2] == ''
				edits[0][2] = str
			else
				edits.unshift([offset,offset,str])

	return edits

def d a,b
	# let out = diffChars(a,b)
	# console.log out
	console.log createEdits(a,b)

global.createEdits = createEdits

# d("hello\nthis.\nreturn","hello\nthis:go\nreturn")