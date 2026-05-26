import * as imbac from 'imba/compiler'

def compile source, o = {}
	String imbac.compile(source,Object.assign({
		platform: 'tsc'
		sourcePath: 'field-registry.imba'
	},o))

test 'field decorator registry entry' do
	let js = compile """
	class Variant
	class Item
		stuff @something(Variant)
	"""

	ok js.indexOf('interface ImbaFieldRegistry') >= 0
	ok js.match(/"_\$INTERNAL\$_imbaFieldRegistry:something:stuff:imba:[^"]+":/)
	ok js.match(/owner:\s*Item/)
	ok js.match(/ownerType:\s*typeof Item/)
	ok js.match(/field:\s*"stuff"/)
	ok js.match(/decorator:\s*"something"/)
	ok js.match(/firstArg:\s*Variant/)
	ok js.match(/firstArgType:\s*typeof Variant/)
	ok js.match(/args:\s*\[typeof Variant\]/)
	ok js.match(/interface Variant\s*\{\s*readonly "_\$INTERNAL\$_imbaFieldTarget:something:stuff:imba:[^"]+"\?: ImbaFieldRegistry\["_\$INTERNAL\$_imbaFieldRegistry:something:stuff:imba:[^"]+"\]/)

test 'field registry has one entry per decorated field' do
	let js = compile """
	class Variant
	class Item
		stuff @something(Variant)
	class Other
		stuff @something(Variant)
	"""

	eq (js.match(/decorator:\s*"something"/g) or []).length, 2
	ok js.match(/owner:\s*Item/)
	ok js.match(/owner:\s*Other/)
	eq (js.match(/firstArg:\s*Variant/g) or []).length, 2
	eq (js.match(/firstArgType:\s*typeof Variant/g) or []).length, 2
	eq (js.match(/args:\s*\[typeof Variant\]/g) or []).length, 2

test 'field registry supports exported class names' do
	let js = compile """
	export class Variant
	export class Item
		stuff @something(Variant)
	"""

	ok js.match(/owner:\s*Item/)
	ok js.match(/firstArg:\s*Variant/)
	ok js.match(/firstArgType:\s*typeof Variant/)
	ok js.match(/args:\s*\[typeof Variant\]/)
	ok js.match(/export interface Variant\s*\{\s*readonly "_\$INTERNAL\$_imbaFieldTarget:something:stuff:imba:[^"]+"\?: ImbaFieldRegistry\["_\$INTERNAL\$_imbaFieldRegistry:something:stuff:imba:[^"]+"\]/)

test 'field registry skips local class names' do
	let js = compile """
	def make
		class Variant
		class Item
			stuff @something(Variant)
	"""

	ok js.indexOf('ImbaFieldRegistry') == -1

test 'field registry keeps unknown for non-nameable args' do
	let js = compile """
	class Something
	class Item
		stuff @something(do Something)
	"""

	ok js.indexOf('interface ImbaFieldRegistry') >= 0
	ok js.match(/firstArg:\s*unknown/)
	ok js.match(/firstArgType:\s*unknown/)
	ok js.match(/args:\s*\[unknown\]/)
	ok js.indexOf('_$INTERNAL$_imbaFieldTarget') == -1

test 'field registry keeps unknown for non-namespace access args' do
	let js = compile """
	class Session
	class Item
		sessions @children(Session.$.user)
	"""

	ok js.indexOf('interface ImbaFieldRegistry') >= 0
	ok js.match(/field:\s*"sessions"/)
	ok js.match(/decorator:\s*"children"/)
	ok js.match(/firstArg:\s*unknown/)
	ok js.match(/args:\s*\[unknown\]/)
	ok js.indexOf('_$INTERNAL$_imbaFieldTarget') == -1

test 'field registry skips descriptors without args' do
	let js = compile """
	class Item
		stuff @something
	"""

	ok js.indexOf('ImbaFieldRegistry') == -1
	ok js.indexOf('firstArg:') == -1
	ok js.indexOf('firstArgType:') == -1

test 'field registry is type-only output' do
	let js = compile """
	class Variant
	class Item
		stuff @something(Variant)
	""", platform: 'browser'

	ok js.indexOf('ImbaFieldRegistry') == -1
