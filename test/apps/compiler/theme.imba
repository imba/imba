let fs = {}

fs.code1 = """
global css div color:mint1 stroke:mint2 bgc:mint3
"""

def compile name, o = {}
	o.sourcePath ||= "{name}.imba"
	global.imba.compiler.compile(fs[name],o)

test 'custom color' do
	let res = compile('code1', config: {theme: {
		colors: {
			mint: {
				"1": "hsl(140, 27%, 96%)",
				"3": "hsl(138, 24%, 89%)"
			}
		}
	}})

	ok res.css.match(/color:\s*hsla\(140/)
	ok res.css.match(/stroke:\s*hsla\(139/)
	ok res.css.match(/background-color:\s*hsla\(138/)
	
	