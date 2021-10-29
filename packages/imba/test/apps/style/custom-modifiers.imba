tag A
	<self[fw:500 @is-guest:600 @some-state:700]>

let flags = document.documentElement.classList

test do
	eqcss <A>, 500
	flags.add('mod-is-guest')
	eqcss <A>, 600
	flags.add('mod-some-state')
	eqcss <A>, 700