# import {diffChars,diffLines} from 'diff'
import diff from 'fast-diff'


export def createEdits from,to
	let all = diff(from,to)
	let offset = 0
	let edits = []
	let last = []
	for item in all
		let t = item[0]
		let str = item[1]
		let len = str.length
		
		if t == 0
			offset += len
		elif t == -1
			edits.unshift(last = [offset,offset + len,'',str])
			offset += len
		elif t == 1
			if last[2] == '' and last[0] == offset
				last[2] = str
			else
				edits.unshift([offset,offset,str])

	return edits

def d a,b
	console.log createEdits(a,b)

global.createEdits = createEdits

# d("hello\nlevle","hello\nlevel")