import * as imbac from 'imba/compiler'

let fs = {}

fs.code1 = """
global css div color:mint1 stroke:mint2 bgc:mint3
"""

fs.unitModifiers = """
global css .odoc
	1codefs:11px @800:13px
	1gap:10px @@500:20px
	1titlebarh:50px ..minimized:32px
"""

def compile name, o = {}
	o.sourcePath ||= "{name}.imba"
	imbac.compile(fs[name],o)

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

test 'unit variable modifier declarations inherit normalized property names' do
	let res = compile('unitModifiers', styles: 'extern')

	ok res.css.match(/--u_codefs:\s*13px/)
	ok res.css.match(/--u_gap:\s*20px/)
	ok res.css.match(/--u_titlebarh:\s*32px/)
	ok !res.css.match(/\b1(?:codefs|gap|titlebarh)\s*:/)
