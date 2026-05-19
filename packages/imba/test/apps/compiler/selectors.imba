import * as imbac from 'imba/compiler'

test 'ancestor modifiers avoid wildcard relation selectors' do
	let res = imbac.compile("""
		css .abc ..visited c:blue
		css .def ^.active c:red
	""", sourcePath: 'selectors.imba')

	ok res.css.match(/\.abc:is\(\.visited :where\([^)]*\.abc\)\)/)
	ok res.css.match(/\.def:is\(\.active > :where\([^)]*\.def\)\)/)
	ok !res.css.match(/:(?:is|where)\([^\n]*\*/)
